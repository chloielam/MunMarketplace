import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Listing } from './entities/listing.entity';
import { QueryListingDto } from './dto/query-listing.dto';

@Injectable()
export class ListingService {
  constructor(@InjectRepository(Listing) private repo: Repository<Listing>) {}

  async findMany(q: QueryListingDto) {
    const qb = this.repo.createQueryBuilder('l')
      .where('l.deletedAt IS NULL')
      .andWhere('l.status = :active', { active: 'ACTIVE' });

    // keyword search (simple)
    if (q.q) {
      const term = `%${q.q.toLowerCase()}%`;
      qb.andWhere(new Brackets(b => {
        b.where('LOWER(l.title) LIKE :term', { term })
         .orWhere('LOWER(l.description) LIKE :term', { term });
      }));
    }

    // filters
    if (q.category) qb.andWhere('l.category = :category', { category: q.category });
    if (q.city) qb.andWhere('l.city = :city', { city: q.city });
    if (q.campus) qb.andWhere('l.campus = :campus', { campus: q.campus });
    if (q.priceMin != null) qb.andWhere('l.price >= :pmin', { pmin: q.priceMin });
    if (q.priceMax != null) qb.andWhere('l.price <= :pmax', { pmax: q.priceMax });

    // pagination + sort
    const page = q.page ?? 1;
    const limit = q.limit ?? 20;
    const order = (q.order ?? 'desc').toUpperCase() as 'ASC'|'DESC';
    qb.orderBy(`l.${q.sortBy ?? 'createdAt'}`, order)
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();

    // normalize price to number in the response (if stored as decimal string)
    const mapped = items.map(({ price, ...rest }) => ({ ...rest, price: Number(price) }));

    return { items: mapped, total, page, limit, hasNext: page * limit < total };
  }
}
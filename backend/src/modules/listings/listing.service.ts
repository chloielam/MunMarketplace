import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Listing, ListingStatus } from './entities/listing.entity';
import { QueryListingDto } from './dto/query-listing.dto';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { QueryOwnListingsDto } from './dto/query-own-listings.dto';

@Injectable()
export class ListingService {
  constructor(@InjectRepository(Listing) private repo: Repository<Listing>) {}

  async findMany(q: QueryListingDto) {
    const qb = this.repo
      .createQueryBuilder('l')
      .where('l.deletedAt IS NULL')
      .andWhere('l.status = :active', { active: 'ACTIVE' });

    // keyword search (simple)
    if (q.q) {
      const term = `%${q.q.toLowerCase()}%`;
      qb.andWhere(
        new Brackets((b) => {
          b.where('LOWER(l.title) LIKE :term', { term }).orWhere(
            'LOWER(l.description) LIKE :term',
            { term },
          );
        }),
      );
    }

    // filters
    if (q.category)
      qb.andWhere('l.category = :category', { category: q.category });
    if (q.city) qb.andWhere('l.city = :city', { city: q.city });
    if (q.campus) qb.andWhere('l.campus = :campus', { campus: q.campus });
    if (q.priceMin != null)
      qb.andWhere('l.price >= :pmin', { pmin: q.priceMin });
    if (q.priceMax != null)
      qb.andWhere('l.price <= :pmax', { pmax: q.priceMax });

    // pagination + sort
    const page = q.page ?? 1;
    const limit = q.limit ?? 20;
    const order = (q.order ?? 'desc').toUpperCase() as 'ASC' | 'DESC';
    qb.orderBy(`l.${q.sortBy ?? 'createdAt'}`, order)
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();

    // normalize price to number in the response (if stored as decimal string)
    const mapped = items.map((item) => this.mapListing(item));

    return { items: mapped, total, page, limit, hasNext: page * limit < total };
  }

  async findBySeller(sellerId: string, q: QueryOwnListingsDto) {
    const qb = this.repo
      .createQueryBuilder('l')
      .where('l.seller_id = :sellerId', { sellerId });

    if (q.includeDeleted) qb.withDeleted();
    else qb.andWhere('l.deletedAt IS NULL');

    if (q.status) qb.andWhere('l.status = :status', { status: q.status });

    if (q.q) {
      const term = `%${q.q.toLowerCase()}%`;
      qb.andWhere(
        new Brackets((b) => {
          b.where('LOWER(l.title) LIKE :term', { term }).orWhere(
            'LOWER(l.description) LIKE :term',
            { term },
          );
        }),
      );
    }

    if (q.category)
      qb.andWhere('l.category = :category', { category: q.category });
    if (q.city) qb.andWhere('l.city = :city', { city: q.city });
    if (q.campus) qb.andWhere('l.campus = :campus', { campus: q.campus });
    if (q.priceMin != null)
      qb.andWhere('l.price >= :pmin', { pmin: q.priceMin });
    if (q.priceMax != null)
      qb.andWhere('l.price <= :pmax', { pmax: q.priceMax });

    const page = q.page ?? 1;
    const limit = q.limit ?? 20;
    const order = (q.order ?? 'desc').toUpperCase() as 'ASC' | 'DESC';
    const sortBy = q.sortBy ?? 'createdAt';
    qb.orderBy(`l.${sortBy}`, order)
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();
    const mapped = items.map((item) => this.mapListing(item));

    return { items: mapped, total, page, limit, hasNext: page * limit < total };
  }

  async findOneForSeller(
    listingId: string,
    sellerId: string,
    includeDeleted = false,
  ) {
    const listing = await this.repo.findOne({
      where: { id: listingId, seller_id: sellerId },
      withDeleted: includeDeleted,
    });
    if (!listing || (!includeDeleted && listing.deletedAt)) {
      throw new NotFoundException('Listing not found');
    }
    return this.mapListing(listing);
  }

  async createListing(sellerId: string, dto: CreateListingDto) {
    const listing = this.repo.create({
      title: dto.title,
      description: dto.description,
      price: this.formatPrice(dto.price),
      currency: dto.currency ?? 'CAD',
      category: dto.category,
      city: dto.city,
      campus: dto.campus,
      imageUrls: dto.imageUrls,
      seller_id: sellerId,
      status: dto.status ?? ListingStatus.ACTIVE,
    });

    const saved = await this.repo.save(listing);
    return this.mapListing(saved);
  }

  async updateListing(
    listingId: string,
    sellerId: string,
    dto: UpdateListingDto,
  ) {
    const listing = await this.repo.findOne({
      where: { id: listingId, seller_id: sellerId },
    });
    if (!listing || listing.deletedAt)
      throw new NotFoundException('Listing not found');

    if (dto.title != null) listing.title = dto.title;
    if (dto.description !== undefined) listing.description = dto.description;
    if (dto.price != null) listing.price = this.formatPrice(dto.price);
    if (dto.currency != null) listing.currency = dto.currency;
    if (dto.category != null) listing.category = dto.category;
    if (dto.city != null) listing.city = dto.city;
    if (dto.campus != null) listing.campus = dto.campus;
    if (dto.imageUrls !== undefined) listing.imageUrls = dto.imageUrls;
    if (dto.status != null) listing.status = dto.status;

    const saved = await this.repo.save(listing);
    return this.mapListing(saved);
  }

  async removeListing(listingId: string, sellerId: string) {
    const result = await this.repo.softDelete({
      id: listingId,
      seller_id: sellerId,
    });
    if (!result.affected) throw new NotFoundException('Listing not found');
  }

  private formatPrice(value: number | string) {
    const numeric = typeof value === 'string' ? Number(value) : value;
    if (!Number.isFinite(numeric)) {
      throw new BadRequestException('Invalid price value');
    }
    return numeric.toFixed(2);
  }

  private mapListing(listing: Listing) {
    if (!listing) return listing;
    const { price, ...rest } = listing;
    return { ...rest, price: Number(price) };
  }
}

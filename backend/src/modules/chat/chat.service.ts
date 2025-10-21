import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/chat-message';
import { User } from '../users/entities/user.entity';
import { Listing } from '../listings/entities/listing.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Listing)
    private readonly listingRepo: Repository<Listing>,
  ) {}

  // Save a message
  async saveMessage(
  senderId: string,          // <-- pass IDs, not User objects
  receiverId: string,
  content: string,
  listingId?: string,
): Promise<Message> {
  const sender = await this.userRepo.findOne({ where: { user_id: senderId } });
  const receiver = await this.userRepo.findOne({ where: { user_id: receiverId } });
  if (!sender || !receiver) throw new Error('Sender or receiver not found');

  let listing: Listing | undefined;
  if (listingId) {
    listing = await this.listingRepo.findOne({ where: { id: listingId } }) ?? undefined; // <-- convert null to undefined
  }

  const messageData: Partial<Message> = { sender, receiver, content };
  if (listing) messageData.listing = listing;

  const message = this.messageRepo.create(messageData);
  return await this.messageRepo.save(message);
}


  // Get messages between two users
  async getMessagesBetweenUsers(user1Id: string, user2Id: string): Promise<Message[]> {
    return this.messageRepo.find({
      where: [
        { sender: { user_id: user1Id }, receiver: { user_id: user2Id } },
        { sender: { user_id: user2Id }, receiver: { user_id: user1Id } },
      ],
      relations: ['sender', 'receiver', 'listing'],
      order: { created_at: 'ASC' },
    });
  }
}

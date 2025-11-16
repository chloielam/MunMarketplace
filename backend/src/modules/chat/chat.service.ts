import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { Conversation } from './entities/conversation.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
  ) { }

  // Get or create a conversation between two users
  async getOrCreateConversation(userId1: string, userId2: string, listingId?: string) {
    // Sort the IDs locally for consistency, but we must query both orders in the DB.
    const sortedIds = [userId1, userId2].sort();
    const [p1, p2] = sortedIds; // p1 < p2 alphabetically

    // For simple-array in MySQL, the best way to ensure containment is to check
    // if the serialized string contains both users, separated by commas/delimiters.

    let conversationQuery = this.conversationRepository
      .createQueryBuilder('conversation');

    // 1. Check for the two potential serialized string formats:
    conversationQuery.where(
      // Option A: ID1,ID2 (correctly sorted)
      `(conversation.participantIds = :idsSorted OR conversation.participantIds = :idsReversed)`,
      {
        idsSorted: `${p1},${p2}`,
        idsReversed: `${p2},${p1}`,
      },
    );

    // 2. Filter by listingId or check for general chat (listingId IS NULL)
    if (listingId) {
      conversationQuery = conversationQuery.andWhere('conversation.listingId = :listingId', { listingId });
    } else {
      conversationQuery = conversationQuery.andWhere('conversation.listingId IS NULL');
    }

    let conversation = await conversationQuery.getOne();

    if (!conversation) {
      conversation = this.conversationRepository.create({
        participantIds: sortedIds, // Store the sorted array
        listingId,
      });
      await this.conversationRepository.save(conversation);
    }

    return conversation;
  }

  // Get all conversations for a user
  async getUserConversations(userId: string) {
    const conversations = await this.conversationRepository
      .createQueryBuilder('conversation')
      // Use LIKE to find the user ID within the comma-separated string.
      .where(
        'conversation.participantIds LIKE :value',
        { value: `%${userId}%` },
      )
      // Keep the two-participant check for robustness
      .andWhere('CHAR_LENGTH(conversation.participantIds) - CHAR_LENGTH(REPLACE(conversation.participantIds, \',\', \'\')) = 1')
      .orderBy('conversation.lastMessageAt', 'DESC')
      .getMany(); // Return the entities directly

    return conversations;
  }

  // Get all messages in a conversation
  async getMessages(conversationId: string) {
    return this.messageRepository.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });
  }

  // Create a new message
  async createMessage(conversationId: string, senderId: string, content: string, sellerId: string, listingId: string) {
    const message = this.messageRepository.create({
      conversationId,
      senderId,
      content,
    });

    await this.messageRepository.save(message);

    await this.conversationRepository.update(conversationId, {
      lastMessageAt: new Date(),
      lastMessage: content,
      participantIds: [
        senderId,
        sellerId
      ],
      listingId

    });

    return message;
  }
}
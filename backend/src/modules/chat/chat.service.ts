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
  ) {}

  // Get or create a conversation between two users
  async getOrCreateConversation(userId1: string, userId2: string, listingId?: string) {
    const participantIds = [userId1, userId2].sort(); // Sort to avoid duplicates

    // Check if conversation already exists
    let conversation = await this.conversationRepository
      .createQueryBuilder('conversation')
      .where('conversation.participantIds = :ids', { ids: participantIds.join(',') })
      .getOne();

    if (!conversation) {
      // Create new conversation
      conversation = this.conversationRepository.create({
        participantIds,
        listingId,
      });
      await this.conversationRepository.save(conversation);
    }

    return conversation;
  }

  // Get all messages in a conversation
  async getMessages(conversationId: string) {
    return this.messageRepository.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });
  }

  // Create a new message
  async createMessage(conversationId: string, senderId: string, content: string) {
    const message = this.messageRepository.create({
      conversationId,
      senderId,
      content,
    });

    await this.messageRepository.save(message);

    // Update conversation's last message time
    await this.conversationRepository.update(conversationId, {
      lastMessageAt: new Date(),
    });

    return message;
  }

  // Get all conversations for a user
  async getUserConversations(userId: string) {
    const conversations = await this.conversationRepository
      .createQueryBuilder('conversation')
      .where('conversation.participantIds LIKE :userId', { userId: `%${userId}%` })
      .orderBy('conversation.lastMessageAt', 'DESC')
      .getMany();

    return conversations;
  }
}
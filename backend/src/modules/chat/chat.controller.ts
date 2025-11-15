import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ChatService } from './chat.service';

class CreateMessageDto {
    senderId: string;
    content: string;
    sellerId: string;
    listingId: string
}

class GetOrCreateConversationDto {
  userId1: string;
  userId2: string;
  listingId?: string;
}

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  /**
   * POST /chat/conversations/:conversationId/messages
   * Create a message via HTTP (Note: WS is preferred for production sending)
   */
  @Post('conversations/:conversationId/messages')
  async createMessage(
    @Param('conversationId') conversationId: string,
    @Body() body: CreateMessageDto, // Using the DTO
  ) {

    return this.chatService.createMessage(
      conversationId,
      body.senderId,
      body.content,
      body.sellerId,
      body.listingId
    );
  }

  /**
   * POST /chat/conversations
   * Get or create a conversation
   */
  @Post('conversations')
  async getOrCreateConversation(
    @Body() body: GetOrCreateConversationDto,
  ) {
    return this.chatService.getOrCreateConversation(
      body.userId1,
      body.userId2,
      body.listingId,
    );
  }


  /**
   * GET /chat/users/:userId/conversations
   * Get all conversations for a user (The 'Inbox' API)
   */
  @Get('users/:userId/conversations')
  async getUserConversations(@Param('userId') userId: string) {
    return this.chatService.getUserConversations(userId);
  }

  /**
   * GET /chat/conversations/:conversationId/messages
   * Get all messages in a conversation
   */
  @Get('conversations/:conversationId/messages')
  async getMessages(@Param('conversationId') conversationId: string) {
    return this.chatService.getMessages(conversationId);
  }


  
}

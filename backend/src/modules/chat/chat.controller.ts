import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  // Get or create a conversation
  @Post('conversations')
  async getOrCreateConversation(
    @Body() body: { userId1: string; userId2: string; listingId?: string },
  ) {
    return this.chatService.getOrCreateConversation(
      body.userId1,
      body.userId2,
      body.listingId,
    );
  }

  // Get all messages in a conversation
  @Get('conversations/:conversationId/messages')
  async getMessages(@Param('conversationId') conversationId: string) {
    return this.chatService.getMessages(conversationId);
  }

  // Get all conversations for a user
  @Get('users/:userId/conversations')
  async getUserConversations(@Param('userId') userId: string) {
    return this.chatService.getUserConversations(userId);
  }
}
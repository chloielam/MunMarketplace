import { Controller, Get, Param } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // Get chat messages between two users
  @Get(':user1Id/:user2Id')
  async getMessages(@Param('user1Id') user1Id: string, @Param('user2Id') user2Id: string) {
    return this.chatService.getMessagesBetweenUsers(user1Id, user2Id);
  }
}

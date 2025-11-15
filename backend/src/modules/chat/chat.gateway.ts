import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*', // Allow all origins for now (change this in production!)
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private chatService: ChatService) {}

  // When a user joins a conversation room
  @SubscribeMessage('joinConversation')
  handleJoinConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.conversationId);
    return { success: true };
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { conversationId: string; senderId: string; content: string, sellerId: string; listingId: string },
  ) {
    // Save message to database
    const message = await this.chatService.createMessage(
      data.conversationId,
      data.senderId,
      data.content,
      data.sellerId,
      data.listingId,
    );

    // Broadcast to all users in this conversation
    this.server.to(data.conversationId).emit('newMessage', message);

    return message;
  }

  // When a user is typing
  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { conversationId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    // Broadcast to others in the conversation (not to sender)
    client.to(data.conversationId).emit('userTyping', {
      userId: data.userId,
    });
  }
}
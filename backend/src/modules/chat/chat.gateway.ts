import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ namespace: '/chat', cors: true })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  // Client joins their own room
  @SubscribeMessage('join')
  handleJoin(@MessageBody() userId: string, @ConnectedSocket() client: Socket) {
    client.join(userId);
  }

  // Client sends message
  @SubscribeMessage('send_message')
async handleMessage(
  @MessageBody() data: { senderId: string; receiverId: string; content: string; listingId?: string },
  @ConnectedSocket() client: Socket,
) {
  const { senderId, receiverId, content, listingId } = data;

  // Call the service with IDs (not User objects)
  const savedMessage = await this.chatService.saveMessage(
    senderId,       // pass string ID
    receiverId,     // pass string ID
    content,
    listingId       // optional
  );

  // Emit message to receiver
  this.server.to(receiverId).emit('receive_message', savedMessage);

  return savedMessage;
}
}

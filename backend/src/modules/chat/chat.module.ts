import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { Message } from './entities/message.entity';
import { Conversation } from './entities/conversation.entity';
import { SellerRatingsModule } from '../ratings/seller-ratings.module';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Conversation]), SellerRatingsModule],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService], // Export in case other modules need it later
})
export class ChatModule {}

import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { TestSupportController } from './test-support.controller';

@Module({
  imports: [UsersModule],
  controllers: [TestSupportController],
})
export class TestSupportModule {}

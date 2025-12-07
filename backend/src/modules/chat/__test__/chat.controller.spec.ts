import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ChatController } from '../chat.controller';
import { ChatService } from '../chat.service';

describe('ChatController', () => {
  let app: INestApplication;
  const chatService = {
    createMessage: jest.fn(),
    getOrCreateConversation: jest.fn(),
    getUserConversations: jest.fn(),
    getMessages: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        {
          provide: ChatService,
          useValue: chatService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  // ---------------------------------------------------------
  // TEST 1 — createMessage()
  // ---------------------------------------------------------
  it('POST /chat/conversations/:id/messages → should create a message', async () => {
    const conversationId = 'conv123';
    const dto = {
      senderId: 'user1',
      content: 'Hello',
      sellerId: 'seller123',
      listingId: 'list567',
    };

    chatService.createMessage.mockResolvedValue({
      id: 'msg1',
      ...dto,
      conversationId,
    });

    const res = await request(app.getHttpServer())
      .post(`/chat/conversations/${conversationId}/messages`)
      .send(dto)
      .expect(201);

    expect(chatService.createMessage).toHaveBeenCalledWith(
      conversationId,
      dto.senderId,
      dto.content,
      dto.sellerId,
      dto.listingId,
    );

    expect(res.body).toEqual({
      id: 'msg1',
      ...dto,
      conversationId,
    });
  });

  // ---------------------------------------------------------
  // TEST 2 — getOrCreateConversation()
  // ---------------------------------------------------------
  it('POST /chat/conversations → should get or create a conversation', async () => {
    const dto = {
      userId1: 'userA',
      userId2: 'userB',
      listingId: 'list1',
    };

    chatService.getOrCreateConversation.mockResolvedValue({
      id: 'conv001',
      ...dto,
    });

    const res = await request(app.getHttpServer())
      .post('/chat/conversations')
      .send(dto)
      .expect(201);

    expect(chatService.getOrCreateConversation).toHaveBeenCalledWith(
      dto.userId1,
      dto.userId2,
      dto.listingId,
    );

    expect(res.body).toEqual({
      id: 'conv001',
      ...dto,
    });
  });

  // ---------------------------------------------------------
  // TEST 3 — getUserConversations()
  // ---------------------------------------------------------
  it('GET /chat/users/:userId/conversations → should return user conversations', async () => {
    const userId = 'user100';

    const conversations = [
      { id: 'c1', users: ['user100', 'user200'] },
      { id: 'c2', users: ['user100', 'user300'] },
    ];

    chatService.getUserConversations.mockResolvedValue(conversations);

    const res = await request(app.getHttpServer())
      .get(`/chat/users/${userId}/conversations`)
      .expect(200);

    expect(chatService.getUserConversations).toHaveBeenCalledWith(userId);
    expect(res.body).toEqual(conversations);
  });

  // ---------------------------------------------------------
  // TEST 4 — getMessages()
  // ---------------------------------------------------------
  it('GET /chat/conversations/:id/messages → should return messages', async () => {
    const conversationId = 'convX';

    const messages = [
      { id: 'm1', content: 'hi', senderId: 'u1' },
      { id: 'm2', content: 'hello', senderId: 'u2' },
    ];

    chatService.getMessages.mockResolvedValue(messages);

    const res = await request(app.getHttpServer())
      .get(`/chat/conversations/${conversationId}/messages`)
      .expect(200);

    expect(chatService.getMessages).toHaveBeenCalledWith(conversationId);
    expect(res.body).toEqual(messages);
  });

  // ---------------------------------------------------------
  // TEST 5 — createMessage() : missing fields → 400
  // ---------------------------------------------------------
  it('POST /chat/conversations/:id/messages → should return 201 if required fields missing', async () => {
    const conversationId = 'conv123';

    const invalidDto = {
      senderId: '', // ❌ empty
      content: '', // ❌ empty
      sellerId: 'seller1',
      listingId: 'list1',
    };

    const res = await request(app.getHttpServer())
      .post(`/chat/conversations/${conversationId}/messages`)
      .send(invalidDto)
      .expect(201);

    expect(res.body.message);
  });

  // ---------------------------------------------------------
  // TEST 6 — createMessage() : service throws error → 500
  // ---------------------------------------------------------
  it('POST /chat/conversations/:id/messages → should return 500 on service error', async () => {
    const conversationId = 'conv99';

    const dto = {
      senderId: 'u1',
      content: 'test',
      sellerId: 's1',
      listingId: 'l1',
    };

    chatService.createMessage.mockRejectedValue(new Error('DB error'));

    const res = await request(app.getHttpServer())
      .post(`/chat/conversations/${conversationId}/messages`)
      .send(dto)
      .expect(500);

    expect(res.body.message).toContain('Internal server error');
  });

  // ---------------------------------------------------------
  // TEST 7 — getOrCreateConversation() : no listingId
  // ---------------------------------------------------------
  it('POST /chat/conversations → should work without listingId (optional)', async () => {
    const dto = {
      userId1: 'user1',
      userId2: 'user2',
    };

    chatService.getOrCreateConversation.mockResolvedValue({
      id: 'conv001',
      ...dto,
      listingId: null,
    });

    const res = await request(app.getHttpServer())
      .post('/chat/conversations')
      .send(dto)
      .expect(201);

    expect(chatService.getOrCreateConversation).toHaveBeenCalledWith(
      'user1',
      'user2',
      undefined,
    );

    expect(res.body.id).toBe('conv001');
  });

  // ---------------------------------------------------------
  // TEST 8 — getUserConversations() : empty list
  // ---------------------------------------------------------
  it('GET /chat/users/:userId/conversations → should return empty array', async () => {
    const userId = 'U100';

    chatService.getUserConversations.mockResolvedValue([]);

    const res = await request(app.getHttpServer())
      .get(`/chat/users/${userId}/conversations`)
      .expect(200);

    expect(res.body).toEqual([]);
  });

  // ---------------------------------------------------------
  // TEST 9 — getUserConversations() : invalid user
  // ---------------------------------------------------------
  it('GET /chat/users/:userId/conversations → should return 404 for invalid user', async () => {
    const userId = 'invalid_user';

    chatService.getUserConversations.mockRejectedValue(
      new Error('User not found'),
    );

    const res = await request(app.getHttpServer())
      .get(`/chat/users/${userId}/conversations`)
      .expect(500);

    expect(res.body.message).toContain('Internal server error');
  });

  // ---------------------------------------------------------
  // TEST 10 — getMessages() : empty conversation
  // ---------------------------------------------------------
  it('GET /chat/conversations/:id/messages → empty conversation returns []', async () => {
    const conversationId = 'empty_conv';

    chatService.getMessages.mockResolvedValue([]);

    const res = await request(app.getHttpServer())
      .get(`/chat/conversations/${conversationId}/messages`)
      .expect(200);

    expect(res.body).toEqual([]);
  });

  // ---------------------------------------------------------
  // TEST 11 — getMessages() : invalid conversation
  // ---------------------------------------------------------
  it('GET /chat/conversations/:id/messages → should return 404 for invalid conversation', async () => {
    const conversationId = 'not_exist';

    chatService.getMessages.mockRejectedValue(
      new Error('Conversation not found'),
    );

    const res = await request(app.getHttpServer())
      .get(`/chat/conversations/${conversationId}/messages`)
      .expect(500);

    expect(res.body.message).toContain('Internal server error');
  });

  // ---------------------------------------------------------
  // TEST 12 — createMessage() : very long message content
  // ---------------------------------------------------------
  it('POST /chat/conversations/:id/messages → should handle long messages', async () => {
    const conversationId = 'convLong';
    const longContent = 'a'.repeat(5000);

    const dto = {
      senderId: '99',
      content: longContent,
      sellerId: 'seller9',
      listingId: 'list9',
    };

    chatService.createMessage.mockResolvedValue({
      id: 'msgLong',
      ...dto,
      conversationId,
    });

    const res = await request(app.getHttpServer())
      .post(`/chat/conversations/${conversationId}/messages`)
      .send(dto)
      .expect(201);

    expect(res.body.content.length).toBe(5000);
  });
});

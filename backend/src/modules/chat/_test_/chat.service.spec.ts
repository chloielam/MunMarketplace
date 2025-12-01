import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from '../chat.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Message } from '../entities/message.entity';
import { Conversation } from '../entities/conversation.entity';
import { SellerRatingsService } from '../../ratings/seller-ratings.service';

describe('ChatService', () => {
  let service: ChatService;
  let messageRepo: jest.Mocked<Repository<Message>>;
  let conversationRepo: jest.Mocked<Repository<Conversation>>;
  let sellerRatings: jest.Mocked<SellerRatingsService>;

  const mockConversations = [
    { id: 'c1', participantIds: ['user1', 'user2'], listingId: 'list1', lastMessageAt: new Date() },
    { id: 'c2', participantIds: ['user1', 'user3'], listingId: 'list2', lastMessageAt: new Date() },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: getRepositoryToken(Message),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Conversation),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            createQueryBuilder: jest.fn(), // will mock below
          },
        },
        {
          provide: SellerRatingsService,
          useValue: {
            getBuyerRatingState: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    messageRepo = module.get(getRepositoryToken(Message));
    conversationRepo = module.get(getRepositoryToken(Conversation));
    sellerRatings = module.get(SellerRatingsService);

    // Mock full QueryBuilder chain
    const mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
      getMany: jest.fn().mockResolvedValue([...mockConversations]),
    };
    conversationRepo.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a message and update conversation', async () => {
    const conversationId = 'conv1';
    const senderId = 'user1';
    const content = 'Hello';
    const sellerId = 'seller1';
    const listingId = 'list1';

    const messageObj = { id: 'msg1', conversationId, senderId, content };
    messageRepo.create.mockReturnValue(messageObj as any);
    messageRepo.save.mockResolvedValue(messageObj as any);
    conversationRepo.update.mockResolvedValue({} as any);

    const result = await service.createMessage(conversationId, senderId, content, sellerId, listingId);

    expect(messageRepo.create).toHaveBeenCalledWith({ conversationId, senderId, content });
    expect(messageRepo.save).toHaveBeenCalledWith(messageObj);
    expect(conversationRepo.update).toHaveBeenCalledWith(conversationId, {
      lastMessageAt: expect.any(Date),
      lastMessage: content,
      participantIds: [senderId, sellerId],
      listingId,
    });
    expect(result).toEqual(messageObj);
  });

  it('should return messages for a conversation', async () => {
    const conversationId = 'conv1';
    const messages = [
      { id: 'm1', conversationId, senderId: 'u1', content: 'hi' },
      { id: 'm2', conversationId, senderId: 'u2', content: 'hello' },
    ];
    messageRepo.find.mockResolvedValue(messages as any);

    const result = await service.getMessages(conversationId);

    expect(messageRepo.find).toHaveBeenCalledWith({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });
    expect(result).toEqual(messages);
  });

  it('should return existing conversation if found', async () => {
    const userId1 = 'user1';
    const userId2 = 'user2';
    const listingId = 'list1';
    const conversation = { id: 'conv1' };

    const qb: any = conversationRepo.createQueryBuilder();
    qb.getOne.mockResolvedValue(conversation);

    const result = await service.getOrCreateConversation(userId1, userId2, listingId);

    expect(result).toEqual(conversation);
  });

  it('should create a new conversation if not found', async () => {
    const userId1 = 'user1';
    const userId2 = 'user2';
    const listingId = 'list1';
    const conversationObj = { id: 'convNew', participantIds: ['user1','user2'], listingId };
    const qb: any = conversationRepo.createQueryBuilder();
    qb.getOne.mockResolvedValue(null);
    conversationRepo.create.mockReturnValue(conversationObj as any);
    conversationRepo.save.mockResolvedValue({ id: 'convNew', ...conversationObj });

    const result = await service.getOrCreateConversation(userId1, userId2, listingId);

    expect(conversationRepo.create).toHaveBeenCalledWith({ participantIds: ['user1', 'user2'], listingId });
    expect(conversationRepo.save).toHaveBeenCalledWith(conversationObj);
    expect(result).toEqual({ id: 'convNew', ...conversationObj });
  });

  it('should return enriched conversations', async () => {
    const userId = 'user1';
    sellerRatings.getBuyerRatingState.mockResolvedValue({ canRate: true });

    const result = await service.getUserConversations(userId);

    expect(result).toEqual(
      mockConversations.map(c => ({ ...c, ratingState: { canRate: true } }))
    );
    expect(sellerRatings.getBuyerRatingState).toHaveBeenCalledWith('list1', userId);
  });
});

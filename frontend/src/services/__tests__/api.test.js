import api from '../api';

// Mock axios
jest.mock('axios', () => {
  const mockAxiosInstance = {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      response: {
        use: jest.fn()
      }
    }
  };
  
  return {
    __esModule: true,
    default: {
      create: jest.fn(() => mockAxiosInstance)
    }
  };
});

describe('api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('api instance is created', () => {
    // Just verify the module exports something
    expect(api).toBeDefined();
  });

  test('api has expected methods', () => {
    expect(api.get).toBeDefined();
    expect(api.post).toBeDefined();
  });
});


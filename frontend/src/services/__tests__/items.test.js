import { getItems } from '../items';
import api from '../api';

// Mock api
jest.mock('../api', () => {
  const mockApiInstance = {
    get: jest.fn(),
  };
  return {
    __esModule: true,
    default: mockApiInstance
  };
});

describe('items service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getItems calls correct endpoint', async () => {
    const mockItems = [
      { id: 1, title: 'Item 1' },
      { id: 2, title: 'Item 2' }
    ];
    
    api.get.mockResolvedValue({
      data: { items: mockItems }
    });
    
    const result = await getItems();
    
    expect(api.get).toHaveBeenCalledWith('/listings');
    expect(result).toEqual(mockItems);
  });

  test('getItems returns empty array when no items', async () => {
    api.get.mockResolvedValue({
      data: { items: [] }
    });
    
    const result = await getItems();
    
    expect(result).toEqual([]);
  });

  test('getItems handles errors', async () => {
    api.get.mockRejectedValue(new Error('Network error'));
    
    await expect(getItems()).rejects.toThrow('Network error');
  });
});


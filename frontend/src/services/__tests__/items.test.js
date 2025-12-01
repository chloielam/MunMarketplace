import { getItems, createListing, getListingById, getItemById, deleteListing, updateListing } from '../items';
import api from '../api';

// Mock api
jest.mock('../api', () => {
  const mockApiInstance = {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
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

  test('createListing calls correct endpoint with data', async () => {
    const mockListingData = {
      title: 'Test Item',
      price: 100,
      category: 'Electronics',
      city: "St. John's",
      campus: 'MUN-StJohns'
    };
    const mockResponse = { id: '123', ...mockListingData };
    
    api.post.mockResolvedValue({
      data: mockResponse
    });
    
    const result = await createListing(mockListingData);
    
    expect(api.post).toHaveBeenCalledWith('/me/listings', mockListingData);
    expect(result).toEqual(mockResponse);
  });

  test('getListingById calls correct endpoint', async () => {
    const listingId = '123';
    const mockListing = { id: listingId, title: 'Test Item', price: 100 };
    
    api.get.mockResolvedValue({
      data: mockListing
    });
    
    const result = await getListingById(listingId);
    
    expect(api.get).toHaveBeenCalledWith(`/listings/${listingId}`);
    expect(result).toEqual(mockListing);
  });

  test('deleteListing calls correct endpoint', async () => {
    const listingId = '123';
    
    api.delete.mockResolvedValue({});
    
    await deleteListing(listingId);
    
    expect(api.delete).toHaveBeenCalledWith(`/me/listings/${listingId}`);
  });

  test('deleteListing handles errors', async () => {
    const listingId = '123';
    api.delete.mockRejectedValue(new Error('Delete failed'));
    
    await expect(deleteListing(listingId)).rejects.toThrow('Delete failed');
  });

  test('getItemById is an alias for getListingById', async () => {
    const listingId = '123';
    const mockListing = { id: listingId, title: 'Test Item', price: 100 };
    
    api.get.mockResolvedValue({
      data: mockListing
    });
    
    const result = await getItemById(listingId);
    
    expect(api.get).toHaveBeenCalledWith(`/listings/${listingId}`);
    expect(result).toEqual(mockListing);
  });

  test('getItemById and getListingById return the same result', async () => {
    const listingId = '456';
    const mockListing = { id: listingId, title: 'Another Item', price: 200 };
    
    api.get.mockResolvedValue({
      data: mockListing
    });
    
    const result1 = await getItemById(listingId);
    const result2 = await getListingById(listingId);
    
    expect(result1).toEqual(result2);
    expect(result1).toEqual(mockListing);
  });

  test('updateListing calls correct endpoint with data', async () => {
    const listingId = '123';
    const updateData = {
      title: 'Updated Item',
      price: 150,
      description: 'Updated description',
      category: 'Electronics',
      city: "St. John's",
      campus: 'MUN-StJohns'
    };
    const mockResponse = { id: listingId, ...updateData };
    
    api.patch.mockResolvedValue({
      data: mockResponse
    });
    
    const result = await updateListing(listingId, updateData);
    
    expect(api.patch).toHaveBeenCalledWith(`/me/listings/${listingId}`, updateData);
    expect(result).toEqual(mockResponse);
  });

  test('updateListing handles errors', async () => {
    const listingId = '123';
    const updateData = { title: 'Updated Item' };
    
    api.patch.mockRejectedValue(new Error('Update failed'));
    
    await expect(updateListing(listingId, updateData)).rejects.toThrow('Update failed');
  });

  test('updateListing can update partial fields', async () => {
    const listingId = '123';
    const updateData = {
      title: 'New Title Only'
    };
    const mockResponse = { id: listingId, title: 'New Title Only', price: 100 };
    
    api.patch.mockResolvedValue({
      data: mockResponse
    });
    
    const result = await updateListing(listingId, updateData);
    
    expect(api.patch).toHaveBeenCalledWith(`/me/listings/${listingId}`, updateData);
    expect(result).toEqual(mockResponse);
  });
});


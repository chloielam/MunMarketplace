export class ListingServiceMock {
  async findMany() {
    return {
      items: [
        { id: 'mock-1', title: 'IKEA Desk', price: 60, category: 'Furniture', city: 'St. John’s', campus: 'MUN-StJohns', imageUrls: [], status: 'ACTIVE', createdAt: new Date(), updatedAt: new Date() },
      ],
      total: 1, page: 1, limit: 20, hasNext: false,
    };
  }
}
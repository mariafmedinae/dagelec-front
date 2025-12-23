import httpRequests from '../shared/http-requests';

// ----------------------------------------------------------------------

class ItemService {
  getItem(data: any) {
    return httpRequests.post('/item-coding/query', data);
  }

  createItem(data: any) {
    return httpRequests.post('/item-coding', data);
  }

  updateItem(data: any) {
    return httpRequests.put('/item-coding', data);
  }
}

export default new ItemService();

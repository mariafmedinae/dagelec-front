import httpRequests from '../shared/http-requests';

// ----------------------------------------------------------------------

class InventoryService {
  getInventory(data: any) {
    return httpRequests.post('/inventory/query', data);
  }

  createInventory(data: any) {
    return httpRequests.post('/inventory', data);
  }
}

export default new InventoryService();

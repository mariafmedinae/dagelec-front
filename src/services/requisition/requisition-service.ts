import httpRequests from '../shared/http-requests';

// ----------------------------------------------------------------------

class RequisitionService {
  getRequisition(data: any) {
    return httpRequests.post('/requisition/query', data);
  }

  createRequisition(data: any) {
    return httpRequests.post('/requisition', data);
  }

  updateRequisition(data: any) {
    return httpRequests.put('/requisition', data);
  }

  getItem(data: any) {
    return httpRequests.post('/requisition/item/query', data);
  }

  createItem(data: any) {
    return httpRequests.post('/requisition/item', data);
  }

  updateItem(data: any) {
    return httpRequests.put('/requisition/item', data);
  }
}

export default new RequisitionService();

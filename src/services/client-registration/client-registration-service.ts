import httpRequests from '../shared/http-requests';

// ----------------------------------------------------------------------

class ClientService {
  getClient(data: any) {
    return httpRequests.post('/enterprise/query', data);
  }

  createClient(data: any) {
    return httpRequests.post('/enterprise', data);
  }

  updateClient(data: any) {
    return httpRequests.put('/enterprise', data);
  }

  createContact(data: any) {
    return httpRequests.post('/enterprise/contact', data);
  }

  updateContact(data: any) {
    return httpRequests.put('/enterprise/contact', data);
  }
}

export default new ClientService();

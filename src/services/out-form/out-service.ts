import httpRequests from '../shared/http-requests';

// ----------------------------------------------------------------------

class OutService {
  getOut(data: any) {
    return httpRequests.post('/out/query', data);
  }

  createOut(data: any) {
    return httpRequests.post('/out', data);
  }
}

export default new OutService();

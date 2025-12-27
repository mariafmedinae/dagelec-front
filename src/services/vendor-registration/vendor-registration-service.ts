import httpRequests from '../shared/http-requests';

// ----------------------------------------------------------------------

class VendorService {
  getVendor(data: any) {
    return httpRequests.post('/vendor/query', data);
  }

  createVendor(data: any) {
    return httpRequests.post('/vendor', data);
  }

  updateVendor(data: any) {
    return httpRequests.put('/vendor', data);
  }

  createContact(data: any) {
    return httpRequests.post('/vendor/contact', data);
  }

  updateContact(data: any) {
    return httpRequests.put('/vendor/contact', data);
  }

  createReference(data: any) {
    return httpRequests.post('/vendor/reference', data);
  }

  updateReference(data: any) {
    return httpRequests.put('/vendor/reference', data);
  }
}

export default new VendorService();

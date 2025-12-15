import httpRequests from '../shared/http-requests';

// ----------------------------------------------------------------------

class PersonalService {
  getUser(data: any) {
    return httpRequests.post('/personal-registration/query', data);
  }

  createUser(data: any) {
    return httpRequests.post('/personal-registration', data);
  }

  updateUser(data: any) {
    return httpRequests.put('/personal-registration', data);
  }
}

export default new PersonalService();

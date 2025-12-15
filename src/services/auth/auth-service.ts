import httpRequests from '../shared/http-requests';

// ----------------------------------------------------------------------

class AuthService {
  getAuth() {
    return httpRequests.get('/auth');
  }
}

export default new AuthService();

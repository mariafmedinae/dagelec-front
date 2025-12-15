import axios from 'axios';

import { getFreshIdToken } from '../../context/auth';

// ---------------------------------------------------------------------

const httpRequests = axios.create({
  baseURL: import.meta.env.VITE_API_HOST,
});

httpRequests.interceptors.request.use(
  async (config) => {
    const idToken = await getFreshIdToken();

    if (idToken && config.headers['Content-Type'] !== 'binary/octet-stream') {
      config.headers.Authorization = `${idToken}`;
    }
    return config;
  },
  (error) => {}
);

export default httpRequests;

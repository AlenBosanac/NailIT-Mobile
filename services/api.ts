import CookieManager from '@react-native-cookies/cookies';
import axios from 'axios';

const API_BASE_URL = 'http://10.0.2.2:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Ručno dodaj cookies na svaki request
api.interceptors.request.use(async (config) => {
  const cookies = await CookieManager.get(API_BASE_URL);
  const cookieHeader = Object.entries(cookies)
    .map(([key, val]) => `${key}=${val.value}`)
    .join('; ');

  if (cookieHeader) {
    config.headers.Cookie = cookieHeader;
  }
  return config;
});

export default api;
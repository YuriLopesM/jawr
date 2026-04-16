import axios from 'axios';

export const radioAPI = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_AZURACAST_URL}/api`,
  timeout: 5000,
});

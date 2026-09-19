export const API_BASE_URL = (
  import.meta.env?.VITE_API_BASE_URL || 'https://api.jhamtani.com'
).replace(/\/$/, '');

export const getApiBaseUrl = () => API_BASE_URL;

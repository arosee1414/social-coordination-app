import axios, { AxiosInstance } from 'axios';

// Base URL for the API - update this for production
const API_BASE_URL = __DEV__
  ? 'http://localhost:5219'
  : 'https://your-production-url.azurewebsites.net';

/**
 * Creates an Axios instance configured for the Social Coordination API.
 * Call this with the Clerk session token to make authenticated requests.
 */
export function createApiClient(getToken: () => Promise<string | null>): AxiosInstance {
  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Inject Clerk JWT token into every request
  client.interceptors.request.use(async (config) => {
    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Failed to get auth token:', error);
    }
    return config;
  });

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.warn('Unauthorized - token may be expired');
      }
      return Promise.reject(error);
    }
  );

  return client;
}

/**
 * Usage with Clerk in a React component:
 *
 * import { useAuth } from '@clerk/clerk-expo';
 * import { createApiClient } from '@/clients/api-client';
 *
 * const { getToken } = useAuth();
 * const apiClient = createApiClient(getToken);
 *
 * // Once the NSwag-generated client is available:
 * // import { SocialCoordinationApiClient } from '@/clients/generatedClient';
 * // const api = new SocialCoordinationApiClient('', apiClient);
 * // const user = await api.getCurrentUser();
 */
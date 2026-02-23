import axios, { AxiosInstance } from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Base URL for the API - update this for production
const getDevBaseUrl = () => {
  // For Expo Go on a physical device, use the dev machine's LAN IP
  // Expo provides this via hostUri (e.g., "192.168.1.10:8081")
  const debuggerHost = Constants.expoConfig?.hostUri?.split(':')[0];

  if (Platform.OS === 'android' && !debuggerHost) {
    return 'http://10.0.2.2:5219'; // Android emulator fallback
  }

  if (debuggerHost) {
    return `http://${debuggerHost}:5219`;
  }

  return 'http://localhost:5219'; // web / fallback
};

const API_BASE_URL = __DEV__
  ? getDevBaseUrl()
  : 'https://your-production-url.azurewebsites.net';

if (__DEV__) {
  console.log('[API Client] Base URL:', API_BASE_URL);
}

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
    timeout: 10000, // 10 second timeout to surface hung connections faster
  });

  // Inject Clerk JWT token into every request
  client.interceptors.request.use(async (config) => {
    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (__DEV__) {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
      }
    } catch (error) {
      console.warn('[API Client] Failed to get auth token:', error);
    }
    return config;
  });

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => {
      if (__DEV__) {
        console.log(`[API Response] ${response.status} ${response.config.url}`);
      }
      return response;
    },
    (error) => {
      if (__DEV__) {
        console.error('[API Error] Full error details:', {
          message: error.message,
          code: error.code, // e.g. ERR_NETWORK, ECONNREFUSED, ECONNABORTED
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          method: error.config?.method,
          status: error.response?.status,
          statusText: error.response?.statusText,
          responseData: error.response?.data,
          isNetworkError: !error.response, // true means no response received at all
        });
      }
      if (error.response?.status === 401) {
        console.warn('[API Client] Unauthorized - token may be expired');
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
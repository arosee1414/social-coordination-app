import { useContext } from 'react';
import { ApiClientContext } from '@/src/contexts/ApiClientContext';
import { SocialCoordinationApiClient } from '@/src/clients/generatedClient';

export function useApiClient(): SocialCoordinationApiClient {
    const client = useContext(ApiClientContext);
    if (!client) {
        throw new Error(
            'useApiClient must be used within an ApiClientProvider',
        );
    }
    return client;
}
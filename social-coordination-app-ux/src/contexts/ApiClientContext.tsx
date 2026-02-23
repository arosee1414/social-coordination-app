import React, { createContext, useMemo } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { createApiClient } from '@/src/clients/api-client';
import { SocialCoordinationApiClient } from '@/src/clients/generatedClient';

const ApiClientContext = createContext<SocialCoordinationApiClient | null>(
    null,
);

export function ApiClientProvider({ children }: { children: React.ReactNode }) {
    const { getToken } = useAuth();

    const apiClient = useMemo(() => {
        const axiosInstance = createApiClient(getToken);
        return new SocialCoordinationApiClient('', axiosInstance);
    }, [getToken]);

    return (
        <ApiClientContext.Provider value={apiClient}>
            {children}
        </ApiClientContext.Provider>
    );
}

export { ApiClientContext };

import { useState, useCallback } from 'react';
import { useApiClient } from './useApiClient';
import type { UserResponse } from '@/src/clients/generatedClient';

export function useApiUserSearch() {
    const api = useApiClient();
    const [results, setResults] = useState<UserResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchUsers = useCallback(
        async (query: string) => {
            if (!query || query.length < 2) {
                setResults([]);
                return;
            }
            try {
                setLoading(true);
                setError(null);
                const result = await api.search(query);
                setResults(result ?? []);
            } catch (err: any) {
                setError(err?.message ?? 'Search failed');
                console.warn('useApiUserSearch error:', err);
            } finally {
                setLoading(false);
            }
        },
        [api],
    );

    return { results, loading, error, searchUsers };
}
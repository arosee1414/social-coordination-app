import { useState, useEffect, useCallback } from 'react';
import { useApiClient } from './useApiClient';
import type { UserResponse, CreateUserRequest, UpdateUserRequest } from '@/src/clients/generatedClient';

export function useApiUser() {
    const api = useApiClient();
    const [user, setUser] = useState<UserResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUser = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await api.meGET();
            setUser(result);
        } catch (err: any) {
            // 404 means user not registered yet — not an error
            if (err?.status === 404) {
                setUser(null);
            } else {
                setError(err?.message ?? 'Failed to fetch user profile');
                console.warn('useApiUser fetch error:', err);
            }
        } finally {
            setLoading(false);
        }
    }, [api]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const createUser = useCallback(
        async (req: CreateUserRequest) => {
            try {
                const result = await api.mePOST(req);
                setUser(result);
            } catch (err: any) {
                setError(err?.message ?? 'Failed to create user');
                throw err;
            }
        },
        [api],
    );

    const updateUser = useCallback(
        async (req: UpdateUserRequest) => {
            try {
                const result = await api.mePUT(req);
                setUser(result);
            } catch (err: any) {
                setError(err?.message ?? 'Failed to update user');
                throw err;
            }
        },
        [api],
    );

    return { user, loading, error, refetch: fetchUser, createUser, updateUser };
}
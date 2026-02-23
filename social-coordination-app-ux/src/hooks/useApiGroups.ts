import { useState, useEffect, useCallback } from 'react';
import { useApiClient } from './useApiClient';
import type { Group } from '@/src/types';
import { mapGroupSummaryToGroup } from '@/src/utils/api-mappers';

export function useApiGroups() {
    const api = useApiClient();
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchGroups = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await api.groupsAll();
            setGroups((result ?? []).map(mapGroupSummaryToGroup));
        } catch (err: any) {
            setError(err?.message ?? 'Failed to fetch groups');
            console.warn('useApiGroups fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [api]);

    useEffect(() => {
        fetchGroups();
    }, [fetchGroups]);

    return { groups, loading, error, refetch: fetchGroups };
}
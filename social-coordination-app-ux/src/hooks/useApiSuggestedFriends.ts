import { useState, useCallback, useEffect } from 'react';
import { useApiClient } from './useApiClient';
import type { SuggestedFriendResponse } from '../clients/generatedClient';

export interface SuggestedFriend {
    userId: string;
    displayName: string;
    avatarUrl: string | null;
    mutualGroupCount: number;
    mutualHangoutCount: number;
    mutualGroupNames: string[];
    mutualHangoutNames: string[];
}

function mapSuggestion(dto: SuggestedFriendResponse): SuggestedFriend {
    return {
        userId: dto.userId ?? '',
        displayName: dto.displayName ?? 'Unknown',
        avatarUrl: dto.avatarUrl ?? null,
        mutualGroupCount: dto.mutualGroupCount ?? 0,
        mutualHangoutCount: dto.mutualHangoutCount ?? 0,
        mutualGroupNames: dto.mutualGroupNames ?? [],
        mutualHangoutNames: dto.mutualHangoutNames ?? [],
    };
}

export function useApiSuggestedFriends() {
    const apiClient = useApiClient();
    const [suggestions, setSuggestions] = useState<SuggestedFriend[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSuggestions = useCallback(async () => {
        if (!apiClient) return;
        setLoading(true);
        setError(null);
        try {
            const result = await apiClient.suggested();
            setSuggestions(result.map(mapSuggestion));
        } catch (err) {
            setError('Failed to load suggestions');
        } finally {
            setLoading(false);
        }
    }, [apiClient]);

    useEffect(() => {
        fetchSuggestions();
    }, [fetchSuggestions]);

    const removeSuggestion = useCallback((userId: string) => {
        setSuggestions((prev) => prev.filter((s) => s.userId !== userId));
    }, []);

    return {
        suggestions,
        loading,
        error,
        refetch: fetchSuggestions,
        removeSuggestion,
    };
}
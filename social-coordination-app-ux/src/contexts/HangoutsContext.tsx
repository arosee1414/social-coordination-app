import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    type ReactNode,
} from 'react';
import type { Hangout, RSVPStatus } from '@/src/types';
import { useApiClient } from '@/src/hooks/useApiClient';
import {
    mapHangoutSummaryToHangout,
    mapRsvpStatusToApi,
} from '@/src/utils/api-mappers';
import { UpdateRSVPRequest } from '@/src/clients/generatedClient';
import { useAuth } from '@clerk/clerk-expo';

interface HangoutsContextValue {
    hangouts: Hangout[];
    loading: boolean;
    error: string | null;
    updateRSVP: (hangoutId: string, status: RSVPStatus) => void;
    refetch: () => Promise<void>;
}

const HangoutsContext = createContext<HangoutsContextValue | undefined>(
    undefined,
);

export function HangoutsProvider({ children }: { children: ReactNode }) {
    const api = useApiClient();
    const { isSignedIn } = useAuth();
    const [hangouts, setHangouts] = useState<Hangout[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHangouts = useCallback(async () => {
        if (!isSignedIn) {
            setHangouts([]);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const result = await api.hangoutsAll();
            setHangouts((result ?? []).map(mapHangoutSummaryToHangout));
        } catch (err: any) {
            setError(err?.message ?? 'Failed to fetch hangouts');
            console.warn('HangoutsContext fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [api, isSignedIn]);

    useEffect(() => {
        fetchHangouts();
    }, [fetchHangouts]);

    const updateRSVP = useCallback(
        async (hangoutId: string, status: RSVPStatus) => {
            // Optimistic update
            setHangouts((prev) =>
                prev.map((h) =>
                    h.id === hangoutId ? { ...h, userStatus: status } : h,
                ),
            );

            try {
                const req = new UpdateRSVPRequest();
                req.status = mapRsvpStatusToApi(status ?? '');
                await api.rsvp(hangoutId, req);
            } catch (err: any) {
                console.warn('RSVP update failed:', err);
                // Revert on failure
                await fetchHangouts();
            }
        },
        [api, fetchHangouts],
    );

    return (
        <HangoutsContext.Provider
            value={{
                hangouts,
                loading,
                error,
                updateRSVP,
                refetch: fetchHangouts,
            }}
        >
            {children}
        </HangoutsContext.Provider>
    );
}

export function useHangouts() {
    const ctx = useContext(HangoutsContext);
    if (!ctx) {
        throw new Error('useHangouts must be used within a HangoutsProvider');
    }
    return ctx;
}

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
import { useAuth, useUser } from '@clerk/clerk-expo';

interface HangoutsContextValue {
    hangouts: Hangout[];
    loading: boolean;
    error: string | null;
    updateRSVP: (hangoutId: string, status: RSVPStatus) => Promise<void>;
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

    const { user } = useUser();

    const updateRSVP = useCallback(
        async (hangoutId: string, status: RSVPStatus) => {
            const userAvatar = user?.imageUrl ?? null;

            // Optimistic update — also update face stack & counts
            setHangouts((prev) =>
                prev.map((h) => {
                    if (h.id !== hangoutId) return h;

                    const prevStatus = h.userStatus;
                    const wasGoing = prevStatus === 'going';
                    const nowGoing = status === 'going';
                    const wasMaybe = prevStatus === 'maybe';
                    const nowMaybe = status === 'maybe';

                    let attendeesPreview = [...h.attendeesPreview];
                    let goingCount = h.goingCount ?? h.going;
                    let going = h.going;
                    let maybe = h.maybe;

                    // Adjust going count & face stack
                    if (wasGoing && !nowGoing) {
                        goingCount = Math.max(0, goingCount - 1);
                        going = Math.max(0, going - 1);
                        // Remove the user's avatar from preview
                        const idx = attendeesPreview.indexOf(userAvatar);
                        if (idx !== -1) {
                            attendeesPreview.splice(idx, 1);
                        }
                    }
                    if (!wasGoing && nowGoing) {
                        goingCount += 1;
                        going += 1;
                        // Add user's avatar to the front of the preview
                        attendeesPreview = [userAvatar, ...attendeesPreview];
                    }

                    // Adjust maybe count
                    if (wasMaybe && !nowMaybe) {
                        maybe = Math.max(0, maybe - 1);
                    }
                    if (!wasMaybe && nowMaybe) {
                        maybe += 1;
                    }

                    return {
                        ...h,
                        userStatus: status,
                        attendeesPreview,
                        goingCount,
                        going,
                        maybe,
                    };
                }),
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
        [api, fetchHangouts, user],
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

import { useState, useEffect, useCallback } from 'react';
import { useApiClient } from './useApiClient';
import type { HangoutResponse } from '@/src/clients/generatedClient';
import type { Hangout, AttendeesByStatus } from '@/src/types';
import { mapHangoutResponseToHangout, mapAttendeesToRsvpGroups, mapRsvpStatus } from '@/src/utils/api-mappers';
import { RSVPStatus as ApiRSVPStatus } from '@/src/clients/generatedClient';

export function useApiHangoutDetail(hangoutId: string, currentUserId?: string) {
    const api = useApiClient();
    const [hangoutResponse, setHangoutResponse] = useState<HangoutResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHangoutDetail = useCallback(async () => {
        if (!hangoutId) return;
        try {
            setLoading(true);
            setError(null);
            const result = await api.hangoutsGET(hangoutId);
            setHangoutResponse(result);
        } catch (err: any) {
            setError(err?.message ?? 'Failed to fetch hangout detail');
            console.warn('useApiHangoutDetail fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [api, hangoutId]);

    useEffect(() => {
        fetchHangoutDetail();
    }, [fetchHangoutDetail]);

    let hangout: Hangout | null = null;
    let attendeesByStatus: AttendeesByStatus = { going: [], maybe: [], notGoing: [] };

    if (hangoutResponse) {
        hangout = mapHangoutResponseToHangout(hangoutResponse);

        // Set user's RSVP status based on current user
        if (currentUserId && hangoutResponse.attendees) {
            const userAttendee = hangoutResponse.attendees.find(
                (a) => a.userId === currentUserId,
            );
            if (userAttendee) {
                hangout.userStatus = mapRsvpStatus(userAttendee.rsvpStatus);
            }
        }

        attendeesByStatus = mapAttendeesToRsvpGroups(hangoutResponse.attendees ?? []);
    }

    return {
        hangout,
        attendeesByStatus,
        description: hangoutResponse?.description ?? null,
        loading,
        error,
        refetch: fetchHangoutDetail,
    };
}
import type {
    HangoutSummaryResponse,
    HangoutResponse,
    HangoutAttendeeResponse,
    GroupSummaryResponse,
    GroupMemberResponse,
} from '@/src/clients/generatedClient';
import { HangoutStatus as ApiHangoutStatus, RSVPStatus as ApiRSVPStatus } from '@/src/clients/generatedClient';
import type { Hangout, RSVPStatus, HangoutStatus, Attendee, AttendeesByStatus, Group, GroupMember } from '@/src/types';

/**
 * Convert API HangoutStatus enum to frontend HangoutStatus string
 */
function mapHangoutStatus(status: ApiHangoutStatus | undefined): HangoutStatus {
    switch (status) {
        case ApiHangoutStatus.Active:
            return 'upcoming';
        case ApiHangoutStatus.Cancelled:
            return 'cancelled';
        case ApiHangoutStatus.Completed:
            return 'past';
        default:
            return 'upcoming';
    }
}

/**
 * Convert API RSVPStatus enum to frontend RSVPStatus string
 */
export function mapRsvpStatus(status: ApiRSVPStatus | undefined): RSVPStatus {
    switch (status) {
        case ApiRSVPStatus.Going:
            return 'going';
        case ApiRSVPStatus.Maybe:
            return 'maybe';
        case ApiRSVPStatus.NotGoing:
            return 'not-going';
        case ApiRSVPStatus.Pending:
        default:
            return null;
    }
}

/**
 * Convert frontend RSVPStatus string to API RSVPStatus enum
 */
export function mapRsvpStatusToApi(status: string): ApiRSVPStatus {
    switch (status) {
        case 'going':
            return ApiRSVPStatus.Going;
        case 'maybe':
            return ApiRSVPStatus.Maybe;
        case 'not-going':
            return ApiRSVPStatus.NotGoing;
        default:
            return ApiRSVPStatus.Pending;
    }
}

/**
 * Format a date into a human-readable time string
 */
function formatTime(date: Date | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

/**
 * Format a date into a human-readable date string
 */
function formatDate(date: Date | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

/**
 * Compute a human-readable "time until" string from a scheduled date
 */
export function formatTimeUntil(startTime: Date | undefined): string {
    if (!startTime) return '';
    const now = new Date();
    const scheduled = new Date(startTime);
    const diffMs = scheduled.getTime() - now.getTime();

    if (diffMs < 0) return 'Started';

    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `in ${diffMins}m`;
    if (diffHours < 24) return `in ${diffHours}h`;
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `in ${diffDays} days`;
    return formatDate(startTime);
}

/**
 * Determine if a hangout is currently "live" (happening now)
 */
function isLive(startTime: Date | undefined, endTime: Date | undefined | null, status: ApiHangoutStatus | undefined): boolean {
    if (status !== ApiHangoutStatus.Active) return false;
    if (!startTime) return false;
    const now = new Date();
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date(start.getTime() + 8 * 60 * 60 * 1000); // default 8 hours
    return now >= start && now <= end;
}

/**
 * Determine if a hangout has ended (start+end window has passed)
 */
function isPast(startTime: Date | undefined, endTime: Date | undefined | null): boolean {
    if (!startTime) return false;
    const now = new Date();
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date(start.getTime() + 8 * 60 * 60 * 1000);
    return now > end;
}

/**
 * Map HangoutSummaryResponse to frontend Hangout type
 */
export function mapHangoutSummaryToHangout(response: HangoutSummaryResponse): Hangout {
    const live = isLive(response.startTime, response.endTime, response.status);
    const past = !live && isPast(response.startTime, response.endTime);
    const hangoutStatus: HangoutStatus = live ? 'live' : past ? 'past' : mapHangoutStatus(response.status);

    return {
        id: response.id ?? '',
        title: response.title ?? '',
        time: formatTime(response.startTime),
        timeUntil: live ? 'Happening now' : past ? formatDate(response.startTime) : formatTimeUntil(response.startTime),
        location: response.location ?? null,
        creator: '', // Not available in summary response
        creatorId: response.createdByUserId ?? '',
        groupId: response.groupId ?? null,
        going: response.attendeeCount ?? 0,
        maybe: 0, // Not available in summary
        userStatus: mapRsvpStatus(response.currentUserRsvpStatus),
        attendeesPreview: (response.attendeeAvatarUrls ?? []).filter(
            (url: string | null | undefined) => !!url,
        ),
        status: hangoutStatus,
        attendeeCount: response.attendeeCount,
        date: formatDate(response.startTime),
        startTime: response.startTime ? new Date(response.startTime) : undefined,
    };
}

/**
 * Map HangoutResponse (detail) to frontend Hangout type
 */
export function mapHangoutResponseToHangout(response: HangoutResponse): Hangout {
    const live = isLive(response.startTime, response.endTime, response.status);
    const past = !live && isPast(response.startTime, response.endTime);
    const hangoutStatus: HangoutStatus = live ? 'live' : past ? 'past' : mapHangoutStatus(response.status);
    const attendees = response.attendees ?? [];
    const goingCount = attendees.filter(a => a.rsvpStatus === ApiRSVPStatus.Going).length;
    const maybeCount = attendees.filter(a => a.rsvpStatus === ApiRSVPStatus.Maybe).length;

    return {
        id: response.id ?? '',
        title: response.title ?? '',
        time: formatTime(response.startTime),
        timeUntil: live ? 'Happening now' : past ? formatDate(response.startTime) : formatTimeUntil(response.startTime),
        location: response.location ?? null,
        creator: response.createdByUserName || response.createdByUserId || '',
        creatorId: response.createdByUserId ?? '',
        groupId: response.groupId ?? null,
        going: goingCount,
        maybe: maybeCount,
        userStatus: null, // Will be set by the hook based on current user
        attendeesPreview: attendees
            .filter(a => a.rsvpStatus === ApiRSVPStatus.Going)
            .slice(0, 3)
            .map(a => a.userId ?? ''),
        status: hangoutStatus,
        attendeeCount: attendees.length,
        date: formatDate(response.startTime),
        startTime: response.startTime ? new Date(response.startTime) : undefined,
        description: response.description ?? null,
    };
}

/**
 * Map a HangoutAttendeeResponse to a frontend Attendee
 */
export function mapAttendeeToDisplayAttendee(attendee: HangoutAttendeeResponse): Attendee {
    return {
        name: attendee.displayName || attendee.userId || 'Unknown',
        avatar: attendee.profileImageUrl ?? null,
        time: attendee.respondedAt ? formatTime(attendee.respondedAt) : undefined,
        fromGroup: null,
    };
}

/**
 * Group attendees by RSVP status for the hangout detail tabs
 */
export function mapAttendeesToRsvpGroups(attendees: HangoutAttendeeResponse[]): AttendeesByStatus {
    const going: Attendee[] = [];
    const maybe: Attendee[] = [];
    const notGoing: Attendee[] = [];

    for (const attendee of attendees) {
        const mapped = mapAttendeeToDisplayAttendee(attendee);
        switch (attendee.rsvpStatus) {
            case ApiRSVPStatus.Going:
                going.push(mapped);
                break;
            case ApiRSVPStatus.Maybe:
                maybe.push(mapped);
                break;
            case ApiRSVPStatus.NotGoing:
                notGoing.push(mapped);
                break;
            // Pending attendees not shown in RSVP tabs
        }
    }

    return { going, maybe, notGoing };
}

/**
 * Map GroupSummaryResponse to frontend Group type
 */
export function mapGroupSummaryToGroup(response: GroupSummaryResponse): Group {
    return {
        id: response.id ?? '',
        name: response.name ?? '',
        icon: response.emoji ?? '👥',
        memberCount: response.memberCount ?? 0,
    };
}

/**
 * Map GroupMemberResponse to frontend GroupMember type
 */
export function mapGroupMemberToDisplayMember(member: GroupMemberResponse): GroupMember {
    return {
        name: member.userId ?? 'Unknown',
        avatar: '👤',
        role: member.role === 'Admin' ? 'Admin' : 'Member',
    };
}

export type RSVPStatus = 'going' | 'maybe' | 'not-going' | null;

export type HangoutStatus = 'live' | 'upcoming' | 'past' | 'cancelled';

export interface Hangout {
    id: string;
    title: string;
    time: string;
    timeUntil: string;
    location: string | null;
    locationDetail?: string;
    creator: string;
    creatorId: string;
    groupId: string | null;
    going: number;
    maybe: number;
    userStatus: RSVPStatus;
    attendeesPreview: string[];
    // Home screen redesign fields
    status: HangoutStatus;
    attendeeCount?: number;
    date?: string;
    startTime?: Date;
}

export interface RecentActivity {
    id: string;
    text: string;
    avatar: string;
}

export interface ReminderBanner {
    id: string;
    title: string;
    subtitle: string;
}

export interface Attendee {
    name: string;
    avatar: string | null;
    time?: string;
    fromGroup?: string | null;
}

export interface AttendeesByStatus {
    going: Attendee[];
    maybe: Attendee[];
    notGoing: Attendee[];
}

export interface InvitedGroup {
    id: string;
    name: string;
    icon: string;
    memberCount: number;
    membersPreview: string[];
}

export interface Group {
    id: string;
    name: string;
    icon: string;
    memberCount: number;
}

export interface GroupMember {
    name: string;
    avatar: string;
    role: 'Admin' | 'Member';
}

export interface Friend {
    id: string;
    name: string;
    avatar: string;
    phone?: string;
}

export interface Notification {
    id: string;
    type: 'rsvp' | 'invite' | 'reminder' | 'group' | 'friend' | 'group_created';
    icon?: string;
    title: string;
    message: string;
    time: string;
    unread: boolean;
    color?: string;
    relatedEntityId?: string;
}

export interface ProfileStat {
    label: string;
    value: string;
}

export interface SettingsItem {
    iconName: string;
    label: string;
    badge?: string | null;
}

export interface SettingsSection {
    title: string;
    items: SettingsItem[];
}

export interface FriendProfile {
    id: string;
    name: string;
    avatar: string;
    friendsSince: string;
    mutualGroups: number;
    mutualFriends: number;
    bio?: string;
    hangoutsTogether: number;
    lastHangout: string;
}

export interface FriendGroupInCommon {
    id: string;
    name: string;
    icon: string;
    memberCount: number;
}

export interface FriendUpcomingHangout {
    id: string;
    title: string;
    time: string;
    date: string;
    groupName: string;
}

export interface FriendRecentActivity {
    id: string;
    text: string;
    time: string;
    icon: string;
}

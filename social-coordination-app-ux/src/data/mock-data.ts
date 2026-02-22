import {
    Hangout,
    AttendeesByStatus,
    InvitedGroup,
    Friend,
    Group,
    GroupMember,
    Notification,
    ProfileStat,
    SettingsSection,
    RecentActivity,
    ReminderBanner,
} from '../types';

export const mockHangouts: Hangout[] = [
    // Live hangouts
    {
        id: '4',
        title: 'Basketball at the park',
        time: 'Now · Started 20m ago',
        timeUntil: 'Live',
        location: 'Central Park Courts',
        locationDetail: 'Court 3, near the fountain',
        creator: 'Alex Turner',
        going: 6,
        maybe: 0,
        userStatus: null,
        attendeesPreview: ['👨🏼', '👨🏽', '👩🏻', '👨🏻', '👩🏽', '👩🏾'],
        status: 'live',
        attendeeCount: 6,
        date: 'Today',
    },
    {
        id: '5',
        title: 'Coffee & coworking',
        time: 'Now · Started 45m ago',
        timeUntil: 'Live',
        location: 'Blue Bottle Coffee',
        locationDetail: '789 Market St',
        creator: 'Nina Patel',
        going: 3,
        maybe: 1,
        userStatus: null,
        attendeesPreview: ['👩🏾', '👨🏻', '👩🏼'],
        status: 'live',
        attendeeCount: 3,
        date: 'Today',
    },
    // Upcoming hangouts
    {
        id: '1',
        title: 'Drinks at The Rooftop',
        time: 'Tonight at 7:00 PM',
        timeUntil: '4h 30m',
        location: 'The Rooftop Bar',
        locationDetail: '123 Main St, Downtown',
        creator: 'Sarah Chen',
        going: 5,
        maybe: 2,
        userStatus: 'going',
        attendeesPreview: ['👩🏻', '👨🏽', '👩🏼', '👨🏻', '👩🏽'],
        status: 'upcoming',
        attendeeCount: 7,
        date: 'Today',
    },
    {
        id: '2',
        title: 'Weekend brunch catch-up',
        time: 'Saturday at 11:00 AM',
        timeUntil: '2d',
        location: 'Maple Café',
        locationDetail: '456 Oak Ave',
        creator: 'Mike Johnson',
        going: 3,
        maybe: 4,
        userStatus: 'maybe',
        attendeesPreview: ['👨🏽', '👩🏼', '👨🏻'],
        status: 'upcoming',
        attendeeCount: 7,
        date: 'Sat, Feb 22',
    },
    {
        id: '3',
        title: 'Movie night',
        time: 'Friday at 8:00 PM',
        timeUntil: '1d 6h',
        location: null,
        creator: 'Emma Wilson',
        going: 4,
        maybe: 1,
        userStatus: null,
        attendeesPreview: ['👩🏼', '👨🏻', '👩🏾', '👨🏼'],
        status: 'upcoming',
        attendeeCount: 5,
        date: 'Fri, Feb 21',
    },
];

export const mockRecentActivity: RecentActivity[] = [
    { id: 'ra1', text: 'Sarah is going to Drinks at The Rooftop', avatar: '👩🏻' },
    { id: 'ra2', text: 'Mike created Weekend brunch catch-up', avatar: '👨🏽' },
    { id: 'ra3', text: 'Emma invited Close Friends to Movie night', avatar: '👩🏼' },
    { id: 'ra4', text: 'Alex joined Basketball at the park', avatar: '👨🏼' },
    { id: 'ra5', text: 'Nina started Coffee & coworking', avatar: '👩🏾' },
];

export const mockReminderBanner: ReminderBanner = {
    id: 'rem1',
    title: 'You haven\'t RSVP\'d to Movie night',
    subtitle: 'Starts Friday at 8:00 PM — respond now!',
};

export const mockAttendees: AttendeesByStatus = {
    going: [
        {
            name: 'Sarah Chen',
            avatar: '👩🏻',
            time: 'RSVP 2h ago',
            fromGroup: 'Close Friends',
        },
        {
            name: 'Mike Johnson',
            avatar: '👨🏽',
            time: 'RSVP 1h ago',
            fromGroup: 'Close Friends',
        },
        {
            name: 'Emma Wilson',
            avatar: '👩🏼',
            time: 'RSVP 45m ago',
            fromGroup: 'Close Friends',
        },
        {
            name: 'David Kim',
            avatar: '👨🏻',
            time: 'RSVP 30m ago',
            fromGroup: null,
        },
        {
            name: 'Lisa Martinez',
            avatar: '👩🏽',
            time: 'RSVP 15m ago',
            fromGroup: null,
        },
    ],
    maybe: [
        {
            name: 'Alex Turner',
            avatar: '👨🏼',
            time: 'RSVP 1h ago',
            fromGroup: 'Close Friends',
        },
        {
            name: 'Nina Patel',
            avatar: '👩🏾',
            time: 'RSVP 20m ago',
            fromGroup: 'Close Friends',
        },
    ],
    notGoing: [
        {
            name: 'Tom Anderson',
            avatar: '👨🏻',
            time: 'RSVP 3h ago',
            fromGroup: null,
        },
    ],
};

export const mockInvitedGroups: InvitedGroup[] = [
    {
        id: 'g1',
        name: 'Close Friends',
        icon: '💜',
        memberCount: 5,
        membersPreview: ['👩🏻', '👨🏽', '👩🏼'],
    },
];

export const mockInvitedFriends = [
    { name: 'David Kim', avatar: '👨🏻' },
    { name: 'Lisa Martinez', avatar: '👩🏽' },
];

export const mockFriends: Friend[] = [
    { id: '1', name: 'Sarah Chen', avatar: '👩🏻', phone: '+1 (555) 123-4567' },
    {
        id: '2',
        name: 'Mike Johnson',
        avatar: '👨🏽',
        phone: '+1 (555) 234-5678',
    },
    {
        id: '3',
        name: 'Emma Wilson',
        avatar: '👩🏼',
        phone: '+1 (555) 345-6789',
    },
    { id: '4', name: 'David Kim', avatar: '👨🏻', phone: '+1 (555) 456-7890' },
    {
        id: '5',
        name: 'Lisa Martinez',
        avatar: '👩🏽',
        phone: '+1 (555) 567-8901',
    },
    { id: '6', name: 'Alex Turner', avatar: '👨🏼' },
    { id: '7', name: 'Nina Patel', avatar: '👩🏾' },
    { id: '8', name: 'Tom Anderson', avatar: '👨🏻' },
];

export const mockGroups: Group[] = [
    { id: '1', name: 'Close Friends', icon: '💜', memberCount: 5 },
    { id: '2', name: 'Basketball Crew', icon: '🏀', memberCount: 8 },
    { id: '3', name: 'Roommates', icon: '🏠', memberCount: 3 },
    { id: '4', name: 'College Squad', icon: '🎓', memberCount: 12 },
];

export const mockGroupMembers: GroupMember[] = [
    { name: 'Sarah Chen', avatar: '👩🏻', role: 'Admin' },
    { name: 'Mike Johnson', avatar: '👨🏽', role: 'Member' },
    { name: 'Emma Wilson', avatar: '👩🏼', role: 'Member' },
    { name: 'David Kim', avatar: '👨🏻', role: 'Member' },
    { name: 'Lisa Martinez', avatar: '👩🏽', role: 'Member' },
];

export const mockNotifications: Notification[] = [
    {
        id: '1',
        type: 'rsvp',
        icon: '👩🏻',
        title: 'Sarah Chen is going',
        message: 'to "Drinks at The Rooftop"',
        time: '5m ago',
        unread: true,
    },
    {
        id: '2',
        type: 'invite',
        icon: '👨🏽',
        title: 'Mike Johnson invited you',
        message: 'to "Weekend brunch catch-up"',
        time: '1h ago',
        unread: true,
    },
    {
        id: '3',
        type: 'reminder',
        title: 'Hangout starting soon',
        message: '"Drinks at The Rooftop" starts in 2 hours',
        time: '2h ago',
        unread: false,
        color: '#3B82F6',
    },
    {
        id: '4',
        type: 'group',
        icon: '💜',
        title: 'Group invited to hangout',
        message: 'Close Friends was invited to "Movie night"',
        time: '3h ago',
        unread: false,
    },
    {
        id: '5',
        type: 'rsvp',
        icon: '👨🏻',
        title: 'David Kim is maybe',
        message: 'for "Weekend brunch catch-up"',
        time: '5h ago',
        unread: false,
    },
    {
        id: '6',
        type: 'friend',
        icon: '👩🏽',
        title: 'Lisa Martinez accepted your invite',
        message: 'You can now plan hangouts together',
        time: '1d ago',
        unread: false,
    },
    {
        id: '7',
        type: 'group_created',
        title: 'New group created',
        message: 'You created "Basketball Crew" with 8 members',
        time: '2d ago',
        unread: false,
        color: '#22C55E',
    },
];

export const profileStats: ProfileStat[] = [
    { label: 'Plans Created', value: '24' },
    { label: 'Groups', value: '5' },
    { label: 'Friends', value: '32' },
];

export const settingsSections: SettingsSection[] = [
    {
        title: 'Account',
        items: [
            { iconName: 'people', label: 'Manage Friends', badge: null },
            { iconName: 'notifications', label: 'Notifications', badge: null },
            { iconName: 'calendar', label: 'Calendar Sync', badge: null },
        ],
    },
    {
        title: 'Support',
        items: [
            { iconName: 'help-circle', label: 'Help & Feedback', badge: null },
        ],
    },
];

export const emojiOptions = [
    '💜',
    '🏀',
    '⚽',
    '🎾',
    '🏊',
    '🎮',
    '🎲',
    '🎸',
    '🎨',
    '☕',
    '🍺',
    '📚',
    '🎬',
    '🧘‍♀️',
    '⛰️',
    '🚴',
    '🏃',
    '🎵',
    '🏠',
    '🎓',
    '💼',
    '✈️',
];

export const mockSuggestedFriends = [
    { id: 's1', name: 'Jordan Lee', avatar: '👨🏻', mutualFriends: 5 },
    { id: 's2', name: 'Ava Thompson', avatar: '👩🏼', mutualFriends: 3 },
    { id: 's3', name: 'Marcus Brown', avatar: '👨🏾', mutualFriends: 8 },
    { id: 's4', name: 'Priya Sharma', avatar: '👩🏽', mutualFriends: 2 },
    { id: 's5', name: 'Carlos Rivera', avatar: '👨🏽', mutualFriends: 4 },
    { id: 's6', name: 'Olivia Park', avatar: '👩🏻', mutualFriends: 6 },
];

export const groupBgColors: Record<
    string,
    { light: { from: string; to: string }; dark: { from: string; to: string } }
> = {
    '1': {
        light: { from: '#F3E8FF', to: '#E9D5FF' }, // purple-100 to purple-200
        dark: { from: 'rgba(168, 85, 247, 0.15)', to: 'rgba(168, 85, 247, 0.20)' },
    },
    '2': {
        light: { from: '#FFEDD5', to: '#FED7AA' }, // orange-100 to orange-200
        dark: { from: 'rgba(249, 115, 22, 0.15)', to: 'rgba(249, 115, 22, 0.20)' },
    },
    '3': {
        light: { from: '#DBEAFE', to: '#BFDBFE' }, // blue-100 to blue-200
        dark: { from: 'rgba(59, 130, 246, 0.15)', to: 'rgba(59, 130, 246, 0.20)' },
    },
    '4': {
        light: { from: '#DCFCE7', to: '#BBF7D0' }, // green-100 to green-200
        dark: { from: 'rgba(34, 197, 94, 0.15)', to: 'rgba(34, 197, 94, 0.20)' },
    },
};

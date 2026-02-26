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
    FriendProfile,
    FriendGroupInCommon,
    FriendUpcomingHangout,
    FriendRecentActivity,
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
        creatorId: 'mock-user-1',
        groupId: null,
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
        creatorId: 'mock-user-2',
        groupId: null,
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
        creatorId: 'mock-user-3',
        groupId: null,
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
        creatorId: 'mock-user-4',
        groupId: null,
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
        creatorId: 'mock-user-5',
        groupId: null,
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
            userId: 'mock-sarah',
            name: 'Sarah Chen',
            avatar: '👩🏻',
            time: 'RSVP 2h ago',
            fromGroup: 'Close Friends',
        },
        {
            userId: 'mock-mike',
            name: 'Mike Johnson',
            avatar: '👨🏽',
            time: 'RSVP 1h ago',
            fromGroup: 'Close Friends',
        },
        {
            userId: 'mock-emma',
            name: 'Emma Wilson',
            avatar: '👩🏼',
            time: 'RSVP 45m ago',
            fromGroup: 'Close Friends',
        },
        {
            userId: 'mock-david',
            name: 'David Kim',
            avatar: '👨🏻',
            time: 'RSVP 30m ago',
            fromGroup: null,
        },
        {
            userId: 'mock-lisa',
            name: 'Lisa Martinez',
            avatar: '👩🏽',
            time: 'RSVP 15m ago',
            fromGroup: null,
        },
    ],
    maybe: [
        {
            userId: 'mock-alex',
            name: 'Alex Turner',
            avatar: '👨🏼',
            time: 'RSVP 1h ago',
            fromGroup: 'Close Friends',
        },
        {
            userId: 'mock-nina',
            name: 'Nina Patel',
            avatar: '👩🏾',
            time: 'RSVP 20m ago',
            fromGroup: 'Close Friends',
        },
    ],
    notGoing: [
        {
            userId: 'mock-tom',
            name: 'Tom Anderson',
            avatar: '👨🏻',
            time: 'RSVP 3h ago',
            fromGroup: null,
        },
    ],
    pending: [],
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
    { userId: 'mock-sarah', name: 'Sarah Chen', avatar: '👩🏻', role: 'Admin' },
    { userId: 'mock-mike', name: 'Mike Johnson', avatar: '👨🏽', role: 'Member' },
    { userId: 'mock-emma', name: 'Emma Wilson', avatar: '👩🏼', role: 'Member' },
    { userId: 'mock-david', name: 'David Kim', avatar: '👨🏻', role: 'Member' },
    { userId: 'mock-lisa', name: 'Lisa Martinez', avatar: '👩🏽', role: 'Member' },
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
        relatedEntityId: '1',
    },
    {
        id: '2',
        type: 'invite',
        icon: '👨🏽',
        title: 'Mike Johnson invited you',
        message: 'to "Weekend brunch catch-up"',
        time: '1h ago',
        unread: true,
        relatedEntityId: '2',
    },
    {
        id: '3',
        type: 'reminder',
        title: 'Hangout starting soon',
        message: '"Drinks at The Rooftop" starts in 2 hours',
        time: '2h ago',
        unread: false,
        color: '#3B82F6',
        relatedEntityId: '1',
    },
    {
        id: '4',
        type: 'group',
        icon: '💜',
        title: 'Group invited to hangout',
        message: 'Close Friends was invited to "Movie night"',
        time: '3h ago',
        unread: false,
        relatedEntityId: '3',
    },
    {
        id: '5',
        type: 'rsvp',
        icon: '👨🏻',
        title: 'David Kim is maybe',
        message: 'for "Weekend brunch catch-up"',
        time: '5h ago',
        unread: false,
        relatedEntityId: '2',
    },
    {
        id: '6',
        type: 'friend',
        icon: '👩🏽',
        title: 'Lisa Martinez accepted your invite',
        message: 'You can now plan hangouts together',
        time: '1d ago',
        unread: false,
        relatedEntityId: '5',
    },
    {
        id: '7',
        type: 'group_created',
        title: 'New group created',
        message: 'You created "Basketball Crew" with 8 members',
        time: '2d ago',
        unread: false,
        color: '#22C55E',
        relatedEntityId: '2',
    },
];

export const profileStats: ProfileStat[] = [
    { label: 'Plans Created', value: '24' },
    { label: 'Groups', value: '5' },
    { label: 'Friends', value: '32' },
];

export const settingsSections: SettingsSection[] = [
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

export const mockFriendProfiles: Record<string, FriendProfile> = {
    '1': {
        id: '1',
        name: 'Sarah Chen',
        avatar: '👩🏻',
        friendsSince: 'Jan 2024',
        mutualGroups: 3,
        mutualFriends: 8,
        bio: 'Coffee enthusiast ☕ Always down for spontaneous adventures',
        hangoutsTogether: 12,
        lastHangout: '2 days ago',
    },
    '2': {
        id: '2',
        name: 'Mike Johnson',
        avatar: '👨🏽',
        friendsSince: 'Mar 2023',
        mutualGroups: 2,
        mutualFriends: 5,
        bio: 'Basketball and good vibes 🏀',
        hangoutsTogether: 18,
        lastHangout: '1 week ago',
    },
    '3': {
        id: '3',
        name: 'Emma Wilson',
        avatar: '👩🏼',
        friendsSince: 'Sep 2023',
        mutualGroups: 4,
        mutualFriends: 12,
        bio: 'Movie buff 🎬 Board game champion',
        hangoutsTogether: 15,
        lastHangout: '3 days ago',
    },
    '4': {
        id: '4',
        name: 'David Kim',
        avatar: '👨🏻',
        friendsSince: 'Jun 2023',
        mutualGroups: 1,
        mutualFriends: 3,
        hangoutsTogether: 6,
        lastHangout: '5 days ago',
    },
    '5': {
        id: '5',
        name: 'Lisa Martinez',
        avatar: '👩🏽',
        friendsSince: 'Nov 2023',
        mutualGroups: 2,
        mutualFriends: 7,
        bio: 'Foodie & travel lover 🌍',
        hangoutsTogether: 9,
        lastHangout: '4 days ago',
    },
    '6': {
        id: '6',
        name: 'Alex Turner',
        avatar: '👨🏼',
        friendsSince: 'Dec 2023',
        mutualGroups: 2,
        mutualFriends: 6,
        hangoutsTogether: 8,
        lastHangout: '1 week ago',
    },
    '7': {
        id: '7',
        name: 'Nina Patel',
        avatar: '👩🏾',
        friendsSince: 'Feb 2024',
        mutualGroups: 1,
        mutualFriends: 4,
        bio: 'Design & coffee ☕✨',
        hangoutsTogether: 5,
        lastHangout: '3 days ago',
    },
    '8': {
        id: '8',
        name: 'Tom Anderson',
        avatar: '👨🏻',
        friendsSince: 'Oct 2023',
        mutualGroups: 1,
        mutualFriends: 2,
        hangoutsTogether: 3,
        lastHangout: '2 weeks ago',
    },
};

export const mockFriendGroupsInCommon: FriendGroupInCommon[] = [
    { id: 'g1', name: 'Close Friends', icon: '💜', memberCount: 5 },
    { id: 'g2', name: 'Basketball Crew', icon: '🏀', memberCount: 8 },
    { id: 'g3', name: 'Roommates', icon: '🏠', memberCount: 3 },
    { id: 'g4', name: 'College Squad', icon: '🎓', memberCount: 12 },
];

export const mockFriendUpcomingHangouts: FriendUpcomingHangout[] = [
    {
        id: '1',
        title: 'Coffee at Blue Bottle',
        time: '2:00 PM',
        date: 'Today',
        groupName: 'Close Friends',
    },
    {
        id: '2',
        title: 'Pickup Basketball',
        time: '6:00 PM',
        date: 'Tomorrow',
        groupName: 'Basketball Crew',
    },
    {
        id: '3',
        title: 'Game Night',
        time: '8:00 PM',
        date: 'Saturday',
        groupName: 'Close Friends',
    },
];

export const mockFriendRecentActivities: FriendRecentActivity[] = [
    { id: '1', text: 'Attended Trivia Night', time: '2 days ago', icon: '🎯' },
    { id: '2', text: 'Joined Basketball Crew', time: '1 week ago', icon: '🏀' },
    { id: '3', text: 'Went to Brunch Club', time: '1 week ago', icon: '☕' },
    { id: '4', text: 'Attended Movie Night', time: '2 weeks ago', icon: '🎬' },
];

export function findFriendIdByName(name: string): string | undefined {
    const friend = mockFriends.find(
        (f) => f.name.toLowerCase() === name.toLowerCase(),
    );
    return friend?.id;
}

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

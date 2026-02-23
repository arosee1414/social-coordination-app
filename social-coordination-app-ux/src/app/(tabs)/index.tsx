import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { createSharedStyles } from '@/src/constants/shared-styles';
import {
    mockRecentActivity,
    mockReminderBanner,
    findFriendIdByName,
} from '@/src/data/mock-data';
import { useHangouts } from '@/src/contexts/HangoutsContext';
import { HappeningNowSection } from '@/src/components/home/HappeningNowSection';
import { ReminderBannerCard } from '@/src/components/home/ReminderBannerCard';
import { UpcomingHangoutsSection } from '@/src/components/home/UpcomingHangoutsSection';
import { RecentActivitySection } from '@/src/components/home/RecentActivitySection';
import { FABBottomSheet } from '@/src/components/home/FABBottomSheet';
import { RSVPStatus } from '@/src/types';

export default function HomeScreen() {
    const colors = useThemeColors();
    const shared = createSharedStyles(colors);
    const router = useRouter();
    const { hangouts, updateRSVP } = useHangouts();

    const liveHangouts = hangouts.filter((h) => h.status === 'live');
    const upcomingHangouts = hangouts.filter((h) => h.status === 'upcoming');

    const handleJoinLive = (hangoutId: string) => {
        router.push(`/hangout/${hangoutId}` as any);
    };

    const handleHangoutPress = (hangoutId: string) => {
        router.push(`/hangout/${hangoutId}` as any);
    };

    const handleSeeAll = () => {
        router.push('/(tabs)/hangouts' as any);
    };

    const handleRSVP = (hangoutId: string, status: RSVPStatus) => {
        updateRSVP(hangoutId, status);
    };

    const handleActivityPress = (activityId: string) => {
        const activity = mockRecentActivity.find((a) => a.id === activityId);
        if (activity) {
            // Extract the first word (friend's first name) from the activity text
            // Activity text format: "Sarah is going to...", "Mike created...", etc.
            const firstName = activity.text.split(' ')[0];
            // Map first names to full names for lookup
            const nameMap: Record<string, string> = {
                Sarah: 'Sarah Chen',
                Mike: 'Mike Johnson',
                Emma: 'Emma Wilson',
                Alex: 'Alex Turner',
                Nina: 'Nina Patel',
                David: 'David Kim',
                Lisa: 'Lisa Martinez',
                Tom: 'Tom Anderson',
            };
            const fullName = nameMap[firstName];
            if (fullName) {
                const friendId = findFriendIdByName(fullName);
                if (friendId) {
                    router.push(`/friend/${friendId}` as any);
                }
            }
        }
    };

    const handleCreateHangout = () => {
        router.push('/create-hangout');
    };

    const handleInviteGroup = () => {
        router.push('/(tabs)/groups' as any);
    };

    return (
        <SafeAreaView
            style={shared.screenContainer}
            edges={['top', 'left', 'right']}
        >
            {/* Header */}
            <View style={shared.screenHeader}>
                <Text style={shared.screenTitle}>Home</Text>
                <Text style={shared.screenSubtitle}>
                    Stay connected with your friends
                </Text>
            </View>

            <ScrollView style={{ flex: 1 }}>
                {/* Happening Now (conditional) */}
                <HappeningNowSection
                    hangouts={liveHangouts}
                    onJoin={handleJoinLive}
                    onPress={handleHangoutPress}
                />

                {/* Reminder Banner */}
                <View style={{ paddingTop: 16, paddingBottom: 16 }}>
                    <ReminderBannerCard reminder={mockReminderBanner} />
                </View>

                {/* Upcoming Hangouts */}
                <UpcomingHangoutsSection
                    hangouts={upcomingHangouts}
                    onSeeAll={handleSeeAll}
                    onHangoutPress={handleHangoutPress}
                    onRSVP={handleRSVP}
                />

                {/* Recent Activity */}
                <RecentActivitySection
                    activities={mockRecentActivity}
                    onActivityPress={handleActivityPress}
                />
            </ScrollView>

            {/* FAB + Bottom Sheet */}
            <FABBottomSheet
                onCreateHangout={handleCreateHangout}
                onInviteGroup={handleInviteGroup}
            />
        </SafeAreaView>
    );
}

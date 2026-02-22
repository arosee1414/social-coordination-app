import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { createSharedStyles } from '@/src/constants/shared-styles';
import {
    mockHangouts,
    mockRecentActivity,
    mockReminderBanner,
} from '@/src/data/mock-data';
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

    const liveHangouts = mockHangouts.filter((h) => h.status === 'live');
    const upcomingHangouts = mockHangouts.filter(
        (h) => h.status === 'upcoming',
    );

    const handleJoinLive = (hangoutId: string) => {
        router.push(`/hangout/${hangoutId}` as any);
    };

    const handleHangoutPress = (hangoutId: string) => {
        router.push(`/hangout/${hangoutId}` as any);
    };

    const handleSeeAll = () => {
        router.push('/(tabs)/hangouts' as any);
    };

    const handleRSVP = (hangoutId: string, _status: RSVPStatus) => {
        // In a real app this would update state; for now just navigate
        router.push(`/hangout/${hangoutId}` as any);
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
                <RecentActivitySection activities={mockRecentActivity} />
            </ScrollView>

            {/* FAB + Bottom Sheet */}
            <FABBottomSheet
                onCreateHangout={handleCreateHangout}
                onInviteGroup={handleInviteGroup}
            />
        </SafeAreaView>
    );
}

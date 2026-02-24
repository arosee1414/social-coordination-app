import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    Animated,
    StyleSheet,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
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
    const { hangouts, loading, updateRSVP, refetch } = useHangouts();
    const [refreshing, setRefreshing] = useState(false);

    const spinnerOpacity = useRef(new Animated.Value(1)).current;
    const [showSpinner, setShowSpinner] = useState(true);

    useEffect(() => {
        if (!loading) {
            Animated.timing(spinnerOpacity, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }).start(() => {
                setShowSpinner(false);
            });
        }
    }, [loading]);

    // Refetch when the screen comes back into focus
    const isFirstFocus = useRef(true);
    useFocusEffect(
        useCallback(() => {
            if (isFirstFocus.current) {
                isFirstFocus.current = false;
                return;
            }
            refetch();
        }, [refetch]),
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    }, [refetch]);

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
            const firstName = activity.text.split(' ')[0];
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

            {/* Content — always rendered to avoid layout shift */}
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
            >
                <HappeningNowSection
                    hangouts={liveHangouts}
                    onJoin={handleJoinLive}
                    onPress={handleHangoutPress}
                />

                <View style={{ paddingTop: 16, paddingBottom: 16 }}>
                    <ReminderBannerCard reminder={mockReminderBanner} />
                </View>

                <UpcomingHangoutsSection
                    hangouts={upcomingHangouts}
                    onSeeAll={handleSeeAll}
                    onHangoutPress={handleHangoutPress}
                    onRSVP={handleRSVP}
                />

                <RecentActivitySection
                    activities={mockRecentActivity}
                    onActivityPress={handleActivityPress}
                />
            </ScrollView>

            {/* Spinner overlay — fades out when data loads */}
            {showSpinner && (
                <Animated.View
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            backgroundColor: colors.background,
                            justifyContent: 'center',
                            alignItems: 'center',
                            opacity: spinnerOpacity,
                        },
                    ]}
                    pointerEvents={loading ? 'auto' : 'none'}
                >
                    <ActivityIndicator size='large' color={colors.primary} />
                </Animated.View>
            )}

            {/* FAB + Bottom Sheet */}
            <FABBottomSheet
                onCreateHangout={handleCreateHangout}
                onInviteGroup={handleInviteGroup}
            />
        </SafeAreaView>
    );
}

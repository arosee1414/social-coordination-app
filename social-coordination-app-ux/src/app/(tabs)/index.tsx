import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    Animated,
    StyleSheet,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useScrollToTop } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { createSharedStyles } from '@/src/constants/shared-styles';
import { useNotifications } from '@/src/contexts/NotificationsContext';
import { useHangouts } from '@/src/contexts/HangoutsContext';
import { HappeningNowSection } from '@/src/components/home/HappeningNowSection';
import { ReminderBannerCard } from '@/src/components/home/ReminderBannerCard';
import { UpcomingHangoutsSection } from '@/src/components/home/UpcomingHangoutsSection';
import { RecentActivitySection } from '@/src/components/home/RecentActivitySection';
import { FABBottomSheet } from '@/src/components/home/FABBottomSheet';
import { RSVPStatus, ReminderBanner, Notification } from '@/src/types';

export default function HomeScreen() {
    const colors = useThemeColors();
    const shared = createSharedStyles(colors);
    const router = useRouter();
    const { hangouts, loading, updateRSVP, refetch } = useHangouts();
    const {
        notifications,
        unreadCount,
        markAsRead,
        refresh: refreshNotifications,
    } = useNotifications();
    const [refreshing, setRefreshing] = useState(false);

    const scrollRef = useRef<ScrollView>(null);
    useScrollToTop(scrollRef);

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

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([refetch(), refreshNotifications()]);
        setRefreshing(false);
    }, [refetch, refreshNotifications]);

    // Compute dynamic reminder banner: find soonest upcoming hangout where user hasn't RSVP'd
    const pendingHangout =
        hangouts
            .filter(
                (h) => h.status === 'upcoming' && h.userStatus === 'pending',
            )
            .sort((a, b) => {
                const aTime = a.startTime
                    ? new Date(a.startTime).getTime()
                    : Infinity;
                const bTime = b.startTime
                    ? new Date(b.startTime).getTime()
                    : Infinity;
                return aTime - bTime;
            })[0] ?? null;

    const reminderBanner: ReminderBanner | null = pendingHangout
        ? {
              id: pendingHangout.id,
              title: `You haven't RSVP'd to ${pendingHangout.title}`,
              subtitle: pendingHangout.date
                  ? `${pendingHangout.date} at ${pendingHangout.time} — respond now!`
                  : 'Respond now!',
          }
        : null;

    const liveHangouts = hangouts.filter((h) => h.status === 'live');
    const upcomingHangouts = hangouts
        .filter((h) => h.status === 'upcoming')
        .sort((a, b) => {
            const aTime = a.startTime ? new Date(a.startTime).getTime() : null;
            const bTime = b.startTime ? new Date(b.startTime).getTime() : null;
            if (aTime === null && bTime === null) return 0;
            if (aTime === null) return 1;
            if (bTime === null) return -1;
            return aTime - bTime;
        });

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

    const handleNotificationPress = (notification: Notification) => {
        // Mark as read (fire-and-forget)
        if (!notification.isRead) {
            markAsRead(notification.id);
        }

        switch (notification.type) {
            case 'Rsvp':
            case 'HangoutInvite':
            case 'HangoutCreated':
                if (notification.hangoutId) {
                    router.push(`/hangout/${notification.hangoutId}` as any);
                }
                break;
            case 'GroupCreated':
            case 'MemberAdded':
            case 'MemberRemoved':
                if (notification.groupId) {
                    router.push(`/group/${notification.groupId}` as any);
                }
                break;
            case 'FriendRequest':
            case 'FriendAccepted':
                if (notification.actorUserId) {
                    router.push(`/friend/${notification.actorUserId}` as any);
                }
                break;
        }
    };

    const handleCreateHangout = () => {
        router.push('/create-hangout');
    };

    const handleCreateGroup = () => {
        router.push('/create-group');
    };

    return (
        <SafeAreaView
            style={shared.screenContainer}
            edges={['top', 'left', 'right']}
        >
            {/* Header */}
            <View
                style={[
                    shared.screenHeader,
                    {
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                    },
                ]}
            >
                <View style={{ flex: 1 }}>
                    <Text style={shared.screenTitle}>Home</Text>
                    <Text style={shared.screenSubtitle}>
                        Stay connected with your friends
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => router.push('/notifications' as any)}
                    style={homeStyles.bellButton}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name='notifications-outline'
                        size={24}
                        color={colors.text}
                    />
                    {unreadCount > 0 && (
                        <View
                            style={[
                                homeStyles.bellBadge,
                                { backgroundColor: colors.error },
                            ]}
                        />
                    )}
                </TouchableOpacity>
            </View>

            {/* Content — always rendered to avoid layout shift */}
            <ScrollView
                ref={scrollRef}
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
                {hangouts.length === 0 && !loading ? (
                    <View style={homeStyles.emptyState}>
                        <View
                            style={[
                                homeStyles.emptyIcon,
                                { backgroundColor: colors.surfaceTertiary },
                            ]}
                        >
                            <Ionicons
                                name='people-outline'
                                size={48}
                                color={colors.textTertiary}
                            />
                        </View>
                        <Text
                            style={[
                                homeStyles.emptyTitle,
                                { color: colors.text },
                            ]}
                        >
                            No Hangouts Yet
                        </Text>
                        <Text
                            style={[
                                homeStyles.emptyText,
                                { color: colors.subtitle },
                            ]}
                        >
                            Create your first hangout and start coordinating
                            with friends
                        </Text>
                        <TouchableOpacity
                            style={shared.primaryBtnLarge}
                            onPress={handleCreateHangout}
                        >
                            <Text style={shared.primaryBtnLargeText}>
                                Create Hangout
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <HappeningNowSection
                            hangouts={liveHangouts}
                            onJoin={handleJoinLive}
                            onPress={handleHangoutPress}
                        />

                        {reminderBanner && (
                            <View style={{ paddingTop: 16, paddingBottom: 16 }}>
                                <ReminderBannerCard
                                    reminder={reminderBanner}
                                    onPress={() =>
                                        router.push(
                                            `/hangout/${reminderBanner.id}` as any,
                                        )
                                    }
                                />
                            </View>
                        )}

                        <UpcomingHangoutsSection
                            hangouts={upcomingHangouts}
                            onSeeAll={handleSeeAll}
                            onHangoutPress={handleHangoutPress}
                            onRSVP={handleRSVP}
                        />
                    </>
                )}

                <RecentActivitySection
                    notifications={notifications.slice(0, 10)}
                    onNotificationPress={handleNotificationPress}
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
                onCreateGroup={handleCreateGroup}
            />
        </SafeAreaView>
    );
}

const homeStyles = StyleSheet.create({
    bellButton: {
        padding: 8,
        marginTop: 4,
        position: 'relative',
    },
    bellBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    emptyState: {
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 64,
    },
    emptyIcon: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 32,
        maxWidth: 280,
    },
});

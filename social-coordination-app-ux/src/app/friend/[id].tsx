import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { createSharedStyles } from '@/src/constants/shared-styles';
import {
    mockFriendProfiles,
    mockFriendGroupsInCommon,
    mockFriendUpcomingHangouts,
    mockFriendRecentActivities,
} from '@/src/data/mock-data';

const CLOSE_THRESHOLD = 50;
const SHEET_HIDDEN_Y = 400;

export default function FriendProfileScreen() {
    const colors = useThemeColors();
    const shared = createSharedStyles(colors);
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const sheetTranslateY = useSharedValue(SHEET_HIDDEN_Y);
    const overlayOpacity = useSharedValue(0);

    const friendId = typeof id === 'string' ? id : '1';
    const friend = mockFriendProfiles[friendId] ?? mockFriendProfiles['1'];
    const groupsInCommon = mockFriendGroupsInCommon.slice(
        0,
        friend.mutualGroups,
    );

    const openSheet = useCallback(() => {
        setIsSheetOpen(true);
        overlayOpacity.value = withTiming(1, { duration: 200 });
        sheetTranslateY.value = withTiming(0, { duration: 250 });
    }, [overlayOpacity, sheetTranslateY]);

    const closeSheet = useCallback(() => {
        overlayOpacity.value = withTiming(0, { duration: 200 });
        sheetTranslateY.value = withTiming(
            SHEET_HIDDEN_Y,
            { duration: 250 },
            () => {
                runOnJS(setIsSheetOpen)(false);
            },
        );
    }, [overlayOpacity, sheetTranslateY]);

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            if (event.translationY > 0) {
                sheetTranslateY.value = event.translationY;
                overlayOpacity.value = Math.max(
                    0,
                    1 - event.translationY / SHEET_HIDDEN_Y,
                );
            }
        })
        .onEnd((event) => {
            if (event.translationY > CLOSE_THRESHOLD) {
                overlayOpacity.value = withTiming(0, { duration: 200 });
                sheetTranslateY.value = withTiming(
                    SHEET_HIDDEN_Y,
                    { duration: 200 },
                    () => {
                        runOnJS(setIsSheetOpen)(false);
                    },
                );
            } else {
                sheetTranslateY.value = withTiming(0, { duration: 200 });
                overlayOpacity.value = withTiming(1, { duration: 200 });
            }
        });

    const overlayAnimatedStyle = useAnimatedStyle(() => ({
        opacity: overlayOpacity.value,
    }));

    const sheetAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: sheetTranslateY.value }],
    }));

    const handleInviteHangout = useCallback(() => {
        closeSheet();
        setTimeout(() => router.push('/create-hangout'), 150);
    }, [closeSheet, router]);

    const handleInviteGroup = useCallback(() => {
        closeSheet();
        setTimeout(() => router.push('/(tabs)/groups' as any), 150);
    }, [closeSheet, router]);

    const handleRemoveFriend = useCallback(() => {
        closeSheet();
    }, [closeSheet]);

    return (
        <SafeAreaView style={shared.screenContainer}>
            {/* Header */}
            <View style={shared.stackHeader}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={s.backBtn}
                >
                    <Ionicons name='arrow-back' size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[s.headerTitle, { color: colors.text }]}>
                    Profile
                </Text>
                <TouchableOpacity onPress={openSheet} style={s.menuBtn}>
                    <Ionicons
                        name='ellipsis-vertical'
                        size={24}
                        color={colors.text}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 32 }}
            >
                {/* Profile Header */}
                <View
                    style={[s.profileHeader, { backgroundColor: colors.card }]}
                >
                    <View
                        style={[
                            s.avatarContainer,
                            { backgroundColor: colors.indigoTint5 },
                        ]}
                    >
                        <Text style={s.avatarEmoji}>{friend.avatar}</Text>
                    </View>
                    <Text style={[s.friendName, { color: colors.text }]}>
                        {friend.name}
                    </Text>
                    <Text style={[s.friendSince, { color: colors.subtitle }]}>
                        Friends since {friend.friendsSince}
                    </Text>
                    <View
                        style={[
                            s.mutualBadge,
                            { backgroundColor: colors.indigoTint },
                        ]}
                    >
                        <Ionicons
                            name='people-outline'
                            size={14}
                            color={colors.primary}
                        />
                        <Text
                            style={[
                                s.mutualBadgeText,
                                { color: colors.primary },
                            ]}
                        >
                            {friend.mutualFriends} mutual friends
                        </Text>
                    </View>
                    {friend.bio && (
                        <Text style={[s.bio, { color: colors.textSecondary }]}>
                            {friend.bio}
                        </Text>
                    )}
                </View>

                {/* Social Stats */}
                <View style={s.statsContainer}>
                    <View style={s.statsGrid}>
                        <View
                            style={[
                                s.statCard,
                                {
                                    backgroundColor: colors.card,
                                    borderColor: colors.cardBorder,
                                },
                            ]}
                        >
                            <Text
                                style={[s.statValue, { color: colors.primary }]}
                            >
                                {friend.hangoutsTogether}
                            </Text>
                            <Text
                                style={[
                                    s.statLabel,
                                    { color: colors.subtitle },
                                ]}
                            >
                                Hangouts{'\n'}Together
                            </Text>
                        </View>
                        <View
                            style={[
                                s.statCard,
                                {
                                    backgroundColor: colors.card,
                                    borderColor: colors.cardBorder,
                                },
                            ]}
                        >
                            <Text
                                style={[s.statValue, { color: colors.primary }]}
                            >
                                {friend.mutualFriends}
                            </Text>
                            <Text
                                style={[
                                    s.statLabel,
                                    { color: colors.subtitle },
                                ]}
                            >
                                Mutual{'\n'}Friends
                            </Text>
                        </View>
                        <View
                            style={[
                                s.statCard,
                                {
                                    backgroundColor: colors.card,
                                    borderColor: colors.cardBorder,
                                },
                            ]}
                        >
                            <Text
                                style={[s.statValue, { color: colors.primary }]}
                            >
                                {friend.lastHangout}
                            </Text>
                            <Text
                                style={[
                                    s.statLabel,
                                    { color: colors.subtitle },
                                ]}
                            >
                                Last{'\n'}Hangout
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Groups in Common */}
                {groupsInCommon.length > 0 && (
                    <View style={s.section}>
                        <Text style={[s.sectionTitle, { color: colors.text }]}>
                            Groups in Common
                        </Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={s.groupsScrollContent}
                        >
                            {groupsInCommon.map((group) => (
                                <View
                                    key={group.id}
                                    style={[
                                        s.groupCard,
                                        {
                                            backgroundColor: colors.card,
                                            borderColor: colors.cardBorder,
                                        },
                                    ]}
                                >
                                    <View
                                        style={[
                                            s.groupIconCircle,
                                            {
                                                backgroundColor:
                                                    colors.indigoTint5,
                                            },
                                        ]}
                                    >
                                        <Text style={s.groupIconEmoji}>
                                            {group.icon}
                                        </Text>
                                    </View>
                                    <Text
                                        style={[
                                            s.groupCardName,
                                            { color: colors.text },
                                        ]}
                                        numberOfLines={2}
                                    >
                                        {group.name}
                                    </Text>
                                    <Text
                                        style={[
                                            s.groupCardMembers,
                                            { color: colors.subtitle },
                                        ]}
                                    >
                                        {group.memberCount} members
                                    </Text>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Upcoming Hangouts */}
                {mockFriendUpcomingHangouts.length > 0 && (
                    <View style={s.section}>
                        <Text style={[s.sectionTitle, { color: colors.text }]}>
                            Upcoming Hangouts
                        </Text>
                        <View style={s.hangoutsListContainer}>
                            {mockFriendUpcomingHangouts.map((hangout) => (
                                <View
                                    key={hangout.id}
                                    style={[
                                        s.hangoutCard,
                                        {
                                            backgroundColor: colors.card,
                                            borderColor: colors.cardBorder,
                                        },
                                    ]}
                                >
                                    <View style={s.hangoutCardHeader}>
                                        <Text
                                            style={[
                                                s.hangoutTitle,
                                                { color: colors.text },
                                            ]}
                                            numberOfLines={1}
                                        >
                                            {hangout.title}
                                        </Text>
                                        <View
                                            style={[
                                                s.dateBadge,
                                                {
                                                    backgroundColor:
                                                        colors.indigoTint,
                                                },
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    s.dateBadgeText,
                                                    {
                                                        color: colors.primary,
                                                    },
                                                ]}
                                            >
                                                {hangout.date}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={s.hangoutMeta}>
                                        <View style={s.hangoutMetaItem}>
                                            <Ionicons
                                                name='time-outline'
                                                size={14}
                                                color={colors.textSecondary}
                                            />
                                            <Text
                                                style={[
                                                    s.hangoutMetaText,
                                                    {
                                                        color: colors.textSecondary,
                                                    },
                                                ]}
                                            >
                                                {hangout.time}
                                            </Text>
                                        </View>
                                        <View style={s.hangoutMetaItem}>
                                            <Ionicons
                                                name='people-outline'
                                                size={14}
                                                color={colors.textSecondary}
                                            />
                                            <Text
                                                style={[
                                                    s.hangoutMetaText,
                                                    {
                                                        color: colors.textSecondary,
                                                    },
                                                ]}
                                            >
                                                {hangout.groupName}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Recent Activity */}
                {mockFriendRecentActivities.length > 0 && (
                    <View style={s.section}>
                        <Text style={[s.sectionTitle, { color: colors.text }]}>
                            Recent Activity
                        </Text>
                        <View style={s.activityListContainer}>
                            {mockFriendRecentActivities.map((activity) => (
                                <View
                                    key={activity.id}
                                    style={[
                                        s.activityCard,
                                        {
                                            backgroundColor: colors.card,
                                            borderColor: colors.cardBorder,
                                        },
                                    ]}
                                >
                                    <View
                                        style={[
                                            s.activityIconCircle,
                                            {
                                                backgroundColor:
                                                    colors.surfaceTertiary,
                                            },
                                        ]}
                                    >
                                        <Text style={s.activityIconEmoji}>
                                            {activity.icon}
                                        </Text>
                                    </View>
                                    <View style={s.activityTextContainer}>
                                        <Text
                                            style={[
                                                s.activityText,
                                                { color: colors.text },
                                            ]}
                                        >
                                            {activity.text}
                                        </Text>
                                        <Text
                                            style={[
                                                s.activityTime,
                                                { color: colors.subtitle },
                                            ]}
                                        >
                                            {activity.time}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Action Menu Bottom Sheet */}
            {isSheetOpen && (
                <View style={StyleSheet.absoluteFill} pointerEvents='box-none'>
                    {/* Overlay */}
                    <Animated.View
                        style={[
                            shared.bottomSheetOverlay,
                            overlayAnimatedStyle,
                        ]}
                    >
                        <Pressable
                            style={StyleSheet.absoluteFill}
                            onPress={closeSheet}
                        />
                    </Animated.View>

                    {/* Sheet */}
                    <GestureDetector gesture={panGesture}>
                        <Animated.View
                            style={[
                                shared.bottomSheetContainer,
                                sheetAnimatedStyle,
                            ]}
                        >
                            {/* Handle */}
                            <View style={shared.bottomSheetHandle} />

                            {/* Buttons */}
                            <View style={s.menuButtonsContainer}>
                                <TouchableOpacity
                                    style={[
                                        shared.primaryBtnLarge,
                                        { flexDirection: 'row', gap: 8 },
                                    ]}
                                    activeOpacity={0.7}
                                    onPress={handleInviteHangout}
                                >
                                    <Ionicons
                                        name='calendar-outline'
                                        size={20}
                                        color={colors.primaryText}
                                    />
                                    <Text style={shared.primaryBtnLargeText}>
                                        Invite to Hangout
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={shared.secondaryBtn}
                                    activeOpacity={0.7}
                                    onPress={handleInviteGroup}
                                >
                                    <Ionicons
                                        name='people-outline'
                                        size={20}
                                        color={colors.textSecondary}
                                    />
                                    <Text style={shared.secondaryBtnText}>
                                        Invite to Group
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        s.destructiveBtn,
                                        {
                                            backgroundColor: `${colors.error}10`,
                                        },
                                    ]}
                                    activeOpacity={0.7}
                                    onPress={handleRemoveFriend}
                                >
                                    <Ionicons
                                        name='person-remove-outline'
                                        size={20}
                                        color={colors.error}
                                    />
                                    <Text
                                        style={[
                                            s.destructiveBtnText,
                                            { color: colors.error },
                                        ]}
                                    >
                                        Remove Friend
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        s.cancelBtn,
                                        {
                                            backgroundColor:
                                                colors.surfaceTertiary,
                                        },
                                    ]}
                                    activeOpacity={0.7}
                                    onPress={closeSheet}
                                >
                                    <Text
                                        style={[
                                            s.cancelBtnText,
                                            { color: colors.textSecondary },
                                        ]}
                                    >
                                        Cancel
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </GestureDetector>
                </View>
            )}
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    backBtn: { padding: 8, marginLeft: -8 },
    menuBtn: { padding: 8, marginRight: -8 },
    headerTitle: { fontSize: 18, fontWeight: '600' },

    // Profile Header
    profileHeader: {
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 24,
        alignItems: 'center',
    },
    avatarContainer: {
        width: 112,
        height: 112,
        borderRadius: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    avatarEmoji: { fontSize: 56 },
    friendName: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
    friendSince: { fontSize: 14, marginBottom: 8 },
    mutualBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    mutualBadgeText: { fontSize: 12, fontWeight: '600' },
    bio: {
        fontSize: 14,
        lineHeight: 20,
        marginTop: 16,
        textAlign: 'center',
    },

    // Stats
    statsContainer: { paddingHorizontal: 24, paddingVertical: 16 },
    statsGrid: { flexDirection: 'row', gap: 12 },
    statCard: {
        flex: 1,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    statValue: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
    statLabel: { fontSize: 11, textAlign: 'center', lineHeight: 15 },

    // Section
    section: { paddingVertical: 16 },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        paddingHorizontal: 24,
        marginBottom: 12,
    },

    // Groups in Common
    groupsScrollContent: { paddingHorizontal: 24, gap: 12 },
    groupCard: {
        width: 140,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    groupIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    groupIconEmoji: { fontSize: 24 },
    groupCardName: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 4,
    },
    groupCardMembers: { fontSize: 12, textAlign: 'center' },

    // Upcoming Hangouts
    hangoutsListContainer: { paddingHorizontal: 24, gap: 12 },
    hangoutCard: {
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    hangoutCardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    hangoutTitle: { fontSize: 16, fontWeight: '600', flex: 1, marginRight: 8 },
    dateBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    dateBadgeText: { fontSize: 12, fontWeight: '600' },
    hangoutMeta: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    hangoutMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    hangoutMetaText: { fontSize: 14 },

    // Recent Activity
    activityListContainer: { paddingHorizontal: 24, gap: 8 },
    activityCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    activityIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    activityIconEmoji: { fontSize: 20 },
    activityTextContainer: { flex: 1 },
    activityText: { fontSize: 14, fontWeight: '500' },
    activityTime: { fontSize: 12, marginTop: 2 },

    // Bottom sheet buttons
    menuButtonsContainer: {
        gap: 12,
    },
    destructiveBtn: {
        width: '100%',
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    destructiveBtnText: { fontSize: 16, fontWeight: '600' },
    cancelBtn: {
        width: '100%',
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelBtnText: { fontSize: 16, fontWeight: '600' },
});

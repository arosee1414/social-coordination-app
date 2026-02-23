import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { createSharedStyles } from '@/src/constants/shared-styles';
import {
    mockFriendProfiles,
    mockFriendGroupsInCommon,
    mockFriendUpcomingHangouts,
    mockFriendRecentActivities,
} from '@/src/data/mock-data';

export default function FriendProfileScreen() {
    const colors = useThemeColors();
    const shared = createSharedStyles(colors);
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [showRemoveModal, setShowRemoveModal] = useState(false);

    const friendId = typeof id === 'string' ? id : '1';
    const friend = mockFriendProfiles[friendId] ?? mockFriendProfiles['1'];
    const groupsInCommon = mockFriendGroupsInCommon.slice(
        0,
        friend.mutualGroups,
    );

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
                <TouchableOpacity
                    onPress={() => setShowRemoveModal(true)}
                    style={s.menuBtn}
                >
                    <Ionicons
                        name='ellipsis-vertical'
                        size={24}
                        color={colors.text}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 140 }}
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

            {/* Action Buttons - Fixed at Bottom */}
            <View
                style={[
                    s.bottomActions,
                    {
                        backgroundColor: colors.background,
                        borderTopColor: colors.cardBorder,
                    },
                ]}
            >
                <TouchableOpacity
                    style={[shared.primaryBtnLarge, { marginBottom: 12 }]}
                    onPress={() => router.push('/create-hangout')}
                >
                    <Text style={shared.primaryBtnLargeText}>
                        Invite to Hangout
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={shared.secondaryBtn}
                    onPress={() => router.push('/(tabs)/groups' as any)}
                >
                    <Text style={shared.secondaryBtnText}>Invite to Group</Text>
                </TouchableOpacity>
            </View>

            {/* Remove Friend Modal */}
            <Modal
                visible={showRemoveModal}
                transparent
                animationType='fade'
                onRequestClose={() => setShowRemoveModal(false)}
            >
                <Pressable
                    style={[
                        s.modalOverlay,
                        { backgroundColor: colors.overlayBg },
                    ]}
                    onPress={() => setShowRemoveModal(false)}
                >
                    <Pressable
                        style={[
                            s.modalSheet,
                            { backgroundColor: colors.bottomSheetBg },
                        ]}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View
                            style={[
                                s.modalHandle,
                                {
                                    backgroundColor: colors.bottomSheetHandle,
                                },
                            ]}
                        />
                        <TouchableOpacity
                            style={s.removeBtn}
                            onPress={() => {
                                setShowRemoveModal(false);
                            }}
                        >
                            <Ionicons
                                name='person-remove-outline'
                                size={20}
                                color={colors.error}
                            />
                            <Text
                                style={[
                                    s.removeBtnText,
                                    { color: colors.error },
                                ]}
                            >
                                Remove Friend
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={s.cancelBtn}
                            onPress={() => setShowRemoveModal(false)}
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
                    </Pressable>
                </Pressable>
            </Modal>
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

    // Bottom Actions
    bottomActions: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        borderTopWidth: 1,
    },

    // Modal
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalSheet: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
    },
    modalHandle: {
        width: 48,
        height: 4,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 24,
    },
    removeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingVertical: 16,
        borderRadius: 12,
    },
    removeBtnText: { fontSize: 16, fontWeight: '600' },
    cancelBtn: {
        alignItems: 'center',
        paddingVertical: 16,
        marginTop: 8,
        borderRadius: 12,
    },
    cancelBtnText: { fontSize: 16, fontWeight: '600' },
});

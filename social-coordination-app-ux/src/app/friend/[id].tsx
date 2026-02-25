import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useApiFriendshipStatus } from '../../hooks/useApiFriendshipStatus';
import { useApiFriendCount } from '../../hooks/useApiFriends';
import { useApiClient } from '../../hooks/useApiClient';
import {
    mapGroupSummaryToGroup,
    mapHangoutSummaryToHangout,
} from '../../utils/api-mappers';
import type { Group, Hangout } from '../../types';

interface FriendProfile {
    userId: string;
    displayName: string;
    avatarUrl?: string;
}

export default function FriendProfileScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const colors = useThemeColors();
    const apiClient = useApiClient();

    const [user, setUser] = useState<FriendProfile | null>(null);
    const [userLoading, setUserLoading] = useState(true);
    const [commonGroups, setCommonGroups] = useState<Group[]>([]);
    const [commonGroupsLoading, setCommonGroupsLoading] = useState(true);
    const [commonHangouts, setCommonHangouts] = useState<Hangout[]>([]);
    const [commonHangoutsLoading, setCommonHangoutsLoading] = useState(true);

    const {
        status: friendshipStatus,
        loading: statusLoading,
        sendRequest,
        acceptRequest,
        rejectRequest,
        removeFriend,
    } = useApiFriendshipStatus(id);

    const { count: friendCount, loading: friendCountLoading } =
        useApiFriendCount(id);

    useEffect(() => {
        async function fetchUser() {
            if (!apiClient || !id) return;
            try {
                setUserLoading(true);
                const userResponse = await apiClient.users(id);
                if (userResponse) {
                    const name =
                        `${userResponse.firstName ?? ''} ${userResponse.lastName ?? ''}`.trim() ||
                        'Unknown';
                    setUser({
                        userId: userResponse.id ?? id,
                        displayName: name,
                        avatarUrl: userResponse.profileImageUrl ?? undefined,
                    });
                    return;
                }
                setUser({
                    userId: id,
                    displayName: 'Unknown User',
                });
            } catch (err) {
                console.error('Error fetching user:', err);
                setUser({
                    userId: id,
                    displayName: 'Unknown User',
                });
            } finally {
                setUserLoading(false);
            }
        }
        fetchUser();
    }, [apiClient, id]);

    // Fetch common groups
    useEffect(() => {
        async function fetchCommonGroups() {
            if (!apiClient || !id) return;
            try {
                setCommonGroupsLoading(true);
                const result = await apiClient.commonGroups(id);
                setCommonGroups((result ?? []).map(mapGroupSummaryToGroup));
            } catch (err) {
                console.warn('Error fetching common groups:', err);
                setCommonGroups([]);
            } finally {
                setCommonGroupsLoading(false);
            }
        }
        fetchCommonGroups();
    }, [apiClient, id]);

    // Fetch common hangouts
    useEffect(() => {
        async function fetchCommonHangouts() {
            if (!apiClient || !id) return;
            try {
                setCommonHangoutsLoading(true);
                const result = await apiClient.commonHangouts(id);
                setCommonHangouts(
                    (result ?? []).map(mapHangoutSummaryToHangout),
                );
            } catch (err) {
                console.warn('Error fetching common hangouts:', err);
                setCommonHangouts([]);
            } finally {
                setCommonHangoutsLoading(false);
            }
        }
        fetchCommonHangouts();
    }, [apiClient, id]);

    const handleSendRequest = async () => {
        try {
            await sendRequest();
        } catch {
            Alert.alert(
                'Error',
                'Failed to send friend request. Please try again.',
            );
        }
    };

    const handleAcceptRequest = async () => {
        try {
            await acceptRequest();
        } catch {
            Alert.alert(
                'Error',
                'Failed to accept friend request. Please try again.',
            );
        }
    };

    const handleRejectRequest = async () => {
        try {
            await rejectRequest();
        } catch {
            Alert.alert(
                'Error',
                'Failed to reject friend request. Please try again.',
            );
        }
    };

    const handleRemoveFriend = () => {
        Alert.alert(
            'Remove Friend',
            `Are you sure you want to remove ${user?.displayName ?? 'this user'} as a friend?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await removeFriend();
                            router.back();
                        } catch {
                            Alert.alert(
                                'Error',
                                'Failed to remove friend. Please try again.',
                            );
                        }
                    },
                },
            ],
        );
    };

    const renderActionButton = () => {
        if (statusLoading) {
            return (
                <View
                    style={[
                        styles.actionButton,
                        { backgroundColor: colors.surfaceTertiary },
                    ]}
                >
                    <ActivityIndicator
                        size='small'
                        color={colors.textSecondary}
                    />
                </View>
            );
        }

        switch (friendshipStatus.status) {
            case 'accepted':
                return (
                    <View style={styles.actionRow}>
                        <View
                            style={[
                                styles.actionButton,
                                styles.friendBadge,
                                { backgroundColor: colors.indigo50 },
                            ]}
                        >
                            <Ionicons
                                name='checkmark-circle'
                                size={18}
                                color={colors.primary}
                            />
                            <Text
                                style={[
                                    styles.actionButtonText,
                                    { color: colors.primary },
                                ]}
                            >
                                Friends
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={[
                                styles.actionButtonSmall,
                                {
                                    backgroundColor: colors.surfaceTertiary,
                                },
                            ]}
                            onPress={handleRemoveFriend}
                        >
                            <Ionicons
                                name='person-remove-outline'
                                size={18}
                                color={colors.error}
                            />
                        </TouchableOpacity>
                    </View>
                );

            case 'pending':
                if (friendshipStatus.direction === 'incoming') {
                    return (
                        <View style={styles.actionRow}>
                            <TouchableOpacity
                                style={[
                                    styles.actionButton,
                                    { backgroundColor: colors.primary },
                                ]}
                                onPress={handleAcceptRequest}
                            >
                                <Ionicons
                                    name='checkmark'
                                    size={18}
                                    color='#FFFFFF'
                                />
                                <Text
                                    style={[
                                        styles.actionButtonText,
                                        { color: '#FFFFFF' },
                                    ]}
                                >
                                    Accept Request
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.actionButtonSmall,
                                    {
                                        backgroundColor: colors.surfaceTertiary,
                                    },
                                ]}
                                onPress={handleRejectRequest}
                            >
                                <Ionicons
                                    name='close'
                                    size={18}
                                    color={colors.textSecondary}
                                />
                            </TouchableOpacity>
                        </View>
                    );
                }
                return (
                    <View
                        style={[
                            styles.actionButton,
                            { backgroundColor: colors.surfaceTertiary },
                        ]}
                    >
                        <Ionicons
                            name='time-outline'
                            size={18}
                            color={colors.textSecondary}
                        />
                        <Text
                            style={[
                                styles.actionButtonText,
                                { color: colors.textSecondary },
                            ]}
                        >
                            Request Sent
                        </Text>
                    </View>
                );

            default:
                return (
                    <TouchableOpacity
                        style={[
                            styles.actionButton,
                            { backgroundColor: colors.primary },
                        ]}
                        onPress={handleSendRequest}
                    >
                        <Ionicons
                            name='person-add-outline'
                            size={18}
                            color='#FFFFFF'
                        />
                        <Text
                            style={[
                                styles.actionButtonText,
                                { color: '#FFFFFF' },
                            ]}
                        >
                            Add Friend
                        </Text>
                    </TouchableOpacity>
                );
        }
    };

    const isFriend = friendshipStatus.status === 'accepted';

    if (userLoading) {
        return (
            <SafeAreaView
                style={[
                    styles.container,
                    { backgroundColor: colors.background },
                ]}
                edges={['top']}
            >
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                    >
                        <Ionicons
                            name='arrow-back'
                            size={24}
                            color={colors.text}
                        />
                    </TouchableOpacity>
                </View>
                <View style={styles.centered}>
                    <ActivityIndicator size='large' color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (!user) {
        return (
            <SafeAreaView
                style={[
                    styles.container,
                    { backgroundColor: colors.background },
                ]}
                edges={['top']}
            >
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                    >
                        <Ionicons
                            name='arrow-back'
                            size={24}
                            color={colors.text}
                        />
                    </TouchableOpacity>
                </View>
                <View style={styles.centered}>
                    <Ionicons
                        name='person-outline'
                        size={48}
                        color={colors.textSecondary}
                    />
                    <Text
                        style={[
                            styles.emptyText,
                            { color: colors.textSecondary },
                        ]}
                    >
                        User not found
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: colors.background }]}
            edges={['top']}
        >
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                    >
                        <Ionicons
                            name='arrow-back'
                            size={24}
                            color={colors.text}
                        />
                    </TouchableOpacity>
                </View>

                {/* Profile Info */}
                <View style={styles.profileSection}>
                    <View style={styles.avatarContainer}>
                        {user.avatarUrl ? (
                            <Image
                                source={{ uri: user.avatarUrl }}
                                style={styles.avatar}
                            />
                        ) : (
                            <View
                                style={[
                                    styles.avatar,
                                    styles.avatarFallback,
                                    { backgroundColor: colors.indigo50 },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.avatarFallbackText,
                                        { color: colors.primary },
                                    ]}
                                >
                                    {user.displayName.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                        )}
                    </View>

                    <Text style={[styles.displayName, { color: colors.text }]}>
                        {user.displayName}
                    </Text>

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text
                                style={[
                                    styles.statNumber,
                                    { color: colors.text },
                                ]}
                            >
                                {friendCountLoading ? '—' : friendCount}
                            </Text>
                            <Text
                                style={[
                                    styles.statLabel,
                                    { color: colors.textSecondary },
                                ]}
                            >
                                Friends
                            </Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text
                                style={[
                                    styles.statNumber,
                                    { color: colors.text },
                                ]}
                            >
                                {commonGroupsLoading
                                    ? '—'
                                    : commonGroups.length}
                            </Text>
                            <Text
                                style={[
                                    styles.statLabel,
                                    { color: colors.textSecondary },
                                ]}
                            >
                                Groups
                            </Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text
                                style={[
                                    styles.statNumber,
                                    { color: colors.text },
                                ]}
                            >
                                {commonHangoutsLoading
                                    ? '—'
                                    : commonHangouts.length}
                            </Text>
                            <Text
                                style={[
                                    styles.statLabel,
                                    { color: colors.textSecondary },
                                ]}
                            >
                                Hangouts
                            </Text>
                        </View>
                    </View>

                    {/* Action Button */}
                    <View style={styles.actionSection}>
                        {renderActionButton()}
                    </View>
                </View>

                {/* Groups in Common */}
                {isFriend && (
                    <View style={styles.section}>
                        <Text
                            style={[
                                styles.sectionTitle,
                                { color: colors.text },
                            ]}
                        >
                            Groups in Common
                        </Text>
                        {commonGroupsLoading ? (
                            <ActivityIndicator
                                size='small'
                                color={colors.primary}
                                style={{ marginTop: 12 }}
                            />
                        ) : commonGroups.length > 0 ? (
                            <View style={styles.cardList}>
                                {commonGroups.map((group) => (
                                    <TouchableOpacity
                                        key={group.id}
                                        style={[
                                            styles.groupCard,
                                            {
                                                backgroundColor:
                                                    colors.indigo50,
                                            },
                                        ]}
                                        onPress={() =>
                                            router.push(
                                                `/group/${group.id}` as any,
                                            )
                                        }
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.groupRow}>
                                            <Text style={styles.groupIcon}>
                                                {group.icon}
                                            </Text>
                                            <View style={{ flex: 1 }}>
                                                <Text
                                                    style={[
                                                        styles.groupName,
                                                        {
                                                            color: colors.text,
                                                        },
                                                    ]}
                                                >
                                                    {group.name}
                                                </Text>
                                                <View style={styles.memberRow}>
                                                    <Ionicons
                                                        name='people-outline'
                                                        size={14}
                                                        color={
                                                            colors.textSecondary
                                                        }
                                                    />
                                                    <Text
                                                        style={[
                                                            styles.memberText,
                                                            {
                                                                color: colors.textSecondary,
                                                            },
                                                        ]}
                                                    >
                                                        {group.memberCount}{' '}
                                                        members
                                                    </Text>
                                                </View>
                                            </View>
                                            <Ionicons
                                                name='chevron-forward'
                                                size={20}
                                                color={colors.textTertiary}
                                            />
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : (
                            <View style={styles.emptySection}>
                                <Ionicons
                                    name='people-outline'
                                    size={28}
                                    color={colors.textTertiary}
                                />
                                <Text
                                    style={[
                                        styles.emptySectionText,
                                        { color: colors.textSecondary },
                                    ]}
                                >
                                    No groups in common
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Hangouts Together */}
                {isFriend && (
                    <View style={[styles.section, { paddingBottom: 32 }]}>
                        <Text
                            style={[
                                styles.sectionTitle,
                                { color: colors.text },
                            ]}
                        >
                            Hangouts Together
                        </Text>
                        {commonHangoutsLoading ? (
                            <ActivityIndicator
                                size='small'
                                color={colors.primary}
                                style={{ marginTop: 12 }}
                            />
                        ) : commonHangouts.length > 0 ? (
                            <View style={styles.cardList}>
                                {commonHangouts.map((hangout) => (
                                    <TouchableOpacity
                                        key={hangout.id}
                                        style={[
                                            styles.hangoutCard,
                                            {
                                                backgroundColor: colors.card,
                                                borderColor: colors.cardBorder,
                                            },
                                        ]}
                                        onPress={() =>
                                            router.push(
                                                `/hangout/${hangout.id}` as any,
                                            )
                                        }
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.hangoutRow}>
                                            <View
                                                style={[
                                                    styles.hangoutEmojiContainer,
                                                    {
                                                        backgroundColor:
                                                            colors.indigo50,
                                                    },
                                                ]}
                                            >
                                                <Text
                                                    style={styles.hangoutEmoji}
                                                >
                                                    {hangout.title.charAt(0) ===
                                                    '🎉'
                                                        ? '🎉'
                                                        : '🎉'}
                                                </Text>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text
                                                    style={[
                                                        styles.hangoutTitle,
                                                        {
                                                            color: colors.text,
                                                        },
                                                    ]}
                                                    numberOfLines={1}
                                                >
                                                    {hangout.title}
                                                </Text>
                                                <View
                                                    style={
                                                        styles.hangoutDetails
                                                    }
                                                >
                                                    <Ionicons
                                                        name='calendar-outline'
                                                        size={13}
                                                        color={
                                                            colors.textSecondary
                                                        }
                                                    />
                                                    <Text
                                                        style={[
                                                            styles.hangoutDetailText,
                                                            {
                                                                color: colors.textSecondary,
                                                            },
                                                        ]}
                                                    >
                                                        {hangout.date ??
                                                            hangout.timeUntil}
                                                    </Text>
                                                    {hangout.location && (
                                                        <>
                                                            <Ionicons
                                                                name='location-outline'
                                                                size={13}
                                                                color={
                                                                    colors.textSecondary
                                                                }
                                                                style={{
                                                                    marginLeft: 8,
                                                                }}
                                                            />
                                                            <Text
                                                                style={[
                                                                    styles.hangoutDetailText,
                                                                    {
                                                                        color: colors.textSecondary,
                                                                    },
                                                                ]}
                                                                numberOfLines={
                                                                    1
                                                                }
                                                            >
                                                                {
                                                                    hangout.location
                                                                }
                                                            </Text>
                                                        </>
                                                    )}
                                                </View>
                                            </View>
                                            <Ionicons
                                                name='chevron-forward'
                                                size={20}
                                                color={colors.textTertiary}
                                            />
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : (
                            <View style={styles.emptySection}>
                                <Ionicons
                                    name='calendar-outline'
                                    size={28}
                                    color={colors.textTertiary}
                                />
                                <Text
                                    style={[
                                        styles.emptySectionText,
                                        { color: colors.textSecondary },
                                    ]}
                                >
                                    No hangouts together
                                </Text>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        marginTop: 12,
    },
    profileSection: {
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    avatarContainer: {
        marginBottom: 12,
    },
    avatar: {
        width: 96,
        height: 96,
        borderRadius: 48,
    },
    avatarFallback: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarFallbackText: {
        fontSize: 36,
        fontWeight: '700',
    },
    displayName: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 12,
    },
    statsRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    statItem: {
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 13,
        marginTop: 2,
    },
    actionSection: {
        width: '100%',
        alignItems: 'center',
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 24,
        gap: 6,
    },
    friendBadge: {
        // styled via actionButton
    },
    actionButtonSmall: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    // Sections
    section: {
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
    },
    cardList: {
        gap: 10,
    },
    // Group cards
    groupCard: {
        borderRadius: 14,
        padding: 16,
    },
    groupRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    groupIcon: {
        fontSize: 32,
    },
    groupName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    memberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    memberText: {
        fontSize: 13,
        fontWeight: '500',
    },
    // Hangout cards
    hangoutCard: {
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
    },
    hangoutRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    hangoutEmojiContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    hangoutEmoji: {
        fontSize: 22,
    },
    hangoutTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 3,
    },
    hangoutDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    hangoutDetailText: {
        fontSize: 13,
        fontWeight: '500',
    },
    // Empty section states
    emptySection: {
        alignItems: 'center',
        paddingVertical: 20,
        gap: 8,
    },
    emptySectionText: {
        fontSize: 14,
        fontWeight: '500',
    },
});

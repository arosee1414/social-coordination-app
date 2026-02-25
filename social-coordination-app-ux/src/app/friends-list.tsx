import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    ActivityIndicator,
    Alert,
    Pressable,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeColors } from '../hooks/useThemeColors';
import { useApiFriends } from '../hooks/useApiFriends';
import { useApiFriendRequests } from '../hooks/useApiFriendRequests';
import { Friend, FriendRequest } from '../types';

type Tab = 'friends' | 'requests';

export default function FriendsListScreen() {
    const router = useRouter();
    const colors = useThemeColors();
    const [activeTab, setActiveTab] = useState<Tab>('friends');

    const [removeSheetFriend, setRemoveSheetFriend] = useState<Friend | null>(
        null,
    );
    const [isSheetRendered, setIsSheetRendered] = useState(false);

    const SHEET_HIDDEN_Y = 400;
    const CLOSE_THRESHOLD = 50;
    const sheetTranslateY = useSharedValue(SHEET_HIDDEN_Y);
    const overlayOpacity = useSharedValue(0);

    const openSheet = useCallback(
        (friend: Friend) => {
            setRemoveSheetFriend(friend);
            setIsSheetRendered(true);
            overlayOpacity.value = withTiming(1, { duration: 200 });
            sheetTranslateY.value = withTiming(0, { duration: 250 });
        },
        [overlayOpacity, sheetTranslateY],
    );

    const closeSheet = useCallback(() => {
        overlayOpacity.value = withTiming(0, { duration: 200 });
        sheetTranslateY.value = withTiming(
            SHEET_HIDDEN_Y,
            { duration: 250 },
            () => {
                runOnJS(setIsSheetRendered)(false);
                runOnJS(setRemoveSheetFriend)(null);
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
                        runOnJS(setIsSheetRendered)(false);
                        runOnJS(setRemoveSheetFriend)(null);
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

    const {
        friends,
        loading: friendsLoading,
        removeFriend,
        refetch: refetchFriends,
    } = useApiFriends();

    const {
        requests,
        loading: requestsLoading,
        acceptRequest,
        rejectRequest,
    } = useApiFriendRequests();

    const incomingRequests = requests.filter((r) => r.direction === 'Incoming');
    const outgoingRequests = requests.filter((r) => r.direction === 'Outgoing');

    const handleRemoveFriend = async () => {
        if (!removeSheetFriend) return;
        const friendId = removeSheetFriend.userId;
        closeSheet();
        try {
            await removeFriend(friendId);
        } catch {
            Alert.alert('Error', 'Failed to remove friend. Please try again.');
        }
    };

    const handleAcceptRequest = async (request: FriendRequest) => {
        try {
            await acceptRequest(request.userId);
            refetchFriends();
        } catch {
            Alert.alert('Error', 'Failed to accept request. Please try again.');
        }
    };

    const handleRejectRequest = async (request: FriendRequest) => {
        try {
            await rejectRequest(request.userId);
        } catch {
            Alert.alert('Error', 'Failed to reject request. Please try again.');
        }
    };

    const renderFriendItem = ({ item }: { item: Friend }) => (
        <TouchableOpacity
            style={[styles.listItem, { backgroundColor: colors.card }]}
            onPress={() => router.push(`/friend/${item.userId}`)}
            activeOpacity={0.7}
        >
            <View style={styles.avatarContainer}>
                {item.avatar ? (
                    <Image
                        source={{ uri: item.avatar }}
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
                            {item.name.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                )}
            </View>
            <View style={styles.itemContent}>
                <Text
                    style={[styles.itemName, { color: colors.text }]}
                    numberOfLines={1}
                >
                    {item.name}
                </Text>
                {item.friendsSince ? (
                    <Text
                        style={[
                            styles.itemSubtext,
                            { color: colors.textSecondary },
                        ]}
                    >
                        Friends since {item.friendsSince}
                    </Text>
                ) : null}
            </View>
            <TouchableOpacity
                onPress={() => openSheet(item)}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
                <Ionicons
                    name='ellipsis-horizontal'
                    size={20}
                    color={colors.textSecondary}
                />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    const renderIncomingRequestItem = ({ item }: { item: FriendRequest }) => (
        <View style={[styles.listItem, { backgroundColor: colors.card }]}>
            <View style={styles.avatarContainer}>
                {item.avatarUrl ? (
                    <Image
                        source={{ uri: item.avatarUrl }}
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
                            {item.displayName.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                )}
            </View>
            <View style={styles.itemContent}>
                <Text
                    style={[styles.itemName, { color: colors.text }]}
                    numberOfLines={1}
                >
                    {item.displayName}
                </Text>
                <Text
                    style={[
                        styles.itemSubtext,
                        { color: colors.textSecondary },
                    ]}
                >
                    Sent {item.sentAt}
                </Text>
            </View>
            <View style={styles.requestActions}>
                <TouchableOpacity
                    style={[
                        styles.confirmButton,
                        { backgroundColor: colors.primary },
                    ]}
                    onPress={() => handleAcceptRequest(item)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.confirmButtonText}>Confirm</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.deleteButton,
                        {
                            backgroundColor: colors.surfaceTertiary,
                            borderWidth: 1,
                            borderColor: colors.cardBorderHeavy,
                        },
                    ]}
                    onPress={() => handleRejectRequest(item)}
                    activeOpacity={0.7}
                >
                    <Text
                        style={[
                            styles.deleteButtonText,
                            { color: colors.text },
                        ]}
                    >
                        Delete
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderOutgoingRequestItem = ({ item }: { item: FriendRequest }) => (
        <View style={[styles.listItem, { backgroundColor: colors.card }]}>
            <View style={styles.avatarContainer}>
                {item.avatarUrl ? (
                    <Image
                        source={{ uri: item.avatarUrl }}
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
                            {item.displayName.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                )}
            </View>
            <View style={styles.itemContent}>
                <Text
                    style={[styles.itemName, { color: colors.text }]}
                    numberOfLines={1}
                >
                    {item.displayName}
                </Text>
                <Text
                    style={[
                        styles.itemSubtext,
                        { color: colors.textSecondary },
                    ]}
                >
                    Request sent
                </Text>
            </View>
            <View
                style={[
                    styles.pendingBadge,
                    { backgroundColor: colors.surfaceTertiary },
                ]}
            >
                <Text
                    style={[
                        styles.pendingBadgeText,
                        { color: colors.textSecondary },
                    ]}
                >
                    Pending
                </Text>
            </View>
        </View>
    );

    const renderFriendsTab = () => {
        if (friendsLoading) {
            return (
                <View style={styles.centered}>
                    <ActivityIndicator size='large' color={colors.primary} />
                </View>
            );
        }

        if (friends.length === 0) {
            return (
                <View style={styles.centered}>
                    <Ionicons
                        name='people-outline'
                        size={48}
                        color={colors.textSecondary}
                    />
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>
                        No friends yet
                    </Text>
                    <Text
                        style={[
                            styles.emptySubtext,
                            { color: colors.textSecondary },
                        ]}
                    >
                        Find and add friends to get started
                    </Text>
                    <TouchableOpacity
                        style={[
                            styles.findFriendsButton,
                            { backgroundColor: colors.primary },
                        ]}
                        onPress={() => router.push('/find-friends')}
                    >
                        <Text style={styles.findFriendsButtonText}>
                            Find Friends
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <FlatList
                data={friends}
                keyExtractor={(item) => item.userId}
                renderItem={renderFriendItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        );
    };

    const renderRequestsTab = () => {
        if (requestsLoading) {
            return (
                <View style={styles.centered}>
                    <ActivityIndicator size='large' color={colors.primary} />
                </View>
            );
        }

        if (incomingRequests.length === 0 && outgoingRequests.length === 0) {
            return (
                <View style={styles.centered}>
                    <Ionicons
                        name='mail-outline'
                        size={48}
                        color={colors.textSecondary}
                    />
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>
                        No pending requests
                    </Text>
                    <Text
                        style={[
                            styles.emptySubtext,
                            { color: colors.textSecondary },
                        ]}
                    >
                        Friend requests will appear here
                    </Text>
                </View>
            );
        }

        return (
            <FlatList
                data={[...incomingRequests, ...outgoingRequests]}
                keyExtractor={(item) => `${item.direction}-${item.userId}`}
                renderItem={({ item }) =>
                    item.direction === 'Incoming'
                        ? renderIncomingRequestItem({ item })
                        : renderOutgoingRequestItem({ item })
                }
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    incomingRequests.length > 0 &&
                    outgoingRequests.length > 0 ? (
                        <View>
                            <Text
                                style={[
                                    styles.sectionHeader,
                                    { color: colors.textSecondary },
                                ]}
                            >
                                Incoming
                            </Text>
                        </View>
                    ) : null
                }
            />
        );
    };

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: colors.background }]}
            edges={['top']}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                >
                    <Ionicons name='arrow-back' size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                    Friends
                </Text>
                <TouchableOpacity onPress={() => router.push('/find-friends')}>
                    <Ionicons
                        name='person-add-outline'
                        size={24}
                        color={colors.primary}
                    />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View
                style={[
                    styles.tabBar,
                    { borderBottomColor: colors.cardBorder },
                ]}
            >
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'friends' && [
                            styles.activeTab,
                            { borderBottomColor: colors.primary },
                        ],
                    ]}
                    onPress={() => setActiveTab('friends')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            {
                                color:
                                    activeTab === 'friends'
                                        ? colors.primary
                                        : colors.textSecondary,
                            },
                        ]}
                    >
                        Friends ({friends.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'requests' && [
                            styles.activeTab,
                            { borderBottomColor: colors.primary },
                        ],
                    ]}
                    onPress={() => setActiveTab('requests')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            {
                                color:
                                    activeTab === 'requests'
                                        ? colors.primary
                                        : colors.textSecondary,
                            },
                        ]}
                    >
                        Requests
                        {requests.length > 0 ? ` (${requests.length})` : ''}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            {activeTab === 'friends' ? renderFriendsTab() : renderRequestsTab()}

            {/* Remove Friend Bottom Sheet */}
            {isSheetRendered && (
                <View style={StyleSheet.absoluteFill} pointerEvents='box-none'>
                    <Animated.View
                        style={[
                            styles.bottomSheetOverlay,
                            { backgroundColor: colors.overlayBg },
                            overlayAnimatedStyle,
                        ]}
                    >
                        <Pressable
                            style={StyleSheet.absoluteFill}
                            onPress={closeSheet}
                        />
                    </Animated.View>
                    <GestureDetector gesture={panGesture}>
                        <Animated.View
                            style={[
                                styles.bottomSheetContainer,
                                { backgroundColor: colors.bottomSheetBg },
                                sheetAnimatedStyle,
                            ]}
                        >
                            <View
                                style={[
                                    styles.bottomSheetHandle,
                                    {
                                        backgroundColor:
                                            colors.bottomSheetHandle,
                                    },
                                ]}
                            />
                            {removeSheetFriend && (
                                <View style={styles.bottomSheetHeader}>
                                    <View style={styles.bottomSheetAvatarRow}>
                                        {removeSheetFriend.avatar ? (
                                            <Image
                                                source={{
                                                    uri: removeSheetFriend.avatar,
                                                }}
                                                style={styles.bottomSheetAvatar}
                                            />
                                        ) : (
                                            <View
                                                style={[
                                                    styles.bottomSheetAvatar,
                                                    styles.bottomSheetAvatarFallback,
                                                    {
                                                        backgroundColor:
                                                            colors.indigo50,
                                                    },
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.bottomSheetAvatarText,
                                                        {
                                                            color: colors.primary,
                                                        },
                                                    ]}
                                                >
                                                    {removeSheetFriend.name
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </Text>
                                            </View>
                                        )}
                                        <Text
                                            style={[
                                                styles.bottomSheetName,
                                                { color: colors.text },
                                            ]}
                                        >
                                            {removeSheetFriend.name}
                                        </Text>
                                    </View>
                                </View>
                            )}
                            <TouchableOpacity
                                style={styles.bottomSheetActionRow}
                                onPress={handleRemoveFriend}
                                activeOpacity={0.6}
                            >
                                <View
                                    style={[
                                        styles.bottomSheetActionIcon,
                                        {
                                            backgroundColor:
                                                'rgba(255, 59, 48, 0.1)',
                                        },
                                    ]}
                                >
                                    <Ionicons
                                        name='person-remove-outline'
                                        size={22}
                                        color={colors.error}
                                    />
                                </View>
                                <Text
                                    style={[
                                        styles.bottomSheetActionText,
                                        { color: colors.error },
                                    ]}
                                >
                                    Remove Friend
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.cancelBtn,
                                    {
                                        backgroundColor: colors.surfaceTertiary,
                                    },
                                ]}
                                activeOpacity={0.7}
                                onPress={closeSheet}
                            >
                                <Text
                                    style={[
                                        styles.cancelText,
                                        { color: colors.textSecondary },
                                    ]}
                                >
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </GestureDetector>
                </View>
            )}
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
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    tabBar: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        marginHorizontal: 24,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomWidth: 2,
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
    },
    listContent: {
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 24,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginBottom: 4,
    },
    avatarContainer: {
        marginRight: 12,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    avatarFallback: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarFallbackText: {
        fontSize: 18,
        fontWeight: '700',
    },
    itemContent: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
    },
    itemSubtext: {
        fontSize: 13,
        marginTop: 2,
    },
    requestActions: {
        flexDirection: 'row',
        gap: 8,
    },
    confirmButton: {
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    deleteButton: {
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButtonText: {
        fontSize: 13,
        fontWeight: '600',
    },
    pendingBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    pendingBadgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 12,
    },
    emptySubtext: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 4,
    },
    findFriendsButton: {
        marginTop: 16,
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 20,
    },
    findFriendsButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    // Bottom sheet
    bottomSheetOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    bottomSheetContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 36,
    },
    bottomSheetHandle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 16,
    },
    bottomSheetHeader: {
        marginBottom: 8,
    },
    bottomSheetAvatarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 8,
    },
    bottomSheetAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    bottomSheetAvatarFallback: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomSheetAvatarText: {
        fontSize: 18,
        fontWeight: '700',
    },
    bottomSheetName: {
        fontSize: 16,
        fontWeight: '600',
    },
    bottomSheetActionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        paddingVertical: 14,
    },
    bottomSheetActionIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomSheetActionText: {
        fontSize: 16,
        fontWeight: '600',
    },
    cancelBtn: {
        width: '100%',
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

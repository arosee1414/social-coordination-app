import React, { useState, useCallback, useRef } from 'react';
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
    Platform,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useScrollToTop } from '@react-navigation/native';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { createSharedStyles } from '@/src/constants/shared-styles';
import { useApiFriends } from '@/src/hooks/useApiFriends';
import { useApiFriendRequests } from '@/src/hooks/useApiFriendRequests';
import { Friend, FriendRequest } from '@/src/types';

type Tab = 'friends' | 'requests';

export default function FriendsTabScreen() {
    const router = useRouter();
    const colors = useThemeColors();
    const shared = createSharedStyles(colors);
    const [activeTab, setActiveTab] = useState<Tab>('friends');
    const [refreshing, setRefreshing] = useState(false);

    const scrollRef = useRef<FlatList>(null);
    useScrollToTop(scrollRef);

    // Popover menu state
    const [menuFriend, setMenuFriend] = useState<Friend | null>(null);
    const [menuPosition, setMenuPosition] = useState<{
        x: number;
        y: number;
    }>({ x: 0, y: 0 });

    const ellipsisRefs = useRef<Record<string, View | null>>({});

    const openMenu = useCallback((friend: Friend, friendId: string) => {
        const ref = ellipsisRefs.current[friendId];
        if (ref) {
            ref.measureInWindow((x, y, width, height) => {
                setMenuPosition({
                    x: x + width - 160,
                    y: y + height + 4,
                });
                setMenuFriend(friend);
            });
        }
    }, []);

    const closeMenu = useCallback(() => {
        setMenuFriend(null);
    }, []);

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
        refetch: refetchRequests,
    } = useApiFriendRequests();

    // Refetch data when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            refetchFriends();
            refetchRequests();
        }, [refetchFriends, refetchRequests]),
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([refetchFriends(), refetchRequests()]);
        setRefreshing(false);
    }, [refetchFriends, refetchRequests]);

    const incomingRequests = requests.filter((r) => r.direction === 'Incoming');
    const outgoingRequests = requests.filter((r) => r.direction === 'Outgoing');

    const handleRemoveFriend = async () => {
        if (!menuFriend) return;
        const friendId = menuFriend.userId;
        closeMenu();
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
            style={styles.listItem}
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
            <View
                ref={(ref) => {
                    ellipsisRefs.current[item.userId] = ref;
                }}
                collapsable={false}
            >
                <TouchableOpacity
                    onPress={() => openMenu(item, item.userId)}
                    hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                >
                    <Ionicons
                        name='ellipsis-horizontal'
                        size={20}
                        color={colors.textSecondary}
                    />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const renderIncomingRequestItem = ({ item }: { item: FriendRequest }) => (
        <TouchableOpacity
            style={styles.listItem}
            onPress={() => router.push(`/friend/${item.userId}`)}
            activeOpacity={0.7}
        >
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
        </TouchableOpacity>
    );

    const renderOutgoingRequestItem = ({ item }: { item: FriendRequest }) => (
        <TouchableOpacity
            style={styles.listItem}
            onPress={() => router.push(`/friend/${item.userId}`)}
            activeOpacity={0.7}
        >
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
                    styles.requestedButton,
                    { backgroundColor: colors.surfaceTertiary },
                ]}
            >
                <Ionicons
                    name='hourglass-outline'
                    size={14}
                    color={colors.textSecondary}
                />
                <Text
                    style={[
                        styles.requestedButtonText,
                        { color: colors.textSecondary },
                    ]}
                >
                    Requested
                </Text>
            </View>
        </TouchableOpacity>
    );

    const renderFriendsTab = () => {
        if (friendsLoading && !refreshing) {
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
                ref={scrollRef as any}
                data={friends}
                keyExtractor={(item) => item.userId}
                renderItem={renderFriendItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
            />
        );
    };

    const renderRequestsTab = () => {
        if (requestsLoading && !refreshing) {
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
                ref={scrollRef as any}
                data={[...incomingRequests, ...outgoingRequests]}
                keyExtractor={(item) => `${item.direction}-${item.userId}`}
                renderItem={({ item }) =>
                    item.direction === 'Incoming'
                        ? renderIncomingRequestItem({ item })
                        : renderOutgoingRequestItem({ item })
                }
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
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
            edges={['top', 'left', 'right']}
        >
            {/* Header */}
            <View style={shared.screenHeader}>
                <View style={styles.headerRow}>
                    <View>
                        <Text style={shared.screenTitle}>Friends</Text>
                        <Text style={shared.screenSubtitle}>
                            Manage your friends and requests
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push('/find-friends')}
                        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                    >
                        <Ionicons
                            name='person-add-outline'
                            size={24}
                            color={colors.primary}
                        />
                    </TouchableOpacity>
                </View>
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

            {/* Popover Menu */}
            {menuFriend && (
                <View style={StyleSheet.absoluteFill} pointerEvents='box-none'>
                    <Pressable
                        style={StyleSheet.absoluteFill}
                        onPress={closeMenu}
                    />
                    <View
                        style={[
                            styles.popoverMenu,
                            {
                                backgroundColor: colors.card,
                                borderColor: colors.cardBorder,
                                top: menuPosition.y,
                                left: menuPosition.x,
                            },
                            Platform.OS === 'android'
                                ? styles.popoverMenuElevation
                                : styles.popoverMenuShadow,
                        ]}
                    >
                        <TouchableOpacity
                            style={styles.popoverMenuItem}
                            onPress={handleRemoveFriend}
                            activeOpacity={0.6}
                        >
                            <Ionicons
                                name='person-remove-outline'
                                size={18}
                                color={colors.error}
                            />
                            <Text
                                style={[
                                    styles.popoverMenuItemText,
                                    { color: colors.error },
                                ]}
                            >
                                Remove Friend
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
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
        paddingHorizontal: 2,
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
        marginRight: 12,
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
    requestedButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        gap: 4,
    },
    requestedButtonText: {
        fontSize: 13,
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
    popoverMenu: {
        position: 'absolute',
        width: 180,
        borderRadius: 12,
        borderWidth: 1,
        paddingVertical: 4,
        zIndex: 1000,
    },
    popoverMenuShadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
    popoverMenuElevation: {
        elevation: 8,
    },
    popoverMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    popoverMenuItemText: {
        fontSize: 15,
        fontWeight: '600',
    },
});

import React, { useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    TextInput,
    Image,
    ActivityIndicator,
    Alert,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useThemeColors } from '../hooks/useThemeColors';
import { useApiUserSearch } from '../hooks/useApiUserSearch';
import { useApiClient } from '../hooks/useApiClient';
import {
    useApiSuggestedFriends,
    SuggestedFriend,
} from '../hooks/useApiSuggestedFriends';
import type { UserResponse } from '../clients/generatedClient';
import { FriendshipStatusInfo } from '../hooks/useApiFriendshipStatus';

interface UserWithStatus {
    user: UserResponse;
    friendshipStatus: FriendshipStatusInfo;
    statusLoading?: boolean;
}

function getDisplayName(user: UserResponse): string {
    return `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Unknown';
}

function getMutualContextLabel(suggestion: SuggestedFriend): string {
    const parts: string[] = [];
    if (suggestion.mutualGroupCount > 0) {
        parts.push(
            `${suggestion.mutualGroupCount} shared group${suggestion.mutualGroupCount > 1 ? 's' : ''}`,
        );
    }
    if (suggestion.mutualHangoutCount > 0) {
        parts.push(
            `${suggestion.mutualHangoutCount} shared hangout${suggestion.mutualHangoutCount > 1 ? 's' : ''}`,
        );
    }
    return parts.join(' · ');
}

export default function FindFriendsScreen() {
    const router = useRouter();
    const colors = useThemeColors();
    const apiClient = useApiClient();
    const [searchQuery, setSearchQuery] = useState('');
    const { results, loading, searchUsers } = useApiUserSearch();
    const {
        suggestions,
        loading: suggestionsLoading,
        refetch: refetchSuggestions,
        removeSuggestion,
    } = useApiSuggestedFriends();
    const [usersWithStatus, setUsersWithStatus] = useState<UserWithStatus[]>(
        [],
    );
    const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
        {},
    );

    // Track whether this is the initial mount to avoid double-fetching
    const isInitialFocus = useRef(true);

    // Extract status-fetching logic into a reusable callback
    const fetchStatuses = useCallback(
        async (users: UserResponse[]) => {
            if (!apiClient || users.length === 0) {
                setUsersWithStatus([]);
                return;
            }

            const items: UserWithStatus[] = [];
            for (const user of users) {
                try {
                    const statusResponse = await apiClient.status(user.id!);
                    items.push({
                        user,
                        friendshipStatus: {
                            status: (statusResponse.status?.toLowerCase() ??
                                'none') as FriendshipStatusInfo['status'],
                            direction:
                                statusResponse.direction?.toLowerCase() as FriendshipStatusInfo['direction'],
                        },
                    });
                } catch {
                    // 404 = no friendship
                    items.push({
                        user,
                        friendshipStatus: { status: 'none' },
                    });
                }
            }
            setUsersWithStatus(items);
        },
        [apiClient],
    );

    const handleSearch = useCallback(
        async (query: string) => {
            setSearchQuery(query);
            if (query.trim().length >= 2) {
                await searchUsers(query.trim());
            }
        },
        [searchUsers],
    );

    // Fetch friendship status when search results change
    React.useEffect(() => {
        isInitialFocus.current = true; // reset so next focus doesn't double-fetch
        fetchStatuses(results);
    }, [results, fetchStatuses]);

    // Re-fetch friendship statuses when screen regains focus (e.g. returning from friend profile)
    useFocusEffect(
        useCallback(() => {
            if (isInitialFocus.current) {
                isInitialFocus.current = false;
                return;
            }
            if (results.length > 0) {
                fetchStatuses(results);
            }
            // Also re-fetch suggestions on focus
            refetchSuggestions();
        }, [results, fetchStatuses, refetchSuggestions]),
    );

    const handleSendRequest = async (userId: string) => {
        if (!apiClient) return;
        setActionLoading((prev) => ({ ...prev, [userId]: true }));
        try {
            await apiClient.request(userId);
            // Update search results
            setUsersWithStatus((prev) =>
                prev.map((u) =>
                    u.user.id === userId
                        ? {
                              ...u,
                              friendshipStatus: {
                                  status: 'pending',
                                  direction: 'outgoing',
                              },
                          }
                        : u,
                ),
            );
            // Remove from suggestions since we sent a request
            removeSuggestion(userId);
        } catch {
            Alert.alert(
                'Error',
                'Failed to send friend request. Please try again.',
            );
        } finally {
            setActionLoading((prev) => ({ ...prev, [userId]: false }));
        }
    };

    const handleAcceptRequest = async (userId: string) => {
        if (!apiClient) return;
        setActionLoading((prev) => ({ ...prev, [userId]: true }));
        try {
            await apiClient.accept(userId);
            setUsersWithStatus((prev) =>
                prev.map((u) =>
                    u.user.id === userId
                        ? { ...u, friendshipStatus: { status: 'accepted' } }
                        : u,
                ),
            );
        } catch {
            Alert.alert(
                'Error',
                'Failed to accept friend request. Please try again.',
            );
        } finally {
            setActionLoading((prev) => ({ ...prev, [userId]: false }));
        }
    };

    const handleCancelRequest = async (userId: string) => {
        if (!apiClient) return;
        setActionLoading((prev) => ({ ...prev, [userId]: true }));
        try {
            await apiClient.cancel(userId);
            setUsersWithStatus((prev) =>
                prev.map((u) =>
                    u.user.id === userId
                        ? { ...u, friendshipStatus: { status: 'none' } }
                        : u,
                ),
            );
        } catch {
            Alert.alert(
                'Error',
                'Failed to cancel friend request. Please try again.',
            );
        } finally {
            setActionLoading((prev) => ({ ...prev, [userId]: false }));
        }
    };

    const renderActionButton = (item: UserWithStatus) => {
        const userId = item.user.id!;
        if (actionLoading[userId]) {
            return (
                <View
                    style={[
                        styles.actionBadge,
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

        const status = item.friendshipStatus;

        if (!status || status.status === 'none') {
            return (
                <TouchableOpacity
                    style={[
                        styles.addButton,
                        { backgroundColor: colors.primary },
                    ]}
                    onPress={() => handleSendRequest(userId)}
                >
                    <Ionicons
                        name='person-add-outline'
                        size={16}
                        color='#FFFFFF'
                    />
                    <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
            );
        }

        if (status.status === 'pending') {
            if (status.direction === 'incoming') {
                return (
                    <TouchableOpacity
                        style={[
                            styles.acceptButton,
                            { backgroundColor: colors.primary },
                        ]}
                        onPress={() => handleAcceptRequest(userId)}
                    >
                        <Ionicons name='checkmark' size={16} color='#FFFFFF' />
                        <Text style={styles.addButtonText}>Accept</Text>
                    </TouchableOpacity>
                );
            }
            return (
                <TouchableOpacity
                    style={[
                        styles.actionBadge,
                        { backgroundColor: colors.surfaceTertiary },
                    ]}
                    onPress={() => handleCancelRequest(userId)}
                >
                    <Ionicons
                        name='close-circle-outline'
                        size={14}
                        color={colors.textSecondary}
                    />
                    <Text
                        style={[
                            styles.actionBadgeText,
                            { color: colors.textSecondary },
                        ]}
                    >
                        Cancel
                    </Text>
                </TouchableOpacity>
            );
        }

        if (status.status === 'accepted') {
            return (
                <View
                    style={[
                        styles.actionBadge,
                        { backgroundColor: colors.indigo50 },
                    ]}
                >
                    <Ionicons
                        name='checkmark-circle'
                        size={14}
                        color={colors.primary}
                    />
                    <Text
                        style={[
                            styles.actionBadgeText,
                            { color: colors.primary },
                        ]}
                    >
                        Friends
                    </Text>
                </View>
            );
        }

        return null;
    };

    const renderUserItem = ({ item }: { item: UserWithStatus }) => {
        const displayName = getDisplayName(item.user);
        return (
            <TouchableOpacity
                style={styles.userItem}
                onPress={() => router.push(`/friend/${item.user.id}`)}
                activeOpacity={0.7}
            >
                <View style={styles.avatarContainer}>
                    {item.user.profileImageUrl ? (
                        <Image
                            source={{ uri: item.user.profileImageUrl }}
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
                                {displayName.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                    )}
                </View>
                <View style={styles.userInfo}>
                    <Text
                        style={[styles.userName, { color: colors.text }]}
                        numberOfLines={1}
                    >
                        {displayName}
                    </Text>
                </View>
                {renderActionButton(item)}
            </TouchableOpacity>
        );
    };

    const renderSuggestionItem = (suggestion: SuggestedFriend) => {
        const isLoading = actionLoading[suggestion.userId];
        const contextLabel = getMutualContextLabel(suggestion);

        return (
            <TouchableOpacity
                key={suggestion.userId}
                style={[
                    styles.suggestionCard,
                    {
                        backgroundColor: colors.card,
                        borderColor: colors.cardBorder,
                    },
                ]}
                onPress={() => router.push(`/friend/${suggestion.userId}`)}
                activeOpacity={0.7}
            >
                <View style={styles.suggestionHeader}>
                    <View style={styles.avatarContainer}>
                        {suggestion.avatarUrl ? (
                            <Image
                                source={{ uri: suggestion.avatarUrl }}
                                style={styles.suggestionAvatar}
                            />
                        ) : (
                            <View
                                style={[
                                    styles.suggestionAvatar,
                                    styles.avatarFallback,
                                    { backgroundColor: colors.indigo50 },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.suggestionAvatarText,
                                        { color: colors.primary },
                                    ]}
                                >
                                    {suggestion.displayName
                                        .charAt(0)
                                        .toUpperCase()}
                                </Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.suggestionInfo}>
                        <Text
                            style={[
                                styles.suggestionName,
                                { color: colors.text },
                            ]}
                            numberOfLines={1}
                        >
                            {suggestion.displayName}
                        </Text>
                        {contextLabel.length > 0 && (
                            <Text
                                style={[
                                    styles.suggestionContext,
                                    { color: colors.textSecondary },
                                ]}
                                numberOfLines={1}
                            >
                                {contextLabel}
                            </Text>
                        )}
                    </View>
                </View>
                {isLoading ? (
                    <View
                        style={[
                            styles.suggestionAddButton,
                            { backgroundColor: colors.surfaceTertiary },
                        ]}
                    >
                        <ActivityIndicator
                            size='small'
                            color={colors.textSecondary}
                        />
                    </View>
                ) : (
                    <TouchableOpacity
                        style={[
                            styles.suggestionAddButton,
                            { backgroundColor: colors.primary },
                        ]}
                        onPress={() => handleSendRequest(suggestion.userId)}
                    >
                        <Ionicons
                            name='person-add-outline'
                            size={16}
                            color='#FFFFFF'
                        />
                        <Text style={styles.addButtonText}>Add Friend</Text>
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        );
    };

    const showSuggestions =
        searchQuery.trim().length < 2 &&
        (suggestions.length > 0 || suggestionsLoading);

    const renderSuggestionsSection = () => {
        if (!showSuggestions) return null;

        return (
            <View style={styles.suggestionsSection}>
                <View style={styles.suggestionsSectionHeader}>
                    <Ionicons
                        name='people-outline'
                        size={20}
                        color={colors.primary}
                    />
                    <Text
                        style={[
                            styles.suggestionsSectionTitle,
                            { color: colors.text },
                        ]}
                    >
                        People You May Know
                    </Text>
                </View>
                <Text
                    style={[
                        styles.suggestionsSectionSubtext,
                        { color: colors.textSecondary },
                    ]}
                >
                    Based on your groups and hangouts
                </Text>

                {suggestionsLoading ? (
                    <View style={styles.suggestionsLoading}>
                        <ActivityIndicator
                            size='small'
                            color={colors.primary}
                        />
                    </View>
                ) : (
                    <View style={styles.suggestionsList}>
                        {suggestions.map(renderSuggestionItem)}
                    </View>
                )}
            </View>
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
                    Find Friends
                </Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View
                    style={[
                        styles.searchBar,
                        {
                            backgroundColor: colors.card,
                            borderColor: colors.cardBorder,
                        },
                    ]}
                >
                    <Ionicons
                        name='search'
                        size={20}
                        color={colors.textSecondary}
                    />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder='Search by name...'
                        placeholderTextColor={colors.textSecondary}
                        value={searchQuery}
                        onChangeText={handleSearch}
                        autoCapitalize='none'
                        autoCorrect={false}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity
                            onPress={() => {
                                setSearchQuery('');
                                setUsersWithStatus([]);
                            }}
                        >
                            <Ionicons
                                name='close-circle'
                                size={20}
                                color={colors.textSecondary}
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Results / Suggestions */}
            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size='large' color={colors.primary} />
                </View>
            ) : searchQuery.trim().length < 2 ? (
                showSuggestions ? (
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps='handled'
                    >
                        {renderSuggestionsSection()}
                    </ScrollView>
                ) : (
                    <View style={styles.centered}>
                        <Ionicons
                            name='search-outline'
                            size={48}
                            color={colors.textSecondary}
                        />
                        <Text
                            style={[styles.emptyTitle, { color: colors.text }]}
                        >
                            Search for friends
                        </Text>
                        <Text
                            style={[
                                styles.emptySubtext,
                                { color: colors.textSecondary },
                            ]}
                        >
                            Enter at least 2 characters to search
                        </Text>
                    </View>
                )
            ) : usersWithStatus.length === 0 && !loading ? (
                <View style={styles.centered}>
                    <Ionicons
                        name='people-outline'
                        size={48}
                        color={colors.textSecondary}
                    />
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>
                        No users found
                    </Text>
                    <Text
                        style={[
                            styles.emptySubtext,
                            { color: colors.textSecondary },
                        ]}
                    >
                        Try a different search term
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={usersWithStatus}
                    keyExtractor={(item) => item.user.id!}
                    renderItem={renderUserItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps='handled'
                />
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
    searchContainer: {
        paddingHorizontal: 24,
        paddingBottom: 12,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 0,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    listContent: {
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    userItem: {
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
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderRadius: 8,
        gap: 4,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
    },
    acceptButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderRadius: 8,
        gap: 4,
    },
    actionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderRadius: 8,
        gap: 4,
    },
    actionBadgeText: {
        fontSize: 13,
        fontWeight: '600',
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
    // Suggestions section
    suggestionsSection: {
        marginTop: 8,
    },
    suggestionsSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    suggestionsSectionTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    suggestionsSectionSubtext: {
        fontSize: 14,
        marginBottom: 16,
    },
    suggestionsLoading: {
        paddingVertical: 24,
        alignItems: 'center',
    },
    suggestionsList: {
        gap: 10,
    },
    suggestionCard: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 14,
        gap: 12,
    },
    suggestionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    suggestionAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    suggestionAvatarText: {
        fontSize: 20,
        fontWeight: '700',
    },
    suggestionInfo: {
        flex: 1,
    },
    suggestionName: {
        fontSize: 16,
        fontWeight: '600',
    },
    suggestionContext: {
        fontSize: 13,
        marginTop: 2,
    },
    suggestionAddButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 10,
        gap: 6,
    },
});

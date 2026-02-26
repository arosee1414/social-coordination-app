import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Image,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useScrollToTop } from '@react-navigation/native';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { createSharedStyles } from '@/src/constants/shared-styles';
import { useApiFriends } from '@/src/hooks/useApiFriends';
import { useApiUserSearch } from '@/src/hooks/useApiUserSearch';
import type { Friend } from '@/src/types';

type Tab = 'friends' | 'discover';

export default function SearchScreen() {
    const colors = useThemeColors();
    const shared = createSharedStyles(colors);
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<Tab>('friends');

    const scrollRef = useRef<ScrollView>(null);
    useScrollToTop(scrollRef);

    const { friends, loading: friendsLoading } = useApiFriends();
    const {
        results: discoverResults,
        loading: discoverLoading,
        searchUsers,
    } = useApiUserSearch();

    // Filter friends locally by search query
    const filteredFriends = useMemo(() => {
        if (!searchQuery.trim()) return friends;
        const q = searchQuery.toLowerCase();
        return friends.filter((f) => f.name.toLowerCase().includes(q));
    }, [friends, searchQuery]);

    // Trigger user search when on discover tab
    const handleSearchChange = useCallback(
        (text: string) => {
            setSearchQuery(text);
            if (activeTab === 'discover') {
                searchUsers(text);
            }
        },
        [activeTab, searchUsers],
    );

    const handleTabChange = useCallback(
        (tab: Tab) => {
            setActiveTab(tab);
            if (tab === 'discover' && searchQuery.length >= 2) {
                searchUsers(searchQuery);
            }
        },
        [searchQuery, searchUsers],
    );

    const handleFriendPress = useCallback(
        (friendId: string) => {
            router.push(`/friend/${friendId}` as any);
        },
        [router],
    );

    const handleFindFriends = useCallback(() => {
        router.push('/find-friends');
    }, [router]);

    const renderFriendRow = (friend: Friend) => (
        <TouchableOpacity
            key={friend.userId}
            style={[
                s.friendCard,
                {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                },
            ]}
            onPress={() => handleFriendPress(friend.userId)}
            activeOpacity={0.7}
        >
            <View style={s.friendRow}>
                {friend.avatar ? (
                    <Image source={{ uri: friend.avatar }} style={s.avatar} />
                ) : (
                    <View
                        style={[
                            s.avatar,
                            s.avatarFallback,
                            { backgroundColor: colors.indigo50 },
                        ]}
                    >
                        <Text
                            style={[
                                s.avatarFallbackText,
                                { color: colors.primary },
                            ]}
                        >
                            {friend.name.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                )}
                <View style={s.friendInfo}>
                    <Text
                        style={[s.friendName, { color: colors.text }]}
                        numberOfLines={1}
                    >
                        {friend.name}
                    </Text>
                    {friend.friendsSince ? (
                        <Text
                            style={[
                                s.friendSubtext,
                                { color: colors.textSecondary },
                            ]}
                        >
                            Friends since {friend.friendsSince}
                        </Text>
                    ) : null}
                </View>
                <Ionicons
                    name='chevron-forward'
                    size={18}
                    color={colors.textTertiary}
                />
            </View>
        </TouchableOpacity>
    );

    const renderDiscoverRow = (user: {
        id?: string;
        displayName?: string | undefined;
        avatarUrl?: string | undefined;
    }) => (
        <TouchableOpacity
            key={user.id}
            style={[
                s.friendCard,
                {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                },
            ]}
            onPress={() => user.id && router.push(`/friend/${user.id}` as any)}
            activeOpacity={0.7}
        >
            <View style={s.friendRow}>
                {user.avatarUrl ? (
                    <Image source={{ uri: user.avatarUrl }} style={s.avatar} />
                ) : (
                    <View
                        style={[
                            s.avatar,
                            s.avatarFallback,
                            { backgroundColor: colors.indigo50 },
                        ]}
                    >
                        <Text
                            style={[
                                s.avatarFallbackText,
                                { color: colors.primary },
                            ]}
                        >
                            {(user.displayName ?? '?').charAt(0).toUpperCase()}
                        </Text>
                    </View>
                )}
                <View style={s.friendInfo}>
                    <Text
                        style={[s.friendName, { color: colors.text }]}
                        numberOfLines={1}
                    >
                        {user.displayName ?? 'Unknown'}
                    </Text>
                </View>
                <Ionicons
                    name='chevron-forward'
                    size={18}
                    color={colors.textTertiary}
                />
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = (
        icon: string,
        title: string,
        subtitle: string,
    ) => (
        <View style={s.emptyState}>
            <View
                style={[
                    s.emptyIcon,
                    { backgroundColor: colors.surfaceTertiary },
                ]}
            >
                <Ionicons
                    name={icon as any}
                    size={32}
                    color={colors.textTertiary}
                />
            </View>
            <Text style={[s.emptyTitle, { color: colors.text }]}>{title}</Text>
            <Text style={[s.emptySubtext, { color: colors.textSecondary }]}>
                {subtitle}
            </Text>
        </View>
    );

    return (
        <SafeAreaView
            style={shared.screenContainer}
            edges={['top', 'left', 'right']}
        >
            {/* Header */}
            <View style={shared.screenHeader}>
                <Text style={shared.screenTitle}>Search</Text>
                <Text style={shared.screenSubtitle}>
                    Find and manage friends
                </Text>
            </View>

            {/* Search Bar */}
            <View style={s.searchBarContainer}>
                <View style={s.searchBarWrapper}>
                    <Ionicons
                        name='search'
                        size={20}
                        color={colors.textTertiary}
                        style={s.searchIcon}
                    />
                    <TextInput
                        style={[
                            shared.searchInput,
                            { paddingRight: searchQuery ? 40 : 16 },
                        ]}
                        placeholder='Search by name...'
                        placeholderTextColor={colors.textTertiary}
                        value={searchQuery}
                        onChangeText={handleSearchChange}
                        autoCapitalize='none'
                        autoCorrect={false}
                        returnKeyType='search'
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity
                            style={s.clearButton}
                            onPress={() => handleSearchChange('')}
                            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                        >
                            <Ionicons
                                name='close-circle'
                                size={18}
                                color={colors.textTertiary}
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Segmented Tabs */}
            <View style={s.tabsContainer}>
                <View style={shared.segmentedControl}>
                    <TouchableOpacity
                        style={
                            activeTab === 'friends'
                                ? shared.segmentedTabActive
                                : shared.segmentedTab
                        }
                        onPress={() => handleTabChange('friends')}
                    >
                        <Text
                            style={
                                activeTab === 'friends'
                                    ? shared.segmentedTabTextActive
                                    : shared.segmentedTabText
                            }
                        >
                            My Friends ({friends.length})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={
                            activeTab === 'discover'
                                ? shared.segmentedTabActive
                                : shared.segmentedTab
                        }
                        onPress={() => handleTabChange('discover')}
                    >
                        <Text
                            style={
                                activeTab === 'discover'
                                    ? shared.segmentedTabTextActive
                                    : shared.segmentedTabText
                            }
                        >
                            Discover
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content */}
            <ScrollView
                ref={scrollRef}
                style={{ flex: 1 }}
                contentContainerStyle={s.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps='handled'
            >
                {activeTab === 'friends' ? (
                    <>
                        {friendsLoading ? (
                            <View style={s.loadingContainer}>
                                <ActivityIndicator
                                    size='large'
                                    color={colors.primary}
                                />
                            </View>
                        ) : filteredFriends.length > 0 ? (
                            filteredFriends.map(renderFriendRow)
                        ) : searchQuery ? (
                            renderEmptyState(
                                'search-outline',
                                'No friends found',
                                'Try a different search',
                            )
                        ) : (
                            renderEmptyState(
                                'people-outline',
                                'No friends yet',
                                'Find and add friends to get started',
                            )
                        )}
                    </>
                ) : (
                    <>
                        {discoverLoading ? (
                            <View style={s.loadingContainer}>
                                <ActivityIndicator
                                    size='large'
                                    color={colors.primary}
                                />
                            </View>
                        ) : discoverResults.length > 0 ? (
                            <>
                                <Text
                                    style={[
                                        s.sectionHeader,
                                        { color: colors.textSecondary },
                                    ]}
                                >
                                    People You May Know
                                </Text>
                                {discoverResults.map(renderDiscoverRow)}
                            </>
                        ) : searchQuery.length >= 2 ? (
                            renderEmptyState(
                                'search-outline',
                                'No suggestions found',
                                'Try a different search',
                            )
                        ) : null}

                        {/* Find Friends CTA */}
                        {!searchQuery && (
                            <View
                                style={[
                                    s.findFriendsCta,
                                    {
                                        backgroundColor: colors.indigoTint5,
                                        borderColor: colors.indigoTint,
                                    },
                                ]}
                            >
                                <Text
                                    style={[s.ctaTitle, { color: colors.text }]}
                                >
                                    Find More Friends
                                </Text>
                                <Text
                                    style={[
                                        s.ctaSubtext,
                                        { color: colors.textSecondary },
                                    ]}
                                >
                                    Connect with people you know to make
                                    planning hangouts even easier.
                                </Text>
                                <TouchableOpacity
                                    style={[
                                        s.ctaButton,
                                        { backgroundColor: colors.primary },
                                    ]}
                                    onPress={handleFindFriends}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons
                                        name='person-add-outline'
                                        size={16}
                                        color='#fff'
                                    />
                                    <Text style={s.ctaButtonText}>
                                        Find Friends
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    searchBarContainer: {
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 12,
    },
    searchBarWrapper: {
        position: 'relative',
        justifyContent: 'center',
    },
    searchIcon: {
        position: 'absolute',
        left: 14,
        zIndex: 1,
    },
    clearButton: {
        position: 'absolute',
        right: 14,
        zIndex: 1,
    },
    tabsContainer: {
        paddingHorizontal: 24,
        paddingBottom: 12,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 32,
    },
    friendCard: {
        borderRadius: 16,
        borderWidth: 2,
        padding: 14,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    friendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    avatarFallback: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarFallbackText: {
        fontSize: 18,
        fontWeight: '700',
    },
    friendInfo: {
        flex: 1,
    },
    friendName: {
        fontSize: 16,
        fontWeight: '600',
    },
    friendSubtext: {
        fontSize: 13,
        marginTop: 2,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 48,
    },
    emptyIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    emptySubtext: {
        fontSize: 14,
        textAlign: 'center',
    },
    loadingContainer: {
        paddingVertical: 48,
        alignItems: 'center',
    },
    findFriendsCta: {
        borderWidth: 2,
        borderRadius: 16,
        padding: 20,
        marginTop: 16,
    },
    ctaTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    ctaSubtext: {
        fontSize: 14,
        marginBottom: 16,
        lineHeight: 20,
    },
    ctaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
    },
    ctaButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});

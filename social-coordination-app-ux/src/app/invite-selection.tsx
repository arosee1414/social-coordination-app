import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Alert,
    ActivityIndicator,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { createSharedStyles } from '@/src/constants/shared-styles';
import { useApiClient } from '@/src/hooks/useApiClient';
import { useApiGroups } from '@/src/hooks/useApiGroups';
import { useApiFriends } from '@/src/hooks/useApiFriends';
import { useHangouts } from '@/src/contexts/HangoutsContext';
import {
    CreateHangoutRequest,
    AddHangoutAttendeesRequest,
} from '@/src/clients/generatedClient';
import type { Friend } from '@/src/types';

interface ExistingAttendee {
    userId: string;
    displayName: string;
    profileImageUrl: string | null;
}

type ActiveTab = 'friends' | 'groups';

export default function InviteSelectionScreen() {
    const colors = useThemeColors();
    const shared = createSharedStyles(colors);
    const router = useRouter();
    const api = useApiClient();
    const { refetch: refetchHangouts } = useHangouts();
    const params = useLocalSearchParams<{
        title: string;
        startTime: string;
        description?: string;
        location?: string;
        endTime?: string;
        hangoutId?: string;
        groupId?: string;
    }>();

    // Determine mode: if hangoutId is present, we're adding to an existing hangout
    const isAddMode = !!params.hangoutId;

    const {
        groups,
        loading: groupsLoading,
        refetch: refetchGroups,
    } = useApiGroups();

    // Use real friends list instead of general user search
    const {
        friends,
        loading: friendsLoading,
        refetch: refetchFriends,
    } = useApiFriends();

    // Re-fetch groups and friends whenever this screen gains focus
    useFocusEffect(
        useCallback(() => {
            refetchGroups();
            refetchFriends();
        }, [refetchGroups, refetchFriends]),
    );
    const [activeTab, setActiveTab] = useState<ActiveTab>(
        params.groupId ? 'groups' : 'friends',
    );
    const [selectedGroups, setSelectedGroups] = useState<Set<string>>(
        params.groupId ? new Set([params.groupId]) : new Set(),
    );
    const [selectedFriends, setSelectedFriends] = useState<Set<string>>(
        new Set(),
    );
    const [search, setSearch] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Track existing attendees (for add mode — to show them as already invited with remove option)
    const [existingAttendees, setExistingAttendees] = useState<
        ExistingAttendee[]
    >([]);
    const [existingAttendeeIds, setExistingAttendeeIds] = useState<Set<string>>(
        new Set(),
    );
    const [existingGroupIds, setExistingGroupIds] = useState<Set<string>>(
        new Set(),
    );
    const [loadingExisting, setLoadingExisting] = useState(false);
    const [removingUserId, setRemovingUserId] = useState<string | null>(null);
    const [creatorUserId, setCreatorUserId] = useState<string | null>(null);

    // Fetch existing hangout data when in add mode
    useEffect(() => {
        if (!isAddMode || !params.hangoutId) return;
        const fetchExisting = async () => {
            try {
                setLoadingExisting(true);
                const hangout = await api.hangoutsGET(params.hangoutId!);
                const attendees = (hangout.attendees ?? []).filter(
                    (a) => !!a.userId,
                );
                const attendeeIds = new Set(attendees.map((a) => a.userId!));
                setExistingAttendeeIds(attendeeIds);
                setExistingAttendees(
                    attendees.map((a) => ({
                        userId: a.userId!,
                        displayName: a.displayName || a.userId || 'Unknown',
                        profileImageUrl: a.profileImageUrl ?? null,
                    })),
                );
                const groupIds = new Set(
                    (hangout.invitedGroupIds ?? []).filter(Boolean),
                );
                setCreatorUserId(hangout.createdByUserId ?? null);
                setExistingGroupIds(groupIds);
            } catch (err: any) {
                Alert.alert(
                    'Error',
                    err?.message ?? 'Failed to load hangout data',
                );
            } finally {
                setLoadingExisting(false);
            }
        };
        fetchExisting();
    }, [isAddMode, params.hangoutId]);

    const toggleGroup = (id: string) => {
        // Don't allow toggling already-invited groups
        if (existingGroupIds.has(id)) return;
        const next = new Set(selectedGroups);
        next.has(id) ? next.delete(id) : next.add(id);
        setSelectedGroups(next);
    };

    const toggleFriend = (friend: Friend) => {
        const id = friend.userId;
        // Don't allow toggling already-invited users
        if (existingAttendeeIds.has(id)) return;
        const next = new Set(selectedFriends);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setSelectedFriends(next);
    };

    const totalSelected = selectedGroups.size + selectedFriends.size;

    // Filter friends by search query (client-side)
    const displayedFriends: Friend[] = friends.filter((f) => {
        if (!search.trim()) return true;
        return f.name.toLowerCase().includes(search.toLowerCase());
    });

    const handleRemoveAttendee = (attendee: ExistingAttendee) => {
        Alert.alert(
            `Remove ${attendee.displayName}?`,
            'They will be removed from this hangout.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setRemovingUserId(attendee.userId);
                            await api.attendeesDELETE(
                                params.hangoutId!,
                                attendee.userId,
                            );
                            // Optimistically remove from local state
                            setExistingAttendees((prev) =>
                                prev.filter(
                                    (a) => a.userId !== attendee.userId,
                                ),
                            );
                            setExistingAttendeeIds((prev) => {
                                const next = new Set(prev);
                                next.delete(attendee.userId);
                                return next;
                            });
                            await refetchHangouts();
                        } catch (err: any) {
                            Alert.alert(
                                'Error',
                                err?.message ?? 'Failed to remove attendee',
                            );
                        } finally {
                            setRemovingUserId(null);
                        }
                    },
                },
            ],
        );
    };

    const filteredGroups = groups.filter((g) =>
        g.name.toLowerCase().includes(search.toLowerCase()),
    );

    const handleSendInvites = async () => {
        if (isAddMode && params.hangoutId) {
            // Add attendees to existing hangout
            try {
                setSubmitting(true);

                const req = new AddHangoutAttendeesRequest();

                const groupIds = Array.from(selectedGroups);
                if (groupIds.length > 0) {
                    req.invitedGroupIds = groupIds;
                }

                const friendIds = Array.from(selectedFriends);
                if (friendIds.length > 0) {
                    req.inviteeUserIds = friendIds;
                }

                await api.attendeesPOST(params.hangoutId, req);
                await refetchHangouts();

                router.back();
            } catch (err: any) {
                Alert.alert('Error', err?.message ?? 'Failed to add people');
            } finally {
                setSubmitting(false);
            }
        } else {
            // Create new hangout mode
            try {
                setSubmitting(true);

                const req = new CreateHangoutRequest();
                req.title = params.title;
                req.startTime = new Date(params.startTime);
                if (params.description) req.description = params.description;
                if (params.location) req.location = params.location;
                if (params.endTime) req.endTime = new Date(params.endTime);

                const groupIds = Array.from(selectedGroups);
                if (groupIds.length > 0) {
                    req.invitedGroupIds = groupIds;
                }

                const friendIds = Array.from(selectedFriends);
                if (friendIds.length > 0) {
                    req.inviteeUserIds = friendIds;
                }

                await api.hangoutsPOST(req);
                await refetchHangouts();

                router.replace('/(tabs)' as any);
            } catch (err: any) {
                Alert.alert(
                    'Error',
                    err?.message ?? 'Failed to create hangout',
                );
            } finally {
                setSubmitting(false);
            }
        }
    };

    // Determine button text
    const getButtonText = () => {
        if (submitting) {
            return isAddMode ? 'Adding...' : 'Creating...';
        }
        if (isAddMode) {
            return totalSelected > 0 ? 'Add People' : 'No one selected';
        }
        return totalSelected > 0
            ? 'Invite & Create Hangout'
            : 'Skip & Create Hangout';
    };

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
                    {isAddMode ? 'Add People' : 'Invite People'}
                </Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Tab Switcher */}
            <View
                style={{
                    paddingHorizontal: 24,
                    paddingTop: 16,
                    paddingBottom: 4,
                }}
            >
                <View style={shared.segmentedControl}>
                    <TouchableOpacity
                        style={
                            activeTab === 'friends'
                                ? shared.segmentedTabActive
                                : shared.segmentedTab
                        }
                        onPress={() => setActiveTab('friends')}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={
                                activeTab === 'friends'
                                    ? shared.segmentedTabTextActive
                                    : shared.segmentedTabText
                            }
                        >
                            Friends
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={
                            activeTab === 'groups'
                                ? shared.segmentedTabActive
                                : shared.segmentedTab
                        }
                        onPress={() => setActiveTab('groups')}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={
                                activeTab === 'groups'
                                    ? shared.segmentedTabTextActive
                                    : shared.segmentedTabText
                            }
                        >
                            Groups
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search */}
            <View
                style={{
                    paddingHorizontal: 24,
                    paddingTop: 12,
                    paddingBottom: 12,
                }}
            >
                <View style={{ position: 'relative' }}>
                    <Ionicons
                        name='search'
                        size={20}
                        color={colors.textTertiary}
                        style={{
                            position: 'absolute',
                            left: 14,
                            top: 14,
                            zIndex: 1,
                        }}
                    />
                    <TextInput
                        style={shared.searchInput}
                        placeholder={
                            activeTab === 'friends'
                                ? 'Search friends...'
                                : 'Search groups...'
                        }
                        placeholderTextColor={colors.placeholder}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
            </View>

            {loadingExisting ? (
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <ActivityIndicator size='large' color={colors.primary} />
                </View>
            ) : (
                <ScrollView
                    style={{ flex: 1 }}
                    keyboardShouldPersistTaps='handled'
                >
                    {/* Friends Tab Content */}
                    {activeTab === 'friends' && (
                        <View
                            style={{
                                paddingHorizontal: 24,
                                paddingBottom: 24,
                            }}
                        >
                            {/* Already Invited section (add mode only) */}
                            {isAddMode && existingAttendees.length > 0 && (
                                <View style={{ marginBottom: 16 }}>
                                    <Text
                                        style={{
                                            fontSize: 13,
                                            fontWeight: '600',
                                            color: colors.textSecondary,
                                            textTransform: 'uppercase',
                                            letterSpacing: 0.5,
                                            marginBottom: 8,
                                        }}
                                    >
                                        Already Invited
                                    </Text>
                                    <View style={{ gap: 8 }}>
                                        {existingAttendees.map((attendee) => (
                                            <View
                                                key={attendee.userId}
                                                style={[
                                                    shared.selectableItemSelected,
                                                    {
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                    },
                                                ]}
                                            >
                                                {attendee.profileImageUrl ? (
                                                    <Image
                                                        source={{
                                                            uri: attendee.profileImageUrl,
                                                        }}
                                                        style={{
                                                            width: 44,
                                                            height: 44,
                                                            borderRadius: 22,
                                                        }}
                                                    />
                                                ) : (
                                                    <View
                                                        style={[
                                                            shared.avatarLarge,
                                                            {
                                                                backgroundColor:
                                                                    colors.surfaceTertiary,
                                                            },
                                                        ]}
                                                    >
                                                        <Ionicons
                                                            name='person'
                                                            size={22}
                                                            color={
                                                                colors.textTertiary
                                                            }
                                                        />
                                                    </View>
                                                )}
                                                <View style={{ flex: 1 }}>
                                                    <Text
                                                        style={[
                                                            s.itemName,
                                                            {
                                                                color: colors.text,
                                                            },
                                                        ]}
                                                    >
                                                        {attendee.displayName}
                                                    </Text>
                                                </View>
                                                {attendee.userId ===
                                                creatorUserId ? (
                                                    <Text
                                                        style={{
                                                            fontSize: 12,
                                                            fontWeight: '600',
                                                            color: colors.textTertiary,
                                                            marginRight: 4,
                                                        }}
                                                    >
                                                        Creator
                                                    </Text>
                                                ) : (
                                                    <TouchableOpacity
                                                        onPress={() =>
                                                            handleRemoveAttendee(
                                                                attendee,
                                                            )
                                                        }
                                                        disabled={
                                                            removingUserId ===
                                                            attendee.userId
                                                        }
                                                        style={{
                                                            padding: 8,
                                                            marginRight: -4,
                                                        }}
                                                        activeOpacity={0.6}
                                                    >
                                                        {removingUserId ===
                                                        attendee.userId ? (
                                                            <ActivityIndicator
                                                                size='small'
                                                                color={
                                                                    colors.error ??
                                                                    '#FF3B30'
                                                                }
                                                            />
                                                        ) : (
                                                            <Ionicons
                                                                name='close-circle'
                                                                size={24}
                                                                color={
                                                                    colors.error ??
                                                                    '#FF3B30'
                                                                }
                                                            />
                                                        )}
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}
                            {friendsLoading && (
                                <ActivityIndicator
                                    color={colors.primary}
                                    style={{ marginVertical: 16 }}
                                />
                            )}
                            {!friendsLoading && friends.length === 0 && (
                                <View
                                    style={{
                                        alignItems: 'center',
                                        paddingVertical: 64,
                                        paddingHorizontal: 24,
                                    }}
                                >
                                    <View
                                        style={{
                                            width: 96,
                                            height: 96,
                                            borderRadius: 48,
                                            backgroundColor:
                                                colors.surfaceTertiary,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginBottom: 24,
                                        }}
                                    >
                                        <Ionicons
                                            name='people-outline'
                                            size={48}
                                            color={colors.textTertiary}
                                        />
                                    </View>
                                    <Text
                                        style={{
                                            fontSize: 20,
                                            fontWeight: 'bold',
                                            color: colors.text,
                                            marginBottom: 8,
                                        }}
                                    >
                                        No Friends Yet
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: 16,
                                            color: colors.subtitle,
                                            textAlign: 'center',
                                            marginBottom: 32,
                                            maxWidth: 280,
                                        }}
                                    >
                                        Add friends first, then you can invite
                                        them to hangouts
                                    </Text>
                                    <TouchableOpacity
                                        style={shared.secondaryBtn}
                                        onPress={() =>
                                            router.push('/find-friends' as any)
                                        }
                                        activeOpacity={0.7}
                                    >
                                        <Text style={shared.secondaryBtnText}>
                                            Find Friends
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                            {!friendsLoading &&
                                friends.length > 0 &&
                                displayedFriends.length === 0 && (
                                    <Text
                                        style={{
                                            color: colors.textSecondary,
                                            fontSize: 14,
                                            paddingVertical: 16,
                                            textAlign: 'center',
                                        }}
                                    >
                                        No friends match your search
                                    </Text>
                                )}
                            {/* Section header */}
                            {!friendsLoading && displayedFriends.length > 0 && (
                                <Text
                                    style={{
                                        fontSize: 13,
                                        fontWeight: '600',
                                        color: colors.textSecondary,
                                        textTransform: 'uppercase',
                                        letterSpacing: 0.5,
                                        marginBottom: 8,
                                    }}
                                >
                                    Your Friends
                                </Text>
                            )}
                            <View style={{ gap: 8 }}>
                                {displayedFriends.map((friend) => {
                                    const isExisting = existingAttendeeIds.has(
                                        friend.userId,
                                    );
                                    const selected =
                                        selectedFriends.has(friend.userId) ||
                                        isExisting;
                                    return (
                                        <TouchableOpacity
                                            key={friend.userId}
                                            style={[
                                                selected
                                                    ? shared.selectableItemSelected
                                                    : shared.selectableItem,
                                                isExisting && { opacity: 0.5 },
                                            ]}
                                            onPress={() => toggleFriend(friend)}
                                            disabled={isExisting}
                                            activeOpacity={isExisting ? 1 : 0.7}
                                        >
                                            {friend.avatar ? (
                                                <Image
                                                    source={{
                                                        uri: friend.avatar,
                                                    }}
                                                    style={{
                                                        width: 44,
                                                        height: 44,
                                                        borderRadius: 22,
                                                    }}
                                                />
                                            ) : (
                                                <View
                                                    style={[
                                                        shared.avatarLarge,
                                                        {
                                                            backgroundColor:
                                                                colors.surfaceTertiary,
                                                        },
                                                    ]}
                                                >
                                                    <Ionicons
                                                        name='person'
                                                        size={22}
                                                        color={
                                                            colors.textTertiary
                                                        }
                                                    />
                                                </View>
                                            )}
                                            <View style={{ flex: 1 }}>
                                                <Text
                                                    style={[
                                                        s.itemName,
                                                        {
                                                            color: colors.text,
                                                        },
                                                    ]}
                                                >
                                                    {friend.name}
                                                </Text>
                                                {isExisting && (
                                                    <Text
                                                        style={[
                                                            s.itemSub,
                                                            {
                                                                color: colors.textTertiary,
                                                                fontStyle:
                                                                    'italic',
                                                            },
                                                        ]}
                                                    >
                                                        Already invited
                                                    </Text>
                                                )}
                                            </View>
                                            {selected && (
                                                <View
                                                    style={[
                                                        shared.checkCircle,
                                                        isExisting && {
                                                            opacity: 0.5,
                                                        },
                                                    ]}
                                                >
                                                    <Ionicons
                                                        name='checkmark'
                                                        size={16}
                                                        color='#fff'
                                                    />
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    )}

                    {/* Groups Tab Content */}
                    {activeTab === 'groups' && (
                        <View
                            style={{
                                paddingHorizontal: 24,
                                paddingBottom: 24,
                            }}
                        >
                            {groupsLoading ? (
                                <ActivityIndicator
                                    color={colors.primary}
                                    style={{ marginVertical: 16 }}
                                />
                            ) : filteredGroups.length === 0 ? (
                                groups.length === 0 ? (
                                    <View
                                        style={{
                                            alignItems: 'center',
                                            paddingVertical: 64,
                                            paddingHorizontal: 24,
                                        }}
                                    >
                                        <View
                                            style={{
                                                width: 96,
                                                height: 96,
                                                borderRadius: 48,
                                                backgroundColor:
                                                    colors.surfaceTertiary,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                marginBottom: 24,
                                            }}
                                        >
                                            <Ionicons
                                                name='people-outline'
                                                size={48}
                                                color={colors.textTertiary}
                                            />
                                        </View>
                                        <Text
                                            style={{
                                                fontSize: 20,
                                                fontWeight: 'bold',
                                                color: colors.text,
                                                marginBottom: 8,
                                            }}
                                        >
                                            No Groups Yet
                                        </Text>
                                        <Text
                                            style={{
                                                fontSize: 16,
                                                color: colors.subtitle,
                                                textAlign: 'center',
                                                marginBottom: 32,
                                                maxWidth: 280,
                                            }}
                                        >
                                            Create a group to save friend lists
                                            and invite them faster to hangouts
                                        </Text>
                                        <TouchableOpacity
                                            style={shared.secondaryBtn}
                                            onPress={() =>
                                                router.push(
                                                    '/create-group' as any,
                                                )
                                            }
                                            activeOpacity={0.7}
                                        >
                                            <Text
                                                style={shared.secondaryBtnText}
                                            >
                                                Create Group
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <Text
                                        style={{
                                            color: colors.textSecondary,
                                            fontSize: 14,
                                            paddingVertical: 8,
                                        }}
                                    >
                                        No groups match your search
                                    </Text>
                                )
                            ) : (
                                <View style={{ gap: 8 }}>
                                    {filteredGroups.map((group) => {
                                        const isExisting = existingGroupIds.has(
                                            group.id,
                                        );
                                        const selected =
                                            selectedGroups.has(group.id) ||
                                            isExisting;
                                        return (
                                            <TouchableOpacity
                                                key={group.id}
                                                style={[
                                                    selected
                                                        ? shared.selectableItemSelected
                                                        : shared.selectableItem,
                                                    isExisting && {
                                                        opacity: 0.5,
                                                    },
                                                ]}
                                                onPress={() =>
                                                    toggleGroup(group.id)
                                                }
                                                activeOpacity={
                                                    isExisting ? 1 : 0.7
                                                }
                                            >
                                                <Text style={{ fontSize: 28 }}>
                                                    {group.icon}
                                                </Text>
                                                <View style={{ flex: 1 }}>
                                                    <Text
                                                        style={[
                                                            s.itemName,
                                                            {
                                                                color: colors.text,
                                                            },
                                                        ]}
                                                    >
                                                        {group.name}
                                                    </Text>
                                                    <Text
                                                        style={[
                                                            s.itemSub,
                                                            {
                                                                color: isExisting
                                                                    ? colors.textTertiary
                                                                    : colors.textSecondary,
                                                                fontStyle:
                                                                    isExisting
                                                                        ? 'italic'
                                                                        : 'normal',
                                                            },
                                                        ]}
                                                    >
                                                        {isExisting
                                                            ? 'Already invited'
                                                            : `${group.memberCount} members`}
                                                    </Text>
                                                </View>
                                                {selected && (
                                                    <View
                                                        style={[
                                                            shared.checkCircle,
                                                            isExisting && {
                                                                opacity: 0.5,
                                                            },
                                                        ]}
                                                    >
                                                        <Ionicons
                                                            name='checkmark'
                                                            size={16}
                                                            color='#fff'
                                                        />
                                                    </View>
                                                )}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            )}
                        </View>
                    )}
                </ScrollView>
            )}

            {/* Bottom CTA */}
            <View style={shared.bottomCTA}>
                {totalSelected > 0 && (
                    <Text style={[s.selectedCount, { color: colors.subtitle }]}>
                        <Text
                            style={{
                                fontWeight: '600',
                                color: colors.primary,
                            }}
                        >
                            {totalSelected}
                        </Text>{' '}
                        selected
                        {selectedFriends.size > 0 &&
                            selectedGroups.size > 0 && (
                                <Text style={{ color: colors.subtitle }}>
                                    {' '}
                                    ({selectedFriends.size} friends,{' '}
                                    {selectedGroups.size} groups)
                                </Text>
                            )}
                    </Text>
                )}
                <TouchableOpacity
                    style={[
                        shared.primaryBtnLarge,
                        (submitting || (isAddMode && totalSelected === 0)) && {
                            opacity: 0.5,
                        },
                    ]}
                    disabled={submitting || (isAddMode && totalSelected === 0)}
                    onPress={handleSendInvites}
                >
                    <Text style={shared.primaryBtnLargeText}>
                        {getButtonText()}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    backBtn: { padding: 8, marginLeft: -8 },
    headerTitle: { fontSize: 18, fontWeight: '600' },
    itemName: { fontSize: 16, fontWeight: '500' },
    itemSub: { fontSize: 14, marginTop: 2 },
    selectedCount: { textAlign: 'center', marginBottom: 12, fontSize: 14 },
});

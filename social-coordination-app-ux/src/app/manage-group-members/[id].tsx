import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Image,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { createSharedStyles } from '@/src/constants/shared-styles';
import { useApiClient } from '@/src/hooks/useApiClient';
import { useApiUser } from '@/src/hooks/useApiUser';
import { useApiFriends } from '@/src/hooks/useApiFriends';
import { AddGroupMemberRequest } from '@/src/clients/generatedClient';
import type { GroupMemberResponse } from '@/src/clients/generatedClient';

export default function ManageGroupMembersScreen() {
    const colors = useThemeColors();
    const shared = createSharedStyles(colors);
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const groupId = typeof id === 'string' ? id : (id?.[0] ?? '');
    const api = useApiClient();
    const { user } = useApiUser();

    const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState<GroupMemberResponse[]>([]);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [addingId, setAddingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const { friends, loading: friendsLoading } = useApiFriends();

    // Fetch group members
    const fetchGroup = useCallback(async () => {
        if (!groupId || !user?.id) return;
        try {
            setLoading(true);
            const result = await api.groupsGET(groupId);

            // Check if the current user is an admin
            const isAdmin = result.members?.some(
                (m: any) => m.userId === user.id && m.role === 'Admin',
            );
            if (!isAdmin) {
                Alert.alert(
                    'Unauthorized',
                    'Only group admins can manage members.',
                );
                router.back();
                return;
            }

            setMembers(result.members ?? []);
        } catch (err: any) {
            Alert.alert('Error', err?.message ?? 'Failed to load group');
            router.back();
        } finally {
            setLoading(false);
        }
    }, [api, groupId, user?.id]);

    useEffect(() => {
        if (user?.id) {
            fetchGroup();
        }
    }, [fetchGroup, user?.id]);

    // Filter friends: exclude existing group members, then apply search query
    const memberUserIds = new Set(members.map((m) => m.userId));
    const filteredFriends = friends.filter((f) => {
        if (memberUserIds.has(f.userId)) return false;
        if (!searchQuery.trim()) return true;
        return f.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const handleRemoveMember = async (memberUserId: string) => {
        try {
            setRemovingId(memberUserId);
            const result = await api.membersDELETE(groupId, memberUserId);
            setMembers(result.members ?? []);
        } catch (err: any) {
            Alert.alert('Error', err?.message ?? 'Failed to remove member');
        } finally {
            setRemovingId(null);
        }
    };

    const handleAddMember = async (userId: string) => {
        try {
            setAddingId(userId);
            const req = new AddGroupMemberRequest();
            req.userId = userId;
            const result = await api.membersPOST(groupId, req);
            setMembers(result.members ?? []);
        } catch (err: any) {
            Alert.alert('Error', err?.message ?? 'Failed to add member');
        } finally {
            setAddingId(null);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={shared.screenContainer}>
                <View style={shared.stackHeader}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={s.backBtn}
                    >
                        <Ionicons
                            name='arrow-back'
                            size={24}
                            color={colors.text}
                        />
                    </TouchableOpacity>
                    <Text style={[s.headerTitle, { color: colors.text }]}>
                        Manage Members
                    </Text>
                    <View style={{ width: 40 }} />
                </View>
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <ActivityIndicator size='large' color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

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
                    Manage Members
                </Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Content */}
            <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps='handled'>
                {/* Current Members Section */}
                <View
                    style={[
                        s.section,
                        { borderBottomColor: colors.cardBorder },
                    ]}
                >
                    <Text style={[s.sectionTitle, { color: colors.text }]}>
                        Current Members ({members.length})
                    </Text>

                    <View style={{ gap: 8 }}>
                        {members.map((member) => (
                            <View
                                key={member.userId}
                                style={[
                                    s.memberRow,
                                    {
                                        backgroundColor: colors.surfaceTertiary,
                                    },
                                ]}
                            >
                                <View style={s.memberAvatar}>
                                    {member.profileImageUrl ? (
                                        <Image
                                            source={{
                                                uri: member.profileImageUrl,
                                            }}
                                            style={s.memberAvatarImage}
                                        />
                                    ) : (
                                        <Ionicons
                                            name='person'
                                            size={22}
                                            color='#999'
                                        />
                                    )}
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text
                                        style={[
                                            s.memberName,
                                            { color: colors.text },
                                        ]}
                                    >
                                        {member.displayName ?? 'Unknown'}
                                    </Text>
                                    <Text
                                        style={[
                                            s.memberRole,
                                            { color: colors.textTertiary },
                                        ]}
                                    >
                                        {member.role}
                                    </Text>
                                </View>
                                {member.role !== 'Admin' && (
                                    <TouchableOpacity
                                        onPress={() =>
                                            handleRemoveMember(
                                                member.userId ?? '',
                                            )
                                        }
                                        disabled={removingId === member.userId}
                                        style={s.removeBtn}
                                    >
                                        {removingId === member.userId ? (
                                            <ActivityIndicator
                                                size='small'
                                                color={colors.error}
                                            />
                                        ) : (
                                            <Ionicons
                                                name='close'
                                                size={20}
                                                color={colors.error}
                                            />
                                        )}
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}
                    </View>
                </View>

                {/* Add Members Section */}
                <View style={s.section}>
                    <Text style={[s.sectionTitle, { color: colors.text }]}>
                        Add More Members
                    </Text>

                    {/* Search */}
                    <View
                        style={[
                            s.searchContainer,
                            {
                                backgroundColor: colors.surfaceTertiary,
                            },
                        ]}
                    >
                        <Ionicons
                            name='search'
                            size={20}
                            color={colors.textTertiary}
                        />
                        <TextInput
                            style={[s.searchInput, { color: colors.inputText }]}
                            placeholder='Search friends'
                            placeholderTextColor={colors.placeholder}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity
                                onPress={() => setSearchQuery('')}
                            >
                                <Ionicons
                                    name='close-circle'
                                    size={20}
                                    color={colors.textTertiary}
                                />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Friends List */}
                    {friendsLoading ? (
                        <View style={s.emptyState}>
                            <ActivityIndicator
                                size='small'
                                color={colors.primary}
                            />
                        </View>
                    ) : filteredFriends.length > 0 ? (
                        <View style={{ gap: 8, marginTop: 12 }}>
                            {filteredFriends.map((friend) => (
                                <TouchableOpacity
                                    key={friend.userId}
                                    style={[
                                        s.addMemberRow,
                                        {
                                            borderColor: colors.cardBorder,
                                        },
                                    ]}
                                    onPress={() =>
                                        handleAddMember(friend.userId)
                                    }
                                    disabled={addingId === friend.userId}
                                >
                                    <View style={s.memberAvatar}>
                                        {friend.avatar ? (
                                            <Image
                                                source={{
                                                    uri: friend.avatar,
                                                }}
                                                style={s.memberAvatarImage}
                                            />
                                        ) : (
                                            <Ionicons
                                                name='person'
                                                size={22}
                                                color='#999'
                                            />
                                        )}
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text
                                            style={[
                                                s.memberName,
                                                { color: colors.text },
                                            ]}
                                        >
                                            {friend.name}
                                        </Text>
                                    </View>
                                    {addingId === friend.userId ? (
                                        <ActivityIndicator
                                            size='small'
                                            color={colors.primary}
                                        />
                                    ) : (
                                        <Ionicons
                                            name='person-add'
                                            size={20}
                                            color={colors.primary}
                                        />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : friends.length === 0 ? (
                        <View style={s.emptyState}>
                            <Text
                                style={[
                                    s.emptyStateText,
                                    { color: colors.textTertiary },
                                ]}
                            >
                                No friends yet. Add friends to invite them to
                                groups.
                            </Text>
                        </View>
                    ) : (
                        <View style={s.emptyState}>
                            <Text
                                style={[
                                    s.emptyStateText,
                                    { color: colors.textTertiary },
                                ]}
                            >
                                No friends match your search
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Bottom CTA */}
            <View style={shared.bottomCTA}>
                <TouchableOpacity
                    style={shared.primaryBtnLarge}
                    onPress={() => router.back()}
                >
                    <Text style={shared.primaryBtnLargeText}>Done</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    backBtn: { padding: 8, marginLeft: -8 },
    headerTitle: { fontSize: 18, fontWeight: '600' },
    section: {
        paddingHorizontal: 24,
        paddingVertical: 24,
        borderBottomWidth: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    memberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        borderRadius: 12,
    },
    memberAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    memberAvatarImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    memberName: {
        fontSize: 15,
        fontWeight: '600',
    },
    memberRole: {
        fontSize: 13,
        marginTop: 2,
    },
    removeBtn: {
        padding: 8,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        height: 48,
        borderRadius: 12,
        paddingHorizontal: 14,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        height: '100%',
    },
    addMemberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        borderRadius: 12,
        borderWidth: 2,
    },
    emptyState: {
        paddingVertical: 32,
        alignItems: 'center',
    },
    emptyStateText: {
        fontSize: 15,
    },
});

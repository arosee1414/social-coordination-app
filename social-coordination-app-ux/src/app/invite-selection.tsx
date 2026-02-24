import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { createSharedStyles } from '@/src/constants/shared-styles';
import { mockFriends } from '@/src/data/mock-data';
import { useApiClient } from '@/src/hooks/useApiClient';
import { useApiGroups } from '@/src/hooks/useApiGroups';
import { useHangouts } from '@/src/contexts/HangoutsContext';
import { CreateHangoutRequest } from '@/src/clients/generatedClient';

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
    }>();

    const { groups, loading: groupsLoading } = useApiGroups();
    const [selectedGroups, setSelectedGroups] = useState<Set<string>>(
        new Set(),
    );
    const [selectedFriends, setSelectedFriends] = useState<Set<string>>(
        new Set(),
    );
    const [search, setSearch] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const toggleGroup = (id: string) => {
        const next = new Set(selectedGroups);
        next.has(id) ? next.delete(id) : next.add(id);
        setSelectedGroups(next);
    };

    const toggleFriend = (id: string) => {
        const next = new Set(selectedFriends);
        next.has(id) ? next.delete(id) : next.add(id);
        setSelectedFriends(next);
    };

    const totalSelected = selectedGroups.size + selectedFriends.size;

    const filteredFriends = mockFriends.filter((f) =>
        f.name.toLowerCase().includes(search.toLowerCase()),
    );

    const handleSendInvites = async () => {
        try {
            setSubmitting(true);

            const req = new CreateHangoutRequest();
            req.title = params.title;
            req.startTime = new Date(params.startTime);
            if (params.description) req.description = params.description;
            if (params.location) req.location = params.location;
            if (params.endTime) req.endTime = new Date(params.endTime);

            // If exactly one group is selected, set it as the groupId
            const groupIds = Array.from(selectedGroups);
            if (groupIds.length === 1) {
                req.groupId = groupIds[0];
            }

            // Collect selected friend IDs as invitees
            const friendIds = Array.from(selectedFriends);
            if (friendIds.length > 0) {
                req.inviteeUserIds = friendIds;
            }

            await api.hangoutsPOST(req);
            await refetchHangouts();

            // Navigate back to the main tabs
            router.replace('/(tabs)' as any);
        } catch (err: any) {
            Alert.alert('Error', err?.message ?? 'Failed to create hangout');
        } finally {
            setSubmitting(false);
        }
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
                    Invite People
                </Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Search */}
            <View
                style={{
                    paddingHorizontal: 24,
                    paddingTop: 16,
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
                        placeholder='Search friends...'
                        placeholderTextColor={colors.placeholder}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
            </View>

            <ScrollView style={{ flex: 1 }}>
                {/* Groups Section */}
                <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
                    <Text
                        style={[
                            shared.sectionLabel,
                            { textTransform: 'uppercase' },
                        ]}
                    >
                        GROUPS
                    </Text>
                    {groupsLoading ? (
                        <ActivityIndicator
                            color={colors.primary}
                            style={{ marginVertical: 16 }}
                        />
                    ) : groups.length === 0 ? (
                        <Text
                            style={{
                                color: colors.textSecondary,
                                fontSize: 14,
                                paddingVertical: 8,
                            }}
                        >
                            No groups yet
                        </Text>
                    ) : (
                        <View style={{ gap: 8 }}>
                            {groups.map((group) => {
                                const selected = selectedGroups.has(group.id);
                                return (
                                    <TouchableOpacity
                                        key={group.id}
                                        style={
                                            selected
                                                ? shared.selectableItemSelected
                                                : shared.selectableItem
                                        }
                                        onPress={() => toggleGroup(group.id)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={{ fontSize: 28 }}>
                                            {group.icon}
                                        </Text>
                                        <View style={{ flex: 1 }}>
                                            <Text
                                                style={[
                                                    s.itemName,
                                                    { color: colors.text },
                                                ]}
                                            >
                                                {group.name}
                                            </Text>
                                            <Text
                                                style={[
                                                    s.itemSub,
                                                    {
                                                        color: colors.textSecondary,
                                                    },
                                                ]}
                                            >
                                                {group.memberCount} members
                                            </Text>
                                        </View>
                                        {selected && (
                                            <View style={shared.checkCircle}>
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

                {/* Friends Section */}
                <View style={{ paddingHorizontal: 24, paddingBottom: 24 }}>
                    <Text
                        style={[
                            shared.sectionLabel,
                            { textTransform: 'uppercase' },
                        ]}
                    >
                        FRIENDS
                    </Text>
                    <View style={{ gap: 8 }}>
                        {filteredFriends.map((friend) => {
                            const selected = selectedFriends.has(friend.id);
                            return (
                                <TouchableOpacity
                                    key={friend.id}
                                    style={
                                        selected
                                            ? shared.selectableItemSelected
                                            : shared.selectableItem
                                    }
                                    onPress={() => toggleFriend(friend.id)}
                                    activeOpacity={0.7}
                                >
                                    <View style={shared.avatarLarge}>
                                        <Text style={{ fontSize: 24 }}>
                                            {friend.avatar}
                                        </Text>
                                    </View>
                                    <Text
                                        style={[
                                            s.itemName,
                                            { color: colors.text, flex: 1 },
                                        ]}
                                    >
                                        {friend.name}
                                    </Text>
                                    {selected && (
                                        <View style={shared.checkCircle}>
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
            </ScrollView>

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
                    </Text>
                )}
                <TouchableOpacity
                    style={[
                        shared.primaryBtnLarge,
                        (totalSelected === 0 || submitting) && { opacity: 0.5 },
                    ]}
                    disabled={totalSelected === 0 || submitting}
                    onPress={handleSendInvites}
                >
                    <Text style={shared.primaryBtnLargeText}>
                        {submitting ? 'Creating...' : 'Send Invites'}
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

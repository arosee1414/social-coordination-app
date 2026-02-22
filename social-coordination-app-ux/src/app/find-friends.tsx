import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { createSharedStyles } from '@/src/constants/shared-styles';
import { mockSuggestedFriends } from '@/src/data/mock-data';

export default function FindFriendsScreen() {
    const colors = useThemeColors();
    const shared = createSharedStyles(colors);
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [addedFriends, setAddedFriends] = useState<Set<string>>(new Set());

    const toggleAdd = (id: string) => {
        const next = new Set(addedFriends);
        next.has(id) ? next.delete(id) : next.add(id);
        setAddedFriends(next);
    };

    const filtered = mockSuggestedFriends.filter((f) =>
        f.name.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <SafeAreaView style={shared.screenContainer}>
            {/* Header */}
            <View style={shared.stackHeader}>
                <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                    <Ionicons name='arrow-back' size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[s.headerTitle, { color: colors.text }]}>Find Friends</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Search */}
            <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12 }}>
                <View style={{ position: 'relative' }}>
                    <Ionicons
                        name='search'
                        size={20}
                        color={colors.textTertiary}
                        style={{ position: 'absolute', left: 14, top: 14, zIndex: 1 }}
                    />
                    <TextInput
                        style={shared.searchInput}
                        placeholder='Search by name or email...'
                        placeholderTextColor={colors.placeholder}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
            </View>

            {/* Invite Link Card */}
            <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
                <View style={shared.infoCard}>
                    <Ionicons name='link-outline' size={22} color={colors.primary} />
                    <View style={{ flex: 1 }}>
                        <Text style={[s.inviteTitle, { color: colors.text }]}>Invite with Link</Text>
                        <Text style={[s.inviteText, { color: colors.textSecondary }]}>
                            Share a link for friends to join Hangout
                        </Text>
                    </View>
                    <TouchableOpacity style={[s.copyBtn, { backgroundColor: colors.indigoTint }]}>
                        <Ionicons name='copy-outline' size={18} color={colors.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Suggested Friends */}
            <ScrollView style={{ flex: 1 }}>
                <View style={{ paddingHorizontal: 24, paddingBottom: 24 }}>
                    <Text style={[shared.sectionLabel, { textTransform: 'uppercase' }]}>SUGGESTED FRIENDS</Text>
                    <View style={{ gap: 8 }}>
                        {filtered.map((friend) => {
                            const added = addedFriends.has(friend.id);
                            return (
                                <View key={friend.id} style={shared.listItem}>
                                    <View style={shared.avatarLarge}>
                                        <Text style={{ fontSize: 24 }}>{friend.avatar}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[s.friendName, { color: colors.text }]}>{friend.name}</Text>
                                        <Text style={[s.friendMutual, { color: colors.textTertiary }]}>
                                            {friend.mutualFriends} mutual friends
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        style={added ? [s.addedBtn, { backgroundColor: colors.statusGoingBg }] : [s.addBtn, { backgroundColor: colors.primary }]}
                                        onPress={() => toggleAdd(friend.id)}
                                    >
                                        {added ? (
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                <Ionicons name='checkmark' size={16} color={colors.statusGoingText} />
                                                <Text style={[s.addBtnText, { color: colors.statusGoingText }]}>Added</Text>
                                            </View>
                                        ) : (
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                <Ionicons name='person-add' size={16} color='#fff' />
                                                <Text style={[s.addBtnText, { color: '#fff' }]}>Add</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    backBtn: { padding: 8, marginLeft: -8 },
    headerTitle: { fontSize: 18, fontWeight: '600' },
    inviteTitle: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
    inviteText: { fontSize: 13 },
    copyBtn: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    friendName: { fontSize: 16, fontWeight: '500' },
    friendMutual: { fontSize: 13, marginTop: 2 },
    addBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
    addedBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
    addBtnText: { fontSize: 13, fontWeight: '600' },
});
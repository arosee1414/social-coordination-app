import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { createSharedStyles } from '@/src/constants/shared-styles';
import { mockFriends } from '@/src/data/mock-data';

export default function AddMembersScreen() {
    const colors = useThemeColors();
    const shared = createSharedStyles(colors);
    const router = useRouter();
    const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
    const [search, setSearch] = useState('');

    const toggleMember = (id: string) => {
        const next = new Set(selectedMembers);
        next.has(id) ? next.delete(id) : next.add(id);
        setSelectedMembers(next);
    };

    const filtered = mockFriends.filter((f) =>
        f.name.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <SafeAreaView style={shared.screenContainer}>
            {/* Header */}
            <View style={shared.stackHeader}>
                <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                    <Ionicons name='arrow-back' size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[s.headerTitle, { color: colors.text }]}>Add Members</Text>
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
                        placeholder='Search friends...'
                        placeholderTextColor={colors.placeholder}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
            </View>

            {/* Content */}
            <ScrollView style={{ flex: 1 }}>
                <View style={{ paddingHorizontal: 24, gap: 8, paddingBottom: 16 }}>
                    {filtered.map((friend) => {
                        const selected = selectedMembers.has(friend.id);
                        return (
                            <TouchableOpacity
                                key={friend.id}
                                style={selected ? shared.selectableItemSelected : shared.selectableItem}
                                onPress={() => toggleMember(friend.id)}
                                activeOpacity={0.7}
                            >
                                <View style={shared.avatarLarge}>
                                    <Text style={{ fontSize: 24 }}>{friend.avatar}</Text>
                                </View>
                                <Text style={[s.friendName, { color: colors.text, flex: 1 }]}>{friend.name}</Text>
                                {selected && (
                                    <View style={shared.checkCircle}>
                                        <Ionicons name='checkmark' size={16} color='#fff' />
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Bottom CTA */}
            <View style={shared.bottomCTA}>
                {selectedMembers.size > 0 && (
                    <Text style={[s.selectedCount, { color: colors.subtitle }]}>
                        <Text style={{ fontWeight: '600', color: colors.primary }}>{selectedMembers.size}</Text> members selected
                    </Text>
                )}
                <TouchableOpacity
                    style={[shared.primaryBtnLarge, selectedMembers.size === 0 && { opacity: 0.5 }]}
                    disabled={selectedMembers.size === 0}
                    onPress={() => router.push('/group-created')}
                >
                    <Text style={shared.primaryBtnLargeText}>Create Group</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    backBtn: { padding: 8, marginLeft: -8 },
    headerTitle: { fontSize: 18, fontWeight: '600' },
    friendName: { fontSize: 16, fontWeight: '500' },
    selectedCount: { textAlign: 'center', marginBottom: 12, fontSize: 14 },
});
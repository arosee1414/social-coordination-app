import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Image,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { createSharedStyles } from '@/src/constants/shared-styles';
import { useApiFriends } from '@/src/hooks/useApiFriends';

export default function AddMembersScreen() {
    const colors = useThemeColors();
    const shared = createSharedStyles(colors);
    const router = useRouter();
    const [selectedMembers, setSelectedMembers] = useState<Set<string>>(
        new Set(),
    );
    const [search, setSearch] = useState('');

    const { friends, loading: friendsLoading } = useApiFriends();

    const toggleMember = (id: string) => {
        const next = new Set(selectedMembers);
        next.has(id) ? next.delete(id) : next.add(id);
        setSelectedMembers(next);
    };

    const filtered = friends.filter((f) =>
        f.name.toLowerCase().includes(search.toLowerCase()),
    );

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
                    Add Members
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

            {/* Content */}
            <ScrollView style={{ flex: 1 }}>
                <View
                    style={{
                        paddingHorizontal: 24,
                        gap: 8,
                        paddingBottom: 16,
                    }}
                >
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
                                    backgroundColor: colors.surfaceTertiary,
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
                                Add friends first, then you can add them to
                                groups
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
                        filtered.length === 0 && (
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
                    {filtered.map((friend) => {
                        const selected = selectedMembers.has(friend.userId);
                        return (
                            <TouchableOpacity
                                key={friend.userId}
                                style={
                                    selected
                                        ? shared.selectableItemSelected
                                        : shared.selectableItem
                                }
                                onPress={() => toggleMember(friend.userId)}
                                activeOpacity={0.7}
                            >
                                {friend.avatar ? (
                                    <Image
                                        source={{ uri: friend.avatar }}
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
                                            color={colors.textTertiary}
                                        />
                                    </View>
                                )}
                                <Text
                                    style={[
                                        s.friendName,
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
            </ScrollView>

            {/* Bottom CTA */}
            <View style={shared.bottomCTA}>
                {selectedMembers.size > 0 && (
                    <Text style={[s.selectedCount, { color: colors.subtitle }]}>
                        <Text
                            style={{
                                fontWeight: '600',
                                color: colors.primary,
                            }}
                        >
                            {selectedMembers.size}
                        </Text>{' '}
                        members selected
                    </Text>
                )}
                <TouchableOpacity
                    style={[
                        shared.primaryBtnLarge,
                        selectedMembers.size === 0 && { opacity: 0.5 },
                    ]}
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

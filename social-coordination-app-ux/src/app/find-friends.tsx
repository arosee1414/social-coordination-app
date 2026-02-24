import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Alert,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useUser } from '@clerk/clerk-expo';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { createSharedStyles } from '@/src/constants/shared-styles';
import { mockFriends } from '@/src/data/mock-data';
import { useApiUserSearch } from '@/src/hooks/useApiUserSearch';
import { useApiUser } from '@/src/hooks/useApiUser';
import { CreateUserRequest } from '@/src/clients/generatedClient';

export default function FindFriendsScreen() {
    const colors = useThemeColors();
    const shared = createSharedStyles(colors);
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [copied, setCopied] = useState(false);
    const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
    const {
        results: apiResults,
        loading: searchLoading,
        searchUsers,
    } = useApiUserSearch();
    const { user: clerkUser } = useUser();
    const { createUser } = useApiUser();
    const hasSynced = useRef(false);

    // One-time sync: seed backend user record with Clerk profile data on sign-up
    useEffect(() => {
        if (!clerkUser || hasSynced.current) return;
        hasSynced.current = true;

        const req = new CreateUserRequest();
        req.email = clerkUser.primaryEmailAddress?.emailAddress ?? '';
        req.firstName = clerkUser.firstName ?? '';
        req.lastName = clerkUser.lastName ?? '';
        req.profileImageUrl = clerkUser.imageUrl ?? undefined;

        createUser(req).catch((err: any) => {
            console.warn('Failed to seed backend user:', err);
        });
    }, [clerkUser, createUser]);

    const inviteLink = 'hangout.app/join/abc123';

    const handleCopy = async () => {
        try {
            await Clipboard.setStringAsync(inviteLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for environments without clipboard
            Alert.alert('Invite Link', inviteLink);
        }
    };

    const handleInvite = (id: string) => {
        const next = new Set(invitedIds);
        next.add(id);
        setInvitedIds(next);
    };

    // Filter mock contacts by search
    const contacts = mockFriends.filter((f) =>
        f.name.toLowerCase().includes(search.toLowerCase()),
    );

    // Debounced API search on text change
    const handleSearchChange = (text: string) => {
        setSearch(text);
        if (text.length >= 2) {
            searchUsers(text);
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
                    Find Friends
                </Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Content */}
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
            >
                <View style={{ paddingHorizontal: 24, paddingTop: 20 }}>
                    <Text
                        style={[s.introText, { color: colors.textSecondary }]}
                    >
                        Connect with your friends to start planning hangouts
                        together
                    </Text>

                    {/* Invite link card */}
                    <View
                        style={[
                            s.inviteCard,
                            { backgroundColor: colors.gradientFrom },
                        ]}
                    >
                        <Text style={s.inviteCardTitle}>
                            Share Your Invite Link
                        </Text>
                        <Text style={s.inviteCardSubtitle}>
                            Send this link to friends to connect instantly
                        </Text>
                        <View style={s.inviteLinkRow}>
                            <Text
                                style={s.inviteLinkText}
                                numberOfLines={1}
                                ellipsizeMode='tail'
                            >
                                {inviteLink}
                            </Text>
                            <TouchableOpacity
                                style={s.copyBtn}
                                onPress={handleCopy}
                                activeOpacity={0.7}
                            >
                                {copied ? (
                                    <Ionicons
                                        name='checkmark'
                                        size={20}
                                        color='#fff'
                                    />
                                ) : (
                                    <Ionicons
                                        name='copy-outline'
                                        size={20}
                                        color='#fff'
                                    />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Search */}
                    <View style={s.searchWrapper}>
                        <Ionicons
                            name='search'
                            size={20}
                            color={colors.textTertiary}
                            style={s.searchIcon}
                        />
                        <TextInput
                            style={[
                                shared.searchInput,
                                { backgroundColor: colors.surfaceTertiary },
                            ]}
                            placeholder='Search contacts'
                            placeholderTextColor={colors.placeholder}
                            value={search}
                            onChangeText={handleSearchChange}
                        />
                    </View>

                    {/* Contacts list */}
                    {/* API Search Results */}
                    {apiResults.length > 0 && (
                        <>
                            <Text
                                style={[
                                    shared.sectionLabel,
                                    {
                                        textTransform: 'uppercase',
                                        marginTop: 8,
                                    },
                                ]}
                            >
                                SEARCH RESULTS
                            </Text>
                            <View style={{ gap: 4, marginBottom: 16 }}>
                                {apiResults.map((user) => {
                                    const invited = invitedIds.has(
                                        user.id ?? '',
                                    );
                                    const displayName =
                                        `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() ||
                                        user.email;
                                    return (
                                        <View
                                            key={user.id}
                                            style={s.contactRow}
                                        >
                                            <View style={shared.avatarLarge}>
                                                <Text style={{ fontSize: 24 }}>
                                                    👤
                                                </Text>
                                            </View>
                                            <View
                                                style={{ flex: 1, minWidth: 0 }}
                                            >
                                                <Text
                                                    style={[
                                                        s.contactName,
                                                        { color: colors.text },
                                                    ]}
                                                >
                                                    {displayName}
                                                </Text>
                                                <Text
                                                    style={[
                                                        s.contactPhone,
                                                        {
                                                            color: colors.textTertiary,
                                                        },
                                                    ]}
                                                >
                                                    {user.email}
                                                </Text>
                                            </View>
                                            {invited ? (
                                                <View
                                                    style={[
                                                        s.invitedBadge,
                                                        {
                                                            backgroundColor:
                                                                colors.statusGoingBg,
                                                        },
                                                    ]}
                                                >
                                                    <Ionicons
                                                        name='checkmark'
                                                        size={16}
                                                        color={
                                                            colors.statusGoingText
                                                        }
                                                    />
                                                    <Text
                                                        style={[
                                                            s.invitedBadgeText,
                                                            {
                                                                color: colors.statusGoingText,
                                                            },
                                                        ]}
                                                    >
                                                        Invited
                                                    </Text>
                                                </View>
                                            ) : (
                                                <TouchableOpacity
                                                    style={[
                                                        s.inviteBtn,
                                                        {
                                                            backgroundColor:
                                                                colors.primary,
                                                        },
                                                    ]}
                                                    onPress={() =>
                                                        handleInvite(
                                                            user.id ?? '',
                                                        )
                                                    }
                                                    activeOpacity={0.8}
                                                >
                                                    <Text
                                                        style={s.inviteBtnText}
                                                    >
                                                        Invite
                                                    </Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    );
                                })}
                            </View>
                        </>
                    )}

                    <Text
                        style={[
                            shared.sectionLabel,
                            { textTransform: 'uppercase', marginTop: 8 },
                        ]}
                    >
                        FROM YOUR CONTACTS
                    </Text>
                    <View style={{ gap: 4 }}>
                        {contacts.map((contact) => {
                            const invited = invitedIds.has(contact.id);
                            return (
                                <View key={contact.id} style={s.contactRow}>
                                    <View style={shared.avatarLarge}>
                                        <Text style={{ fontSize: 24 }}>
                                            {contact.avatar}
                                        </Text>
                                    </View>
                                    <View style={{ flex: 1, minWidth: 0 }}>
                                        <Text
                                            style={[
                                                s.contactName,
                                                { color: colors.text },
                                            ]}
                                        >
                                            {contact.name}
                                        </Text>
                                        {contact.phone && (
                                            <Text
                                                style={[
                                                    s.contactPhone,
                                                    {
                                                        color: colors.textTertiary,
                                                    },
                                                ]}
                                            >
                                                {contact.phone}
                                            </Text>
                                        )}
                                    </View>
                                    {invited ? (
                                        <View
                                            style={[
                                                s.invitedBadge,
                                                {
                                                    backgroundColor:
                                                        colors.statusGoingBg,
                                                },
                                            ]}
                                        >
                                            <Ionicons
                                                name='checkmark'
                                                size={16}
                                                color={colors.statusGoingText}
                                            />
                                            <Text
                                                style={[
                                                    s.invitedBadgeText,
                                                    {
                                                        color: colors.statusGoingText,
                                                    },
                                                ]}
                                            >
                                                Invited
                                            </Text>
                                        </View>
                                    ) : (
                                        <TouchableOpacity
                                            style={[
                                                s.inviteBtn,
                                                {
                                                    backgroundColor:
                                                        colors.primary,
                                                },
                                            ]}
                                            onPress={() =>
                                                handleInvite(contact.id)
                                            }
                                            activeOpacity={0.8}
                                        >
                                            <Text style={s.inviteBtnText}>
                                                Invite
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                </View>
            </ScrollView>

            {/* Bottom CTA */}
            <View style={shared.bottomCTA}>
                <TouchableOpacity
                    style={[
                        s.skipBtn,
                        { backgroundColor: colors.surfaceTertiary },
                    ]}
                    onPress={() => router.replace('/(tabs)')}
                    activeOpacity={0.7}
                >
                    <Text
                        style={[s.skipBtnText, { color: colors.textSecondary }]}
                    >
                        Skip for Now
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    backBtn: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    introText: {
        fontSize: 16,
        lineHeight: 22,
        marginBottom: 20,
    },
    // Invite card
    inviteCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    inviteCardTitle: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '600',
        marginBottom: 6,
    },
    inviteCardSubtitle: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        marginBottom: 16,
    },
    inviteLinkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    inviteLinkText: {
        flex: 1,
        color: '#fff',
        fontSize: 14,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    copyBtn: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Search
    searchWrapper: {
        position: 'relative',
        marginBottom: 20,
    },
    searchIcon: {
        position: 'absolute',
        left: 14,
        top: 14,
        zIndex: 1,
    },
    // Contact row
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    contactName: {
        fontSize: 16,
        fontWeight: '600',
    },
    contactPhone: {
        fontSize: 13,
        marginTop: 2,
    },
    inviteBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    inviteBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    invitedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    invitedBadgeText: {
        fontSize: 14,
        fontWeight: '600',
    },
    // Skip button
    skipBtn: {
        width: '100%',
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    skipBtnText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

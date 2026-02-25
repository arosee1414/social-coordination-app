import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { createSharedStyles } from '@/src/constants/shared-styles';
import { emojiOptions } from '@/src/data/mock-data';
import { useApiClient } from '@/src/hooks/useApiClient';
import { CreateGroupRequest } from '@/src/clients/generatedClient';
import { pendingGroupMembers } from '@/src/utils/pendingGroupMembers';

export default function CreateGroupScreen() {
    const colors = useThemeColors();
    const shared = createSharedStyles(colors);
    const router = useRouter();
    const api = useApiClient();

    const [name, setName] = useState('');
    const [selectedEmoji, setSelectedEmoji] = useState('💜');
    const [submitting, setSubmitting] = useState(false);
    const [memberIds, setMemberIds] = useState<string[]>([]);

    // Re-read shared state every time this screen gains focus
    // (e.g. returning from add-members via router.back())
    useFocusEffect(
        useCallback(() => {
            setMemberIds([...pendingGroupMembers.ids]);
        }, []),
    );

    // Clear shared state when leaving the create flow entirely
    const handleBack = () => {
        pendingGroupMembers.ids = [];
        router.back();
    };

    const handleCreate = async () => {
        try {
            setSubmitting(true);
            const req = new CreateGroupRequest();
            req.name = name;
            req.emoji = selectedEmoji;
            if (memberIds.length > 0) {
                req.memberUserIds = memberIds;
            }
            await api.groupsPOST(req);
            pendingGroupMembers.ids = [];
            router.back();
        } catch (err: any) {
            Alert.alert('Error', err?.message ?? 'Failed to create group');
        } finally {
            setSubmitting(false);
        }
    };

    const handleManageMembers = () => {
        // Write current selections to shared state before navigating
        pendingGroupMembers.ids = [...memberIds];
        router.push('/add-members' as any);
    };

    return (
        <SafeAreaView style={shared.screenContainer}>
            {/* Header */}
            <View style={shared.stackHeader}>
                <TouchableOpacity onPress={handleBack} style={s.backBtn}>
                    <Ionicons name='arrow-back' size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[s.headerTitle, { color: colors.text }]}>
                    Create Group
                </Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Content */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{
                        paddingHorizontal: 24,
                        paddingVertical: 24,
                    }}
                    keyboardShouldPersistTaps='handled'
                >
                    <View style={{ gap: 24 }}>
                        {/* Info */}
                        <View style={shared.infoCard}>
                            <Text
                                style={[
                                    s.infoText,
                                    { color: colors.textSecondary },
                                ]}
                            >
                                Groups are saved friend lists that make inviting
                                people to hangouts faster.
                            </Text>
                        </View>

                        {/* Icon Selection */}
                        <View>
                            <Text style={shared.formLabel}>Choose an Icon</Text>
                            <View style={s.emojiGrid}>
                                {emojiOptions.map((emoji) => (
                                    <TouchableOpacity
                                        key={emoji}
                                        style={[
                                            s.emojiBtn,
                                            {
                                                borderColor:
                                                    selectedEmoji === emoji
                                                        ? colors.primary
                                                        : colors.cardBorderHeavy,
                                                backgroundColor:
                                                    selectedEmoji === emoji
                                                        ? colors.indigoTint5
                                                        : 'transparent',
                                            },
                                            selectedEmoji === emoji && {
                                                transform: [{ scale: 1.1 }],
                                            },
                                        ]}
                                        onPress={() => setSelectedEmoji(emoji)}
                                    >
                                        <Text style={{ fontSize: 24 }}>
                                            {emoji}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Group Name */}
                        <View>
                            <Text style={shared.formLabel}>Group Name *</Text>
                            <TextInput
                                style={[
                                    shared.formInput,
                                    { color: colors.inputText },
                                ]}
                                placeholder='e.g., Close Friends, Basketball Crew'
                                placeholderTextColor={colors.placeholder}
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        {/* Manage Members Button */}
                        <TouchableOpacity
                            style={[
                                s.manageMembersBtn,
                                {
                                    backgroundColor: colors.indigoTint5,
                                    borderColor: colors.indigoTint,
                                },
                            ]}
                            onPress={handleManageMembers}
                        >
                            <Ionicons
                                name='people-outline'
                                size={20}
                                color={colors.primary}
                            />
                            <Text
                                style={[
                                    s.manageMembersBtnText,
                                    { color: colors.primary },
                                ]}
                            >
                                {memberIds.length > 0
                                    ? `Manage Members (${memberIds.length})`
                                    : 'Add Members'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                {/* Bottom CTA */}
                <View style={shared.bottomCTA}>
                    <TouchableOpacity
                        style={[
                            shared.primaryBtnLarge,
                            (!name || submitting) && { opacity: 0.5 },
                        ]}
                        onPress={handleCreate}
                        disabled={!name || submitting}
                    >
                        <Text style={shared.primaryBtnLargeText}>
                            {submitting ? 'Creating...' : 'Create Group'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    backBtn: { padding: 8, marginLeft: -8 },
    headerTitle: { fontSize: 18, fontWeight: '600' },
    infoText: { fontSize: 14, lineHeight: 20 },
    emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    emojiBtn: {
        width: 56,
        height: 56,
        borderRadius: 12,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    manageMembersBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 56,
        borderWidth: 2,
        borderRadius: 12,
    },
    manageMembersBtnText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

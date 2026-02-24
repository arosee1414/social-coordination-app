import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Modal,
    Pressable,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { createSharedStyles } from '@/src/constants/shared-styles';
import { emojiOptions } from '@/src/data/mock-data';
import { useApiClient } from '@/src/hooks/useApiClient';
import { useApiUser } from '@/src/hooks/useApiUser';
import { UpdateGroupRequest } from '@/src/clients/generatedClient';

export default function EditGroupScreen() {
    const colors = useThemeColors();
    const shared = createSharedStyles(colors);
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const groupId = typeof id === 'string' ? id : (id?.[0] ?? '');
    const api = useApiClient();
    const { user } = useApiUser();

    // Loading states
    const [initialLoading, setInitialLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Form fields
    const [name, setName] = useState('');
    const [selectedEmoji, setSelectedEmoji] = useState('💜');

    // Fetch existing group data
    const fetchGroup = useCallback(async () => {
        if (!groupId) return;
        try {
            setInitialLoading(true);
            const result = await api.groupsGET(groupId);

            // Check if the current user is the creator
            if (user?.id && result.createdByUserId !== user.id) {
                Alert.alert(
                    'Unauthorized',
                    'You can only edit groups you created.',
                );
                router.back();
                return;
            }

            setName(result.name ?? '');
            setSelectedEmoji(result.emoji ?? '💜');
        } catch (err: any) {
            Alert.alert('Error', err?.message ?? 'Failed to load group');
            router.back();
        } finally {
            setInitialLoading(false);
        }
    }, [api, groupId, user?.id]);

    useEffect(() => {
        if (user?.id) {
            fetchGroup();
        }
    }, [fetchGroup, user?.id]);

    const canSave = name.trim().length > 0;

    const handleSaveChanges = async () => {
        if (!canSave) return;
        try {
            setSubmitting(true);
            const req = new UpdateGroupRequest();
            req.name = name;
            req.emoji = selectedEmoji;
            await api.groupsPUT(groupId, req);
            router.back();
        } catch (err: any) {
            Alert.alert('Error', err?.message ?? 'Failed to save changes');
        } finally {
            setSubmitting(false);
        }
    };

    const handleManageMembers = () => {
        router.push(`/manage-group-members/${groupId}` as any);
    };

    const handleDeleteGroup = async () => {
        try {
            setDeleting(true);
            setShowDeleteConfirm(false);
            await api.groupsDELETE(groupId);
            router.replace('/(tabs)/groups' as any);
        } catch (err: any) {
            Alert.alert('Error', err?.message ?? 'Failed to delete group');
        } finally {
            setDeleting(false);
        }
    };

    if (initialLoading) {
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
                        Edit Group
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
                    Edit Group
                </Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Content */}
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{
                        paddingHorizontal: 24,
                        paddingVertical: 24,
                    }}
                    keyboardShouldPersistTaps='handled'
                >
                    <View style={{ gap: 24 }}>
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
                                Manage Members
                            </Text>
                        </TouchableOpacity>

                        {/* Delete Group */}
                        <View
                            style={[
                                s.deleteSection,
                                { borderTopColor: colors.cardBorder },
                            ]}
                        >
                            <TouchableOpacity
                                style={[
                                    s.deleteBtn,
                                    {
                                        backgroundColor:
                                            colors.statusNotGoingBg,
                                    },
                                ]}
                                onPress={() => setShowDeleteConfirm(true)}
                                disabled={deleting}
                            >
                                <Ionicons
                                    name='trash-outline'
                                    size={20}
                                    color={colors.error}
                                />
                                <Text
                                    style={[
                                        s.deleteBtnText,
                                        { color: colors.error },
                                    ]}
                                >
                                    {deleting ? 'Deleting...' : 'Delete Group'}
                                </Text>
                            </TouchableOpacity>
                            <Text
                                style={[
                                    s.deleteHintText,
                                    { color: colors.textTertiary },
                                ]}
                            >
                                This will permanently delete this saved friend
                                list
                            </Text>
                        </View>
                    </View>
                </ScrollView>

                {/* Bottom CTA */}
                <View style={shared.bottomCTA}>
                    <TouchableOpacity
                        style={[
                            shared.primaryBtnLarge,
                            (!canSave || submitting) && { opacity: 0.5 },
                        ]}
                        onPress={handleSaveChanges}
                        disabled={!canSave || submitting}
                    >
                        <Text style={shared.primaryBtnLargeText}>
                            {submitting ? 'Saving...' : 'Save Changes'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            {/* Delete Confirmation Modal */}
            <Modal visible={showDeleteConfirm} transparent animationType='fade'>
                <Pressable
                    style={s.modalOverlay}
                    onPress={() => setShowDeleteConfirm(false)}
                >
                    <Pressable
                        style={[
                            s.deleteModalContent,
                            { backgroundColor: colors.background },
                        ]}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <Text
                            style={[s.deleteModalTitle, { color: colors.text }]}
                        >
                            Delete this group?
                        </Text>
                        <Text
                            style={[
                                s.deleteModalMessage,
                                { color: colors.textSecondary },
                            ]}
                        >
                            This will permanently delete the group. This is just
                            a saved friend list, so it won&apos;t affect any
                            existing hangouts. This action cannot be undone.
                        </Text>
                        <View style={{ gap: 12 }}>
                            <TouchableOpacity
                                style={[
                                    s.deleteConfirmBtn,
                                    { backgroundColor: colors.error },
                                ]}
                                onPress={handleDeleteGroup}
                            >
                                <Text style={s.deleteConfirmBtnText}>
                                    Yes, Delete Group
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    s.deleteCancelBtn,
                                    { backgroundColor: colors.surfaceTertiary },
                                ]}
                                onPress={() => setShowDeleteConfirm(false)}
                            >
                                <Text
                                    style={[
                                        s.deleteCancelBtnText,
                                        { color: colors.textSecondary },
                                    ]}
                                >
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    backBtn: { padding: 8, marginLeft: -8 },
    headerTitle: { fontSize: 18, fontWeight: '600' },
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
    deleteSection: {
        paddingTop: 24,
        borderTopWidth: 1,
    },
    deleteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 56,
        borderRadius: 12,
    },
    deleteBtnText: {
        fontSize: 16,
        fontWeight: '600',
    },
    deleteHintText: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 8,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    deleteModalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 36,
    },
    deleteModalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    deleteModalMessage: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 24,
    },
    deleteConfirmBtn: {
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteConfirmBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    deleteCancelBtn: {
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteCancelBtnText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

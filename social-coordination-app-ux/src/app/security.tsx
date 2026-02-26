import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { createSharedStyles } from '@/src/constants/shared-styles';

export default function SecurityScreen() {
    const colors = useThemeColors();
    const shared = createSharedStyles(colors);
    const router = useRouter();
    const { user } = useUser();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChangePassword = async () => {
        setErrorMessage(null);

        if (!currentPassword.trim()) {
            setErrorMessage('Please enter your current password.');
            return;
        }
        if (!newPassword.trim()) {
            setErrorMessage('Please enter a new password.');
            return;
        }
        if (newPassword.length < 8) {
            setErrorMessage('New password must be at least 8 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setErrorMessage('New passwords do not match.');
            return;
        }

        setSaving(true);
        try {
            await user?.updatePassword({
                currentPassword,
                newPassword,
            });
            Alert.alert(
                'Password Changed',
                'Your password has been updated successfully.',
                [{ text: 'OK', onPress: () => router.back() }],
            );
        } catch (err: any) {
            const message =
                err?.errors?.[0]?.longMessage ??
                err?.message ??
                'Failed to change password. Please try again.';
            setErrorMessage(message);
        } finally {
            setSaving(false);
        }
    };

    const canSubmit =
        currentPassword.trim() &&
        newPassword.trim() &&
        confirmPassword.trim() &&
        !saving;

    return (
        <SafeAreaView
            style={shared.screenContainer}
            edges={['top', 'left', 'right']}
        >
            {/* Header */}
            <View style={shared.stackHeader}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                    <Ionicons
                        name='chevron-back'
                        size={28}
                        color={colors.text}
                    />
                </TouchableOpacity>
                <Text style={[s.headerTitle, { color: colors.text }]}>
                    Security
                </Text>
                <View style={{ width: 28 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        style={{ flex: 1 }}
                        contentContainerStyle={s.content}
                        keyboardShouldPersistTaps='handled'
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Section label */}
                        <Text
                            style={[
                                shared.sectionLabel,
                                { textTransform: 'uppercase' },
                            ]}
                        >
                            Change Password
                        </Text>

                        {/* Form card */}
                        <View
                            style={[
                                s.formCard,
                                {
                                    backgroundColor: colors.card,
                                    borderColor: colors.cardBorder,
                                },
                            ]}
                        >
                            {/* Current Password */}
                            <View style={s.fieldContainer}>
                                <Text
                                    style={[
                                        s.fieldLabel,
                                        { color: colors.textSecondary },
                                    ]}
                                >
                                    Current Password
                                </Text>
                                <View style={s.inputWrapper}>
                                    <TextInput
                                        style={[
                                            s.input,
                                            {
                                                borderColor:
                                                    colors.cardBorderHeavy,
                                                backgroundColor:
                                                    colors.inputBackground,
                                                color: colors.inputText,
                                            },
                                        ]}
                                        placeholder='Enter current password'
                                        placeholderTextColor={
                                            colors.placeholder
                                        }
                                        secureTextEntry={!showCurrentPassword}
                                        value={currentPassword}
                                        onChangeText={setCurrentPassword}
                                        autoCapitalize='none'
                                    />
                                    <TouchableOpacity
                                        style={s.eyeIcon}
                                        onPress={() =>
                                            setShowCurrentPassword(
                                                !showCurrentPassword,
                                            )
                                        }
                                        hitSlop={{
                                            top: 8,
                                            bottom: 8,
                                            left: 8,
                                            right: 8,
                                        }}
                                    >
                                        <Ionicons
                                            name={
                                                showCurrentPassword
                                                    ? 'eye-off-outline'
                                                    : 'eye-outline'
                                            }
                                            size={20}
                                            color={colors.textTertiary}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Divider */}
                            <View
                                style={[
                                    s.divider,
                                    {
                                        backgroundColor: colors.cardBorder,
                                    },
                                ]}
                            />

                            {/* New Password */}
                            <View style={s.fieldContainer}>
                                <Text
                                    style={[
                                        s.fieldLabel,
                                        { color: colors.textSecondary },
                                    ]}
                                >
                                    New Password
                                </Text>
                                <View style={s.inputWrapper}>
                                    <TextInput
                                        style={[
                                            s.input,
                                            {
                                                borderColor:
                                                    colors.cardBorderHeavy,
                                                backgroundColor:
                                                    colors.inputBackground,
                                                color: colors.inputText,
                                            },
                                        ]}
                                        placeholder='Enter new password'
                                        placeholderTextColor={
                                            colors.placeholder
                                        }
                                        secureTextEntry={!showNewPassword}
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                        autoCapitalize='none'
                                    />
                                    <TouchableOpacity
                                        style={s.eyeIcon}
                                        onPress={() =>
                                            setShowNewPassword(!showNewPassword)
                                        }
                                        hitSlop={{
                                            top: 8,
                                            bottom: 8,
                                            left: 8,
                                            right: 8,
                                        }}
                                    >
                                        <Ionicons
                                            name={
                                                showNewPassword
                                                    ? 'eye-off-outline'
                                                    : 'eye-outline'
                                            }
                                            size={20}
                                            color={colors.textTertiary}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Divider */}
                            <View
                                style={[
                                    s.divider,
                                    {
                                        backgroundColor: colors.cardBorder,
                                    },
                                ]}
                            />

                            {/* Confirm New Password */}
                            <View style={s.fieldContainer}>
                                <Text
                                    style={[
                                        s.fieldLabel,
                                        { color: colors.textSecondary },
                                    ]}
                                >
                                    Confirm New Password
                                </Text>
                                <View style={s.inputWrapper}>
                                    <TextInput
                                        style={[
                                            s.input,
                                            {
                                                borderColor:
                                                    colors.cardBorderHeavy,
                                                backgroundColor:
                                                    colors.inputBackground,
                                                color: colors.inputText,
                                            },
                                        ]}
                                        placeholder='Re-enter new password'
                                        placeholderTextColor={
                                            colors.placeholder
                                        }
                                        secureTextEntry={!showConfirmPassword}
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        autoCapitalize='none'
                                    />
                                    <TouchableOpacity
                                        style={s.eyeIcon}
                                        onPress={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword,
                                            )
                                        }
                                        hitSlop={{
                                            top: 8,
                                            bottom: 8,
                                            left: 8,
                                            right: 8,
                                        }}
                                    >
                                        <Ionicons
                                            name={
                                                showConfirmPassword
                                                    ? 'eye-off-outline'
                                                    : 'eye-outline'
                                            }
                                            size={20}
                                            color={colors.textTertiary}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        {/* Error message */}
                        {errorMessage && (
                            <Text style={[shared.errorText, { marginTop: 16 }]}>
                                {errorMessage}
                            </Text>
                        )}

                        {/* Password hint */}
                        <View
                            style={[
                                s.hintContainer,
                                { backgroundColor: colors.surfaceTertiary },
                            ]}
                        >
                            <Ionicons
                                name='information-circle-outline'
                                size={18}
                                color={colors.textTertiary}
                            />
                            <Text
                                style={[
                                    s.hintText,
                                    { color: colors.textTertiary },
                                ]}
                            >
                                Password must be at least 8 characters long.
                            </Text>
                        </View>

                        {/* Submit button */}
                        <TouchableOpacity
                            style={[
                                shared.primaryBtnLarge,
                                !canSubmit && { opacity: 0.5 },
                                { marginTop: 24 },
                            ]}
                            onPress={handleChangePassword}
                            activeOpacity={0.8}
                            disabled={!canSubmit}
                        >
                            {saving ? (
                                <ActivityIndicator color='#fff' />
                            ) : (
                                <Text style={shared.primaryBtnLargeText}>
                                    Update Password
                                </Text>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    content: {
        padding: 24,
        paddingBottom: 40,
    },
    formCard: {
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
    },
    fieldContainer: {
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    fieldLabel: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
    },
    inputWrapper: {
        position: 'relative',
    },
    input: {
        width: '100%',
        height: 48,
        borderWidth: 2,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingRight: 48,
        fontSize: 16,
    },
    eyeIcon: {
        position: 'absolute',
        right: 14,
        top: 14,
    },
    divider: {
        height: 1,
        marginHorizontal: 16,
    },
    hintContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 16,
        padding: 12,
        borderRadius: 10,
    },
    hintText: {
        fontSize: 13,
        lineHeight: 18,
        flex: 1,
    },
});

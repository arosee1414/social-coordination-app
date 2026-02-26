import { useState, useCallback } from 'react';
import React from 'react';
import {
    Text,
    TextInput,
    View,
    TouchableOpacity,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
} from 'react-native';
import { isClerkAPIResponseError, useSignUp, useSSO } from '@clerk/clerk-expo';
import { ClerkAPIError } from '@clerk/types';
import { useRouter } from 'expo-router';
import { useHeaderHeight } from '@react-navigation/elements';
import { Ionicons } from '@expo/vector-icons';
import GoogleLogo from '@/src/components/GoogleLogo';
import Dialog from 'react-native-dialog';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { createSharedStyles } from '@/src/constants/shared-styles';

enum Strategy {
    Google = 'oauth_google',
}

export default function SignUpPage() {
    const { isLoaded, signUp, setActive } = useSignUp();
    const { startSSOFlow } = useSSO();
    const router = useRouter();
    const colors = useThemeColors();
    const shared = createSharedStyles(colors);
    const headerHeight = useHeaderHeight();

    const [emailAddress, setEmailAddress] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [pendingVerification, setPendingVerification] = useState(false);
    const [code, setCode] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [verificationError, setVerificationError] = useState<string | null>(
        null,
    );
    const [isVerifying, setIsVerifying] = useState(false);

    const onSelectAuth = async (strategy: Strategy) => {
        try {
            const result = await startSSOFlow({ strategy });
            const {
                createdSessionId,
                setActive: setActiveSession,
                signIn,
                signUp: ssoSignUp,
            } = result;

            if (createdSessionId) {
                await setActiveSession!({ session: createdSessionId });
                router.replace('/find-friends');
            } else if (
                (ssoSignUp as any)?.status === 'complete' &&
                (ssoSignUp as any)?.createdSessionId
            ) {
                await setActiveSession!({
                    session: (ssoSignUp as any).createdSessionId,
                });
                router.replace('/find-friends');
            } else if (
                (signIn as any)?.status === 'complete' &&
                (signIn as any)?.createdSessionId
            ) {
                await setActiveSession!({
                    session: (signIn as any).createdSessionId,
                });
                router.replace('/(tabs)');
            }
        } catch (err) {
            console.error('SSO error:', err);
        }
    };

    const onSignUpPress = async () => {
        setErrorMessage(null);
        if (!emailAddress.trim()) {
            setErrorMessage('Please enter your email address');
            return;
        }
        if (!password) {
            setErrorMessage('Please enter a password');
            return;
        }
        if (password.length < 8) {
            setErrorMessage('Password must be at least 8 characters');
            return;
        }
        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match');
            return;
        }
        if (!isLoaded) return;

        try {
            await signUp.create({ emailAddress, password });
            await signUp.prepareEmailAddressVerification({
                strategy: 'email_code',
            });
            setVerificationError(null);
            setCode('');
            setPendingVerification(true);
        } catch (error) {
            if (isClerkAPIResponseError(error)) {
                setErrorMessage(
                    error.errors[0]?.longMessage ??
                        error.errors[0]?.message ??
                        'Failed to sign up. Please try again.',
                );
            } else {
                console.error(JSON.stringify(error, null, 2));
                setErrorMessage(
                    'An unexpected error occurred. Please try again.',
                );
            }
        }
    };

    const onVerifyPress = useCallback(async () => {
        if (!isLoaded || isVerifying) return;
        setVerificationError(null);
        setIsVerifying(true);

        try {
            const signUpAttempt = await signUp.attemptEmailAddressVerification({
                code,
            });

            if (signUpAttempt.status === 'complete') {
                setPendingVerification(false);
                await setActive({ session: signUpAttempt.createdSessionId });
                router.replace('/find-friends');
            } else {
                console.error(JSON.stringify(signUpAttempt, null, 2));
                setVerificationError(
                    'Verification could not be completed. Please try again.',
                );
            }
        } catch (error) {
            if (isClerkAPIResponseError(error)) {
                const clerkError = error.errors[0];
                setVerificationError(
                    clerkError?.longMessage ??
                        clerkError?.message ??
                        'Invalid verification code. Please try again.',
                );
            } else {
                console.error(JSON.stringify(error, null, 2));
                setVerificationError(
                    'An unexpected error occurred. Please try again.',
                );
            }
        } finally {
            setIsVerifying(false);
        }
    }, [isLoaded, isVerifying, signUp, code, setActive, router]);

    const onCancelVerification = useCallback(() => {
        setPendingVerification(false);
        setVerificationError(null);
        setCode('');
    }, []);

    return (
        <View
            style={[
                shared.screenContainer,
                { backgroundColor: colors.background },
            ]}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
                keyboardVerticalOffset={headerHeight}
            >
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={[s.scrollContent, { flexGrow: 1 }]}
                    keyboardShouldPersistTaps='handled'
                    showsVerticalScrollIndicator={false}
                >
                    <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }}>
                        <Dialog.Container visible={pendingVerification}>
                            <Dialog.Title>Verify Your Email</Dialog.Title>
                            <Dialog.Description>
                                A verification code has been sent to{' '}
                                {emailAddress}. Enter it below.
                            </Dialog.Description>
                            <Dialog.CodeInput
                                codeLength={6}
                                onCodeChange={setCode}
                            />
                            {verificationError && (
                                <Dialog.Description
                                    style={{ color: '#dc2626' }}
                                >
                                    {verificationError}
                                </Dialog.Description>
                            )}
                            <Dialog.Button
                                onPress={onCancelVerification}
                                label='Cancel'
                            />
                            <Dialog.Button
                                onPress={onVerifyPress}
                                label={isVerifying ? 'Verifying...' : 'Verify'}
                                disabled={isVerifying || code.length < 6}
                                bold
                            />
                        </Dialog.Container>

                        {/* Title section */}
                        <View style={s.titleSection}>
                            <Text style={[s.title, { color: colors.text }]}>
                                Create Account
                            </Text>
                            <Text
                                style={[s.subtitle, { color: colors.subtitle }]}
                            >
                                Sign up to start planning hangouts with friends
                            </Text>
                        </View>

                        {/* Social login buttons */}
                        <View style={s.socialSection}>
                            <TouchableOpacity
                                style={[
                                    s.socialBtn,
                                    {
                                        borderColor: colors.cardBorderHeavy,
                                        backgroundColor:
                                            colors.socialButtonBackground,
                                    },
                                ]}
                                onPress={() => onSelectAuth(Strategy.Google)}
                                activeOpacity={0.7}
                            >
                                <GoogleLogo size={20} />
                                <Text
                                    style={[
                                        s.socialBtnText,
                                        { color: colors.socialButtonText },
                                    ]}
                                >
                                    Continue with Google
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Divider */}
                        <View style={shared.separatorView}>
                            <View style={shared.separator} />
                            <Text style={shared.separatorText}>or</Text>
                            <View style={shared.separator} />
                        </View>

                        {/* Email form */}
                        <View style={s.formSection}>
                            <View style={s.inputWrapper}>
                                <Ionicons
                                    name='mail-outline'
                                    size={20}
                                    color={colors.placeholder}
                                    style={s.inputIcon}
                                />
                                <TextInput
                                    style={[
                                        s.input,
                                        {
                                            borderColor: colors.cardBorderHeavy,
                                            backgroundColor:
                                                colors.inputBackground,
                                            color: colors.inputText,
                                        },
                                    ]}
                                    autoCapitalize='none'
                                    keyboardType='email-address'
                                    placeholder='Email address'
                                    placeholderTextColor={colors.placeholder}
                                    value={emailAddress}
                                    onChangeText={setEmailAddress}
                                />
                            </View>

                            <View style={s.inputWrapper}>
                                <Ionicons
                                    name='lock-closed-outline'
                                    size={20}
                                    color={colors.placeholder}
                                    style={s.inputIcon}
                                />
                                <TextInput
                                    style={[
                                        s.input,
                                        {
                                            borderColor: colors.cardBorderHeavy,
                                            backgroundColor:
                                                colors.inputBackground,
                                            color: colors.inputText,
                                        },
                                    ]}
                                    placeholder='Password'
                                    placeholderTextColor={colors.placeholder}
                                    secureTextEntry
                                    value={password}
                                    onChangeText={setPassword}
                                />
                            </View>

                            <View style={s.inputWrapper}>
                                <Ionicons
                                    name='lock-closed-outline'
                                    size={20}
                                    color={colors.placeholder}
                                    style={s.inputIcon}
                                />
                                <TextInput
                                    style={[
                                        s.input,
                                        {
                                            borderColor: colors.cardBorderHeavy,
                                            backgroundColor:
                                                colors.inputBackground,
                                            color: colors.inputText,
                                        },
                                    ]}
                                    placeholder='Confirm password'
                                    placeholderTextColor={colors.placeholder}
                                    secureTextEntry
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                />
                            </View>

                            <TouchableOpacity
                                style={[
                                    s.signUpBtn,
                                    { backgroundColor: colors.primary },
                                ]}
                                onPress={onSignUpPress}
                                activeOpacity={0.8}
                            >
                                <Text style={s.signUpBtnText}>Sign Up</Text>
                            </TouchableOpacity>
                        </View>

                        {errorMessage && (
                            <Text style={[shared.errorText, { marginTop: 12 }]}>
                                {errorMessage}
                            </Text>
                        )}
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Toggle to sign in - fixed at bottom */}
            <View style={s.toggleSection}>
                <TouchableOpacity onPress={() => router.replace('/sign-in')}>
                    <Text
                        style={[s.toggleText, { color: colors.textSecondary }]}
                    >
                        Already have an account?{' '}
                        <Text style={[s.toggleLink, { color: colors.primary }]}>
                            Sign In
                        </Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    titleSection: {
        paddingTop: 32,
        marginBottom: 32,
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        lineHeight: 22,
    },
    socialSection: {
        gap: 12,
    },
    socialBtn: {
        width: '100%',
        height: 52,
        borderWidth: 2,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    socialBtnText: {
        fontSize: 16,
        fontWeight: '600',
    },
    formSection: {
        gap: 16,
    },
    inputWrapper: {
        position: 'relative',
    },
    inputIcon: {
        position: 'absolute',
        left: 16,
        top: 16,
        zIndex: 1,
    },
    input: {
        width: '100%',
        height: 52,
        borderWidth: 2,
        borderRadius: 12,
        paddingLeft: 48,
        paddingRight: 16,
        fontSize: 16,
    },
    signUpBtn: {
        width: '100%',
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 4,
    },
    signUpBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    toggleSection: {
        paddingTop: 24,
        paddingBottom: 16,
        alignItems: 'center',
    },
    toggleText: {
        fontSize: 15,
    },
    toggleLink: {
        fontWeight: '600',
    },
});

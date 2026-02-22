import { useState } from 'react';
import React from 'react';
import {
    Text,
    TextInput,
    View,
    TouchableOpacity,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    ScrollView,
    StyleSheet,
} from 'react-native';
import { isClerkAPIResponseError, useSignIn, useSSO } from '@clerk/clerk-expo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ClerkAPIError } from '@clerk/types';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { createSharedStyles } from '@/src/constants/shared-styles';

enum Strategy {
    Google = 'oauth_google',
}

export default function SignInPage() {
    const { signIn, setActive, isLoaded } = useSignIn();
    const { startSSOFlow } = useSSO();
    const router = useRouter();
    const { email } = useLocalSearchParams();
    const colors = useThemeColors();
    const shared = createSharedStyles(colors);
    const [emailAddress, setEmailAddress] = useState<string>(
        (email as string) ?? '',
    );
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const onSignInPress = async () => {
        if (!isLoaded) return;

        try {
            const signInAttempt = await signIn.create({
                identifier: emailAddress,
                password,
            });

            if (signInAttempt.status === 'complete') {
                await setActive({ session: signInAttempt.createdSessionId });
                router.replace('/(tabs)');
            } else {
                console.error(JSON.stringify(signInAttempt, null, 2));
            }
        } catch (error) {
            if (isClerkAPIResponseError(error)) {
                handleClerkApiErrors(error.errors[0]);
            } else {
                console.error(JSON.stringify(error, null, 2));
            }
        }
    };

    const onSelectAuth = async (strategy: Strategy) => {
        try {
            const result = await startSSOFlow({ strategy });
            const {
                createdSessionId,
                setActive: setActiveSession,
                signIn: ssoSignIn,
                signUp,
            } = result;

            if (createdSessionId) {
                await setActiveSession!({ session: createdSessionId });
                router.replace('/(tabs)');
            } else if (
                (ssoSignIn as any)?.status === 'complete' &&
                (ssoSignIn as any)?.createdSessionId
            ) {
                await setActiveSession!({
                    session: (ssoSignIn as any).createdSessionId,
                });
                router.replace('/(tabs)');
            } else if (
                (signUp as any)?.status === 'complete' &&
                (signUp as any)?.createdSessionId
            ) {
                await setActiveSession!({
                    session: (signUp as any).createdSessionId,
                });
                router.replace('/(tabs)');
            }
        } catch (err) {
            console.error('SSO error:', err);
        }
    };

    const handleClerkApiErrors = (error: ClerkAPIError) => {
        switch (error.code) {
            case 'strategy_for_user_invalid':
                setErrorMessage(
                    'It looks like you signed up using a third-party account. Please log in with the provider you used (Google, Facebook, or Apple).',
                );
                break;
            case 'form_identifier_not_found':
                setErrorMessage(
                    "We couldn't find an account with that email and password. Please check your credentials and try again.",
                );
                break;
            default:
                setErrorMessage('Failed to sign in. Please try again.');
        }
    };

    return (
        <SafeAreaView
            style={[
                shared.screenContainer,
                { backgroundColor: colors.background },
            ]}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        style={{ flex: 1 }}
                        contentContainerStyle={s.scrollContent}
                        keyboardShouldPersistTaps='handled'
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Title section */}
                        <View style={s.titleSection}>
                            <Text style={[s.title, { color: colors.text }]}>
                                Welcome Back
                            </Text>
                            <Text
                                style={[s.subtitle, { color: colors.subtitle }]}
                            >
                                Sign in to continue
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
                                <Ionicons
                                    name='logo-google'
                                    size={20}
                                    color={colors.socialButtonIcon}
                                />
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

                            {/* Forgot password */}
                            <View style={s.forgotPasswordRow}>
                                <TouchableOpacity>
                                    <Text
                                        style={[
                                            s.forgotPasswordText,
                                            { color: colors.primary },
                                        ]}
                                    >
                                        Forgot password?
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={[
                                    s.signInBtn,
                                    { backgroundColor: colors.primary },
                                ]}
                                onPress={onSignInPress}
                                activeOpacity={0.8}
                            >
                                <Text style={s.signInBtnText}>Sign In</Text>
                            </TouchableOpacity>
                        </View>

                        {errorMessage && (
                            <Text style={[shared.errorText, { marginTop: 12 }]}>
                                {errorMessage}
                            </Text>
                        )}

                        {/* Toggle to sign up */}
                        <View style={s.toggleSection}>
                            <TouchableOpacity
                                onPress={() => router.replace('/sign-up')}
                            >
                                <Text
                                    style={[
                                        s.toggleText,
                                        { color: colors.textSecondary },
                                    ]}
                                >
                                    Don&apos;t have an account?{' '}
                                    <Text
                                        style={[
                                            s.toggleLink,
                                            { color: colors.primary },
                                        ]}
                                    >
                                        Sign Up
                                    </Text>
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
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
    forgotPasswordRow: {
        alignItems: 'flex-end',
        marginTop: -4,
    },
    forgotPasswordText: {
        fontSize: 14,
        fontWeight: '500',
    },
    signInBtn: {
        width: '100%',
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 4,
    },
    signInBtnText: {
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

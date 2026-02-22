import { useState } from 'react';
import React from 'react';
import { Text, TextInput, View, TouchableOpacity } from 'react-native';
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
    const styles = createSharedStyles(colors);
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
        <SafeAreaView style={styles.centeredContainer}>
            <Text style={[styles.title, { marginBottom: 24 }]}>Sign in</Text>

            <TextInput
                style={styles.input}
                autoCapitalize='none'
                value={emailAddress}
                placeholder='Enter email'
                placeholderTextColor={colors.placeholder}
                onChangeText={setEmailAddress}
            />

            <TextInput
                style={styles.input}
                value={password}
                placeholder='Enter password'
                placeholderTextColor={colors.placeholder}
                secureTextEntry={true}
                onChangeText={setPassword}
            />

            <TouchableOpacity style={styles.primaryBtn} onPress={onSignInPress}>
                <Text style={styles.primaryBtnText}>Continue</Text>
            </TouchableOpacity>

            {errorMessage && (
                <Text style={styles.errorText}>{errorMessage}</Text>
            )}

            <View style={styles.separatorView}>
                <View style={styles.separator} />
                <Text style={styles.separatorText}>or</Text>
                <View style={styles.separator} />
            </View>

            <View style={{ width: '100%' }}>
                <TouchableOpacity
                    onPress={() => onSelectAuth(Strategy.Google)}
                    style={styles.socialBtn}
                >
                    <Ionicons
                        name='logo-google'
                        size={20}
                        color={colors.socialButtonIcon}
                        style={{ marginRight: 10 }}
                    />
                    <Text style={styles.socialBtnText}>
                        Continue with Google
                    </Text>
                </TouchableOpacity>
            </View>

            <View
                style={{
                    paddingTop: 24,
                    paddingBottom: 16,
                    alignItems: 'center',
                }}
            >
                <TouchableOpacity onPress={() => router.replace('/sign-up')}>
                    <Text style={{ fontSize: 15, color: colors.textSecondary }}>
                        Don&apos;t have an account?{' '}
                        <Text
                            style={{ fontWeight: '600', color: colors.primary }}
                        >
                            Sign Up
                        </Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

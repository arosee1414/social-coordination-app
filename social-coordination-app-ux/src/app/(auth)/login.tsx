import {
    Text,
    TouchableOpacity,
    View,
    TextInput,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSSO } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';
import { Link, RelativePathString, useRouter } from 'expo-router';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { createSharedStyles } from '@/src/constants/shared-styles';

enum Strategy {
    Google = 'oauth_google',
}

export default function LoginPage() {
    const { startSSOFlow } = useSSO();
    const [email, setEmail] = useState<string>('');
    const router = useRouter();
    const colors = useThemeColors();
    const styles = createSharedStyles(colors);

    useEffect(() => {
        Keyboard.dismiss();
        setEmail('');
    }, []);

    const onSelectAuth = async (strategy: Strategy) => {
        try {
            const redirectUrl = Linking.createURL('/');
            const result = await startSSOFlow({
                strategy: strategy,
                //redirectUrl,
            });

            const { createdSessionId, setActive, signIn, signUp } = result;

            console.log(
                'SSO result:',
                JSON.stringify({
                    createdSessionId,
                    signInStatus: (signIn as any)?.status,
                    signInSessionId: (signIn as any)?.createdSessionId,
                    signUpStatus: (signUp as any)?.status,
                    signUpSessionId: (signUp as any)?.createdSessionId,
                }),
            );

            if (createdSessionId) {
                await setActive!({ session: createdSessionId });
                router.replace('/(tabs)');
            } else if (
                (signUp as any)?.status === 'complete' &&
                (signUp as any)?.createdSessionId
            ) {
                await setActive!({ session: (signUp as any).createdSessionId });
                router.replace('/(tabs)');
            } else if (
                (signIn as any)?.status === 'complete' &&
                (signIn as any)?.createdSessionId
            ) {
                await setActive!({ session: (signIn as any).createdSessionId });
                router.replace('/(tabs)');
            }
        } catch (err) {
            console.error('SSO error:', err);
        }
    };

    const onSelectSignUpWithEmail = () => {
        if (email.trim() !== '') {
            Keyboard.dismiss();
            setEmail('');
            router.push(`/sign-up?email=${encodeURIComponent(email)}`);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                keyboardVerticalOffset={-200}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1, width: '100%' }}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Text
                            style={{
                                fontFamily: 'Pacifico_400Regular',
                                fontSize: 48,
                                color: colors.primary,
                                marginBottom: 8,
                            }}
                        >
                            Hangout
                        </Text>
                        <Text style={styles.subtitle}>
                            Plan hangouts with friends, effortlessly
                        </Text>

                        <TextInput
                            style={styles.input}
                            autoCapitalize='none'
                            placeholder='Email'
                            placeholderTextColor={colors.placeholder}
                            onChangeText={setEmail}
                            value={email}
                        />

                        <TouchableOpacity
                            style={styles.primaryBtn}
                            onPress={onSelectSignUpWithEmail}
                        >
                            <Text style={styles.primaryBtnText}>
                                Sign up with email
                            </Text>
                        </TouchableOpacity>

                        <View style={{ marginTop: 10 }}>
                            <Link
                                href={
                                    `/sign-in${
                                        email
                                            ? `?email=${encodeURIComponent(email)}`
                                            : ''
                                    }` as RelativePathString
                                }
                            >
                                <Text style={styles.linkText}>
                                    Have an account already? Sign in
                                </Text>
                            </Link>
                        </View>

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
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

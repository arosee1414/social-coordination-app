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
            const { createdSessionId, setActive } = await startSSOFlow({
                strategy: strategy,
            });
            if (createdSessionId) {
                setActive!({ session: createdSessionId });
                router.replace('/');
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
                        <Text style={styles.title}>Welcome</Text>
                        <Text style={styles.subtitle}>
                            Sign in or create an account to get started
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

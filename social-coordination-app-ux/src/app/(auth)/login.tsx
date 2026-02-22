import {
    Text,
    TouchableOpacity,
    View,
    TextInput,
    StyleSheet,
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

enum Strategy {
    Google = 'oauth_google',
}

export default function LoginPage() {
    const { startSSOFlow } = useSSO();
    const [email, setEmail] = useState<string>('');
    const router = useRouter();

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
                    <View style={styles.inner}>
                        <Text style={styles.title}>Welcome</Text>
                        <Text style={styles.subtitle}>
                            Sign in or create an account to get started
                        </Text>

                        <TextInput
                            style={styles.input}
                            autoCapitalize='none'
                            placeholder='Email'
                            placeholderTextColor='gray'
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
                            <Text
                                style={{ marginHorizontal: 8, color: 'grey' }}
                            >
                                or
                            </Text>
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
                                    color={'#333'}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
    },
    inner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: 'grey',
        marginBottom: 30,
    },
    input: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
        marginBottom: 16,
    },
    primaryBtn: {
        width: '100%',
        height: 50,
        backgroundColor: '#007AFF',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    linkText: {
        color: '#007AFF',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    separatorView: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
        width: '100%',
    },
    separator: {
        flex: 1,
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
    },
    socialBtn: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    socialBtnText: {
        fontSize: 16,
        fontWeight: '500',
    },
});

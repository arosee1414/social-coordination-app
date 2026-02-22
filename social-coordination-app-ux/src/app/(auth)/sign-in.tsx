import { useState } from 'react';
import React from 'react';
import {
    Text,
    TextInput,
    View,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { isClerkAPIResponseError, useSignIn } from '@clerk/clerk-expo';
import {
    Link,
    RelativePathString,
    useLocalSearchParams,
    useRouter,
} from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ClerkAPIError } from '@clerk/types';

export default function SignInPage() {
    const { signIn, setActive, isLoaded } = useSignIn();
    const router = useRouter();
    const { email } = useLocalSearchParams();
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
                router.navigate('/');
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
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Sign in</Text>

            <TextInput
                style={styles.input}
                autoCapitalize='none'
                value={emailAddress}
                placeholder='Enter email'
                placeholderTextColor='#999'
                onChangeText={setEmailAddress}
            />

            <TextInput
                style={styles.input}
                value={password}
                placeholder='Enter password'
                placeholderTextColor='#999'
                secureTextEntry={true}
                onChangeText={setPassword}
            />

            <TouchableOpacity style={styles.primaryBtn} onPress={onSignInPress}>
                <Text style={styles.primaryBtnText}>Continue</Text>
            </TouchableOpacity>

            {errorMessage && (
                <Text style={styles.errorText}>{errorMessage}</Text>
            )}

            <View style={{ marginTop: 10 }}>
                <Link
                    href={
                        `/sign-up${
                            emailAddress
                                ? `?email=${encodeURIComponent(emailAddress)}`
                                : ''
                        }` as RelativePathString
                    }
                >
                    <Text style={styles.linkText}>
                        Don&apos;t have an account? Sign up
                    </Text>
                </Link>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 24,
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
    errorText: {
        color: 'red',
        marginTop: 10,
        textAlign: 'center',
    },
    linkText: {
        color: '#007AFF',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
});

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
} from 'react-native';
import { isClerkAPIResponseError, useSignUp } from '@clerk/clerk-expo';
import { ClerkAPIError } from '@clerk/types';
import {
    Link,
    RelativePathString,
    useLocalSearchParams,
    useRouter,
} from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Dialog from 'react-native-dialog';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { createSharedStyles } from '@/src/constants/shared-styles';

export default function SignUpPage() {
    const { isLoaded, signUp, setActive } = useSignUp();
    const router = useRouter();
    const { email } = useLocalSearchParams();
    const colors = useThemeColors();
    const styles = createSharedStyles(colors);
    const [emailAddress, setEmailAddress] = useState<string>(
        (email as string) ?? '',
    );
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [pendingVerification, setPendingVerification] = useState(false);
    const [code, setCode] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const onSignUpPress = async () => {
        setErrorMessage(null);
        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match');
            return;
        }
        if (!password) {
            setErrorMessage('You must enter a password');
            return;
        }
        if (!isLoaded) return;

        try {
            await signUp.create({
                emailAddress,
                password,
            });

            await signUp.prepareEmailAddressVerification({
                strategy: 'email_code',
            });

            setPendingVerification(true);
        } catch (error) {
            if (isClerkAPIResponseError(error)) {
                handleClerkApiErrors(error.errors[0]);
            } else {
                console.error(JSON.stringify(error, null, 2));
            }
        }
    };

    const handleClerkApiErrors = (error: ClerkAPIError) => {
        setErrorMessage(error.longMessage ?? null);
    };

    const onVerifyPress = async () => {
        if (!isLoaded) return;

        try {
            const signUpAttempt = await signUp.attemptEmailAddressVerification({
                code,
            });

            if (signUpAttempt.status === 'complete') {
                setPendingVerification(false);
                await setActive({ session: signUpAttempt.createdSessionId });
                router.replace('/(tabs)');
            } else {
                console.error(JSON.stringify(signUpAttempt, null, 2));
            }
        } catch (error) {
            if (isClerkAPIResponseError(error)) {
                handleClerkApiErrors(error.errors[0]);
            } else {
                console.error(JSON.stringify(error, null, 2));
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1, width: '100%' }}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View
                        style={{
                            flex: 1,
                            alignItems: 'center',
                        }}
                    >
                        <Dialog.Container visible={pendingVerification}>
                            <Dialog.Title>
                                A verification code has been sent to your email.
                            </Dialog.Title>
                            <Dialog.CodeInput
                                codeLength={6}
                                onCodeChange={setCode}
                            />
                            <Dialog.Button
                                onPress={onVerifyPress}
                                label='Verify'
                            />
                        </Dialog.Container>

                        <Text style={[styles.title, { marginBottom: 24 }]}>
                            Sign up
                        </Text>

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

                        <TextInput
                            style={styles.input}
                            value={confirmPassword}
                            placeholder='Confirm password'
                            placeholderTextColor={colors.placeholder}
                            secureTextEntry={true}
                            onChangeText={setConfirmPassword}
                        />

                        <TouchableOpacity
                            style={styles.primaryBtn}
                            onPress={onSignUpPress}
                        >
                            <Text style={styles.primaryBtnText}>Continue</Text>
                        </TouchableOpacity>

                        {errorMessage && (
                            <Text style={styles.errorText}>{errorMessage}</Text>
                        )}

                        <View style={{ marginTop: 10 }}>
                            <Link
                                href={
                                    `/sign-in${
                                        emailAddress
                                            ? `?email=${encodeURIComponent(emailAddress)}`
                                            : ''
                                    }` as RelativePathString
                                }
                            >
                                <Text style={styles.linkText}>
                                    Have an account already? Sign in
                                </Text>
                            </Link>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

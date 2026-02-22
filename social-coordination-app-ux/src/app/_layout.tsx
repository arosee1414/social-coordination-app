import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { ClerkLoaded, ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { tokenCache } from './utils/tokenCache';
import React, { useEffect } from 'react';

export const unstable_settings = {
    anchor: '(tabs)',
};

export default function RootLayout() {
    const colorScheme = useColorScheme();

    return (
        <ThemeProvider
            value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
        >
            <ClerkProvider
                tokenCache={tokenCache}
                publishableKey={
                    'pk_test_ZHluYW1pYy1oZXJtaXQtMTguY2xlcmsuYWNjb3VudHMuZGV2JA'
                }
            >
                <ClerkLoaded>
                    <RootLayoutNav />
                </ClerkLoaded>
            </ClerkProvider>
        </ThemeProvider>
    );
}

function RootLayoutNav(): React.JSX.Element {
    const { isLoaded, isSignedIn } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            console.log('user is signed in');
            router.navigate('/');
        } else if (isLoaded && !isSignedIn) {
            console.log('user is not signed in');
            router.navigate('/login');
        }
    }, []);

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name='(auth)'
                options={{ headerShown: false, animation: 'fade' }}
            />
            <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
            <Stack.Screen
                name='modal'
                options={{ presentation: 'modal', title: 'Modal' }}
            />
        </Stack>
    );
}

import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { ClerkProvider } from '@clerk/clerk-expo';
import { useColorScheme } from '@/src/hooks/use-color-scheme';
import tokenCache from './utils/tokenCache';
import React from 'react';

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
                <Stack>
                    <Stack.Screen
                        name='(tabs)'
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name='modal'
                        options={{ presentation: 'modal', title: 'Modal' }}
                    />
                </Stack>
                <StatusBar style='auto' />
            </ClerkProvider>
        </ThemeProvider>
    );
}

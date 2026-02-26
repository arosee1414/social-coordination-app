import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native';
import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { ClerkLoaded, ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from './utils/tokenCache';
import React from 'react';
import { useFonts, Pacifico_400Regular } from '@expo-google-fonts/pacifico';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NotificationsProvider } from '@/src/contexts/NotificationsContext';
import { HangoutsProvider } from '@/src/contexts/HangoutsContext';
import { ApiClientProvider } from '@/src/contexts/ApiClientContext';
import { ThemeProvider, useThemeContext } from '@/src/contexts/ThemeContext';

// Keep the splash screen visible until we explicitly hide it
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        Pacifico_400Regular,
    });

    if (!fontsLoaded) {
        // Splash screen is still showing natively — return null to avoid any flash
        return null;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemeProvider>
                <RootLayoutInner />
            </ThemeProvider>
        </GestureHandlerRootView>
    );
}

function RootLayoutInner(): React.JSX.Element {
    const { effectiveScheme } = useThemeContext();

    return (
        <NavigationThemeProvider
            value={effectiveScheme === 'dark' ? DarkTheme : DefaultTheme}
        >
            <ClerkProvider
                tokenCache={tokenCache}
                publishableKey={
                    'pk_test_ZHluYW1pYy1oZXJtaXQtMTguY2xlcmsuYWNjb3VudHMuZGV2JA'
                }
            >
                <ClerkLoaded>
                    <ApiClientProvider>
                        <NotificationsProvider>
                            <HangoutsProvider>
                                <RootLayoutNav />
                            </HangoutsProvider>
                        </NotificationsProvider>
                    </ApiClientProvider>
                </ClerkLoaded>
            </ClerkProvider>
        </NavigationThemeProvider>
    );
}

function RootLayoutNav(): React.JSX.Element {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name='index'
                options={{
                    headerShown: false,
                    gestureEnabled: false,
                    animation: 'none',
                }}
            />
            <Stack.Screen
                name='(auth)'
                options={{
                    headerShown: false,
                    animation: 'fade',
                    gestureEnabled: false,
                }}
            />
            <Stack.Screen
                name='(tabs)'
                options={{
                    headerShown: false,
                    gestureEnabled: false,
                    animation: 'none',
                }}
            />
            <Stack.Screen
                name='hangout/[id]'
                options={{ headerShown: false, animation: 'slide_from_right' }}
            />
            <Stack.Screen
                name='create-hangout'
                options={{ headerShown: false, animation: 'slide_from_right' }}
            />
            <Stack.Screen
                name='invite-selection'
                options={{ headerShown: false, animation: 'slide_from_right' }}
            />
            <Stack.Screen
                name='group/[id]'
                options={{ headerShown: false, animation: 'slide_from_right' }}
            />
            <Stack.Screen
                name='create-group'
                options={{ headerShown: false, animation: 'slide_from_right' }}
            />
            <Stack.Screen
                name='add-members'
                options={{ headerShown: false, animation: 'slide_from_right' }}
            />
            <Stack.Screen
                name='group-created'
                options={{
                    headerShown: false,
                    animation: 'fade',
                    gestureEnabled: false,
                }}
            />
            <Stack.Screen
                name='friend/[id]'
                options={{ headerShown: false, animation: 'slide_from_right' }}
            />
            <Stack.Screen
                name='edit-hangout/[id]'
                options={{ headerShown: false, animation: 'slide_from_right' }}
            />
            <Stack.Screen
                name='edit-group/[id]'
                options={{ headerShown: false, animation: 'slide_from_right' }}
            />
            <Stack.Screen
                name='manage-group-members/[id]'
                options={{ headerShown: false, animation: 'slide_from_right' }}
            />
            <Stack.Screen
                name='find-friends'
                options={{
                    headerShown: false,
                    animation: 'slide_from_right',
                    gestureEnabled: false,
                }}
            />
        </Stack>
    );
}

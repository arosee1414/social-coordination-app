import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from '@react-navigation/native';
import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { ClerkLoaded, ClerkProvider } from '@clerk/clerk-expo';
import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { tokenCache } from './utils/tokenCache';
import React from 'react';
import { useFonts, Pacifico_400Regular } from '@expo-google-fonts/pacifico';
import { View } from 'react-native';

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const [fontsLoaded] = useFonts({
        Pacifico_400Regular,
    });

    if (!fontsLoaded) {
        return <View style={{ flex: 1 }} />;
    }

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
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name='index' options={{ headerShown: false }} />
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

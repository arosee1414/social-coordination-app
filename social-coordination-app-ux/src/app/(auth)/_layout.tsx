import { Stack, router } from 'expo-router';
import React from 'react';
import { Button, Keyboard } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

export default function AuthLayout(): React.JSX.Element {
    const colors = useThemeColors();
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name='login' />
            <Stack.Screen
                name='sign-in'
                options={{
                    headerShown: true,
                    title: '',
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: colors.background },
                    headerTintColor: colors.text,
                    headerLeft: () => (
                        <Button
                            title='Back'
                            onPress={() => {
                                Keyboard.dismiss();
                                router.navigate('/login');
                            }}
                        />
                    ),
                }}
            />
            <Stack.Screen
                name='sign-up'
                options={{
                    headerShown: true,
                    title: '',
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: colors.background },
                    headerTintColor: colors.text,
                    headerLeft: () => (
                        <Button
                            title='Back'
                            onPress={() => {
                                Keyboard.dismiss();
                                router.navigate('/login');
                            }}
                        />
                    ),
                }}
            />
        </Stack>
    );
}

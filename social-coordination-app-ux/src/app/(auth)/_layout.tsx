import { Stack, router } from 'expo-router';
import React from 'react';
import { Button, Keyboard } from 'react-native';

export default function AuthLayout(): React.JSX.Element {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name='login' />
            <Stack.Screen
                name='sign-in'
                options={{
                    headerShown: true,
                    title: '',
                    headerShadowVisible: false,
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

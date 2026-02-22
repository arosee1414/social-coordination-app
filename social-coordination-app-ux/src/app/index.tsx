import { useAuth } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function Index() {
    const { isLoaded, isSignedIn } = useAuth();
    console.log('Auth state - isLoaded:', isLoaded, 'isSignedIn:', isSignedIn);

    if (!isLoaded) {
        return <View style={{ flex: 1 }} />;
    }

    if (isSignedIn) {
        return <Redirect href='/(tabs)' />;
    }

    return <Redirect href='/login' />;
}

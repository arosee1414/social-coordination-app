import { useAuth } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';
import React, { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

export default function Index() {
    const { isLoaded, isSignedIn } = useAuth();

    useEffect(() => {
        if (isLoaded) {
            // Fonts are loaded (_layout.tsx rendered us) and Clerk is ready —
            // hide the native splash screen right before we redirect.
            SplashScreen.hideAsync();
        }
    }, [isLoaded]);

    if (!isLoaded) {
        // Native splash screen is still visible — return null to avoid flash
        return null;
    }

    if (isSignedIn) {
        return <Redirect href='/(tabs)' />;
    }

    return <Redirect href='/login' />;
}

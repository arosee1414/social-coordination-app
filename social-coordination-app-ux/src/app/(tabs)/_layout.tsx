import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/src/components/haptic-tab';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Colors } from '@/src/constants/theme';
import { useColorScheme } from '@/src/hooks/use-color-scheme';

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: colors.tabIconSelected,
                tabBarInactiveTintColor: colors.tabIconDefault,
                headerShown: false,
                tabBarButton: HapticTab,
                tabBarStyle: {
                    backgroundColor: colors.background,
                    borderTopColor: colors.cardBorder,
                },
            }}
        >
            <Tabs.Screen
                name='index'
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={28} name='house.fill' color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name='hangouts'
                options={{
                    title: 'Hangouts',
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={28} name='calendar' color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name='groups'
                options={{
                    title: 'Groups',
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={28} name='people' color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name='notifications'
                options={{
                    title: 'Alerts',
                    tabBarIcon: ({ color }) => (
                        <IconSymbol
                            size={28}
                            name='notifications'
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name='profile'
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={28} name='person' color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
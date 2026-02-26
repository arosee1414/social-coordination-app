import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/src/components/haptic-tab';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/theme';
import { useThemeContext } from '@/src/contexts/ThemeContext';

export default function TabLayout() {
    const { effectiveScheme } = useThemeContext();
    const colors = Colors[effectiveScheme];

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
                        <IconSymbol
                            size={32}
                            name='person.2.fill'
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name='friends'
                options={{
                    title: 'Friends',
                    tabBarIcon: ({ color }) => (
                        <Ionicons
                            size={26}
                            name='people-outline'
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
                        <IconSymbol size={26} name='person' color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}

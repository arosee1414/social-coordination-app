import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { createSharedStyles } from '@/src/constants/shared-styles';
import { mockNotifications } from '@/src/data/mock-data';

export default function NotificationsScreen() {
    const colors = useThemeColors();
    const shared = createSharedStyles(colors);

    const getNotificationIcon = (
        notification: (typeof mockNotifications)[0],
    ) => {
        if (notification.icon) {
            return (
                <View
                    style={[
                        s.iconCircle,
                        { backgroundColor: colors.surfaceTertiary },
                    ]}
                >
                    <Text style={{ fontSize: 24 }}>{notification.icon}</Text>
                </View>
            );
        }
        if (notification.color) {
            return (
                <View
                    style={[
                        s.iconCircle,
                        { backgroundColor: notification.color },
                    ]}
                >
                    {notification.type === 'reminder' && (
                        <Ionicons name='calendar' size={24} color='#fff' />
                    )}
                    {notification.type === 'group_created' && (
                        <Ionicons name='sparkles' size={24} color='#fff' />
                    )}
                </View>
            );
        }
        return (
            <View style={[s.iconCircle, { backgroundColor: colors.primary }]}>
                <Ionicons name='notifications' size={24} color='#fff' />
            </View>
        );
    };

    return (
        <SafeAreaView
            style={shared.screenContainer}
            edges={['top', 'left', 'right']}
        >
            <View style={shared.screenHeaderBordered}>
                <View style={s.headerRow}>
                    <Text style={shared.screenTitle}>Notifications</Text>
                    <TouchableOpacity>
                        <Text style={[s.markRead, { color: colors.primary }]}>
                            Mark all read
                        </Text>
                    </TouchableOpacity>
                </View>
                <Text style={shared.screenSubtitle}>
                    Stay updated on your hangouts
                </Text>
            </View>

            <ScrollView style={{ flex: 1 }}>
                {mockNotifications.map((notification) => (
                    <TouchableOpacity
                        key={notification.id}
                        style={[
                            s.notifItem,
                            { borderBottomColor: colors.cardBorder },
                            notification.unread && {
                                backgroundColor: colors.unreadBg,
                            },
                        ]}
                        activeOpacity={0.7}
                    >
                        {getNotificationIcon(notification)}
                        <View style={{ flex: 1 }}>
                            <View style={s.notifHeader}>
                                <Text
                                    style={[
                                        s.notifTitle,
                                        { color: colors.text },
                                    ]}
                                    numberOfLines={1}
                                >
                                    {notification.title}
                                </Text>
                                {notification.unread && (
                                    <View
                                        style={[
                                            s.unreadDot,
                                            {
                                                backgroundColor:
                                                    colors.unreadDot,
                                            },
                                        ]}
                                    />
                                )}
                            </View>
                            <Text
                                style={[
                                    s.notifMessage,
                                    { color: colors.textSecondary },
                                ]}
                                numberOfLines={1}
                            >
                                {notification.message}
                            </Text>
                            <Text
                                style={[
                                    s.notifTime,
                                    { color: colors.textTertiary },
                                ]}
                            >
                                {notification.time}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    markRead: { fontSize: 14, fontWeight: '600' },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notifItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    notifHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 8,
        marginBottom: 4,
    },
    notifTitle: { fontSize: 15, fontWeight: '600', flex: 1 },
    unreadDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
    notifMessage: { fontSize: 14, marginBottom: 4 },
    notifTime: { fontSize: 12 },
});

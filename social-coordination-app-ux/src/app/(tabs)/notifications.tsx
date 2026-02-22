import React, { useCallback, useRef, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Animated as RNAnimated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, { FadeOut, LinearTransition } from 'react-native-reanimated';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { createSharedStyles } from '@/src/constants/shared-styles';
import { mockNotifications } from '@/src/data/mock-data';
import type { Notification } from '@/src/types';

export default function NotificationsScreen() {
    const colors = useThemeColors();
    const shared = createSharedStyles(colors);
    const [notifications, setNotifications] = useState<Notification[]>(() => [
        ...mockNotifications,
    ]);
    const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());
    const openSwipeableRef = useRef<Swipeable | null>(null);

    const markAllAsRead = useCallback(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    }, []);

    const handleDelete = useCallback((id: string) => {
        const ref = swipeableRefs.current.get(id);
        if (ref) {
            ref.close();
        }
        swipeableRefs.current.delete(id);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    const renderRightActions = (
        _progress: RNAnimated.AnimatedInterpolation<number>,
        dragX: RNAnimated.AnimatedInterpolation<number>,
        id: string,
    ) => {
        const scale = dragX.interpolate({
            inputRange: [-100, -50, 0],
            outputRange: [1, 0.8, 0],
            extrapolate: 'clamp',
        });

        return (
            <TouchableOpacity
                onPress={() => handleDelete(id)}
                activeOpacity={0.8}
                style={s.deleteAction}
            >
                <RNAnimated.View
                    style={[s.deleteContent, { transform: [{ scale }] }]}
                >
                    <Ionicons name='trash-outline' size={22} color='#fff' />
                    <Text style={s.deleteText}>Delete</Text>
                </RNAnimated.View>
            </TouchableOpacity>
        );
    };

    const getNotificationIcon = (notification: Notification) => {
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
                    <TouchableOpacity onPress={markAllAsRead}>
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
                {notifications.map((notification) => (
                    <Animated.View
                        key={notification.id}
                        exiting={FadeOut.duration(200)}
                        layout={LinearTransition.duration(250)}
                    >
                        <Swipeable
                            ref={(ref) => {
                                if (ref) {
                                    swipeableRefs.current.set(
                                        notification.id,
                                        ref,
                                    );
                                }
                            }}
                            renderRightActions={(progress, dragX) =>
                                renderRightActions(
                                    progress,
                                    dragX,
                                    notification.id,
                                )
                            }
                            onSwipeableWillOpen={() => {
                                if (
                                    openSwipeableRef.current &&
                                    openSwipeableRef.current !==
                                        swipeableRefs.current.get(
                                            notification.id,
                                        )
                                ) {
                                    openSwipeableRef.current.close();
                                }
                                openSwipeableRef.current =
                                    swipeableRefs.current.get(
                                        notification.id,
                                    ) ?? null;
                            }}
                            onSwipeableClose={() => {
                                if (
                                    openSwipeableRef.current ===
                                    swipeableRefs.current.get(notification.id)
                                ) {
                                    openSwipeableRef.current = null;
                                }
                            }}
                            rightThreshold={40}
                            overshootRight={false}
                            friction={2}
                        >
                            <TouchableOpacity
                                style={[
                                    s.notifItem,
                                    {
                                        borderBottomColor: colors.cardBorder,
                                        backgroundColor: notification.unread
                                            ? colors.unreadBg
                                            : colors.background,
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
                        </Swipeable>
                    </Animated.View>
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
    deleteAction: {
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
        width: 90,
    },
    deleteContent: {
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
    },
    deleteText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
});

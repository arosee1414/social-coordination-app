import React, { useCallback, useRef } from 'react';
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
import { useScrollToTop } from '@react-navigation/native';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, { FadeOut, LinearTransition } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { createSharedStyles } from '@/src/constants/shared-styles';
import { useNotifications } from '@/src/contexts/NotificationsContext';
import type { Notification } from '@/src/types';

function formatTimeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

export default function NotificationsScreen() {
    const colors = useThemeColors();
    const shared = createSharedStyles(colors);
    const router = useRouter();
    const { notifications, markAsRead, markAllAsRead, deleteNotification } =
        useNotifications();
    const scrollRef = useRef<ScrollView>(null);
    useScrollToTop(scrollRef);
    const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());
    const openSwipeableRef = useRef<Swipeable | null>(null);

    const handleNotificationPress = useCallback(
        (notification: Notification) => {
            markAsRead(notification.id);

            switch (notification.type) {
                case 'Rsvp':
                case 'HangoutInvite':
                case 'HangoutCreated':
                    if (notification.hangoutId) {
                        router.push(`/hangout/${notification.hangoutId}`);
                    }
                    break;
                case 'GroupCreated':
                case 'MemberAdded':
                case 'MemberRemoved':
                    if (notification.groupId) {
                        router.push(`/group/${notification.groupId}`);
                    }
                    break;
                case 'FriendRequest':
                case 'FriendAccepted':
                    if (notification.actorUserId) {
                        router.push(
                            `/friend/${notification.actorUserId}` as any,
                        );
                    }
                    break;
            }
        },
        [markAsRead, router],
    );

    const handleDelete = useCallback(
        (id: string) => {
            const ref = swipeableRefs.current.get(id);
            if (ref) {
                ref.close();
            }
            swipeableRefs.current.delete(id);
            deleteNotification(id);
        },
        [deleteNotification],
    );

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
        let iconName: keyof typeof Ionicons.glyphMap = 'notifications';
        let iconColor = colors.primary;

        switch (notification.type) {
            case 'HangoutInvite':
            case 'HangoutCreated':
                iconName = 'calendar';
                iconColor = '#6366F1';
                break;
            case 'Rsvp':
                iconName = 'checkmark-circle';
                iconColor = '#10B981';
                break;
            case 'GroupCreated':
                iconName = 'sparkles';
                iconColor = '#F59E0B';
                break;
            case 'MemberAdded':
                iconName = 'person-add';
                iconColor = '#3B82F6';
                break;
            case 'MemberRemoved':
                iconName = 'person-remove';
                iconColor = '#EF4444';
                break;
            case 'FriendRequest':
                iconName = 'people';
                iconColor = '#8B5CF6';
                break;
            case 'FriendAccepted':
                iconName = 'heart';
                iconColor = '#EC4899';
                break;
        }

        return (
            <View style={[s.iconCircle, { backgroundColor: iconColor }]}>
                <Ionicons name={iconName} size={24} color='#fff' />
            </View>
        );
    };

    return (
        <SafeAreaView
            style={shared.screenContainer}
            edges={['top', 'left', 'right']}
        >
            <View style={[shared.stackHeader, { position: 'relative' }]}>
                <Text style={[s.stackTitleAbsolute, { color: colors.text }]}>
                    Notifications
                </Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                    style={{ zIndex: 1 }}
                >
                    <Ionicons name='arrow-back' size={24} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity onPress={markAllAsRead} style={{ zIndex: 1 }}>
                    <Text style={[s.markRead, { color: colors.primary }]}>
                        Mark all read
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView ref={scrollRef} style={{ flex: 1 }}>
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
                                        backgroundColor: !notification.isRead
                                            ? colors.unreadBg
                                            : colors.background,
                                    },
                                ]}
                                activeOpacity={0.7}
                                onPress={() =>
                                    handleNotificationPress(notification)
                                }
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
                                        {!notification.isRead && (
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
    stackTitleAbsolute: {
        position: 'absolute',
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: '700',
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

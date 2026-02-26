import React from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Notification } from '@/src/types';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { createSharedStyles } from '@/src/constants/shared-styles';

interface RecentActivitySectionProps {
    notifications: Notification[];
    onNotificationPress?: (notification: Notification) => void;
}

function formatTimeAgo(dateString?: string): string {
    if (!dateString) return '';
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

function getNotificationIconInfo(type: string): {
    iconName: keyof typeof Ionicons.glyphMap;
    iconColor: string;
} {
    switch (type) {
        case 'HangoutInvite':
        case 'HangoutCreated':
            return { iconName: 'calendar', iconColor: '#6366F1' };
        case 'Rsvp':
            return { iconName: 'checkmark-circle', iconColor: '#10B981' };
        case 'GroupCreated':
            return { iconName: 'sparkles', iconColor: '#F59E0B' };
        case 'MemberAdded':
            return { iconName: 'person-add', iconColor: '#3B82F6' };
        case 'MemberRemoved':
            return { iconName: 'person-remove', iconColor: '#EF4444' };
        case 'FriendRequest':
            return { iconName: 'people', iconColor: '#8B5CF6' };
        case 'FriendAccepted':
            return { iconName: 'heart', iconColor: '#EC4899' };
        default:
            return { iconName: 'notifications', iconColor: '#6366F1' };
    }
}

export function RecentActivitySection({
    notifications,
    onNotificationPress,
}: RecentActivitySectionProps) {
    const colors = useThemeColors();
    const shared = createSharedStyles(colors);

    if (notifications.length === 0) return null;

    return (
        <View style={styles.container}>
            <Text style={[shared.sectionTitle, styles.sectionTitle]}>
                Recent Activity
            </Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {notifications.map((notification) => {
                    const { iconName, iconColor } = getNotificationIconInfo(
                        notification.type,
                    );
                    const timeAgo = formatTimeAgo(
                        notification.createdAt ?? notification.time,
                    );

                    return (
                        <TouchableOpacity
                            key={notification.id}
                            style={[
                                styles.card,
                                {
                                    backgroundColor: colors.card,
                                    borderColor: colors.cardBorder,
                                    shadowColor: '#000',
                                },
                            ]}
                            onPress={() => onNotificationPress?.(notification)}
                            activeOpacity={onNotificationPress ? 0.7 : 1}
                        >
                            <View style={styles.cardHeader}>
                                <View
                                    style={[
                                        styles.iconCircle,
                                        {
                                            backgroundColor: iconColor,
                                        },
                                    ]}
                                >
                                    <Ionicons
                                        name={iconName}
                                        size={16}
                                        color='#fff'
                                    />
                                </View>
                                {timeAgo ? (
                                    <Text
                                        style={[
                                            styles.timeText,
                                            {
                                                color: colors.textTertiary,
                                            },
                                        ]}
                                    >
                                        {timeAgo}
                                    </Text>
                                ) : null}
                            </View>
                            <Text
                                style={[
                                    styles.titleText,
                                    { color: colors.text },
                                ]}
                                numberOfLines={2}
                            >
                                {notification.title}
                            </Text>
                            {notification.message ? (
                                <Text
                                    style={[
                                        styles.messageText,
                                        { color: colors.textSecondary },
                                    ]}
                                    numberOfLines={1}
                                >
                                    {notification.message}
                                </Text>
                            ) : null}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 16,
        paddingBottom: 24,
    },
    sectionTitle: {
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    scrollContent: {
        paddingHorizontal: 24,
        gap: 12,
    },
    card: {
        width: 200,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    iconCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleText: {
        fontSize: 13,
        fontWeight: '600',
        lineHeight: 18,
    },
    messageText: {
        fontSize: 12,
        lineHeight: 16,
        marginTop: 2,
    },
    timeText: {
        fontSize: 11,
    },
});

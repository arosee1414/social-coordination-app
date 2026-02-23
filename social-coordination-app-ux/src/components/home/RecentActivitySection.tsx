import React from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { RecentActivity } from '@/src/types';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { createSharedStyles } from '@/src/constants/shared-styles';

interface RecentActivitySectionProps {
    activities: RecentActivity[];
    onActivityPress?: (activityId: string) => void;
}

export function RecentActivitySection({
    activities,
    onActivityPress,
}: RecentActivitySectionProps) {
    const colors = useThemeColors();
    const shared = createSharedStyles(colors);

    if (activities.length === 0) return null;

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
                {activities.map((activity) => (
                    <TouchableOpacity
                        key={activity.id}
                        style={[
                            styles.card,
                            {
                                backgroundColor: colors.card,
                                borderColor: colors.cardBorder,
                                shadowColor: '#000',
                            },
                        ]}
                        onPress={() => onActivityPress?.(activity.id)}
                        activeOpacity={onActivityPress ? 0.7 : 1}
                    >
                        <View style={styles.cardContent}>
                            <View
                                style={[
                                    styles.avatarCircle,
                                    {
                                        backgroundColor: colors.surfaceTertiary,
                                    },
                                ]}
                            >
                                <Text style={styles.avatarEmoji}>
                                    {activity.avatar}
                                </Text>
                            </View>
                            <Text
                                style={[
                                    styles.activityText,
                                    { color: colors.textSecondary },
                                ]}
                                numberOfLines={3}
                            >
                                {activity.text}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
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
    cardContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    avatarCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    avatarEmoji: {
        fontSize: 18,
    },
    activityText: {
        fontSize: 14,
        lineHeight: 20,
        flex: 1,
        paddingTop: 2,
    },
});

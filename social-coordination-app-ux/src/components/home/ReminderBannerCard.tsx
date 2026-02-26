import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReminderBanner } from '@/src/types';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { createSharedStyles } from '@/src/constants/shared-styles';

interface ReminderBannerCardProps {
    reminder: ReminderBanner;
    onPress?: () => void;
}

export function ReminderBannerCard({
    reminder,
    onPress,
}: ReminderBannerCardProps) {
    const colors = useThemeColors();
    const shared = createSharedStyles(colors);

    const Wrapper = onPress ? TouchableOpacity : View;
    const wrapperProps = onPress ? { onPress, activeOpacity: 0.7 } : {};

    return (
        <Wrapper
            {...wrapperProps}
            style={[shared.reminderBanner, styles.wrapper]}
        >
            {/* Clock icon circle */}
            <View
                style={[
                    styles.iconCircle,
                    { backgroundColor: colors.reminderBorder },
                ]}
            >
                <Ionicons
                    name='time-outline'
                    size={16}
                    color={colors.reminderText}
                />
            </View>

            {/* Text content */}
            <View style={styles.textContainer}>
                <Text
                    style={[styles.title, { color: colors.reminderText }]}
                    numberOfLines={1}
                >
                    {reminder.title}
                </Text>
                <Text
                    style={[styles.subtitle, { color: colors.reminderSubtext }]}
                    numberOfLines={1}
                >
                    {reminder.subtitle}
                </Text>
            </View>
        </Wrapper>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        marginHorizontal: 24,
    },
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
    },
    subtitle: {
        fontSize: 12,
        marginTop: 2,
    },
});

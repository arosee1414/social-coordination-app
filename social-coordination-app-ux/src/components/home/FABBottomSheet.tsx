import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Pressable,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { createSharedStyles } from '@/src/constants/shared-styles';

interface FABBottomSheetProps {
    onCreateHangout: () => void;
    onInviteGroup: () => void;
}

export function FABBottomSheet({
    onCreateHangout,
    onInviteGroup,
}: FABBottomSheetProps) {
    const colors = useThemeColors();
    const shared = createSharedStyles(colors);
    const [isOpen, setIsOpen] = useState(false);

    const sheetTranslateY = useSharedValue(300);
    const overlayOpacity = useSharedValue(0);

    const open = useCallback(() => {
        setIsOpen(true);
        overlayOpacity.value = withTiming(1, { duration: 200 });
        sheetTranslateY.value = withSpring(0, {
            damping: 20,
            stiffness: 200,
        });
    }, [overlayOpacity, sheetTranslateY]);

    const close = useCallback(() => {
        overlayOpacity.value = withTiming(0, { duration: 200 });
        sheetTranslateY.value = withSpring(
            300,
            {
                damping: 20,
                stiffness: 200,
            },
            () => {
                runOnJS(setIsOpen)(false);
            },
        );
    }, [overlayOpacity, sheetTranslateY]);

    const handleCreateHangout = useCallback(() => {
        close();
        // Small delay to let animation start before navigation
        setTimeout(onCreateHangout, 150);
    }, [close, onCreateHangout]);

    const handleInviteGroup = useCallback(() => {
        close();
        setTimeout(onInviteGroup, 150);
    }, [close, onInviteGroup]);

    const overlayAnimatedStyle = useAnimatedStyle(() => ({
        opacity: overlayOpacity.value,
    }));

    const sheetAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: sheetTranslateY.value }],
    }));

    return (
        <>
            {/* FAB Button */}
            <TouchableOpacity
                style={shared.fabLarge}
                activeOpacity={0.85}
                onPress={open}
            >
                <Ionicons name='add' size={28} color='#fff' />
            </TouchableOpacity>

            {/* Bottom Sheet Modal */}
            {isOpen && (
                <View style={StyleSheet.absoluteFill} pointerEvents='box-none'>
                    {/* Overlay */}
                    <Animated.View
                        style={[
                            shared.bottomSheetOverlay,
                            overlayAnimatedStyle,
                        ]}
                    >
                        <Pressable
                            style={StyleSheet.absoluteFill}
                            onPress={close}
                        />
                    </Animated.View>

                    {/* Sheet */}
                    <Animated.View
                        style={[
                            shared.bottomSheetContainer,
                            sheetAnimatedStyle,
                        ]}
                    >
                        {/* Handle */}
                        <View style={shared.bottomSheetHandle} />

                        {/* Title */}
                        <Text
                            style={[styles.sheetTitle, { color: colors.text }]}
                        >
                            Create New
                        </Text>

                        {/* Create Hangout */}
                        <TouchableOpacity
                            style={shared.bottomSheetActionRow}
                            activeOpacity={0.7}
                            onPress={handleCreateHangout}
                        >
                            <View style={shared.bottomSheetActionIcon}>
                                <Ionicons
                                    name='calendar-outline'
                                    size={20}
                                    color={colors.primary}
                                />
                            </View>
                            <View style={styles.actionTextContainer}>
                                <Text
                                    style={[
                                        styles.actionTitle,
                                        { color: colors.text },
                                    ]}
                                >
                                    Create Hangout
                                </Text>
                                <Text
                                    style={[
                                        styles.actionSubtitle,
                                        { color: colors.subtitle },
                                    ]}
                                >
                                    Plan a new event with friends
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* Invite Group */}
                        <TouchableOpacity
                            style={shared.bottomSheetActionRow}
                            activeOpacity={0.7}
                            onPress={handleInviteGroup}
                        >
                            <View style={shared.bottomSheetActionIcon}>
                                <Ionicons
                                    name='people-outline'
                                    size={20}
                                    color={colors.primary}
                                />
                            </View>
                            <View style={styles.actionTextContainer}>
                                <Text
                                    style={[
                                        styles.actionTitle,
                                        { color: colors.text },
                                    ]}
                                >
                                    Invite Group
                                </Text>
                                <Text
                                    style={[
                                        styles.actionSubtitle,
                                        { color: colors.subtitle },
                                    ]}
                                >
                                    Quick invite from saved groups
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* Cancel */}
                        <TouchableOpacity
                            style={styles.cancelBtn}
                            activeOpacity={0.7}
                            onPress={close}
                        >
                            <Ionicons
                                name='close'
                                size={20}
                                color={colors.subtitle}
                            />
                            <Text
                                style={[
                                    styles.cancelText,
                                    { color: colors.textSecondary },
                                ]}
                            >
                                Cancel
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    sheetTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    actionTextContainer: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    actionSubtitle: {
        fontSize: 14,
        marginTop: 2,
    },
    cancelBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        marginTop: 8,
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

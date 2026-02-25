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
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { createSharedStyles } from '@/src/constants/shared-styles';

const CLOSE_THRESHOLD = 50;
const SHEET_HIDDEN_Y = 300;

interface FABBottomSheetProps {
    onCreateHangout: () => void;
    onCreateGroup: () => void;
}

export function FABBottomSheet({
    onCreateHangout,
    onCreateGroup,
}: FABBottomSheetProps) {
    const colors = useThemeColors();
    const shared = createSharedStyles(colors);
    const [isOpen, setIsOpen] = useState(false);

    const sheetTranslateY = useSharedValue(SHEET_HIDDEN_Y);
    const overlayOpacity = useSharedValue(0);

    const open = useCallback(() => {
        setIsOpen(true);
        overlayOpacity.value = withTiming(1, { duration: 200 });
        sheetTranslateY.value = withTiming(0, { duration: 250 });
    }, [overlayOpacity, sheetTranslateY]);

    const close = useCallback(() => {
        overlayOpacity.value = withTiming(0, { duration: 200 });
        sheetTranslateY.value = withTiming(
            SHEET_HIDDEN_Y,
            { duration: 250 },
            () => {
                runOnJS(setIsOpen)(false);
            },
        );
    }, [overlayOpacity, sheetTranslateY]);

    // Pan gesture for swipe-down-to-close
    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            // Only allow dragging downward (positive translationY)
            if (event.translationY > 0) {
                sheetTranslateY.value = event.translationY;
                // Fade overlay proportionally
                overlayOpacity.value = Math.max(
                    0,
                    1 - event.translationY / SHEET_HIDDEN_Y,
                );
            }
        })
        .onEnd((event) => {
            if (event.translationY > CLOSE_THRESHOLD) {
                // Past threshold — close
                overlayOpacity.value = withTiming(0, { duration: 200 });
                sheetTranslateY.value = withTiming(
                    SHEET_HIDDEN_Y,
                    { duration: 200 },
                    () => {
                        runOnJS(setIsOpen)(false);
                    },
                );
            } else {
                // Snap back open
                sheetTranslateY.value = withTiming(0, { duration: 200 });
                overlayOpacity.value = withTiming(1, { duration: 200 });
            }
        });

    const handleCreateHangout = useCallback(() => {
        close();
        // Small delay to let animation start before navigation
        setTimeout(onCreateHangout, 150);
    }, [close, onCreateHangout]);

    const handleCreateGroup = useCallback(() => {
        close();
        setTimeout(onCreateGroup, 150);
    }, [close, onCreateGroup]);

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
                    <GestureDetector gesture={panGesture}>
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
                                style={[
                                    styles.sheetTitle,
                                    { color: colors.text },
                                ]}
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

                            {/* Create Group */}
                            <TouchableOpacity
                                style={shared.bottomSheetActionRow}
                                activeOpacity={0.7}
                                onPress={handleCreateGroup}
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
                                        Create Group
                                    </Text>
                                    <Text
                                        style={[
                                            styles.actionSubtitle,
                                            { color: colors.subtitle },
                                        ]}
                                    >
                                        Start a new group with friends
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            {/* Cancel */}
                            <TouchableOpacity
                                style={[
                                    styles.cancelBtn,
                                    { backgroundColor: colors.surfaceTertiary },
                                ]}
                                activeOpacity={0.7}
                                onPress={close}
                            >
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
                    </GestureDetector>
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
        width: '100%',
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

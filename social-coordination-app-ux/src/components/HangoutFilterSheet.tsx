import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Pressable,
    ScrollView,
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
import type { Group } from '@/src/types';

const CLOSE_THRESHOLD = 50;
const SHEET_HIDDEN_Y = 600;

export type FilterRole = 'all' | 'hosting' | 'invited';
export type FilterRSVP = 'all' | 'pending' | 'accepted' | 'declined';
export type FilterDate = 'all' | 'month' | '3months';

export interface HangoutFilters {
    role: FilterRole;
    rsvp: FilterRSVP;
    groupId: string; // 'all' or a specific group ID
    date: FilterDate;
}

export const DEFAULT_FILTERS: HangoutFilters = {
    role: 'all',
    rsvp: 'all',
    groupId: 'all',
    date: 'all',
};

export function hasActiveFilters(filters: HangoutFilters): boolean {
    return (
        filters.role !== 'all' ||
        filters.rsvp !== 'all' ||
        filters.groupId !== 'all' ||
        filters.date !== 'all'
    );
}

interface HangoutFilterSheetProps {
    visible: boolean;
    onClose: () => void;
    filters: HangoutFilters;
    onApply: (filters: HangoutFilters) => void;
    groups: Group[];
    activeTab: 'upcoming' | 'past';
}

export function HangoutFilterSheet({
    visible,
    onClose,
    filters,
    onApply,
    groups,
    activeTab,
}: HangoutFilterSheetProps) {
    const colors = useThemeColors();
    const shared = createSharedStyles(colors);

    const [localFilters, setLocalFilters] = useState<HangoutFilters>(filters);

    const sheetTranslateY = useSharedValue(SHEET_HIDDEN_Y);
    const overlayOpacity = useSharedValue(0);
    const [isRendered, setIsRendered] = useState(false);

    const open = useCallback(() => {
        setLocalFilters(filters);
        setIsRendered(true);
        overlayOpacity.value = withTiming(1, { duration: 200 });
        sheetTranslateY.value = withTiming(0, { duration: 300 });
    }, [filters, overlayOpacity, sheetTranslateY]);

    const close = useCallback(() => {
        overlayOpacity.value = withTiming(0, { duration: 200 });
        sheetTranslateY.value = withTiming(
            SHEET_HIDDEN_Y,
            { duration: 250 },
            () => {
                runOnJS(setIsRendered)(false);
                runOnJS(onClose)();
            },
        );
    }, [overlayOpacity, sheetTranslateY, onClose]);

    // Open when visible changes to true
    React.useEffect(() => {
        if (visible && !isRendered) {
            open();
        } else if (!visible && isRendered) {
            close();
        }
    }, [visible]);

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            if (event.translationY > 0) {
                sheetTranslateY.value = event.translationY;
                overlayOpacity.value = Math.max(
                    0,
                    1 - event.translationY / SHEET_HIDDEN_Y,
                );
            }
        })
        .onEnd((event) => {
            if (event.translationY > CLOSE_THRESHOLD) {
                overlayOpacity.value = withTiming(0, { duration: 200 });
                sheetTranslateY.value = withTiming(
                    SHEET_HIDDEN_Y,
                    { duration: 200 },
                    () => {
                        runOnJS(setIsRendered)(false);
                        runOnJS(onClose)();
                    },
                );
            } else {
                sheetTranslateY.value = withTiming(0, { duration: 200 });
                overlayOpacity.value = withTiming(1, { duration: 200 });
            }
        });

    const handleApply = useCallback(() => {
        onApply(localFilters);
        close();
    }, [localFilters, onApply, close]);

    const handleClearAll = useCallback(() => {
        onApply(DEFAULT_FILTERS);
        close();
    }, [onApply, close]);

    const overlayAnimatedStyle = useAnimatedStyle(() => ({
        opacity: overlayOpacity.value,
    }));

    const sheetAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: sheetTranslateY.value }],
    }));

    if (!isRendered) return null;

    const roleOptions: { value: FilterRole; label: string }[] = [
        { value: 'all', label: 'All' },
        { value: 'hosting', label: 'Hosting' },
        { value: 'invited', label: 'Invited' },
    ];

    const rsvpOptions: { value: FilterRSVP; label: string }[] = [
        { value: 'all', label: 'All' },
        { value: 'pending', label: 'Pending' },
        { value: 'accepted', label: 'Accepted' },
        { value: 'declined', label: 'Declined' },
    ];

    const dateOptions: { value: FilterDate; label: string }[] =
        activeTab === 'upcoming'
            ? [
                  { value: 'all', label: 'All' },
                  { value: 'month', label: 'This Month' },
                  { value: '3months', label: 'Next 3 Months' },
              ]
            : [
                  { value: 'all', label: 'All Time' },
                  { value: 'month', label: 'This Month' },
                  { value: '3months', label: 'Last 3 Months' },
              ];

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents='box-none'>
            {/* Overlay */}
            <Animated.View
                style={[shared.bottomSheetOverlay, overlayAnimatedStyle]}
            >
                <Pressable style={StyleSheet.absoluteFill} onPress={close} />
            </Animated.View>

            {/* Sheet */}
            <GestureDetector gesture={panGesture}>
                <Animated.View
                    style={[
                        s.sheetContainer,
                        {
                            backgroundColor: colors.bottomSheetBg,
                        },
                        sheetAnimatedStyle,
                    ]}
                >
                    {/* Handle */}
                    <View
                        style={[
                            shared.bottomSheetHandle,
                            { marginTop: 12, marginBottom: 0 },
                        ]}
                    />

                    {/* Header */}
                    <View style={s.header}>
                        <Text style={[s.headerTitle, { color: colors.text }]}>
                            Filter Hangouts
                        </Text>
                        <TouchableOpacity
                            onPress={close}
                            style={[
                                s.closeBtn,
                                { backgroundColor: colors.surfaceTertiary },
                            ]}
                        >
                            <Ionicons
                                name='close'
                                size={18}
                                color={colors.textSecondary}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Scrollable Filter Content */}
                    <ScrollView
                        style={s.scrollContent}
                        showsVerticalScrollIndicator={false}
                        bounces={false}
                    >
                        {/* Role */}
                        <View style={s.filterSection}>
                            <Text
                                style={[
                                    s.sectionLabel,
                                    { color: colors.textSecondary },
                                ]}
                            >
                                Role
                            </Text>
                            <View style={s.chipRow}>
                                {roleOptions.map((option) => (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={[
                                            s.chip,
                                            localFilters.role === option.value
                                                ? {
                                                      backgroundColor:
                                                          colors.primary,
                                                  }
                                                : {
                                                      backgroundColor:
                                                          colors.surfaceTertiary,
                                                  },
                                        ]}
                                        onPress={() =>
                                            setLocalFilters((prev) => ({
                                                ...prev,
                                                role: option.value,
                                            }))
                                        }
                                        activeOpacity={0.7}
                                    >
                                        <Text
                                            style={[
                                                s.chipText,
                                                localFilters.role ===
                                                option.value
                                                    ? { color: '#fff' }
                                                    : {
                                                          color: colors.textSecondary,
                                                      },
                                            ]}
                                        >
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* RSVP Status */}
                        <View style={s.filterSection}>
                            <Text
                                style={[
                                    s.sectionLabel,
                                    { color: colors.textSecondary },
                                ]}
                            >
                                RSVP Status
                            </Text>
                            <View style={s.chipRow}>
                                {rsvpOptions.map((option) => (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={[
                                            s.chip,
                                            localFilters.rsvp === option.value
                                                ? {
                                                      backgroundColor:
                                                          colors.primary,
                                                  }
                                                : {
                                                      backgroundColor:
                                                          colors.surfaceTertiary,
                                                  },
                                        ]}
                                        onPress={() =>
                                            setLocalFilters((prev) => ({
                                                ...prev,
                                                rsvp: option.value,
                                            }))
                                        }
                                        activeOpacity={0.7}
                                    >
                                        <Text
                                            style={[
                                                s.chipText,
                                                localFilters.rsvp ===
                                                option.value
                                                    ? { color: '#fff' }
                                                    : {
                                                          color: colors.textSecondary,
                                                      },
                                            ]}
                                        >
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Group */}
                        {groups.length > 0 && (
                            <View style={s.filterSection}>
                                <Text
                                    style={[
                                        s.sectionLabel,
                                        { color: colors.textSecondary },
                                    ]}
                                >
                                    Group
                                </Text>
                                <View style={s.chipRow}>
                                    <TouchableOpacity
                                        style={[
                                            s.chip,
                                            localFilters.groupId === 'all'
                                                ? {
                                                      backgroundColor:
                                                          colors.primary,
                                                  }
                                                : {
                                                      backgroundColor:
                                                          colors.surfaceTertiary,
                                                  },
                                        ]}
                                        onPress={() =>
                                            setLocalFilters((prev) => ({
                                                ...prev,
                                                groupId: 'all',
                                            }))
                                        }
                                        activeOpacity={0.7}
                                    >
                                        <Text
                                            style={[
                                                s.chipText,
                                                localFilters.groupId === 'all'
                                                    ? { color: '#fff' }
                                                    : {
                                                          color: colors.textSecondary,
                                                      },
                                            ]}
                                        >
                                            All
                                        </Text>
                                    </TouchableOpacity>
                                    {groups.map((group) => (
                                        <TouchableOpacity
                                            key={group.id}
                                            style={[
                                                s.chip,
                                                localFilters.groupId ===
                                                group.id
                                                    ? {
                                                          backgroundColor:
                                                              colors.primary,
                                                      }
                                                    : {
                                                          backgroundColor:
                                                              colors.surfaceTertiary,
                                                      },
                                            ]}
                                            onPress={() =>
                                                setLocalFilters((prev) => ({
                                                    ...prev,
                                                    groupId: group.id,
                                                }))
                                            }
                                            activeOpacity={0.7}
                                        >
                                            <Text
                                                style={[
                                                    s.chipText,
                                                    localFilters.groupId ===
                                                    group.id
                                                        ? { color: '#fff' }
                                                        : {
                                                              color: colors.textSecondary,
                                                          },
                                                ]}
                                            >
                                                {group.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Date */}
                        <View style={s.filterSection}>
                            <Text
                                style={[
                                    s.sectionLabel,
                                    { color: colors.textSecondary },
                                ]}
                            >
                                Date
                            </Text>
                            <View style={s.chipRow}>
                                {dateOptions.map((option) => (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={[
                                            s.chip,
                                            localFilters.date === option.value
                                                ? {
                                                      backgroundColor:
                                                          colors.primary,
                                                  }
                                                : {
                                                      backgroundColor:
                                                          colors.surfaceTertiary,
                                                  },
                                        ]}
                                        onPress={() =>
                                            setLocalFilters((prev) => ({
                                                ...prev,
                                                date: option.value,
                                            }))
                                        }
                                        activeOpacity={0.7}
                                    >
                                        <Text
                                            style={[
                                                s.chipText,
                                                localFilters.date ===
                                                option.value
                                                    ? { color: '#fff' }
                                                    : {
                                                          color: colors.textSecondary,
                                                      },
                                            ]}
                                        >
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </ScrollView>

                    {/* Action Buttons */}
                    <View
                        style={[
                            s.actionRow,
                            { borderTopColor: colors.cardBorder },
                        ]}
                    >
                        <TouchableOpacity
                            style={[
                                s.actionBtn,
                                { backgroundColor: colors.surfaceTertiary },
                            ]}
                            onPress={handleClearAll}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    s.actionBtnText,
                                    { color: colors.textSecondary },
                                ]}
                            >
                                Clear All
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                s.actionBtn,
                                { backgroundColor: colors.primary },
                            ]}
                            onPress={handleApply}
                            activeOpacity={0.7}
                        >
                            <Text style={[s.actionBtnText, { color: '#fff' }]}>
                                Apply Filters
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </GestureDetector>
        </View>
    );
}

const s = StyleSheet.create({
    sheetContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '85%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingHorizontal: 24,
    },
    filterSection: {
        marginBottom: 24,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 12,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    chipText: {
        fontSize: 14,
        fontWeight: '600',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 24,
        paddingVertical: 16,
        paddingBottom: 32,
        borderTopWidth: 1,
    },
    actionBtn: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionBtnText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

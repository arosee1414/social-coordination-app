/**
 * Centralized theme configuration for the app.
 * All colors are defined for both light and dark mode.
 */

import { Platform } from 'react-native';

export const Colors = {
    light: {
        // Core
        text: '#11181C',
        background: '#fff',
        tint: '#007AFF',

        // Navigation
        icon: '#687076',
        tabIconDefault: '#687076',
        tabIconSelected: '#007AFF',

        // Buttons
        primary: '#007AFF',
        primaryDark: '#0066CC',
        primaryText: '#fff',

        // Blue variants (matching #007AFF primary)
        indigo50: '#EBF5FF',
        indigo100: '#DBEAFE',
        indigo500: '#3B82F6',
        indigo600: '#007AFF',
        indigoTint: 'rgba(0, 122, 255, 0.1)',
        indigoTint5: 'rgba(0, 122, 255, 0.05)',

        // Status colors
        statusGoing: '#22C55E',
        statusGoingBg: '#F0FDF4',
        statusGoingText: '#15803D',
        statusMaybe: '#EAB308',
        statusMaybeBg: '#FEFCE8',
        statusMaybeText: '#A16207',
        statusNotGoing: '#9CA3AF',
        statusNotGoingBg: '#F3F4F6',
        statusNotGoingText: '#4B5563',

        // Social buttons
        socialButtonBackground: '#fff',
        socialButtonBorder: '#ccc',
        socialButtonText: '#333',
        socialButtonIcon: '#333',

        // Inputs
        inputBackground: '#fff',
        inputBorder: '#E5E7EB',
        inputText: '#11181C',
        placeholder: '#999',

        // Links
        link: '#007AFF',

        // Feedback
        error: '#FF3B30',
        errorText: '#DC2626',

        // Separators
        separator: '#ccc',
        separatorText: 'grey',

        // Surfaces
        card: '#fff',
        cardBorder: '#F3F4F6',
        cardBorderHeavy: '#E5E7EB',
        surfaceSecondary: '#F9FAFB',
        surfaceTertiary: '#F3F4F6',

        // Text variants
        subtitle: '#6B7280',
        textSecondary: '#4B5563',
        textTertiary: '#9CA3AF',

        // Gradient substitutes (solid)
        gradientFrom: '#007AFF',
        gradientTo: '#3B82F6',

        // Badge
        badgeRed: '#EF4444',
        badgeRedText: '#fff',

        // Notification
        unreadBg: 'rgba(0, 122, 255, 0.05)',
        unreadDot: '#007AFF',

        // Live badge
        liveBadgeBg: 'rgba(255, 255, 255, 0.25)',
        livePulse: '#EF4444',

        // Reminder banner
        reminderBg: '#FFFBEB',
        reminderBorder: '#FDE68A',
        reminderText: '#92400E',
        reminderSubtext: '#A16207',

        // FAB
        fabShadow: 'rgba(0, 122, 255, 0.3)',

        // Overlay & bottom sheet
        overlayBg: 'rgba(0, 0, 0, 0.4)',
        bottomSheetBg: '#fff',
        bottomSheetHandle: '#D1D5DB',
    },
    dark: {
        // Core
        text: '#ECEDEE',
        background: '#151718',
        tint: '#0A84FF',

        // Navigation
        icon: '#9BA1A6',
        tabIconDefault: '#9BA1A6',
        tabIconSelected: '#0A84FF',

        // Buttons
        primary: '#007AFF',
        primaryDark: '#0066CC',
        primaryText: '#fff',

        // Blue variants (matching #007AFF primary)
        indigo50: 'rgba(0, 122, 255, 0.1)',
        indigo100: 'rgba(0, 122, 255, 0.15)',
        indigo500: '#0A84FF',
        indigo600: '#007AFF',
        indigoTint: 'rgba(0, 122, 255, 0.15)',
        indigoTint5: 'rgba(0, 122, 255, 0.08)',

        // Status colors
        statusGoing: '#22C55E',
        statusGoingBg: 'rgba(34, 197, 94, 0.15)',
        statusGoingText: '#4ADE80',
        statusMaybe: '#EAB308',
        statusMaybeBg: 'rgba(234, 179, 8, 0.15)',
        statusMaybeText: '#FACC15',
        statusNotGoing: '#6B7280',
        statusNotGoingBg: 'rgba(107, 114, 128, 0.15)',
        statusNotGoingText: '#9CA3AF',

        // Social buttons
        socialButtonBackground: '#2C2C2E',
        socialButtonBorder: '#3A3A3C',
        socialButtonText: '#ECEDEE',
        socialButtonIcon: '#ECEDEE',

        // Inputs
        inputBackground: '#2C2C2E',
        inputBorder: '#3A3A3C',
        inputText: '#ECEDEE',
        placeholder: '#6C6C70',

        // Links
        link: '#0A84FF',

        // Feedback
        error: '#FF453A',
        errorText: '#FF453A',

        // Separators
        separator: '#3A3A3C',
        separatorText: '#8E8E93',

        // Surfaces
        card: '#1C1C1E',
        cardBorder: '#2C2C2E',
        cardBorderHeavy: '#3A3A3C',
        surfaceSecondary: '#1C1C1E',
        surfaceTertiary: '#2C2C2E',

        // Text variants
        subtitle: '#8E8E93',
        textSecondary: '#9BA1A6',
        textTertiary: '#6C6C70',

        // Gradient substitutes (solid)
        gradientFrom: '#007AFF',
        gradientTo: '#0A84FF',

        // Badge
        badgeRed: '#EF4444',
        badgeRedText: '#fff',

        // Notification
        unreadBg: 'rgba(0, 122, 255, 0.1)',
        unreadDot: '#0A84FF',

        // Live badge
        liveBadgeBg: 'rgba(255, 255, 255, 0.2)',
        livePulse: '#F87171',

        // Reminder banner
        reminderBg: 'rgba(234, 179, 8, 0.12)',
        reminderBorder: 'rgba(234, 179, 8, 0.3)',
        reminderText: '#FBBF24',
        reminderSubtext: '#FCD34D',

        // FAB
        fabShadow: 'rgba(0, 122, 255, 0.15)',

        // Overlay & bottom sheet
        overlayBg: 'rgba(0, 0, 0, 0.6)',
        bottomSheetBg: '#1C1C1E',
        bottomSheetHandle: '#48484A',
    },
};

export type ThemeColors = (typeof Colors)['light'];

export const Fonts = Platform.select({
    ios: {
        sans: 'system-ui',
        serif: 'ui-serif',
        rounded: 'ui-rounded',
        mono: 'ui-monospace',
    },
    default: {
        sans: 'normal',
        serif: 'serif',
        rounded: 'normal',
        mono: 'monospace',
    },
    web: {
        sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        serif: "Georgia, 'Times New Roman', serif",
        rounded:
            "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
        mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    },
});
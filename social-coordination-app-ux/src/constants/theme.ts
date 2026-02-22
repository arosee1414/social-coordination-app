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
        tint: '#4F46E5',

        // Navigation
        icon: '#687076',
        tabIconDefault: '#687076',
        tabIconSelected: '#4F46E5',

        // Buttons
        primary: '#4F46E5',
        primaryDark: '#4338CA',
        primaryText: '#fff',

        // Indigo variants
        indigo50: '#EEF2FF',
        indigo100: '#E0E7FF',
        indigo500: '#6366F1',
        indigo600: '#4F46E5',
        indigoTint: 'rgba(79, 70, 229, 0.1)',
        indigoTint5: 'rgba(79, 70, 229, 0.05)',

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
        link: '#4F46E5',

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
        gradientFrom: '#4F46E5',
        gradientTo: '#6366F1',

        // Badge
        badgeRed: '#EF4444',
        badgeRedText: '#fff',

        // Notification
        unreadBg: 'rgba(79, 70, 229, 0.05)',
        unreadDot: '#4F46E5',
    },
    dark: {
        // Core
        text: '#ECEDEE',
        background: '#151718',
        tint: '#818CF8',

        // Navigation
        icon: '#9BA1A6',
        tabIconDefault: '#9BA1A6',
        tabIconSelected: '#818CF8',

        // Buttons
        primary: '#6366F1',
        primaryDark: '#4F46E5',
        primaryText: '#fff',

        // Indigo variants
        indigo50: 'rgba(99, 102, 241, 0.1)',
        indigo100: 'rgba(99, 102, 241, 0.15)',
        indigo500: '#818CF8',
        indigo600: '#6366F1',
        indigoTint: 'rgba(99, 102, 241, 0.15)',
        indigoTint5: 'rgba(99, 102, 241, 0.08)',

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
        link: '#818CF8',

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
        gradientFrom: '#6366F1',
        gradientTo: '#818CF8',

        // Badge
        badgeRed: '#EF4444',
        badgeRedText: '#fff',

        // Notification
        unreadBg: 'rgba(99, 102, 241, 0.1)',
        unreadDot: '#818CF8',
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
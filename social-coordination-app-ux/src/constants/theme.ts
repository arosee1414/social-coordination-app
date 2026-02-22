/**
 * Centralized theme configuration for the app.
 * All colors are defined for both light and dark mode.
 * When you settle on a design, just update these values.
 */

import { Platform } from 'react-native';

export const Colors = {
    light: {
        // Core
        text: '#11181C',
        background: '#fff',
        tint: '#0a7ea4',

        // Navigation
        icon: '#687076',
        tabIconDefault: '#687076',
        tabIconSelected: '#0a7ea4',

        // Buttons
        primary: '#007AFF',
        primaryText: '#fff',

        // Social buttons
        socialButtonBackground: '#fff',
        socialButtonBorder: '#ccc',
        socialButtonText: '#333',
        socialButtonIcon: '#333',

        // Inputs
        inputBackground: '#fff',
        inputBorder: '#ccc',
        inputText: '#11181C',
        placeholder: '#999',

        // Links
        link: '#007AFF',

        // Feedback
        error: '#FF3B30',

        // Separators
        separator: '#ccc',
        separatorText: 'grey',

        // Surfaces
        card: '#f5f5f5',
    },
    dark: {
        // Core
        text: '#ECEDEE',
        background: '#151718',
        tint: '#fff',

        // Navigation
        icon: '#9BA1A6',
        tabIconDefault: '#9BA1A6',
        tabIconSelected: '#fff',

        // Buttons
        primary: '#0A84FF',
        primaryText: '#fff',

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

        // Separators
        separator: '#3A3A3C',
        separatorText: '#8E8E93',

        // Surfaces
        card: '#1C1C1E',
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
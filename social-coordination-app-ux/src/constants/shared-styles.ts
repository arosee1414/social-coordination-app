import { StyleSheet } from 'react-native';
import { ThemeColors } from './theme';

/**
 * Creates a set of reusable styles based on the current theme colors.
 * Use with useThemeColors():
 *
 *   const colors = useThemeColors();
 *   const styles = createSharedStyles(colors);
 */
export function createSharedStyles(colors: ThemeColors) {
    return StyleSheet.create({
        // Containers
        container: {
            flex: 1,
            padding: 24,
            backgroundColor: colors.background,
        },
        centeredContainer: {
            flex: 1,
            padding: 24,
            backgroundColor: colors.background,
            alignItems: 'center',
        },

        // Typography
        title: {
            fontSize: 32,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 8,
        },
        subtitle: {
            fontSize: 16,
            color: colors.separatorText,
            marginBottom: 30,
        },

        // Inputs
        input: {
            width: '100%',
            height: 50,
            borderWidth: 1,
            borderColor: colors.inputBorder,
            backgroundColor: colors.inputBackground,
            color: colors.inputText,
            borderRadius: 8,
            paddingHorizontal: 16,
            fontSize: 16,
            marginBottom: 16,
        },

        // Primary button
        primaryBtn: {
            width: '100%',
            height: 50,
            backgroundColor: colors.primary,
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
        },
        primaryBtnText: {
            color: colors.primaryText,
            fontSize: 16,
            fontWeight: '600',
        },

        // Social button
        socialBtn: {
            width: '100%',
            height: 50,
            borderWidth: 1,
            borderColor: colors.socialButtonBorder,
            backgroundColor: colors.socialButtonBackground,
            borderRadius: 8,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 12,
        },
        socialBtnText: {
            fontSize: 16,
            fontWeight: '500',
            color: colors.socialButtonText,
        },

        // Links
        linkText: {
            color: colors.link,
            fontSize: 14,
            textDecorationLine: 'underline',
        },

        // Error
        errorText: {
            color: colors.error,
            marginTop: 10,
            textAlign: 'center',
        },

        // Separators
        separatorView: {
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 24,
            width: '100%',
        },
        separator: {
            flex: 1,
            borderBottomColor: colors.separator,
            borderBottomWidth: 1,
        },
        separatorText: {
            marginHorizontal: 8,
            color: colors.separatorText,
        },
    });
}
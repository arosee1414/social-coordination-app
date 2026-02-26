import { Colors, ThemeColors } from '@/src/constants/theme';
import { useThemeContext } from '@/src/contexts/ThemeContext';

/**
 * Returns the color palette for the current effective color scheme (light or dark).
 * Respects the user's manual theme preference from ThemeContext.
 *
 * Example:
 *   const colors = useThemeColors();
 *   <Text style={{ color: colors.text }}>Hello</Text>
 */
export function useThemeColors(): ThemeColors {
    const { effectiveScheme } = useThemeContext();
    return Colors[effectiveScheme];
}
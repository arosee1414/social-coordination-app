import { Colors, ThemeColors } from '@/src/constants/theme';
import { useColorScheme } from '@/src/hooks/use-color-scheme';

/**
 * Returns the color palette for the current color scheme (light or dark).
 * Use this in any component to get theme-aware colors.
 *
 * Example:
 *   const colors = useThemeColors();
 *   <Text style={{ color: colors.text }}>Hello</Text>
 */
export function useThemeColors(): ThemeColors {
    const colorScheme = useColorScheme();
    return Colors[colorScheme ?? 'light'];
}
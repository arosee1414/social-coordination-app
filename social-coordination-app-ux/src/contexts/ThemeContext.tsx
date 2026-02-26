import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import { useColorScheme as useSystemColorScheme, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export type ThemePreference = 'system' | 'light' | 'dark';
export type EffectiveScheme = 'light' | 'dark';

interface ThemeContextValue {
    /** The user's stored preference: system, light, or dark */
    themePreference: ThemePreference;
    /** The resolved scheme after applying the preference */
    effectiveScheme: EffectiveScheme;
    /** Update and persist the preference */
    setThemePreference: (pref: ThemePreference) => void;
    /** Whether the preference has been loaded from storage */
    isLoaded: boolean;
}

const STORAGE_KEY = '@theme_preference';

const ThemeContext = createContext<ThemeContextValue>({
    themePreference: 'system',
    effectiveScheme: 'light',
    setThemePreference: () => {},
    isLoaded: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemScheme = useSystemColorScheme();
    const [themePreference, setThemePreferenceState] =
        useState<ThemePreference>('system');
    const [isLoaded, setIsLoaded] = useState(false);

    // Load persisted preference on mount
    useEffect(() => {
        if (Platform.OS === 'web') {
            setIsLoaded(true);
            return;
        }
        SecureStore.getItemAsync(STORAGE_KEY)
            .then((value) => {
                if (
                    value === 'light' ||
                    value === 'dark' ||
                    value === 'system'
                ) {
                    setThemePreferenceState(value);
                }
            })
            .catch(() => {})
            .finally(() => setIsLoaded(true));
    }, []);

    const setThemePreference = useCallback((pref: ThemePreference) => {
        setThemePreferenceState(pref);
        if (Platform.OS !== 'web') {
            SecureStore.setItemAsync(STORAGE_KEY, pref).catch(() => {});
        }
    }, []);

    const effectiveScheme: EffectiveScheme =
        themePreference === 'system'
            ? (systemScheme ?? 'light')
            : themePreference;

    return (
        <ThemeContext.Provider
            value={{
                themePreference,
                effectiveScheme,
                setThemePreference,
                isLoaded,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

/**
 * Access the theme context from any component.
 */
export function useThemeContext(): ThemeContextValue {
    return useContext(ThemeContext);
}

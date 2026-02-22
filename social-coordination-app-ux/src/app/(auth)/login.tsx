import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/src/hooks/useThemeColors';

export default function LoginPage() {
    const router = useRouter();
    const colors = useThemeColors();

    return (
        <View
            style={[
                styles.gradientBg,
                { backgroundColor: colors.gradientFrom },
            ]}
        >
            <SafeAreaView style={styles.safeArea}>
                {/* Top spacer + branding */}
                <View style={styles.brandingContainer}>
                    {/* App icon */}
                    <View style={styles.iconWrapper}>
                        <View style={styles.appIcon}>
                            <Ionicons
                                name='people'
                                size={48}
                                color={colors.primary}
                            />
                        </View>
                        <Text style={styles.sparkle}>✨</Text>
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>Hangout</Text>
                    <Text style={styles.subtitle}>
                        Plan spontaneous meetups and{'\n'}manage recurring
                        social groups
                    </Text>
                </View>

                {/* CTA buttons */}
                <View style={styles.ctaContainer}>
                    <TouchableOpacity
                        style={styles.createAccountBtn}
                        onPress={() => router.push('/sign-up')}
                        activeOpacity={0.9}
                    >
                        <Text
                            style={[
                                styles.createAccountText,
                                { color: colors.primary },
                            ]}
                        >
                            Create Account
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.signInBtn}
                        onPress={() => router.push('/sign-in')}
                        activeOpacity={0.9}
                    >
                        <Text style={styles.signInText}>Sign In</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    gradientBg: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        paddingHorizontal: 24,
    },
    brandingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconWrapper: {
        marginBottom: 32,
        position: 'relative',
    },
    appIcon: {
        width: 96,
        height: 96,
        backgroundColor: '#fff',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    sparkle: {
        position: 'absolute',
        top: -8,
        right: -8,
        fontSize: 28,
    },
    title: {
        fontFamily: 'Pacifico_400Regular',
        fontSize: 52,
        color: '#fff',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.85)',
        textAlign: 'center',
        lineHeight: 26,
    },
    ctaContainer: {
        paddingBottom: 32,
        gap: 12,
    },
    createAccountBtn: {
        width: '100%',
        height: 56,
        backgroundColor: '#fff',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 4,
    },
    createAccountText: {
        fontSize: 18,
        fontWeight: '600',
    },
    signInBtn: {
        width: '100%',
        height: 56,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signInText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
});

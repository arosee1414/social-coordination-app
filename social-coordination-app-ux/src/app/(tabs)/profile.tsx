import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useClerk } from '@clerk/clerk-expo';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { createSharedStyles } from '@/src/constants/shared-styles';
import { profileStats, settingsSections } from '@/src/data/mock-data';

export default function ProfileScreen() {
    const colors = useThemeColors();
    const shared = createSharedStyles(colors);
    const router = useRouter();
    const { signOut } = useClerk();

    const handleSignOut = async () => {
        await signOut();
        router.replace('/');
    };

    return (
        <SafeAreaView style={shared.screenContainer}>
            <ScrollView style={{ flex: 1 }}>
                {/* Profile Header Card */}
                <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}>
                    <View style={[s.profileCard, { backgroundColor: colors.primary }]}>
                        <View style={s.avatarRow}>
                            <View style={s.avatar}>
                                <Text style={{ fontSize: 32 }}>👤</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={s.profileName}>Your Name</Text>
                                <Text style={s.profileEmail}>user@example.com</Text>
                            </View>
                        </View>
                        {/* Stats */}
                        <View style={s.statsRow}>
                            {profileStats.map((stat, index) => (
                                <View key={index} style={s.statItem}>
                                    <Text style={s.statValue}>{stat.value}</Text>
                                    <Text style={s.statLabel}>{stat.label}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Settings Sections */}
                <View style={{ paddingHorizontal: 24, gap: 24, paddingBottom: 24 }}>
                    {settingsSections.map((section, sIdx) => (
                        <View key={sIdx}>
                            <Text style={[shared.sectionLabel, { textTransform: 'uppercase' }]}>
                                {section.title}
                            </Text>
                            <View style={[s.settingsCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                                {section.items.map((item, iIdx) => (
                                    <TouchableOpacity
                                        key={iIdx}
                                        style={[
                                            s.settingsItem,
                                            iIdx < section.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
                                        ]}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[s.settingsIcon, { backgroundColor: colors.surfaceTertiary }]}>
                                            <Ionicons
                                                name={item.iconName as any}
                                                size={20}
                                                color={colors.primary}
                                            />
                                        </View>
                                        <Text style={[s.settingsLabel, { color: colors.text }]}>{item.label}</Text>
                                        <Ionicons name='chevron-forward' size={20} color={colors.textTertiary} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    ))}

                    {/* Sign Out */}
                    <TouchableOpacity
                        style={[s.signOutBtn, { backgroundColor: colors.surfaceTertiary }]}
                        onPress={handleSignOut}
                        activeOpacity={0.7}
                    >
                        <Ionicons name='log-out-outline' size={20} color={colors.errorText} />
                        <Text style={[s.signOutText, { color: colors.errorText }]}>Sign Out</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    profileCard: {
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 3,
    },
    avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileName: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 2 },
    profileEmail: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
    statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
    statItem: { alignItems: 'center' },
    statValue: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
    settingsCard: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
    settingsItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
    settingsIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    settingsLabel: { flex: 1, fontSize: 16, fontWeight: '500' },
    signOutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 12,
    },
    signOutText: { fontSize: 16, fontWeight: '600' },
});
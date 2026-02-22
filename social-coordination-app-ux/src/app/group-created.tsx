import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { createSharedStyles } from '@/src/constants/shared-styles';

export default function GroupCreatedScreen() {
    const colors = useThemeColors();
    const shared = createSharedStyles(colors);
    const router = useRouter();

    return (
        <SafeAreaView style={[shared.screenContainer, { justifyContent: 'center', alignItems: 'center' }]}>
            <View style={s.content}>
                {/* Success Icon */}
                <View style={[s.iconCircle, { backgroundColor: colors.statusGoingBg }]}>
                    <View style={[s.iconInner, { backgroundColor: colors.statusGoing }]}>
                        <Ionicons name='checkmark' size={48} color='#fff' />
                    </View>
                </View>

                <Text style={[s.title, { color: colors.text }]}>Group Created!</Text>
                <Text style={[s.subtitle, { color: colors.subtitle }]}>
                    Your group has been created successfully. You can now invite this group to hangouts.
                </Text>

                {/* Actions */}
                <View style={s.actions}>
                    <TouchableOpacity
                        style={shared.primaryBtnLarge}
                        onPress={() => router.push('/create-hangout')}
                    >
                        <Text style={shared.primaryBtnLargeText}>Create a Hangout</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[s.secondaryBtn, { borderColor: colors.cardBorderHeavy }]}
                        onPress={() => router.replace('/(tabs)/groups' as any)}
                    >
                        <Text style={[s.secondaryBtnText, { color: colors.text }]}>Go to Groups</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    content: { alignItems: 'center', paddingHorizontal: 32 },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    iconInner: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
    subtitle: { fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 40, maxWidth: 300 },
    actions: { width: '100%', gap: 12 },
    secondaryBtn: {
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
    },
    secondaryBtnText: { fontSize: 16, fontWeight: '600' },
});
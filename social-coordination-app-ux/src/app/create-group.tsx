import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { createSharedStyles } from '@/src/constants/shared-styles';
import { emojiOptions } from '@/src/data/mock-data';

export default function CreateGroupScreen() {
    const colors = useThemeColors();
    const shared = createSharedStyles(colors);
    const router = useRouter();
    const [name, setName] = useState('');
    const [selectedEmoji, setSelectedEmoji] = useState('💜');

    return (
        <SafeAreaView style={shared.screenContainer}>
            {/* Header */}
            <View style={shared.stackHeader}>
                <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                    <Ionicons name='arrow-back' size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[s.headerTitle, { color: colors.text }]}>Create Group</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Content */}
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 24 }}>
                <View style={{ gap: 24 }}>
                    {/* Info */}
                    <View style={shared.infoCard}>
                        <Text style={[s.infoText, { color: colors.textSecondary }]}>
                            Groups are saved friend lists that make inviting people to hangouts faster. They're not recurring events.
                        </Text>
                    </View>

                    {/* Icon Selection */}
                    <View>
                        <Text style={shared.formLabel}>Choose an Icon</Text>
                        <View style={s.emojiGrid}>
                            {emojiOptions.map((emoji) => (
                                <TouchableOpacity
                                    key={emoji}
                                    style={[
                                        s.emojiBtn,
                                        {
                                            borderColor: selectedEmoji === emoji ? colors.primary : colors.cardBorderHeavy,
                                            backgroundColor: selectedEmoji === emoji ? colors.indigoTint5 : 'transparent',
                                        },
                                        selectedEmoji === emoji && { transform: [{ scale: 1.1 }] },
                                    ]}
                                    onPress={() => setSelectedEmoji(emoji)}
                                >
                                    <Text style={{ fontSize: 24 }}>{emoji}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Group Name */}
                    <View>
                        <Text style={shared.formLabel}>Group Name *</Text>
                        <TextInput
                            style={[shared.formInput, { color: colors.inputText }]}
                            placeholder='e.g., Close Friends, Basketball Crew'
                            placeholderTextColor={colors.placeholder}
                            value={name}
                            onChangeText={setName}
                        />
                    </View>
                </View>
            </ScrollView>

            {/* Bottom CTA */}
            <View style={shared.bottomCTA}>
                <TouchableOpacity
                    style={[shared.primaryBtnLarge, !name && { opacity: 0.5 }]}
                    onPress={() => router.push('/add-members')}
                    disabled={!name}
                >
                    <Text style={shared.primaryBtnLargeText}>Continue to Add Members</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    backBtn: { padding: 8, marginLeft: -8 },
    headerTitle: { fontSize: 18, fontWeight: '600' },
    infoText: { fontSize: 14, lineHeight: 20 },
    emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    emojiBtn: {
        width: 56,
        height: 56,
        borderRadius: 12,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
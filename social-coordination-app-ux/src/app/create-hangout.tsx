import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { createSharedStyles } from '@/src/constants/shared-styles';
import { useApiClient } from '@/src/hooks/useApiClient';
import { CreateHangoutRequest } from '@/src/clients/generatedClient';
import { Alert } from 'react-native';

export default function CreateHangoutScreen() {
    const colors = useThemeColors();
    const shared = createSharedStyles(colors);
    const router = useRouter();
    const api = useApiClient();
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleCreate = async () => {
        try {
            setSubmitting(true);
            const req = new CreateHangoutRequest();
            req.title = title;
            req.location = location || undefined;
            req.description = description || undefined;
            req.startTime = new Date(Date.now() + 60 * 60 * 1000); // default: 1 hour from now
            await api.hangoutsPOST(req);
            router.back();
        } catch (err: any) {
            Alert.alert('Error', err?.message ?? 'Failed to create hangout');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={shared.screenContainer}>
            {/* Header */}
            <View style={shared.stackHeader}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={s.backBtn}
                >
                    <Ionicons name='arrow-back' size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[s.headerTitle, { color: colors.text }]}>
                    Create Hangout
                </Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Content */}
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                    paddingHorizontal: 24,
                    paddingVertical: 24,
                }}
            >
                <View style={{ gap: 24 }}>
                    {/* Info Card */}
                    <View style={shared.infoCard}>
                        <Ionicons
                            name='information-circle-outline'
                            size={22}
                            color={colors.primary}
                        />
                        <Text
                            style={[
                                s.infoText,
                                { color: colors.textSecondary },
                            ]}
                        >
                            Hangouts are one-time plans with friends. Set the
                            details and invite people or groups.
                        </Text>
                    </View>

                    {/* Title */}
                    <View>
                        <Text style={shared.formLabel}>Hangout Title *</Text>
                        <TextInput
                            style={[
                                shared.formInput,
                                { color: colors.inputText },
                            ]}
                            placeholder='e.g., Drinks at The Rooftop'
                            placeholderTextColor={colors.placeholder}
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>

                    {/* Date */}
                    <View>
                        <Text style={shared.formLabel}>Date & Time</Text>
                        <TouchableOpacity
                            style={[
                                s.pickerBtn,
                                {
                                    borderColor: colors.cardBorderHeavy,
                                    backgroundColor: colors.inputBackground,
                                },
                            ]}
                        >
                            <Ionicons
                                name='calendar-outline'
                                size={20}
                                color={colors.subtitle}
                            />
                            <Text
                                style={[
                                    s.pickerText,
                                    { color: colors.subtitle },
                                ]}
                            >
                                Select date and time
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Location */}
                    <View>
                        <Text style={shared.formLabel}>
                            Location (optional)
                        </Text>
                        <TextInput
                            style={[
                                shared.formInput,
                                { color: colors.inputText },
                            ]}
                            placeholder='e.g., The Rooftop Bar, 123 Main St'
                            placeholderTextColor={colors.placeholder}
                            value={location}
                            onChangeText={setLocation}
                        />
                    </View>

                    {/* Note */}
                    <View>
                        <Text style={shared.formLabel}>Note (optional)</Text>
                        <TextInput
                            style={[
                                shared.formInput,
                                {
                                    color: colors.inputText,
                                    height: 100,
                                    textAlignVertical: 'top',
                                    paddingTop: 14,
                                },
                            ]}
                            placeholder='Add any details for your friends...'
                            placeholderTextColor={colors.placeholder}
                            multiline
                            value={description}
                            onChangeText={setDescription}
                        />
                    </View>
                </View>
            </ScrollView>

            {/* Bottom CTA */}
            <View style={shared.bottomCTA}>
                <TouchableOpacity
                    style={[
                        shared.primaryBtnLarge,
                        (!title || submitting) && { opacity: 0.5 },
                    ]}
                    onPress={handleCreate}
                    disabled={!title || submitting}
                >
                    <Text style={shared.primaryBtnLargeText}>
                        {submitting ? 'Creating...' : 'Create Hangout'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    backBtn: { padding: 8, marginLeft: -8 },
    headerTitle: { fontSize: 18, fontWeight: '600' },
    infoText: { fontSize: 14, flex: 1, lineHeight: 20 },
    pickerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        height: 52,
        borderWidth: 2,
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    pickerText: { fontSize: 16 },
});

import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { createSharedStyles } from '@/src/constants/shared-styles';

export default function CreateHangoutScreen() {
    const colors = useThemeColors();
    const shared = createSharedStyles(colors);
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');

    const handleContinue = () => {
        router.push('/invite-selection' as any);
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

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={0}
            >
                {/* Content */}
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{
                        paddingHorizontal: 24,
                        paddingVertical: 24,
                    }}
                >
                    <View style={{ gap: 24 }}>
                        {/* Title */}
                        <View>
                            <Text style={shared.formLabel}>
                                Hangout Title *
                            </Text>
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
                            <Text style={shared.formLabel}>
                                Note (optional)
                            </Text>
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

                        {/* Next: Invite friends info card */}
                        <View style={shared.infoCard}>
                            <Ionicons
                                name='people-outline'
                                size={22}
                                color={colors.primary}
                                style={{ marginTop: 2 }}
                            />
                            <View style={{ flex: 1 }}>
                                <Text
                                    style={[
                                        s.infoCardTitle,
                                        { color: colors.text },
                                    ]}
                                >
                                    Next: Invite friends
                                </Text>
                                <Text
                                    style={[
                                        s.infoCardSubtitle,
                                        { color: colors.textSecondary },
                                    ]}
                                >
                                    You&apos;ll be able to invite individual
                                    friends or entire groups on the next screen
                                </Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>

                {/* Bottom CTA */}
                <View style={shared.bottomCTA}>
                    <TouchableOpacity
                        style={[
                            shared.primaryBtnLarge,
                            !title && { opacity: 0.5 },
                        ]}
                        onPress={handleContinue}
                        disabled={!title}
                    >
                        <Text style={shared.primaryBtnLargeText}>
                            Continue to Invite
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    backBtn: { padding: 8, marginLeft: -8 },
    headerTitle: { fontSize: 18, fontWeight: '600' },
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
    infoCardTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    infoCardSubtitle: {
        fontSize: 14,
        lineHeight: 20,
    },
});

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
    Modal,
    Pressable,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, {
    DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { createSharedStyles } from '@/src/constants/shared-styles';

/** Duration options: null = "No set duration", numbers = hours */
const DURATION_OPTIONS: { value: number | null; label: string }[] = [
    { value: null, label: 'No set duration' },
    ...Array.from({ length: 96 }, (_, i) => {
        const hours = (i + 1) * 0.25;
        return { value: hours, label: formatDuration(hours) };
    }),
];

/** Convert fractional hours to a human-readable label */
function formatDuration(hours: number): string {
    const totalMinutes = Math.round(hours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
}

export default function CreateHangoutScreen() {
    const colors = useThemeColors();
    const shared = createSharedStyles(colors);
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');

    // Date & time picker state
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    // Temp values for iOS modal spinner — only committed on "Done"
    const [tempDate, setTempDate] = useState(new Date());
    const [tempTime, setTempTime] = useState(new Date());

    // Duration picker state
    const [selectedDuration, setSelectedDuration] = useState<number | null>(
        null,
    );
    const [showDurationPicker, setShowDurationPicker] = useState(false);
    const [tempDuration, setTempDuration] = useState<number | null>(null);

    const openDurationPicker = () => {
        setTempDuration(selectedDuration);
        setShowDurationPicker(true);
    };

    const confirmDuration = () => {
        setSelectedDuration(tempDuration);
        setShowDurationPicker(false);
    };

    const cancelDuration = () => {
        setShowDurationPicker(false);
    };

    /** Compute endTime from selectedDate + selectedTime + selectedDuration */
    const computeEndTime = (): Date | null => {
        if (selectedDuration === null) return null; // backend defaults to +8h
        if (!selectedDate || !selectedTime) return null;
        const start = new Date(selectedDate);
        start.setHours(
            selectedTime.getHours(),
            selectedTime.getMinutes(),
            0,
            0,
        );
        return new Date(start.getTime() + selectedDuration * 60 * 60 * 1000);
    };

    const openDatePicker = () => {
        setShowTimePicker(false);
        setTempDate(selectedDate || new Date());
        setShowDatePicker(true);
    };

    const openTimePicker = () => {
        setShowDatePicker(false);
        setTempTime(selectedTime || new Date());
        setShowTimePicker(true);
    };

    // Android fires onChange once with 'set' or 'dismissed'
    const handleDateChangeAndroid = (
        event: DateTimePickerEvent,
        date?: Date,
    ) => {
        setShowDatePicker(false);
        if (event.type === 'set' && date) {
            setSelectedDate(date);
        }
    };

    const handleTimeChangeAndroid = (
        event: DateTimePickerEvent,
        date?: Date,
    ) => {
        setShowTimePicker(false);
        if (event.type === 'set' && date) {
            setSelectedTime(date);
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    // Check if the selected date is today
    const isSelectedDateToday = (() => {
        if (!selectedDate) return true; // default to restricting if no date yet
        const now = new Date();
        return (
            selectedDate.getFullYear() === now.getFullYear() &&
            selectedDate.getMonth() === now.getMonth() &&
            selectedDate.getDate() === now.getDate()
        );
    })();

    const canContinue = title && selectedDate && selectedTime;

    const handleContinue = () => {
        // Build startTime from selectedDate + selectedTime
        const start = new Date(selectedDate!);
        start.setHours(
            selectedTime!.getHours(),
            selectedTime!.getMinutes(),
            0,
            0,
        );
        const endTime = computeEndTime();

        const params: Record<string, string> = {
            title,
            startTime: start.toISOString(),
        };
        if (description) params.description = description;
        if (location) params.location = location;
        if (endTime) params.endTime = endTime.toISOString();

        router.push({
            pathname: '/invite-selection',
            params,
        } as any);
    };

    // iOS picker modal helper
    const renderIOSPickerModal = (
        visible: boolean,
        mode: 'date' | 'time',
        value: Date,
        onValueChange: (d: Date) => void,
        onDone: () => void,
        onCancel: () => void,
        minDate?: Date,
    ) => (
        <Modal visible={visible} transparent animationType='fade'>
            <Pressable style={s.modalOverlay} onPress={onCancel}>
                <Pressable
                    style={[
                        s.modalContent,
                        { backgroundColor: colors.background },
                    ]}
                    onPress={(e) => e.stopPropagation()}
                >
                    <View style={s.modalHeader}>
                        <TouchableOpacity onPress={onCancel}>
                            <Text
                                style={[
                                    s.modalBtn,
                                    { color: colors.textSecondary },
                                ]}
                            >
                                Cancel
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onDone}>
                            <Text
                                style={[s.modalBtn, { color: colors.primary }]}
                            >
                                Done
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <DateTimePicker
                        value={value}
                        mode={mode}
                        display='spinner'
                        minimumDate={minDate}
                        onChange={(_e, d) => {
                            if (d) onValueChange(d);
                        }}
                        textColor={colors.text}
                        style={{ width: '100%' }}
                    />
                </Pressable>
            </Pressable>
        </Modal>
    );

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

                        {/* Date & Time — two columns */}
                        <View style={s.dateTimeRow}>
                            {/* Date */}
                            <View style={{ flex: 1 }}>
                                <Text style={shared.formLabel}>Date *</Text>
                                <TouchableOpacity
                                    style={[
                                        s.pickerBtn,
                                        {
                                            borderColor: colors.cardBorderHeavy,
                                            backgroundColor:
                                                colors.inputBackground,
                                        },
                                    ]}
                                    onPress={openDatePicker}
                                >
                                    <Ionicons
                                        name='calendar-outline'
                                        size={20}
                                        color={
                                            selectedDate
                                                ? colors.text
                                                : colors.subtitle
                                        }
                                    />
                                    <Text
                                        style={[
                                            s.pickerText,
                                            {
                                                color: selectedDate
                                                    ? colors.text
                                                    : colors.subtitle,
                                            },
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {selectedDate
                                            ? formatDate(selectedDate)
                                            : 'Select date'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Time */}
                            <View style={{ flex: 1 }}>
                                <Text style={shared.formLabel}>Time *</Text>
                                <TouchableOpacity
                                    style={[
                                        s.pickerBtn,
                                        {
                                            borderColor: colors.cardBorderHeavy,
                                            backgroundColor:
                                                colors.inputBackground,
                                        },
                                    ]}
                                    onPress={openTimePicker}
                                >
                                    <Ionicons
                                        name='time-outline'
                                        size={20}
                                        color={
                                            selectedTime
                                                ? colors.text
                                                : colors.subtitle
                                        }
                                    />
                                    <Text
                                        style={[
                                            s.pickerText,
                                            {
                                                color: selectedTime
                                                    ? colors.text
                                                    : colors.subtitle,
                                            },
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {selectedTime
                                            ? formatTime(selectedTime)
                                            : 'Select time'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Android pickers — rendered inline, auto-dismiss */}
                        {Platform.OS === 'android' && showDatePicker && (
                            <DateTimePicker
                                value={selectedDate || new Date()}
                                mode='date'
                                display='default'
                                minimumDate={new Date()}
                                onChange={handleDateChangeAndroid}
                            />
                        )}
                        {Platform.OS === 'android' && showTimePicker && (
                            <DateTimePicker
                                value={selectedTime || new Date()}
                                mode='time'
                                display='default'
                                minimumDate={
                                    isSelectedDateToday ? new Date() : undefined
                                }
                                onChange={handleTimeChangeAndroid}
                            />
                        )}

                        {/* Duration (Optional) */}
                        <View>
                            <Text style={shared.formLabel}>
                                Duration (optional)
                            </Text>
                            <TouchableOpacity
                                style={[
                                    s.pickerBtn,
                                    {
                                        borderColor: colors.cardBorderHeavy,
                                        backgroundColor: colors.inputBackground,
                                    },
                                ]}
                                onPress={openDurationPicker}
                            >
                                <Ionicons
                                    name='hourglass-outline'
                                    size={20}
                                    color={
                                        selectedDuration !== null
                                            ? colors.text
                                            : colors.subtitle
                                    }
                                />
                                <Text
                                    style={[
                                        s.pickerText,
                                        {
                                            color:
                                                selectedDuration !== null
                                                    ? colors.text
                                                    : colors.subtitle,
                                        },
                                    ]}
                                    numberOfLines={1}
                                >
                                    {selectedDuration !== null
                                        ? formatDuration(selectedDuration)
                                        : 'No set duration'}
                                </Text>
                            </TouchableOpacity>
                            <Text
                                style={[
                                    s.durationHelperText,
                                    { color: colors.textSecondary },
                                ]}
                            >
                                Defaults to 8 hours if not set
                            </Text>
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
                            !canContinue && { opacity: 0.5 },
                        ]}
                        onPress={handleContinue}
                        disabled={!canContinue}
                    >
                        <Text style={shared.primaryBtnLargeText}>
                            Continue to Invite
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            {/* iOS picker modals */}
            {Platform.OS === 'ios' &&
                renderIOSPickerModal(
                    showDatePicker,
                    'date',
                    tempDate,
                    setTempDate,
                    () => {
                        setSelectedDate(tempDate);
                        setShowDatePicker(false);
                    },
                    () => setShowDatePicker(false),
                    new Date(),
                )}
            {Platform.OS === 'ios' &&
                renderIOSPickerModal(
                    showTimePicker,
                    'time',
                    tempTime,
                    setTempTime,
                    () => {
                        setSelectedTime(tempTime);
                        setShowTimePicker(false);
                    },
                    () => setShowTimePicker(false),
                    isSelectedDateToday ? new Date() : undefined,
                )}

            {/* Duration picker modal */}
            <Modal
                visible={showDurationPicker}
                transparent
                animationType='fade'
            >
                <Pressable style={s.modalOverlay} onPress={cancelDuration}>
                    <Pressable
                        style={[
                            s.modalContent,
                            { backgroundColor: colors.background },
                        ]}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View style={s.modalHeader}>
                            <TouchableOpacity onPress={cancelDuration}>
                                <Text
                                    style={[
                                        s.modalBtn,
                                        { color: colors.textSecondary },
                                    ]}
                                >
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={confirmDuration}>
                                <Text
                                    style={[
                                        s.modalBtn,
                                        { color: colors.primary },
                                    ]}
                                >
                                    Done
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <Picker
                            selectedValue={
                                tempDuration === null ? 'none' : tempDuration
                            }
                            onValueChange={(itemValue) =>
                                setTempDuration(
                                    itemValue === 'none'
                                        ? null
                                        : (itemValue as number),
                                )
                            }
                            itemStyle={{ color: colors.text }}
                            style={{ width: '100%' }}
                        >
                            {DURATION_OPTIONS.map((opt) => (
                                <Picker.Item
                                    key={
                                        opt.value === null
                                            ? 'none'
                                            : String(opt.value)
                                    }
                                    label={opt.label}
                                    value={
                                        opt.value === null ? 'none' : opt.value
                                    }
                                />
                            ))}
                        </Picker>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    backBtn: { padding: 8, marginLeft: -8 },
    headerTitle: { fontSize: 18, fontWeight: '600' },
    dateTimeRow: {
        flexDirection: 'row',
        gap: 12,
    },
    pickerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        height: 52,
        borderWidth: 2,
        borderRadius: 12,
        paddingHorizontal: 14,
    },
    pickerText: { fontSize: 15, flexShrink: 1 },
    infoCardTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    infoCardSubtitle: {
        fontSize: 14,
        lineHeight: 20,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    modalContent: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingBottom: 30,
        alignItems: 'center',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 14,
        width: '100%',
    },
    modalBtn: {
        fontSize: 17,
        fontWeight: '600',
    },
    durationHelperText: {
        fontSize: 13,
        marginTop: 6,
    },
});

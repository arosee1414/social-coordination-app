import React, { useState, useEffect, useCallback } from 'react';
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
    Keyboard,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, {
    DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { createSharedStyles } from '@/src/constants/shared-styles';
import { useApiClient } from '@/src/hooks/useApiClient';
import { useHangouts } from '@/src/contexts/HangoutsContext';
import { useApiUser } from '@/src/hooks/useApiUser';
import {
    UpdateHangoutRequest,
    HangoutStatus,
} from '@/src/clients/generatedClient';

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

export default function EditHangoutScreen() {
    const colors = useThemeColors();
    const shared = createSharedStyles(colors);
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const hangoutId = typeof id === 'string' ? id : (id?.[0] ?? '');
    const api = useApiClient();
    const { refetch: refetchHangouts } = useHangouts();
    const { user } = useApiUser();

    // Loading state for initial fetch
    const [initialLoading, setInitialLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Hangout status tracking
    const [hangoutStatus, setHangoutStatus] = useState<HangoutStatus | null>(
        null,
    );
    const [hangoutEndTime, setHangoutEndTime] = useState<Date | null>(null);

    // Form fields
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<Date | null>(null);
    const [selectedDuration, setSelectedDuration] = useState<number | null>(
        null,
    );

    // Date & time picker state
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [tempDate, setTempDate] = useState(new Date());
    const [tempTime, setTempTime] = useState(new Date());

    // Duration picker state
    const [showDurationPicker, setShowDurationPicker] = useState(false);
    const [tempDuration, setTempDuration] = useState<number | null>(null);

    // Fetch existing hangout data and populate form
    const fetchHangout = useCallback(async () => {
        if (!hangoutId) return;
        try {
            setInitialLoading(true);
            const result = await api.hangoutsGET(hangoutId);

            // Check if the current user is the creator
            if (user?.id && result.createdByUserId !== user.id) {
                Alert.alert(
                    'Unauthorized',
                    'You can only edit hangouts you created.',
                );
                router.back();
                return;
            }

            setHangoutStatus(result.status ?? null);
            if (result.endTime) {
                setHangoutEndTime(new Date(result.endTime));
            }

            setTitle(result.title ?? '');
            setLocation(result.location ?? '');
            setDescription(result.description ?? '');

            if (result.startTime) {
                const start = new Date(result.startTime);
                setSelectedDate(start);
                setSelectedTime(start);

                // Calculate duration from start and end times
                if (result.endTime) {
                    const end = new Date(result.endTime);
                    const durationHours =
                        (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                    // Find the closest matching duration option
                    const closestOption = DURATION_OPTIONS.find(
                        (opt) =>
                            opt.value !== null &&
                            Math.abs(opt.value - durationHours) < 0.01,
                    );
                    setSelectedDuration(closestOption?.value ?? null);
                }
            }
        } catch (err: any) {
            Alert.alert('Error', err?.message ?? 'Failed to load hangout');
            router.back();
        } finally {
            setInitialLoading(false);
        }
    }, [api, hangoutId, user?.id]);

    useEffect(() => {
        if (user?.id) {
            fetchHangout();
        }
    }, [fetchHangout, user?.id]);

    // Duration picker handlers
    const openDurationPicker = () => {
        Keyboard.dismiss();
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

    // Date/time picker handlers
    const openDatePicker = () => {
        Keyboard.dismiss();
        setShowTimePicker(false);
        setTempDate(selectedDate || new Date());
        setShowDatePicker(true);
    };

    const openTimePicker = () => {
        Keyboard.dismiss();
        setShowDatePicker(false);
        setTempTime(selectedTime || new Date());
        setShowTimePicker(true);
    };

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

    const formatDateDisplay = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatTimeDisplay = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    const isSelectedDateToday = (() => {
        if (!selectedDate) return true;
        const now = new Date();
        return (
            selectedDate.getFullYear() === now.getFullYear() &&
            selectedDate.getMonth() === now.getMonth() &&
            selectedDate.getDate() === now.getDate()
        );
    })();

    /** Compute endTime from selectedDate + selectedTime + selectedDuration */
    const computeEndTime = (): Date | null => {
        if (selectedDuration === null) return null;
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

    const isHangoutEnded =
        hangoutStatus === HangoutStatus.Cancelled ||
        hangoutStatus === HangoutStatus.Completed ||
        (hangoutEndTime !== null && hangoutEndTime < new Date());

    const canSave = title && selectedDate && selectedTime;

    const handleSaveChanges = async () => {
        if (!canSave) return;
        try {
            setSubmitting(true);

            const start = new Date(selectedDate!);
            start.setHours(
                selectedTime!.getHours(),
                selectedTime!.getMinutes(),
                0,
                0,
            );
            const endTime = computeEndTime();

            const req = new UpdateHangoutRequest();
            req.title = title;
            req.startTime = start;
            req.description = description || undefined;
            req.location = location || undefined;
            req.endTime = endTime ?? undefined;

            await api.hangoutsPUT(hangoutId, req);
            await refetchHangouts();

            router.back();
        } catch (err: any) {
            Alert.alert('Error', err?.message ?? 'Failed to save changes');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteHangout = async () => {
        try {
            setDeleting(true);
            setShowDeleteConfirm(false);
            await api.hangoutsDELETE(hangoutId);
            await refetchHangouts();
            router.replace('/(tabs)' as any);
        } catch (err: any) {
            Alert.alert('Error', err?.message ?? 'Failed to delete hangout');
        } finally {
            setDeleting(false);
        }
    };

    const handleManageInvites = () => {
        router.push({
            pathname: '/invite-selection',
            params: { hangoutId },
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

    if (initialLoading) {
        return (
            <SafeAreaView style={shared.screenContainer}>
                <View style={shared.stackHeader}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={s.backBtn}
                    >
                        <Ionicons
                            name='arrow-back'
                            size={24}
                            color={colors.text}
                        />
                    </TouchableOpacity>
                    <Text style={[s.headerTitle, { color: colors.text }]}>
                        Edit Hangout
                    </Text>
                    <View style={{ width: 40 }} />
                </View>
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <ActivityIndicator size='large' color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

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
                    Edit Hangout
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
                    keyboardShouldPersistTaps='handled'
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
                                            ? formatDateDisplay(selectedDate)
                                            : 'Select date'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Time */}
                            <View style={{ flex: 1 }}>
                                <Text style={shared.formLabel}>
                                    Start Time *
                                </Text>
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
                                            ? formatTimeDisplay(selectedTime)
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
                                Duration (Optional)
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
                                Location (Optional)
                            </Text>
                            <TextInput
                                style={[
                                    shared.formInput,
                                    { color: colors.inputText },
                                ]}
                                placeholder='Add a location'
                                placeholderTextColor={colors.placeholder}
                                value={location}
                                onChangeText={setLocation}
                            />
                        </View>

                        {/* Note */}
                        <View>
                            <Text style={shared.formLabel}>
                                Note (Optional)
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

                        {/* Manage Invites Button */}
                        <View>
                            <TouchableOpacity
                                style={[
                                    s.manageInvitesBtn,
                                    {
                                        backgroundColor: colors.indigoTint5,
                                        borderColor: colors.indigoTint,
                                    },
                                    isHangoutEnded && { opacity: 0.5 },
                                ]}
                                onPress={handleManageInvites}
                                disabled={isHangoutEnded}
                            >
                                <Ionicons
                                    name='people-outline'
                                    size={20}
                                    color={colors.primary}
                                />
                                <Text
                                    style={[
                                        s.manageInvitesBtnText,
                                        { color: colors.primary },
                                    ]}
                                >
                                    Manage Invites
                                </Text>
                            </TouchableOpacity>
                            {isHangoutEnded && (
                                <Text
                                    style={[
                                        s.manageInvitesHint,
                                        { color: colors.textTertiary },
                                    ]}
                                >
                                    Invites can&apos;t be managed after a
                                    hangout has ended
                                </Text>
                            )}
                        </View>

                        {/* Delete Hangout */}
                        <View
                            style={[
                                s.deleteSection,
                                { borderTopColor: colors.cardBorder },
                            ]}
                        >
                            <TouchableOpacity
                                style={[
                                    s.deleteBtn,
                                    {
                                        backgroundColor:
                                            colors.statusNotGoingBg,
                                    },
                                ]}
                                onPress={() => setShowDeleteConfirm(true)}
                                disabled={deleting}
                            >
                                <Ionicons
                                    name='trash-outline'
                                    size={20}
                                    color={colors.error}
                                />
                                <Text
                                    style={[
                                        s.deleteBtnText,
                                        { color: colors.error },
                                    ]}
                                >
                                    {deleting
                                        ? 'Deleting...'
                                        : 'Delete Hangout'}
                                </Text>
                            </TouchableOpacity>
                            <Text
                                style={[
                                    s.deleteHintText,
                                    { color: colors.textTertiary },
                                ]}
                            >
                                This will cancel the hangout for all invited
                                friends
                            </Text>
                        </View>
                    </View>
                </ScrollView>

                {/* Bottom CTA */}
                <View style={shared.bottomCTA}>
                    <TouchableOpacity
                        style={[
                            shared.primaryBtnLarge,
                            (!canSave || submitting) && { opacity: 0.5 },
                        ]}
                        onPress={handleSaveChanges}
                        disabled={!canSave || submitting}
                    >
                        <Text style={shared.primaryBtnLargeText}>
                            {submitting ? 'Saving...' : 'Save Changes'}
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

            {/* Delete Confirmation Modal */}
            <Modal visible={showDeleteConfirm} transparent animationType='fade'>
                <Pressable
                    style={s.modalOverlay}
                    onPress={() => setShowDeleteConfirm(false)}
                >
                    <Pressable
                        style={[
                            s.deleteModalContent,
                            { backgroundColor: colors.background },
                        ]}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <Text
                            style={[s.deleteModalTitle, { color: colors.text }]}
                        >
                            Delete this hangout?
                        </Text>
                        <Text
                            style={[
                                s.deleteModalMessage,
                                { color: colors.textSecondary },
                            ]}
                        >
                            This will permanently delete the hangout and notify
                            all invited friends that it&apos;s been cancelled.
                            This action cannot be undone.
                        </Text>
                        <View style={{ gap: 12 }}>
                            <TouchableOpacity
                                style={[
                                    s.deleteConfirmBtn,
                                    { backgroundColor: colors.error },
                                ]}
                                onPress={handleDeleteHangout}
                            >
                                <Text style={s.deleteConfirmBtnText}>
                                    Yes, Delete Hangout
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    s.deleteCancelBtn,
                                    { backgroundColor: colors.surfaceTertiary },
                                ]}
                                onPress={() => setShowDeleteConfirm(false)}
                            >
                                <Text
                                    style={[
                                        s.deleteCancelBtnText,
                                        { color: colors.textSecondary },
                                    ]}
                                >
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                        </View>
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
    durationHelperText: {
        fontSize: 13,
        marginTop: 6,
    },
    manageInvitesBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 56,
        borderWidth: 2,
        borderRadius: 12,
    },
    manageInvitesBtnText: {
        fontSize: 16,
        fontWeight: '600',
    },
    manageInvitesHint: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 8,
    },
    deleteSection: {
        paddingTop: 24,
        borderTopWidth: 1,
    },
    deleteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 56,
        borderRadius: 12,
    },
    deleteBtnText: {
        fontSize: 16,
        fontWeight: '600',
    },
    deleteHintText: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 8,
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
    deleteModalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 36,
    },
    deleteModalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    deleteModalMessage: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 24,
    },
    deleteConfirmBtn: {
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteConfirmBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    deleteCancelBtn: {
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteCancelBtnText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

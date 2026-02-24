import React, { useCallback, useMemo, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { createSharedStyles } from '@/src/constants/shared-styles';
import { findFriendIdByName } from '@/src/data/mock-data';
import { useHangouts } from '@/src/contexts/HangoutsContext';
import { useApiHangoutDetail } from '@/src/hooks/useApiHangoutDetail';
import { useApiUser } from '@/src/hooks/useApiUser';
import { useFocusEffect } from '@react-navigation/native';

export default function HangoutDetailScreen() {
    const colors = useThemeColors();
    const shared = createSharedStyles(colors);
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const hangoutId = typeof id === 'string' ? id : (id?.[0] ?? '');
    const { updateRSVP } = useHangouts();
    const { user } = useApiUser();
    const {
        hangout,
        attendeesByStatus,
        invitedGroups,
        loading,
        error,
        refetch,
    } = useApiHangoutDetail(hangoutId, user?.id);
    const isCreator = !!(
        user?.id &&
        hangout?.creatorId &&
        user.id === hangout.creatorId
    );

    // Refetch hangout data whenever the screen regains focus (e.g. returning from edit)
    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch]),
    );

    const rsvp = hangout?.userStatus ?? null;
    const [activeTab, setActiveTab] = useState<
        'going' | 'maybe' | 'not-going' | 'pending'
    >('going');

    const ITEM_HEIGHT = 72;
    const ITEM_GAP = 8;
    const minListHeight = useMemo(() => {
        const maxCount = Math.max(
            attendeesByStatus.going.length,
            attendeesByStatus.maybe.length,
            attendeesByStatus.notGoing.length,
            attendeesByStatus.pending.length,
        );
        const cappedCount = Math.min(maxCount, 6);
        return (
            cappedCount * ITEM_HEIGHT + Math.max(0, cappedCount - 1) * ITEM_GAP
        );
    }, [attendeesByStatus]);

    const tabs: {
        key: 'going' | 'maybe' | 'not-going' | 'pending';
        label: string;
        count: number;
    }[] = [
        { key: 'going', label: 'Going', count: attendeesByStatus.going.length },
        { key: 'maybe', label: 'Maybe', count: attendeesByStatus.maybe.length },
        {
            key: 'not-going',
            label: 'Not Going',
            count: attendeesByStatus.notGoing.length,
        },
        {
            key: 'pending',
            label: 'Pending',
            count: attendeesByStatus.pending.length,
        },
    ];

    const attendeeList =
        activeTab === 'going'
            ? attendeesByStatus.going
            : activeTab === 'maybe'
              ? attendeesByStatus.maybe
              : activeTab === 'pending'
                ? attendeesByStatus.pending
                : attendeesByStatus.notGoing;

    if (!hangout && !loading) {
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
                        Hangout Not Found
                    </Text>
                    <View style={s.headerActions} />
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
                    Hangout Details
                </Text>
                <View style={s.headerActions}>
                    <TouchableOpacity>
                        <Ionicons
                            name='share-social-outline'
                            size={24}
                            color={colors.text}
                        />
                    </TouchableOpacity>
                    {isCreator && (
                        <TouchableOpacity
                            onPress={() =>
                                router.push(`/edit-hangout/${hangoutId}` as any)
                            }
                        >
                            <Ionicons
                                name='ellipsis-vertical'
                                size={24}
                                color={colors.text}
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView style={{ flex: 1 }}>
                <View
                    style={{
                        paddingHorizontal: 24,
                        paddingTop: 24,
                        paddingBottom: 24,
                    }}
                >
                    {/* Title Section */}
                    <Text style={[s.title, { color: colors.text }]}>
                        {hangout?.title}
                    </Text>
                    <Text style={[s.creator, { color: colors.subtitle }]}>
                        Created by {hangout?.creator}
                    </Text>

                    {/* Time Badge */}
                    <View
                        style={[
                            s.countdownBadge,
                            { backgroundColor: colors.primary },
                        ]}
                    >
                        <Ionicons name='time-outline' size={18} color='#fff' />
                        <Text style={s.countdownText}>
                            {hangout?.status === 'live' ||
                            hangout?.status === 'past'
                                ? hangout?.timeUntil
                                : `Starts ${hangout?.timeUntil}`}
                        </Text>
                    </View>

                    {/* Details Card */}
                    <View
                        style={[
                            shared.card,
                            { marginTop: 24, marginBottom: 24 },
                        ]}
                    >
                        <View style={s.detailRow}>
                            <Ionicons
                                name='time-outline'
                                size={20}
                                color={colors.primary}
                            />
                            <View style={{ flex: 1 }}>
                                <Text
                                    style={[
                                        s.detailLabel,
                                        { color: colors.subtitle },
                                    ]}
                                >
                                    When
                                </Text>
                                <Text
                                    style={[
                                        s.detailValue,
                                        { color: colors.text },
                                    ]}
                                >
                                    {hangout?.time}
                                </Text>
                            </View>
                        </View>
                        <View
                            style={[
                                s.detailRow,
                                {
                                    borderTopWidth: 1,
                                    borderTopColor: colors.cardBorder,
                                    paddingTop: 12,
                                    marginTop: 12,
                                },
                            ]}
                        >
                            <Ionicons
                                name='location-outline'
                                size={20}
                                color={colors.primary}
                            />
                            <View style={{ flex: 1 }}>
                                <Text
                                    style={[
                                        s.detailLabel,
                                        { color: colors.subtitle },
                                    ]}
                                >
                                    Where
                                </Text>
                                <Text
                                    style={[
                                        s.detailValue,
                                        { color: colors.text },
                                        !hangout?.location && {
                                            fontStyle: 'italic',
                                            color: colors.textTertiary,
                                            fontWeight: '400',
                                        },
                                    ]}
                                >
                                    {hangout?.location || 'No location set'}
                                </Text>
                                {hangout?.locationDetail && (
                                    <Text
                                        style={[
                                            s.detailSub,
                                            { color: colors.textSecondary },
                                        ]}
                                    >
                                        {hangout?.locationDetail}
                                    </Text>
                                )}
                            </View>
                        </View>
                        <View
                            style={[
                                s.detailRow,
                                {
                                    borderTopWidth: 1,
                                    borderTopColor: colors.cardBorder,
                                    paddingTop: 12,
                                    marginTop: 12,
                                },
                            ]}
                        >
                            <Ionicons
                                name='document-text-outline'
                                size={20}
                                color={colors.primary}
                            />
                            <View style={{ flex: 1 }}>
                                <Text
                                    style={[
                                        s.detailLabel,
                                        { color: colors.subtitle },
                                    ]}
                                >
                                    Notes
                                </Text>
                                <Text
                                    style={[
                                        s.detailValue,
                                        { color: colors.text },
                                        !hangout?.description && {
                                            fontStyle: 'italic',
                                            color: colors.textTertiary,
                                            fontWeight: '400',
                                        },
                                    ]}
                                >
                                    {hangout?.description || 'No notes added'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* RSVP Buttons */}
                    <Text
                        style={[
                            shared.sectionLabel,
                            { textTransform: 'uppercase' },
                        ]}
                    >
                        YOUR RESPONSE
                    </Text>
                    <View style={s.rsvpRow}>
                        <TouchableOpacity
                            style={[
                                s.rsvpBtn,
                                rsvp === 'going'
                                    ? {
                                          backgroundColor: colors.statusGoingBg,
                                          borderColor: colors.statusGoing,
                                      }
                                    : { borderColor: colors.cardBorderHeavy },
                            ]}
                            onPress={() =>
                                hangout && updateRSVP(hangout.id, 'going')
                            }
                        >
                            <Text
                                style={[
                                    s.rsvpBtnText,
                                    {
                                        color:
                                            rsvp === 'going'
                                                ? colors.statusGoingText
                                                : colors.textSecondary,
                                    },
                                ]}
                            >
                                Going ✓
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                s.rsvpBtn,
                                rsvp === 'maybe'
                                    ? {
                                          backgroundColor: colors.statusMaybeBg,
                                          borderColor: colors.statusMaybe,
                                      }
                                    : { borderColor: colors.cardBorderHeavy },
                            ]}
                            onPress={() =>
                                hangout && updateRSVP(hangout.id, 'maybe')
                            }
                        >
                            <Text
                                style={[
                                    s.rsvpBtnText,
                                    {
                                        color:
                                            rsvp === 'maybe'
                                                ? colors.statusMaybeText
                                                : colors.textSecondary,
                                    },
                                ]}
                            >
                                Maybe
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                s.rsvpBtn,
                                rsvp === 'not-going'
                                    ? {
                                          backgroundColor:
                                              colors.statusNotGoingBg,
                                          borderColor: colors.statusNotGoing,
                                      }
                                    : { borderColor: colors.cardBorderHeavy },
                            ]}
                            onPress={() =>
                                hangout && updateRSVP(hangout.id, 'not-going')
                            }
                        >
                            <Text
                                style={[
                                    s.rsvpBtnText,
                                    {
                                        color:
                                            rsvp === 'not-going'
                                                ? colors.statusNotGoingText
                                                : colors.textSecondary,
                                    },
                                ]}
                            >
                                {"Can't Go"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Invited Groups */}
                    {invitedGroups.length > 0 && (
                        <View style={{ marginTop: 24 }}>
                            <Text
                                style={[
                                    shared.sectionLabel,
                                    { textTransform: 'uppercase' },
                                ]}
                            >
                                INVITED GROUPS
                            </Text>
                            {invitedGroups.map((g) => (
                                <TouchableOpacity
                                    key={g.id}
                                    style={[shared.card, { marginBottom: 8 }]}
                                    onPress={() =>
                                        router.push(`/group/${g.id}` as any)
                                    }
                                    activeOpacity={0.7}
                                >
                                    <View style={s.groupRow}>
                                        <Text style={{ fontSize: 32 }}>
                                            {g.icon}
                                        </Text>
                                        <View style={{ flex: 1 }}>
                                            <Text
                                                style={[
                                                    s.groupName,
                                                    { color: colors.text },
                                                ]}
                                            >
                                                {g.name}
                                            </Text>
                                            <Text
                                                style={[
                                                    s.groupMembers,
                                                    {
                                                        color: colors.textSecondary,
                                                    },
                                                ]}
                                            >
                                                {g.memberCount} members
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* Attendees Tabs */}
                    <View style={{ marginTop: 24 }}>
                        <Text
                            style={[
                                shared.sectionLabel,
                                { textTransform: 'uppercase' },
                            ]}
                        >
                            RESPONSES
                        </Text>
                        <View style={shared.segmentedControl}>
                            {tabs.map((tab) => (
                                <TouchableOpacity
                                    key={tab.key}
                                    style={
                                        activeTab === tab.key
                                            ? shared.segmentedTabActive
                                            : shared.segmentedTab
                                    }
                                    onPress={() => setActiveTab(tab.key)}
                                >
                                    <Text
                                        style={
                                            activeTab === tab.key
                                                ? shared.segmentedTabTextActive
                                                : shared.segmentedTabText
                                        }
                                    >
                                        {tab.label} ({tab.count})
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View
                            style={{
                                marginTop: 16,
                                gap: 8,
                                minHeight: minListHeight,
                            }}
                        >
                            {attendeeList.map((attendee, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[shared.listItem]}
                                    onPress={() => {
                                        const friendId = findFriendIdByName(
                                            attendee.name,
                                        );
                                        if (friendId) {
                                            router.push(
                                                `/friend/${friendId}` as any,
                                            );
                                        }
                                    }}
                                >
                                    <View style={shared.avatarLarge}>
                                        {attendee.avatar ? (
                                            <Image
                                                source={{
                                                    uri: attendee.avatar,
                                                }}
                                                style={s.avatarImage}
                                            />
                                        ) : (
                                            <Text style={{ fontSize: 24 }}>
                                                👤
                                            </Text>
                                        )}
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text
                                            style={[
                                                s.attendeeName,
                                                { color: colors.text },
                                            ]}
                                        >
                                            {attendee.name}
                                        </Text>
                                        <Text
                                            style={[
                                                s.attendeeTime,
                                                { color: colors.textTertiary },
                                            ]}
                                        >
                                            {attendee.time}
                                        </Text>
                                    </View>
                                    {attendee.fromGroup && (
                                        <View
                                            style={[
                                                s.groupBadge,
                                                {
                                                    backgroundColor:
                                                        colors.indigoTint,
                                                },
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    s.groupBadgeText,
                                                    { color: colors.primary },
                                                ]}
                                            >
                                                {attendee.fromGroup}
                                            </Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    backBtn: { padding: 8, marginLeft: -8 },
    headerTitle: { fontSize: 18, fontWeight: '600' },
    headerActions: { flexDirection: 'row', gap: 16 },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 4 },
    creator: { fontSize: 16, marginBottom: 16 },
    countdownBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
    },
    countdownText: { color: '#fff', fontSize: 15, fontWeight: '600' },
    detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    detailLabel: { fontSize: 13, fontWeight: '500', marginBottom: 2 },
    detailValue: { fontSize: 16, fontWeight: '600' },
    detailSub: { fontSize: 14, marginTop: 2 },
    rsvpRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
    rsvpBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
    },
    rsvpBtnText: { fontSize: 14, fontWeight: '600' },
    groupRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    groupName: { fontSize: 16, fontWeight: '600' },
    groupMembers: { fontSize: 14 },
    friendName: { fontSize: 16, fontWeight: '500' },
    attendeeName: { fontSize: 16, fontWeight: '500' },
    attendeeTime: { fontSize: 13, marginTop: 2 },
    groupBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    groupBadgeText: { fontSize: 12, fontWeight: '600' },
    avatarImage: { width: 48, height: 48, borderRadius: 24 },
});

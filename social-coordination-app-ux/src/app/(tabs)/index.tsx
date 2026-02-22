import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { createSharedStyles } from '@/src/constants/shared-styles';
import { mockHangouts } from '@/src/data/mock-data';

export default function HomeScreen() {
    const colors = useThemeColors();
    const shared = createSharedStyles(colors);
    const router = useRouter();

    return (
        <SafeAreaView style={shared.screenContainer}>
            {/* Header */}
            <View style={shared.screenHeader}>
                <Text style={shared.screenTitle}>Home</Text>
                <Text style={shared.screenSubtitle}>
                    Your upcoming hangouts
                </Text>
            </View>

            <ScrollView style={{ flex: 1 }}>
                {mockHangouts.length > 0 ? (
                    <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}>
                        <View style={s.sectionHeader}>
                            <Text style={[shared.sectionTitle]}>
                                Upcoming Hangouts
                            </Text>
                            <TouchableOpacity
                                style={shared.fab}
                                onPress={() => router.push('/create-hangout')}
                            >
                                <Ionicons
                                    name='add'
                                    size={20}
                                    color='#fff'
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={{ gap: 12 }}>
                            {mockHangouts.map((hangout) => (
                                <TouchableOpacity
                                    key={hangout.id}
                                    style={[shared.card]}
                                    onPress={() =>
                                        router.push(
                                            `/hangout/${hangout.id}` as any,
                                        )
                                    }
                                    activeOpacity={0.7}
                                >
                                    <View style={s.cardTop}>
                                        <View style={{ flex: 1 }}>
                                            <Text
                                                style={[
                                                    s.cardTitle,
                                                    { color: colors.text },
                                                ]}
                                            >
                                                {hangout.title}
                                            </Text>
                                            <View style={s.iconRow}>
                                                <Ionicons
                                                    name='time-outline'
                                                    size={16}
                                                    color={colors.subtitle}
                                                />
                                                <Text
                                                    style={[
                                                        s.iconRowText,
                                                        {
                                                            color: colors.textSecondary,
                                                        },
                                                    ]}
                                                >
                                                    {hangout.time}
                                                </Text>
                                            </View>
                                            {hangout.location && (
                                                <View style={s.iconRow}>
                                                    <Ionicons
                                                        name='location-outline'
                                                        size={16}
                                                        color={colors.subtitle}
                                                    />
                                                    <Text
                                                        style={[
                                                            s.iconRowText,
                                                            {
                                                                color: colors.textSecondary,
                                                            },
                                                        ]}
                                                    >
                                                        {hangout.location}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                        <View style={shared.timeBadge}>
                                            <Text
                                                style={shared.timeBadgeText}
                                            >
                                                {hangout.timeUntil}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Attendees Preview */}
                                    <View style={s.attendeesRow}>
                                        <View style={s.avatarStack}>
                                            {hangout.attendeesPreview
                                                .slice(0, 4)
                                                .map((avatar, index) => (
                                                    <View
                                                        key={index}
                                                        style={[
                                                            shared.avatarSmall,
                                                            {
                                                                marginLeft:
                                                                    index > 0
                                                                        ? -8
                                                                        : 0,
                                                                zIndex:
                                                                    hangout
                                                                        .attendeesPreview
                                                                        .length -
                                                                    index,
                                                            },
                                                        ]}
                                                    >
                                                        <Text
                                                            style={{
                                                                fontSize: 14,
                                                            }}
                                                        >
                                                            {avatar}
                                                        </Text>
                                                    </View>
                                                ))}
                                            {hangout.attendeesPreview.length >
                                                4 && (
                                                <View
                                                    style={[
                                                        shared.avatarSmall,
                                                        {
                                                            marginLeft: -8,
                                                            backgroundColor:
                                                                colors.surfaceTertiary,
                                                        },
                                                    ]}
                                                >
                                                    <Text
                                                        style={{
                                                            fontSize: 10,
                                                            fontWeight: '600',
                                                            color: colors.textSecondary,
                                                        }}
                                                    >
                                                        +
                                                        {hangout
                                                            .attendeesPreview
                                                            .length - 4}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                        <Text
                                            style={[
                                                s.invitedText,
                                                { color: colors.subtitle },
                                            ]}
                                        >
                                            {hangout.going + hangout.maybe}{' '}
                                            invited
                                        </Text>
                                    </View>

                                    {/* Status row */}
                                    <View
                                        style={[
                                            s.statusRow,
                                            {
                                                borderTopColor:
                                                    colors.cardBorder,
                                            },
                                        ]}
                                    >
                                        <View style={s.statusItem}>
                                            <View
                                                style={[
                                                    s.statusDot,
                                                    {
                                                        backgroundColor:
                                                            colors.statusGoing,
                                                    },
                                                ]}
                                            />
                                            <Text
                                                style={[
                                                    s.statusText,
                                                    { color: colors.text },
                                                ]}
                                            >
                                                {hangout.going} going
                                            </Text>
                                        </View>
                                        <View style={s.statusItem}>
                                            <View
                                                style={[
                                                    s.statusDot,
                                                    {
                                                        backgroundColor:
                                                            colors.statusMaybe,
                                                    },
                                                ]}
                                            />
                                            <Text
                                                style={[
                                                    s.statusText,
                                                    { color: colors.text },
                                                ]}
                                            >
                                                {hangout.maybe} maybe
                                            </Text>
                                        </View>
                                        {hangout.userStatus === 'going' && (
                                            <View
                                                style={[
                                                    shared.statusBadgeGoing,
                                                    { marginLeft: 'auto' },
                                                ]}
                                            >
                                                <Text
                                                    style={
                                                        shared.statusBadgeGoingText
                                                    }
                                                >
                                                    You're going ✓
                                                </Text>
                                            </View>
                                        )}
                                        {hangout.userStatus === 'maybe' && (
                                            <View
                                                style={[
                                                    shared.statusBadgeMaybe,
                                                    { marginLeft: 'auto' },
                                                ]}
                                            >
                                                <Text
                                                    style={
                                                        shared.statusBadgeMaybeText
                                                    }
                                                >
                                                    Maybe
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ) : (
                    <View style={s.emptyState}>
                        <View
                            style={[
                                s.emptyIcon,
                                { backgroundColor: colors.surfaceTertiary },
                            ]}
                        >
                            <Ionicons
                                name='calendar-outline'
                                size={48}
                                color={colors.textTertiary}
                            />
                        </View>
                        <Text
                            style={[s.emptyTitle, { color: colors.text }]}
                        >
                            No Hangouts Yet
                        </Text>
                        <Text
                            style={[s.emptyText, { color: colors.subtitle }]}
                        >
                            Create your first hangout and invite friends or
                            groups
                        </Text>
                        <TouchableOpacity
                            style={shared.primaryBtnLarge}
                            onPress={() => router.push('/create-hangout')}
                        >
                            <Text style={shared.primaryBtnLargeText}>
                                Create Hangout
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    iconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
    },
    iconRowText: {
        fontSize: 14,
    },
    attendeesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    avatarStack: {
        flexDirection: 'row',
    },
    invitedText: {
        fontSize: 14,
        fontWeight: '500',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        paddingTop: 12,
        borderTopWidth: 1,
    },
    statusItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '500',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 64,
    },
    emptyIcon: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 32,
        maxWidth: 280,
    },
});
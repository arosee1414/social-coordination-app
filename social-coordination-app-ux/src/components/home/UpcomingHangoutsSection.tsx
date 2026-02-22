import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Hangout, RSVPStatus } from '@/src/types';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { createSharedStyles } from '@/src/constants/shared-styles';

interface UpcomingHangoutsSectionProps {
    hangouts: Hangout[];
    onSeeAll: () => void;
    onHangoutPress: (hangoutId: string) => void;
    onRSVP: (hangoutId: string, status: RSVPStatus) => void;
}

export function UpcomingHangoutsSection({
    hangouts,
    onSeeAll,
    onHangoutPress,
    onRSVP,
}: UpcomingHangoutsSectionProps) {
    const colors = useThemeColors();
    const shared = createSharedStyles(colors);

    const displayHangouts = hangouts.slice(0, 3);

    return (
        <View style={styles.container}>
            {/* Section header */}
            <View style={styles.header}>
                <Text style={shared.sectionTitle}>Upcoming</Text>
                <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
                    <Text style={shared.seeAllLink}>See All</Text>
                </TouchableOpacity>
            </View>

            {/* Hangout cards */}
            <View style={styles.cardList}>
                {displayHangouts.map((hangout) => (
                    <TouchableOpacity
                        key={hangout.id}
                        activeOpacity={0.9}
                        onPress={() => onHangoutPress(hangout.id)}
                        style={shared.card}
                    >
                        {/* Top row: title + time badge */}
                        <View style={styles.topRow}>
                            <View style={styles.titleContainer}>
                                <Text
                                    style={[
                                        styles.cardTitle,
                                        { color: colors.text },
                                    ]}
                                    numberOfLines={1}
                                >
                                    {hangout.title}
                                </Text>
                            </View>
                            <View style={shared.timeBadge}>
                                <Text style={shared.timeBadgeText}>
                                    {hangout.timeUntil}
                                </Text>
                            </View>
                        </View>

                        {/* Info rows */}
                        <View style={styles.infoRows}>
                            <View style={styles.infoRow}>
                                <Ionicons
                                    name='time-outline'
                                    size={14}
                                    color={colors.textSecondary}
                                />
                                <Text
                                    style={[
                                        styles.infoText,
                                        { color: colors.textSecondary },
                                    ]}
                                >
                                    {hangout.time}
                                </Text>
                            </View>
                            {hangout.location && (
                                <View style={styles.infoRow}>
                                    <Ionicons
                                        name='location-outline'
                                        size={14}
                                        color={colors.subtitle}
                                    />
                                    <Text
                                        style={[
                                            styles.infoText,
                                            { color: colors.subtitle },
                                        ]}
                                    >
                                        {hangout.location}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Bottom row: avatars + RSVP */}
                        <View style={styles.bottomRow}>
                            {/* Avatar stack */}
                            <View style={styles.avatarStack}>
                                {hangout.attendeesPreview
                                    .slice(0, 3)
                                    .map((avatar, index) => (
                                        <View
                                            key={index}
                                            style={[
                                                styles.avatar,
                                                {
                                                    marginLeft:
                                                        index === 0 ? 0 : -8,
                                                    zIndex:
                                                        hangout.attendeesPreview
                                                            .length - index,
                                                    backgroundColor:
                                                        colors.card,
                                                    borderColor: colors.card,
                                                },
                                            ]}
                                        >
                                            <Text style={styles.avatarText}>
                                                {avatar}
                                            </Text>
                                        </View>
                                    ))}
                                {hangout.attendeesPreview.length > 3 && (
                                    <View
                                        style={[
                                            styles.avatar,
                                            {
                                                marginLeft: -8,
                                                backgroundColor:
                                                    colors.surfaceTertiary,
                                                borderColor: colors.card,
                                            },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.avatarOverflowText,
                                                { color: colors.textSecondary },
                                            ]}
                                        >
                                            +
                                            {hangout.attendeesPreview.length -
                                                3}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {/* RSVP indicator */}
                            {hangout.userStatus === 'going' ? (
                                <View style={shared.statusBadgeGoing}>
                                    <Text style={shared.statusBadgeGoingText}>
                                        ✓ Going
                                    </Text>
                                </View>
                            ) : hangout.userStatus === 'maybe' ? (
                                <View style={shared.statusBadgeMaybe}>
                                    <Text style={shared.statusBadgeMaybeText}>
                                        Maybe
                                    </Text>
                                </View>
                            ) : (
                                <View style={styles.rsvpButtons}>
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={(e) => {
                                            e.stopPropagation?.();
                                            onRSVP(hangout.id, 'going');
                                        }}
                                        style={[
                                            styles.rsvpBtn,
                                            {
                                                backgroundColor: colors.primary,
                                            },
                                        ]}
                                    >
                                        <Text style={styles.rsvpBtnGoingText}>
                                            Going
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={(e) => {
                                            e.stopPropagation?.();
                                            onRSVP(hangout.id, 'maybe');
                                        }}
                                        style={[
                                            styles.rsvpBtn,
                                            {
                                                backgroundColor:
                                                    colors.surfaceTertiary,
                                            },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.rsvpBtnMaybeText,
                                                {
                                                    color: colors.textSecondary,
                                                },
                                            ]}
                                        >
                                            Maybe
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 8,
        paddingBottom: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    cardList: {
        paddingHorizontal: 24,
        gap: 12,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    titleContainer: {
        flex: 1,
        paddingRight: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    infoRows: {
        marginBottom: 12,
        gap: 4,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    infoText: {
        fontSize: 14,
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    avatarStack: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 12,
    },
    avatarOverflowText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    rsvpButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    rsvpBtn: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
    },
    rsvpBtnGoingText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#fff',
    },
    rsvpBtnMaybeText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
});

import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Hangout } from '@/src/types';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { createSharedStyles } from '@/src/constants/shared-styles';
import { PulsingDot } from '@/src/components/PulsingDot';

interface HappeningNowSectionProps {
    hangouts: Hangout[];
    onJoin: (hangoutId: string) => void;
    onPress: (hangoutId: string) => void;
}

export function HappeningNowSection({
    hangouts,
    onJoin,
    onPress,
}: HappeningNowSectionProps) {
    const colors = useThemeColors();
    const shared = createSharedStyles(colors);

    if (hangouts.length === 0) return null;

    return (
        <View style={styles.container}>
            <Text style={[shared.sectionTitle, styles.sectionTitle]}>
                Happening Now
            </Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {hangouts.map((hangout) => (
                    <TouchableOpacity
                        key={hangout.id}
                        activeOpacity={0.9}
                        onPress={() => onPress(hangout.id)}
                        style={[
                            styles.card,
                            { backgroundColor: colors.gradientFrom },
                        ]}
                    >
                        {/* LIVE Badge */}
                        <View style={shared.liveBadge}>
                            <PulsingDot color={colors.livePulse} />
                            <Text style={shared.liveBadgeText}>LIVE</Text>
                        </View>

                        {/* Title */}
                        <Text style={styles.cardTitle}>{hangout.title}</Text>

                        {/* Time */}
                        <View style={styles.infoRow}>
                            <Ionicons
                                name='time-outline'
                                size={16}
                                color='rgba(255,255,255,0.9)'
                            />
                            <Text style={styles.infoText}>{hangout.time}</Text>
                        </View>

                        {/* Location (conditional) */}
                        {hangout.location && (
                            <View style={[styles.infoRow, styles.locationRow]}>
                                <Ionicons
                                    name='location-outline'
                                    size={16}
                                    color='rgba(255,255,255,0.9)'
                                />
                                <Text style={styles.infoText}>
                                    {hangout.location}
                                </Text>
                            </View>
                        )}

                        {/* Bottom: Attendees + Join */}
                        <View style={styles.bottomRow}>
                            {/* Avatar stack */}
                            <View style={styles.avatarStack}>
                                {hangout.attendeesPreview
                                    .slice(0, 4)
                                    .map((avatarUrl, index) => (
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
                                                    borderColor:
                                                        colors.gradientFrom,
                                                },
                                            ]}
                                        >
                                            {avatarUrl ? (
                                                <Image
                                                    source={{ uri: avatarUrl }}
                                                    style={styles.avatarImage}
                                                />
                                            ) : (
                                                <Ionicons
                                                    name='person'
                                                    size={16}
                                                    color='rgba(255,255,255,0.6)'
                                                />
                                            )}
                                        </View>
                                    ))}
                                {(hangout.attendeeCount ?? 0) > 4 && (
                                    <View
                                        style={[
                                            styles.avatar,
                                            styles.avatarOverflow,
                                            {
                                                marginLeft: -8,
                                                borderColor:
                                                    colors.gradientFrom,
                                            },
                                        ]}
                                    >
                                        <Text style={styles.avatarOverflowText}>
                                            +{(hangout.attendeeCount ?? 0) - 4}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {/* Join button */}
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={(e) => {
                                    e.stopPropagation?.();
                                    onJoin(hangout.id);
                                }}
                                style={shared.joinButton}
                            >
                                <Text style={shared.joinButtonText}>Join</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 24,
        paddingBottom: 16,
    },
    sectionTitle: {
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingVertical: 4,
        gap: 12,
    },
    card: {
        width: 280,
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 2,
    },
    cardTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 12,
        marginBottom: 4,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    locationRow: {
        marginBottom: 16,
    },
    infoText: {
        color: 'rgba(255,255,255,0.9)',
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
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#fff',
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarImage: {
        width: 28,
        height: 28,
        borderRadius: 14,
    },
    avatarOverflow: {
        backgroundColor: '#fff',
    },
    avatarOverflowText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#007AFF',
    },
});

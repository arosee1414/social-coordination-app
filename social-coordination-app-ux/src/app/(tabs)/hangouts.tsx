import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Animated,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { createSharedStyles } from '@/src/constants/shared-styles';
import { useHangouts } from '@/src/contexts/HangoutsContext';
import { PulsingDot } from '@/src/components/PulsingDot';

type HangoutTab = 'upcoming' | 'past';

export default function HangoutsScreen() {
    const colors = useThemeColors();
    const shared = createSharedStyles(colors);
    const router = useRouter();
    const { hangouts: mockHangouts, loading, refetch } = useHangouts();
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<HangoutTab>('upcoming');

    const filteredHangouts = useMemo(() => {
        if (activeTab === 'upcoming') {
            return mockHangouts.filter(
                (h) => h.status === 'live' || h.status === 'upcoming',
            );
        }
        return mockHangouts.filter((h) => h.status === 'past');
    }, [mockHangouts, activeTab]);

    const spinnerOpacity = useRef(new Animated.Value(1)).current;
    const [showSpinner, setShowSpinner] = useState(true);

    useEffect(() => {
        if (!loading) {
            Animated.timing(spinnerOpacity, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }).start(() => {
                setShowSpinner(false);
            });
        }
    }, [loading]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    }, [refetch]);

    return (
        <SafeAreaView
            style={shared.screenContainer}
            edges={['top', 'left', 'right']}
        >
            <View style={shared.screenHeaderBordered}>
                <View style={s.headerRow}>
                    <Text style={shared.screenTitle}>Hangouts</Text>
                    <TouchableOpacity
                        style={shared.fab}
                        onPress={() => router.push('/create-hangout')}
                    >
                        <Ionicons name='add' size={20} color='#fff' />
                    </TouchableOpacity>
                </View>
                <Text style={shared.screenSubtitle}>
                    All your planned hangouts
                </Text>
            </View>

            {/* Tab Bar */}
            <View
                style={[
                    shared.segmentedControl,
                    { marginHorizontal: 24, marginTop: 12, marginBottom: 4 },
                ]}
            >
                <TouchableOpacity
                    style={
                        activeTab === 'upcoming'
                            ? shared.segmentedTabActive
                            : shared.segmentedTab
                    }
                    onPress={() => setActiveTab('upcoming')}
                >
                    <Text
                        style={
                            activeTab === 'upcoming'
                                ? shared.segmentedTabTextActive
                                : shared.segmentedTabText
                        }
                    >
                        Upcoming
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={
                        activeTab === 'past'
                            ? shared.segmentedTabActive
                            : shared.segmentedTab
                    }
                    onPress={() => setActiveTab('past')}
                >
                    <Text
                        style={
                            activeTab === 'past'
                                ? shared.segmentedTabTextActive
                                : shared.segmentedTabText
                        }
                    >
                        Past
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
            >
                {filteredHangouts.length > 0 ? (
                    <View
                        style={{
                            paddingHorizontal: 24,
                            paddingVertical: 24,
                            gap: 12,
                        }}
                    >
                        {filteredHangouts.map((hangout) => {
                            const isLive = hangout.status === 'live';

                            return (
                                <TouchableOpacity
                                    key={hangout.id}
                                    style={[
                                        shared.card,
                                        isLive && {
                                            backgroundColor:
                                                colors.gradientFrom,
                                            borderColor: colors.gradientFrom,
                                        },
                                    ]}
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
                                                    {
                                                        color: isLive
                                                            ? '#fff'
                                                            : colors.text,
                                                    },
                                                ]}
                                            >
                                                {hangout.title}
                                            </Text>
                                            <View style={s.iconRow}>
                                                <Ionicons
                                                    name='time-outline'
                                                    size={16}
                                                    color={
                                                        isLive
                                                            ? 'rgba(255,255,255,0.9)'
                                                            : colors.subtitle
                                                    }
                                                />
                                                <Text
                                                    style={[
                                                        s.iconRowText,
                                                        {
                                                            color: isLive
                                                                ? 'rgba(255,255,255,0.9)'
                                                                : colors.textSecondary,
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
                                                        color={
                                                            isLive
                                                                ? 'rgba(255,255,255,0.9)'
                                                                : colors.subtitle
                                                        }
                                                    />
                                                    <Text
                                                        style={[
                                                            s.iconRowText,
                                                            {
                                                                color: isLive
                                                                    ? 'rgba(255,255,255,0.9)'
                                                                    : colors.textSecondary,
                                                            },
                                                        ]}
                                                    >
                                                        {hangout.location}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                        {isLive ? (
                                            <View style={shared.liveBadge}>
                                                <PulsingDot
                                                    color={colors.livePulse}
                                                />
                                                <Text
                                                    style={shared.liveBadgeText}
                                                >
                                                    LIVE
                                                </Text>
                                            </View>
                                        ) : (
                                            <View style={shared.timeBadge}>
                                                <Text
                                                    style={shared.timeBadgeText}
                                                >
                                                    {hangout.timeUntil}
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    <View
                                        style={[
                                            s.statusRow,
                                            {
                                                borderTopColor: isLive
                                                    ? 'rgba(255,255,255,0.2)'
                                                    : colors.cardBorder,
                                            },
                                        ]}
                                    >
                                        <View style={s.statusItem}>
                                            <View
                                                style={[
                                                    s.statusDot,
                                                    {
                                                        backgroundColor: isLive
                                                            ? '#4ADE80'
                                                            : colors.statusGoing,
                                                    },
                                                ]}
                                            />
                                            <Text
                                                style={[
                                                    s.statusText,
                                                    {
                                                        color: isLive
                                                            ? 'rgba(255,255,255,0.9)'
                                                            : colors.text,
                                                    },
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
                                                        backgroundColor: isLive
                                                            ? '#FACC15'
                                                            : colors.statusMaybe,
                                                    },
                                                ]}
                                            />
                                            <Text
                                                style={[
                                                    s.statusText,
                                                    {
                                                        color: isLive
                                                            ? 'rgba(255,255,255,0.9)'
                                                            : colors.text,
                                                    },
                                                ]}
                                            >
                                                {hangout.maybe} maybe
                                            </Text>
                                        </View>
                                        {hangout.userStatus === 'going' && (
                                            <View
                                                style={[
                                                    isLive
                                                        ? s.statusBadgeLive
                                                        : shared.statusBadgeGoing,
                                                    { marginLeft: 'auto' },
                                                ]}
                                            >
                                                <Text
                                                    style={
                                                        isLive
                                                            ? s.statusBadgeLiveText
                                                            : shared.statusBadgeGoingText
                                                    }
                                                >
                                                    {"You're going ✓"}
                                                </Text>
                                            </View>
                                        )}
                                        {hangout.userStatus === 'maybe' && (
                                            <View
                                                style={[
                                                    isLive
                                                        ? s.statusBadgeLive
                                                        : shared.statusBadgeMaybe,
                                                    { marginLeft: 'auto' },
                                                ]}
                                            >
                                                <Text
                                                    style={
                                                        isLive
                                                            ? s.statusBadgeLiveText
                                                            : shared.statusBadgeMaybeText
                                                    }
                                                >
                                                    Maybe
                                                </Text>
                                            </View>
                                        )}
                                        {hangout.userStatus === 'not-going' && (
                                            <View
                                                style={[
                                                    isLive
                                                        ? s.statusBadgeLive
                                                        : shared.statusBadgeNotGoing,
                                                    { marginLeft: 'auto' },
                                                ]}
                                            >
                                                <Text
                                                    style={
                                                        isLive
                                                            ? s.statusBadgeLiveText
                                                            : shared.statusBadgeNotGoingText
                                                    }
                                                >
                                                    {"Can't Go"}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ) : !loading ? (
                    <View style={s.emptyState}>
                        <View
                            style={[
                                s.emptyIcon,
                                { backgroundColor: colors.surfaceTertiary },
                            ]}
                        >
                            <Ionicons
                                name={
                                    activeTab === 'upcoming'
                                        ? 'calendar-outline'
                                        : 'time-outline'
                                }
                                size={48}
                                color={colors.textTertiary}
                            />
                        </View>
                        <Text style={[s.emptyTitle, { color: colors.text }]}>
                            {activeTab === 'upcoming'
                                ? 'No Upcoming Hangouts'
                                : 'No Past Hangouts'}
                        </Text>
                        <Text style={[s.emptyText, { color: colors.subtitle }]}>
                            {activeTab === 'upcoming'
                                ? 'Create a hangout and invite friends or groups'
                                : "You haven't been to any hangouts yet."}
                        </Text>
                        {activeTab === 'upcoming' && (
                            <TouchableOpacity
                                style={shared.primaryBtnLarge}
                                onPress={() => router.push('/create-hangout')}
                            >
                                <Text style={shared.primaryBtnLargeText}>
                                    Create Hangout
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : null}
            </ScrollView>

            {/* Spinner overlay — fades out when data loads */}
            {showSpinner && (
                <Animated.View
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            backgroundColor: colors.background,
                            justifyContent: 'center',
                            alignItems: 'center',
                            opacity: spinnerOpacity,
                        },
                    ]}
                    pointerEvents={loading ? 'auto' : 'none'}
                >
                    <ActivityIndicator size='large' color={colors.primary} />
                </Animated.View>
            )}
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
    iconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
    },
    iconRowText: { fontSize: 14 },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        paddingTop: 12,
        borderTopWidth: 1,
    },
    statusItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    statusText: { fontSize: 14, fontWeight: '500' },
    statusBadgeLive: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusBadgeLiveText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },
    emptyState: {
        alignItems: 'center',
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
    emptyTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 32,
        maxWidth: 280,
    },
});

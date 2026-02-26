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
    Image,
    Switch,
    InteractionManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useClerk } from '@clerk/clerk-expo';
import { useScrollToTop } from '@react-navigation/native';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useThemeContext } from '@/src/contexts/ThemeContext';
import { createSharedStyles } from '@/src/constants/shared-styles';
import { settingsSections } from '@/src/data/mock-data';
import { useApiUser } from '@/src/hooks/useApiUser';
import { useHangouts } from '@/src/contexts/HangoutsContext';
import { useApiGroups } from '@/src/hooks/useApiGroups';
import { useApiFriendCount } from '@/src/hooks/useApiFriends';

export default function ProfileScreen() {
    const colors = useThemeColors();
    const { effectiveScheme, themePreference, setThemePreference } =
        useThemeContext();
    const shared = createSharedStyles(colors);
    const router = useRouter();
    const { signOut } = useClerk();
    const { user, loading: userLoading, refetch } = useApiUser();
    const { hangouts, refetch: refetchHangouts } = useHangouts();
    const { groups, refetch: refetchGroups } = useApiGroups();
    const { count: friendsCount, refetch: refetchFriendCount } =
        useApiFriendCount(user?.id);
    const [refreshing, setRefreshing] = useState(false);
    const [localDarkMode, setLocalDarkMode] = useState(
        effectiveScheme === 'dark',
    );
    const scrollRef = useRef<ScrollView>(null);
    useScrollToTop(scrollRef);

    // Sync local toggle state when effectiveScheme changes externally
    useEffect(() => {
        setLocalDarkMode(effectiveScheme === 'dark');
    }, [effectiveScheme]);

    const spinnerOpacity = useRef(new Animated.Value(1)).current;
    const [showSpinner, setShowSpinner] = useState(true);

    useEffect(() => {
        if (!userLoading) {
            Animated.timing(spinnerOpacity, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }).start(() => {
                setShowSpinner(false);
            });
        }
    }, [userLoading]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([
            refetch(),
            refetchHangouts(),
            refetchGroups(),
            refetchFriendCount(),
        ]);
        setRefreshing(false);
    }, [refetch, refetchHangouts, refetchGroups, refetchFriendCount]);

    const displayName = user
        ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Your Name'
        : 'Your Name';
    const displayEmail = user?.email ?? 'user@example.com';
    const avatarUrl = user?.profileImageUrl;

    // Compute real stats
    const plansCreated = useMemo(() => {
        if (!user?.id) return 0;
        return hangouts.filter((h) => h.creatorId === user.id).length;
    }, [hangouts, user?.id]);

    const groupsCount = groups.length;

    const profileStats = [
        { label: 'Plans Created', value: String(plansCreated) },
        { label: 'Groups', value: String(groupsCount) },
        { label: 'Friends', value: String(friendsCount) },
    ];

    const handleSignOut = async () => {
        await signOut();
        router.replace('/login');
    };

    return (
        <SafeAreaView
            style={shared.screenContainer}
            edges={['top', 'left', 'right']}
        >
            <ScrollView
                ref={scrollRef}
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
                {/* Profile Header — centered like friend profile page */}
                <View style={s.profileSection}>
                    {/* Avatar */}
                    <View style={s.avatarContainer}>
                        {avatarUrl ? (
                            <Image
                                source={{ uri: avatarUrl }}
                                style={s.avatar}
                            />
                        ) : (
                            <View
                                style={[
                                    s.avatar,
                                    s.avatarFallback,
                                    { backgroundColor: colors.indigo50 },
                                ]}
                            >
                                <Text
                                    style={[
                                        s.avatarFallbackText,
                                        { color: colors.primary },
                                    ]}
                                >
                                    {displayName.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Name */}
                    <Text style={[s.displayName, { color: colors.text }]}>
                        {displayName}
                    </Text>

                    {/* Email */}
                    <Text
                        style={[
                            s.displayEmail,
                            { color: colors.textSecondary },
                        ]}
                    >
                        {displayEmail}
                    </Text>

                    {/* Stats Row */}
                    <View style={s.statsRow}>
                        {profileStats.map((stat, index) => {
                            const content = (
                                <View key={index} style={s.statItem}>
                                    <Text
                                        style={[
                                            s.statValue,
                                            { color: colors.text },
                                        ]}
                                    >
                                        {stat.value}
                                    </Text>
                                    <Text
                                        style={[
                                            s.statLabel,
                                            {
                                                color: colors.textSecondary,
                                            },
                                        ]}
                                    >
                                        {stat.label}
                                    </Text>
                                </View>
                            );
                            if (stat.label === 'Friends') {
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={{ flex: 1 }}
                                        onPress={() =>
                                            router.push(
                                                '/(tabs)/friends' as any,
                                            )
                                        }
                                        activeOpacity={0.7}
                                    >
                                        {content}
                                    </TouchableOpacity>
                                );
                            }
                            if (stat.label === 'Groups') {
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={{ flex: 1 }}
                                        onPress={() =>
                                            router.push('/(tabs)/groups' as any)
                                        }
                                        activeOpacity={0.7}
                                    >
                                        {content}
                                    </TouchableOpacity>
                                );
                            }
                            if (stat.label === 'Plans Created') {
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={{ flex: 1 }}
                                        onPress={() =>
                                            router.push({
                                                pathname:
                                                    '/(tabs)/hangouts' as any,
                                                params: {
                                                    role: 'hosting',
                                                },
                                            })
                                        }
                                        activeOpacity={0.7}
                                    >
                                        {content}
                                    </TouchableOpacity>
                                );
                            }
                            return content;
                        })}
                    </View>
                </View>

                {/* Settings Sections */}
                <View
                    style={{
                        paddingHorizontal: 24,
                        gap: 24,
                        paddingBottom: 24,
                    }}
                >
                    {/* Preferences Section */}
                    <View>
                        <Text
                            style={[
                                shared.sectionLabel,
                                { textTransform: 'uppercase' },
                            ]}
                        >
                            Preferences
                        </Text>
                        <View
                            style={[
                                s.settingsCard,
                                {
                                    backgroundColor: colors.card,
                                    borderColor: colors.cardBorder,
                                },
                            ]}
                        >
                            {/* Notifications */}
                            <TouchableOpacity
                                style={[
                                    s.settingsItem,
                                    {
                                        borderBottomWidth: 1,
                                        borderBottomColor: colors.cardBorder,
                                    },
                                ]}
                                activeOpacity={0.7}
                                onPress={() =>
                                    router.push('/notifications' as any)
                                }
                            >
                                <View
                                    style={[
                                        s.settingsIcon,
                                        {
                                            backgroundColor:
                                                colors.surfaceTertiary,
                                        },
                                    ]}
                                >
                                    <Ionicons
                                        name='notifications'
                                        size={20}
                                        color={colors.primary}
                                    />
                                </View>
                                <Text
                                    style={[
                                        s.settingsLabel,
                                        { color: colors.text },
                                    ]}
                                >
                                    Notifications
                                </Text>
                                <Ionicons
                                    name='chevron-forward'
                                    size={20}
                                    color={colors.textTertiary}
                                />
                            </TouchableOpacity>

                            {/* Calendar Sync */}
                            <TouchableOpacity
                                style={[
                                    s.settingsItem,
                                    {
                                        borderBottomWidth: 1,
                                        borderBottomColor: colors.cardBorder,
                                    },
                                ]}
                                activeOpacity={0.7}
                            >
                                <View
                                    style={[
                                        s.settingsIcon,
                                        {
                                            backgroundColor:
                                                colors.surfaceTertiary,
                                        },
                                    ]}
                                >
                                    <Ionicons
                                        name='calendar'
                                        size={20}
                                        color={colors.primary}
                                    />
                                </View>
                                <Text
                                    style={[
                                        s.settingsLabel,
                                        { color: colors.text },
                                    ]}
                                >
                                    Calendar Sync
                                </Text>
                                <Ionicons
                                    name='chevron-forward'
                                    size={20}
                                    color={colors.textTertiary}
                                />
                            </TouchableOpacity>

                            {/* Dark Mode */}
                            <View style={s.settingsItem}>
                                <View
                                    style={[
                                        s.settingsIcon,
                                        {
                                            backgroundColor:
                                                colors.surfaceTertiary,
                                        },
                                    ]}
                                >
                                    <Ionicons
                                        name='moon'
                                        size={20}
                                        color={colors.primary}
                                    />
                                </View>
                                <Text
                                    style={[
                                        s.settingsLabel,
                                        { color: colors.text },
                                    ]}
                                >
                                    Dark Mode
                                </Text>
                                <Switch
                                    value={localDarkMode}
                                    onValueChange={(value) => {
                                        setLocalDarkMode(value);
                                        InteractionManager.runAfterInteractions(
                                            () => {
                                                setThemePreference(
                                                    value ? 'dark' : 'light',
                                                );
                                            },
                                        );
                                    }}
                                    trackColor={{
                                        false: '#787880',
                                        true: '#007AFF',
                                    }}
                                    ios_backgroundColor='#787880'
                                />
                            </View>
                            <View
                                style={[
                                    s.darkModeHint,
                                    {
                                        borderTopColor: colors.cardBorder,
                                        backgroundColor: colors.surfaceTertiary,
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        s.darkModeHintText,
                                        { color: colors.textTertiary },
                                    ]}
                                >
                                    {effectiveScheme === 'dark'
                                        ? 'Dark mode is enabled. Enjoy the darker theme!'
                                        : 'Enable dark mode for a comfortable viewing experience in low light.'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Remaining sections (Support, etc.) */}
                    {settingsSections.map((section, sIdx) => (
                        <View key={`rest-${sIdx}`}>
                            <Text
                                style={[
                                    shared.sectionLabel,
                                    { textTransform: 'uppercase' },
                                ]}
                            >
                                {section.title}
                            </Text>
                            <View
                                style={[
                                    s.settingsCard,
                                    {
                                        backgroundColor: colors.card,
                                        borderColor: colors.cardBorder,
                                    },
                                ]}
                            >
                                {section.items.map((item, iIdx) => (
                                    <TouchableOpacity
                                        key={iIdx}
                                        style={[
                                            s.settingsItem,
                                            iIdx < section.items.length - 1 && {
                                                borderBottomWidth: 1,
                                                borderBottomColor:
                                                    colors.cardBorder,
                                            },
                                        ]}
                                        activeOpacity={0.7}
                                    >
                                        <View
                                            style={[
                                                s.settingsIcon,
                                                {
                                                    backgroundColor:
                                                        colors.surfaceTertiary,
                                                },
                                            ]}
                                        >
                                            <Ionicons
                                                name={item.iconName as any}
                                                size={20}
                                                color={colors.primary}
                                            />
                                        </View>
                                        <Text
                                            style={[
                                                s.settingsLabel,
                                                { color: colors.text },
                                            ]}
                                        >
                                            {item.label}
                                        </Text>
                                        <Ionicons
                                            name='chevron-forward'
                                            size={20}
                                            color={colors.textTertiary}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    ))}

                    {/* Sign Out */}
                    <TouchableOpacity
                        style={[
                            s.signOutBtn,
                            { backgroundColor: colors.surfaceTertiary },
                        ]}
                        onPress={handleSignOut}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name='log-out-outline'
                            size={20}
                            color={colors.errorText}
                        />
                        <Text
                            style={[s.signOutText, { color: colors.errorText }]}
                        >
                            Sign Out
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Spinner overlay — fades out when user data loads */}
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
                    pointerEvents={userLoading ? 'auto' : 'none'}
                >
                    <ActivityIndicator size='large' color={colors.primary} />
                </Animated.View>
            )}
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    profileSection: {
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 24,
    },
    avatarContainer: {
        marginBottom: 12,
    },
    avatar: {
        width: 96,
        height: 96,
        borderRadius: 48,
    },
    avatarFallback: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarFallbackText: {
        fontSize: 36,
        fontWeight: '700',
    },
    displayName: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    displayEmail: {
        fontSize: 14,
        marginBottom: 12,
    },
    statsRow: {
        flexDirection: 'row',
        alignSelf: 'stretch',
        marginBottom: 0,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: { fontSize: 20, fontWeight: '700' },
    statLabel: { fontSize: 13, marginTop: 2 },
    settingsCard: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
    settingsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    settingsIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingsLabel: { flex: 1, fontSize: 16, fontWeight: '500' },
    darkModeHint: {
        borderTopWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    darkModeHintText: {
        fontSize: 12,
        lineHeight: 16,
    },
    signOutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 12,
    },
    signOutText: { fontSize: 16, fontWeight: '600' },
});

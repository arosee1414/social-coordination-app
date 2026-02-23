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
import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { createSharedStyles } from '@/src/constants/shared-styles';
import { groupBgColors } from '@/src/data/mock-data';
import { useApiGroups } from '@/src/hooks/useApiGroups';

export default function GroupsScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const colors = useThemeColors();
    const shared = createSharedStyles(colors);
    const router = useRouter();
    const { groups, loading, error } = useApiGroups();

    return (
        <SafeAreaView
            style={shared.screenContainer}
            edges={['top', 'left', 'right']}
        >
            <View style={shared.screenHeaderBordered}>
                <View style={s.headerRow}>
                    <Text style={shared.screenTitle}>Groups</Text>
                    <TouchableOpacity
                        style={shared.fab}
                        onPress={() => router.push('/create-group')}
                    >
                        <Ionicons name='add' size={20} color='#fff' />
                    </TouchableOpacity>
                </View>
                <Text style={shared.screenSubtitle}>
                    Your saved friend lists
                </Text>
            </View>

            <ScrollView style={{ flex: 1 }}>
                {groups.length > 0 ? (
                    <View
                        style={{
                            paddingHorizontal: 24,
                            paddingVertical: 24,
                            gap: 12,
                        }}
                    >
                        {groups.map((group) => {
                            const bgTheme = groupBgColors[group.id];
                            const bg = bgTheme
                                ? isDark
                                    ? bgTheme.dark
                                    : bgTheme.light
                                : {
                                      from: colors.indigo50,
                                      to: colors.indigo100,
                                  };
                            return (
                                <TouchableOpacity
                                    key={group.id}
                                    style={[
                                        s.groupCard,
                                        { backgroundColor: bg.from },
                                    ]}
                                    onPress={() =>
                                        router.push(`/group/${group.id}` as any)
                                    }
                                    activeOpacity={0.7}
                                >
                                    <View style={s.groupRow}>
                                        <Text style={s.groupIcon}>
                                            {group.icon}
                                        </Text>
                                        <View style={{ flex: 1 }}>
                                            <Text
                                                style={[
                                                    s.groupName,
                                                    { color: colors.text },
                                                ]}
                                            >
                                                {group.name}
                                            </Text>
                                            <View style={s.memberRow}>
                                                <Ionicons
                                                    name='people-outline'
                                                    size={16}
                                                    color={colors.textSecondary}
                                                />
                                                <Text
                                                    style={[
                                                        s.memberText,
                                                        {
                                                            color: colors.textSecondary,
                                                        },
                                                    ]}
                                                >
                                                    {group.memberCount} members
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
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
                                name='people-outline'
                                size={48}
                                color={colors.textTertiary}
                            />
                        </View>
                        <Text style={[s.emptyTitle, { color: colors.text }]}>
                            No Groups Yet
                        </Text>
                        <Text style={[s.emptyText, { color: colors.subtitle }]}>
                            Create a group to save friend lists and invite them
                            faster to hangouts
                        </Text>
                        <TouchableOpacity
                            style={shared.primaryBtnLarge}
                            onPress={() => router.push('/create-group')}
                        >
                            <Text style={shared.primaryBtnLargeText}>
                                Create Group
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
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
    groupCard: {
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    groupRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    groupIcon: { fontSize: 40 },
    groupName: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
    memberRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    memberText: { fontSize: 14, fontWeight: '500' },
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

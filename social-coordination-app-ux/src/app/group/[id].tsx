import React from 'react';
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
import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { createSharedStyles } from '@/src/constants/shared-styles';
import { groupBgColors } from '@/src/data/mock-data';
import { useApiGroupDetail } from '@/src/hooks/useApiGroupDetail';

export default function GroupDetailScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const colors = useThemeColors();
    const shared = createSharedStyles(colors);
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const groupId = typeof id === 'string' ? id : (id?.[0] ?? '');
    const { group, members, loading, error } = useApiGroupDetail(groupId);
    const bgTheme = group ? groupBgColors[group.id] : undefined;
    const bg = bgTheme
        ? isDark
            ? bgTheme.dark
            : bgTheme.light
        : { from: colors.indigo50, to: colors.indigo100 };

    if (!group && !loading) {
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
                        Group Not Found
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
                    Group Details
                </Text>
                <View style={s.headerActions}>
                    <TouchableOpacity>
                        <Ionicons
                            name='create-outline'
                            size={24}
                            color={colors.text}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Ionicons
                            name='ellipsis-vertical'
                            size={24}
                            color={colors.text}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={{ flex: 1 }}>
                {/* Group Info Card */}
                <View
                    style={{
                        paddingHorizontal: 24,
                        paddingTop: 24,
                        paddingBottom: 16,
                    }}
                >
                    <View style={[s.groupCard, { backgroundColor: bg.from }]}>
                        <View style={s.groupCardRow}>
                            <Text style={{ fontSize: 48 }}>{group?.icon}</Text>
                            <View style={{ flex: 1 }}>
                                <Text
                                    style={[
                                        s.groupName,
                                        { color: colors.text },
                                    ]}
                                >
                                    {group?.name}
                                </Text>
                                <Text
                                    style={[
                                        s.groupMeta,
                                        { color: colors.textSecondary },
                                    ]}
                                >
                                    {group?.memberCount} members
                                </Text>
                            </View>
                        </View>
                        <View style={s.avatarRow}>
                            {members.slice(0, 5).map((m, i) => (
                                <View
                                    key={i}
                                    style={[
                                        s.avatarCircle,
                                        {
                                            marginLeft: i > 0 ? -12 : 0,
                                            zIndex: members.length - i,
                                        },
                                    ]}
                                >
                                    {m.avatar ? (
                                        <Image
                                            source={{ uri: m.avatar }}
                                            style={s.avatarCircleImage}
                                        />
                                    ) : (
                                        <Ionicons
                                            name='person'
                                            size={22}
                                            color='#999'
                                        />
                                    )}
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Quick Actions */}
                <View
                    style={{
                        paddingHorizontal: 24,
                        flexDirection: 'row',
                        gap: 12,
                        marginBottom: 24,
                    }}
                >
                    <TouchableOpacity
                        style={[shared.primaryBtnLarge, { flex: 1 }]}
                        onPress={() => router.push('/create-hangout')}
                    >
                        <Text style={shared.primaryBtnLargeText}>
                            Invite to Hangout
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Members List */}
                <View style={{ paddingHorizontal: 24, paddingBottom: 24 }}>
                    <View style={s.sectionHeader}>
                        <Text
                            style={[
                                shared.sectionLabel,
                                { textTransform: 'uppercase', marginBottom: 0 },
                            ]}
                        >
                            MEMBERS ({members.length})
                        </Text>
                        <TouchableOpacity
                            onPress={() => router.push('/add-members')}
                        >
                            <Text
                                style={[s.addLink, { color: colors.primary }]}
                            >
                                + Add
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ gap: 8 }}>
                        {members.map((member, index) => (
                            <TouchableOpacity
                                key={index}
                                style={shared.listItem}
                                onPress={() => {
                                    router.push(
                                        `/friend/${member.userId}` as any,
                                    );
                                }}
                            >
                                <View style={shared.avatarLarge}>
                                    {member.avatar ? (
                                        <Image
                                            source={{ uri: member.avatar }}
                                            style={s.memberAvatarImage}
                                        />
                                    ) : (
                                        <Ionicons
                                            name='person'
                                            size={28}
                                            color='#999'
                                        />
                                    )}
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text
                                        style={[
                                            s.memberName,
                                            { color: colors.text },
                                        ]}
                                    >
                                        {member.name}
                                    </Text>
                                    <Text
                                        style={[
                                            s.memberRole,
                                            { color: colors.textTertiary },
                                        ]}
                                    >
                                        {member.role}
                                    </Text>
                                </View>
                                {member.role === 'Admin' && (
                                    <View
                                        style={[
                                            s.adminBadge,
                                            {
                                                backgroundColor:
                                                    colors.indigoTint,
                                            },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                s.adminBadgeText,
                                                { color: colors.primary },
                                            ]}
                                        >
                                            Admin
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
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
    groupCard: { borderRadius: 16, padding: 24 },
    groupCardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 16,
    },
    groupName: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
    groupMeta: { fontSize: 14, fontWeight: '500' },
    avatarRow: { flexDirection: 'row', justifyContent: 'center' },
    avatarCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#e0e0e0',
        borderWidth: 2,
        borderColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
        overflow: 'hidden',
    },
    avatarCircleImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    memberAvatarImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    addLink: { fontSize: 14, fontWeight: '600' },
    memberName: { fontSize: 16, fontWeight: '500' },
    memberRole: { fontSize: 13, marginTop: 2 },
    adminBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    adminBadgeText: { fontSize: 12, fontWeight: '600' },
});

import { StyleSheet } from 'react-native';
import { ThemeColors } from './theme';

/**
 * Creates a set of reusable styles based on the current theme colors.
 * Use with useThemeColors():
 *
 *   const colors = useThemeColors();
 *   const styles = createSharedStyles(colors);
 */
export function createSharedStyles(colors: ThemeColors) {
    return StyleSheet.create({
        // Containers
        container: {
            flex: 1,
            padding: 24,
            backgroundColor: colors.background,
        },
        centeredContainer: {
            flex: 1,
            padding: 24,
            backgroundColor: colors.background,
            alignItems: 'center',
        },
        screenContainer: {
            flex: 1,
            backgroundColor: colors.background,
        },

        // Typography
        title: {
            fontSize: 32,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 8,
        },
        subtitle: {
            fontSize: 16,
            color: colors.subtitle,
            marginBottom: 30,
        },
        screenTitle: {
            fontSize: 30,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 4,
        },
        screenSubtitle: {
            fontSize: 16,
            color: colors.subtitle,
        },
        sectionTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text,
        },
        sectionLabel: {
            fontSize: 13,
            fontWeight: '600',
            color: colors.subtitle,
            letterSpacing: 0.5,
            marginBottom: 12,
            paddingHorizontal: 4,
        },

        // Inputs
        input: {
            width: '100%',
            height: 50,
            borderWidth: 1,
            borderColor: colors.inputBorder,
            backgroundColor: colors.inputBackground,
            color: colors.inputText,
            borderRadius: 8,
            paddingHorizontal: 16,
            fontSize: 16,
            marginBottom: 16,
        },
        formInput: {
            width: '100%',
            height: 52,
            borderWidth: 2,
            borderColor: colors.cardBorderHeavy,
            backgroundColor: colors.inputBackground,
            color: colors.inputText,
            borderRadius: 12,
            paddingHorizontal: 16,
            fontSize: 16,
        },
        formLabel: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.textSecondary,
            marginBottom: 8,
        },
        searchInput: {
            width: '100%',
            height: 48,
            backgroundColor: colors.surfaceTertiary,
            color: colors.inputText,
            borderRadius: 12,
            paddingLeft: 44,
            paddingRight: 16,
            fontSize: 16,
        },

        // Primary button
        primaryBtn: {
            width: '100%',
            height: 50,
            backgroundColor: colors.primary,
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
        },
        primaryBtnText: {
            color: colors.primaryText,
            fontSize: 16,
            fontWeight: '600',
        },
        primaryBtnLarge: {
            width: '100%',
            height: 56,
            backgroundColor: colors.primary,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
        },
        primaryBtnLargeText: {
            color: colors.primaryText,
            fontSize: 18,
            fontWeight: '600',
        },
        secondaryBtn: {
            width: '100%',
            height: 56,
            backgroundColor: colors.surfaceTertiary,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            gap: 8,
        },
        secondaryBtnText: {
            color: colors.textSecondary,
            fontSize: 16,
            fontWeight: '600',
        },

        // Social button
        socialBtn: {
            width: '100%',
            height: 50,
            borderWidth: 1,
            borderColor: colors.socialButtonBorder,
            backgroundColor: colors.socialButtonBackground,
            borderRadius: 8,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 12,
        },
        socialBtnText: {
            fontSize: 16,
            fontWeight: '500',
            color: colors.socialButtonText,
        },

        // Links
        linkText: {
            color: colors.link,
            fontSize: 14,
            textDecorationLine: 'underline',
        },

        // Error
        errorText: {
            color: colors.error,
            marginTop: 10,
            textAlign: 'center',
        },

        // Separators
        separatorView: {
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 24,
            width: '100%',
        },
        separator: {
            flex: 1,
            borderBottomColor: colors.separator,
            borderBottomWidth: 1,
        },
        separatorText: {
            marginHorizontal: 8,
            color: colors.separatorText,
        },

        // Cards
        card: {
            backgroundColor: colors.card,
            borderWidth: 2,
            borderColor: colors.cardBorder,
            borderRadius: 16,
            padding: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 3,
            elevation: 1,
        },
        infoCard: {
            backgroundColor: colors.indigoTint5,
            borderWidth: 2,
            borderColor: colors.indigoTint,
            borderRadius: 12,
            padding: 16,
            flexDirection: 'row',
            gap: 12,
        },

        // Screen header
        screenHeader: {
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: 12,
        },
        screenHeaderBordered: {
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.cardBorder,
        },
        stackHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.cardBorder,
        },

        // Bottom CTA container
        bottomCTA: {
            padding: 24,
            borderTopWidth: 1,
            borderTopColor: colors.cardBorder,
            backgroundColor: colors.background,
        },

        // Fab button
        fab: {
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
        },

        // Avatar
        avatarSmall: {
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: colors.card,
            borderWidth: 2,
            borderColor: colors.cardBorder,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
        },
        avatarMedium: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.card,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
        },
        avatarLarge: {
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: colors.surfaceTertiary,
            borderWidth: 1,
            borderColor: colors.cardBorderHeavy,
            justifyContent: 'center',
            alignItems: 'center',
        },

        // List items
        listItem: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            padding: 12,
            borderRadius: 12,
            backgroundColor: colors.surfaceTertiary,
        },
        selectableItem: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            padding: 12,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: colors.cardBorderHeavy,
        },
        selectableItemSelected: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            padding: 12,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: colors.primary,
            backgroundColor: colors.indigoTint5,
        },

        // Check indicator
        checkCircle: {
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
        },

        // Tab segmented control
        segmentedControl: {
            flexDirection: 'row',
            gap: 8,
            backgroundColor: colors.surfaceTertiary,
            padding: 4,
            borderRadius: 12,
        },
        segmentedTab: {
            flex: 1,
            paddingVertical: 10,
            borderRadius: 8,
            alignItems: 'center',
        },
        segmentedTabActive: {
            flex: 1,
            paddingVertical: 10,
            borderRadius: 8,
            alignItems: 'center',
            backgroundColor: colors.card,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
        },
        segmentedTabText: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.subtitle,
        },
        segmentedTabTextActive: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
        },

        // Status badges
        statusBadgeGoing: {
            backgroundColor: colors.statusGoingBg,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
        },
        statusBadgeGoingText: {
            fontSize: 12,
            fontWeight: '600',
            color: colors.statusGoingText,
        },
        statusBadgeMaybe: {
            backgroundColor: colors.statusMaybeBg,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
        },
        statusBadgeMaybeText: {
            fontSize: 12,
            fontWeight: '600',
            color: colors.statusMaybeText,
        },

        // Time badge
        timeBadge: {
            backgroundColor: colors.indigoTint,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 12,
        },
        timeBadgeText: {
            fontSize: 12,
            fontWeight: '600',
            color: colors.primary,
        },
    });
}
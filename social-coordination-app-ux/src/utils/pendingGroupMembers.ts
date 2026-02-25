/**
 * Simple mutable shared state for passing selected member IDs
 * between create-group and add-members screens without navigation params.
 * This avoids stack buildup caused by navigate/replace.
 */
export const pendingGroupMembers = {
    ids: [] as string[],
};
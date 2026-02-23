import { useState, useEffect, useCallback } from 'react';
import { useApiClient } from './useApiClient';
import type { GroupResponse } from '@/src/clients/generatedClient';
import type { Group, GroupMember } from '@/src/types';
import { mapGroupMemberToDisplayMember } from '@/src/utils/api-mappers';

export function useApiGroupDetail(groupId: string) {
    const api = useApiClient();
    const [groupDetail, setGroupDetail] = useState<GroupResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchGroupDetail = useCallback(async () => {
        if (!groupId) return;
        try {
            setLoading(true);
            setError(null);
            const result = await api.groupsGET(groupId);
            setGroupDetail(result);
        } catch (err: any) {
            setError(err?.message ?? 'Failed to fetch group detail');
            console.warn('useApiGroupDetail fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [api, groupId]);

    useEffect(() => {
        fetchGroupDetail();
    }, [fetchGroupDetail]);

    const group: Group | null = groupDetail
        ? {
              id: groupDetail.id ?? '',
              name: groupDetail.name ?? '',
              icon: groupDetail.emoji ?? '👥',
              memberCount: groupDetail.members?.length ?? 0,
          }
        : null;

    const members: GroupMember[] = (groupDetail?.members ?? []).map(
        mapGroupMemberToDisplayMember,
    );

    return {
        group,
        members,
        description: groupDetail?.description ?? null,
        createdByUserId: groupDetail?.createdByUserId ?? null,
        loading,
        error,
        refetch: fetchGroupDetail,
    };
}
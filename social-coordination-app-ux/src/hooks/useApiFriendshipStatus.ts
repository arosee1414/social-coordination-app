import { useState, useEffect, useCallback } from "react";
import { useApiClient } from "./useApiClient";

export interface FriendshipStatusInfo {
  status: "none" | "pending" | "accepted";
  direction?: "incoming" | "outgoing";
}

export function useApiFriendshipStatus(friendId: string | undefined) {
  const apiClient = useApiClient();
  const [status, setStatus] = useState<FriendshipStatusInfo>({
    status: "none",
  });
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    if (!apiClient || !friendId) return;
    try {
      setLoading(true);
      const response = await apiClient.status(friendId);
      setStatus({
        status: (response.status?.toLowerCase() ?? "none") as FriendshipStatusInfo["status"],
        direction: response.direction?.toLowerCase() as FriendshipStatusInfo["direction"],
      });
    } catch (err: any) {
      // 404 means no friendship exists
      if (err?.status === 404) {
        setStatus({ status: "none" });
      } else {
        console.error("Error fetching friendship status:", err);
      }
    } finally {
      setLoading(false);
    }
  }, [apiClient, friendId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const sendRequest = useCallback(async () => {
    if (!apiClient || !friendId) return;
    try {
      await apiClient.request(friendId);
      setStatus({ status: "pending", direction: "outgoing" });
    } catch (err) {
      console.error("Error sending friend request:", err);
      throw err;
    }
  }, [apiClient, friendId]);

  const acceptRequest = useCallback(async () => {
    if (!apiClient || !friendId) return;
    try {
      await apiClient.accept(friendId);
      setStatus({ status: "accepted" });
    } catch (err) {
      console.error("Error accepting friend request:", err);
      throw err;
    }
  }, [apiClient, friendId]);

  const rejectRequest = useCallback(async () => {
    if (!apiClient || !friendId) return;
    try {
      await apiClient.reject(friendId);
      setStatus({ status: "none" });
    } catch (err) {
      console.error("Error rejecting friend request:", err);
      throw err;
    }
  }, [apiClient, friendId]);

  const removeFriend = useCallback(async () => {
    if (!apiClient || !friendId) return;
    try {
      await apiClient.friends(friendId);
      setStatus({ status: "none" });
    } catch (err) {
      console.error("Error removing friend:", err);
      throw err;
    }
  }, [apiClient, friendId]);

  return {
    status,
    loading,
    refetch: fetchStatus,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeFriend,
  };
}
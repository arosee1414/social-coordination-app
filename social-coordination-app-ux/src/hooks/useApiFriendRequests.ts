import { useState, useEffect, useCallback } from "react";
import { useApiClient } from "./useApiClient";
import { FriendRequest } from "../types";
import { mapFriendRequestResponseToFriendRequest } from "../utils/api-mappers";

export function useApiFriendRequests() {
  const apiClient = useApiClient();
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    if (!apiClient) return;
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.requests();
      setRequests(response.map(mapFriendRequestResponseToFriendRequest));
    } catch (err) {
      console.error("Error fetching friend requests:", err);
      setError("Failed to load friend requests");
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const acceptRequest = useCallback(
    async (friendId: string) => {
      if (!apiClient) return;
      try {
        await apiClient.accept(friendId);
        // Remove from requests list after accepting
        setRequests((prev) => prev.filter((r) => r.userId !== friendId));
      } catch (err) {
        console.error("Error accepting friend request:", err);
        throw err;
      }
    },
    [apiClient]
  );

  const cancelRequest = useCallback(
    async (friendId: string) => {
      if (!apiClient) return;
      try {
        await apiClient.cancel(friendId);
        // Remove from requests list after cancelling
        setRequests((prev) => prev.filter((r) => r.userId !== friendId));
      } catch (err) {
        console.error("Error cancelling friend request:", err);
        throw err;
      }
    },
    [apiClient]
  );

  const rejectRequest = useCallback(
    async (friendId: string) => {
      if (!apiClient) return;
      try {
        await apiClient.reject(friendId);
        // Remove from requests list after rejecting
        setRequests((prev) => prev.filter((r) => r.userId !== friendId));
      } catch (err) {
        console.error("Error rejecting friend request:", err);
        throw err;
      }
    },
    [apiClient]
  );

  return {
    requests,
    loading,
    error,
    refetch: fetchRequests,
    acceptRequest,
    cancelRequest,
    rejectRequest,
  };
}
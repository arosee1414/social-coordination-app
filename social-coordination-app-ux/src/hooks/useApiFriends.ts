import { useState, useEffect, useCallback } from "react";
import { useApiClient } from "./useApiClient";
import { Friend } from "../types";
import { mapFriendResponseToFriend } from "../utils/api-mappers";

export function useApiFriends() {
  const apiClient = useApiClient();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFriends = useCallback(async () => {
    if (!apiClient) return;
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.friendsAll();
      setFriends(response.map(mapFriendResponseToFriend));
    } catch (err) {
      console.error("Error fetching friends:", err);
      setError("Failed to load friends");
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  const removeFriend = useCallback(
    async (friendId: string) => {
      if (!apiClient) return;
      try {
        await apiClient.friends(friendId);
        setFriends((prev) => prev.filter((f) => f.userId !== friendId));
      } catch (err) {
        console.error("Error removing friend:", err);
        throw err;
      }
    },
    [apiClient]
  );

  return { friends, loading, error, refetch: fetchFriends, removeFriend };
}

export function useApiFriendCount(userId: string | undefined) {
  const apiClient = useApiClient();
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchCount = useCallback(async () => {
    if (!apiClient || !userId) return;
    try {
      setLoading(true);
      const response = await apiClient.count(userId);
      setCount(response.count ?? 0);
    } catch (err) {
      console.error("Error fetching friend count:", err);
    } finally {
      setLoading(false);
    }
  }, [apiClient, userId]);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  return { count, loading, refetch: fetchCount };
}
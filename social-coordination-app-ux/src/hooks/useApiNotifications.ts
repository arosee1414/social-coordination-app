import { useState, useEffect, useCallback } from 'react';
import { useApiClient } from './useApiClient';
import { Notification } from '../types';
import { mapNotificationResponseToNotification } from '../utils/api-mappers';

export function useApiNotifications() {
  const apiClient = useApiClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [continuationToken, setContinuationToken] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!apiClient) return;
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.notificationsGET(20, undefined);
      const mapped = (response.notifications ?? []).map(mapNotificationResponseToNotification);
      setNotifications(mapped);
      setContinuationToken(response.continuationToken ?? null);
      setHasMore(!!response.continuationToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  const fetchMore = useCallback(async () => {
    if (!apiClient || !continuationToken) return;
    try {
      const response = await apiClient.notificationsGET(20, continuationToken);
      const mapped = (response.notifications ?? []).map(mapNotificationResponseToNotification);
      setNotifications((prev) => [...prev, ...mapped]);
      setContinuationToken(response.continuationToken ?? null);
      setHasMore(!!response.continuationToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch more notifications');
    }
  }, [apiClient, continuationToken]);

  const fetchUnreadCount = useCallback(async () => {
    if (!apiClient) return;
    try {
      const response = await apiClient.unreadCount();
      setUnreadCount(response.unreadCount ?? 0);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, [apiClient]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!apiClient) return;
      try {
        await apiClient.read(notificationId);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    },
    [apiClient]
  );

  const markAllAsRead = useCallback(async () => {
    if (!apiClient) return;
    try {
        await apiClient.readAll();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }, [apiClient]);

  const deleteNotification = useCallback(
    async (notificationId: string) => {
      if (!apiClient) return;
      try {
        const notification = notifications.find((n) => n.id === notificationId);
        await apiClient.notificationsDELETE(notificationId);
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        if (notification && !notification.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch (err) {
        console.error('Failed to delete notification:', err);
      }
    },
    [apiClient, notifications]
  );

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    fetchNotifications,
    fetchMore,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
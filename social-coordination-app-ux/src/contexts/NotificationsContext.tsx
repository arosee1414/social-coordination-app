import React, { createContext, useContext, useEffect, useRef } from 'react';
import { Notification } from '../types';
import { useApiNotifications } from '../hooks/useApiNotifications';

type NotificationsContextType = {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    error: string | null;
    hasMore: boolean;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    refresh: () => Promise<void>;
    fetchMore: () => Promise<void>;
};

const NotificationsContext = createContext<
    NotificationsContextType | undefined
>(undefined);

const POLL_INTERVAL = 30000; // 30 seconds

export function NotificationsProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const {
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
    } = useApiNotifications();

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Poll for new notifications and unread count
    useEffect(() => {
        intervalRef.current = setInterval(() => {
            fetchNotifications();
            fetchUnreadCount();
        }, POLL_INTERVAL);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [fetchNotifications, fetchUnreadCount]);

    const refresh = async () => {
        await Promise.all([fetchNotifications(), fetchUnreadCount()]);
    };

    return (
        <NotificationsContext.Provider
            value={{
                notifications,
                unreadCount,
                loading,
                error,
                hasMore,
                markAsRead,
                markAllAsRead,
                deleteNotification,
                refresh,
                fetchMore,
            }}
        >
            {children}
        </NotificationsContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationsContext);
    if (!context) {
        throw new Error(
            'useNotifications must be used within a NotificationsProvider',
        );
    }
    return context;
}

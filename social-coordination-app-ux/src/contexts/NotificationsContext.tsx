import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';
import { mockNotifications } from '@/src/data/mock-data';
import type { Notification } from '@/src/types';

interface NotificationsContextValue {
    notifications: Notification[];
    unreadCount: number;
    markAllAsRead: () => void;
    deleteNotification: (id: string) => void;
    setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(
    null,
);

export function NotificationsProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [notifications, setNotifications] = useState<Notification[]>(() => [
        ...mockNotifications,
    ]);

    const unreadCount = useMemo(
        () => notifications.filter((n) => n.unread).length,
        [notifications],
    );

    const markAllAsRead = useCallback(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    }, []);

    const deleteNotification = useCallback((id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    const value = useMemo(
        () => ({
            notifications,
            unreadCount,
            markAllAsRead,
            deleteNotification,
            setNotifications,
        }),
        [notifications, unreadCount, markAllAsRead, deleteNotification],
    );

    return (
        <NotificationsContext.Provider value={value}>
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

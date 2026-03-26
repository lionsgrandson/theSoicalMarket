// stores/useNotificationStore.ts
import { create } from "zustand";

export type NotificationKind = "hire" | "message" | "system";

export interface Notification {
  id: string;
  kind: NotificationKind;
  title: string;
  message: string;
  read: boolean;
  createdAt: number;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;

  setFromBackend: (list: Notification[]) => void;
  add: (n: Omit<Notification, "id" | "read" | "createdAt">) => void;
  markAllRead: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,

  setFromBackend: (list) =>
    set({
      notifications: list,
      unreadCount: list.filter((n) => !n.read).length,
    }),

  add: (n) =>
    set((state) => ({
      notifications: [
        {
          id: crypto.randomUUID(),
          read: false,
          createdAt: Date.now(),
          ...n,
        },
        ...state.notifications,
      ],
      unreadCount: state.unreadCount + 1,
    })),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({
        ...n,
        read: true,
      })),
      unreadCount: 0,
    })),
}));

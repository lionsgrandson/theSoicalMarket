import { create } from "zustand";

interface ChatRoom {
  id: number;
  seen: boolean;
  // add other room fields if needed
}

interface ChatStore {
  rooms: ChatRoom[];
  unreadCount: number;

  setRooms: (rooms: ChatRoom[]) => void;
  markRoomAsRead: (roomId: number) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  rooms: [],
  unreadCount: 0,

  // ✅ set rooms & auto-calc unread
  setRooms: (rooms) =>
    set(() => {

      const unread = rooms.filter((r) => r.seen === false).length;


      return {
        rooms,
        unreadCount: unread,
      };
    }),

  // ✅ mark single room as read
  markRoomAsRead: (roomId) =>
    set((state) => {
      const updatedRooms = state.rooms.map((room) =>
        room.id === roomId ? { ...room, seen: true } : room
      );

      return {
        rooms: updatedRooms,
        unreadCount: updatedRooms.filter((r) => r.seen === false).length,
      };
    }),
}));

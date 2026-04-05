"use client";

import { useEffect, useRef, useState } from "react";
import { buildApiUrl } from "@/lib/backendUrls";
import { useAuthStore } from "@/stores/useAuthStore";

interface MessagePayload {
  message: string;
  sender_id: number;
  timestamp?: string;
}

function buildChatSocketUrl(roomId: string, token: string) {
  const rawBase =
    process.env.NEXT_PUBLIC_WS_URL ?? process.env.NEXT_PUBLIC_WEBSOCKET_URL;

  if (!rawBase) {
    throw new Error("Missing NEXT_PUBLIC_WS_URL");
  }

  const trimmedBase = rawBase.replace(/\/+$/, "");
  const handshakeBase = trimmedBase.endsWith("/chat_handshake")
    ? trimmedBase
    : `${trimmedBase}/chat_handshake`;

  return `${handshakeBase}/ws/chat/${roomId}/?token=${encodeURIComponent(token)}`;
}

export default function useChatRoom(
  targetUserId: number,
  onMessage: (msg: MessagePayload) => void
) {
  const [roomId, setRoomId] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const { token } = useAuthStore();

  useEffect(() => {
    if (!targetUserId || !token) return;

    async function createRoom() {
      try {
        const res = await fetch(buildApiUrl("chat_service/get_or_create_room/"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ target_user_id: targetUserId }),
        });

        const data = await res.json();
        setRoomId(data.room_id);
      } catch (error) {
        console.error("Room creation failed:", error);
      }
    }

    createRoom();
  }, [targetUserId, token]);

  useEffect(() => {
    if (!roomId || !token) return;

    const url = buildChatSocketUrl(roomId, token);
    const ws = new WebSocket(url);
    socketRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };

    ws.onerror = (err) => console.error("WebSocket error", err);

    return () => ws.close();
  }, [roomId, token, onMessage]);

  const sendMessage = (text: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ message: text }));
    }
  };

  return { roomId, sendMessage };
}

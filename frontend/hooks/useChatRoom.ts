"use client";

import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/stores/useAuthStore";

interface MessagePayload {
  message: string;
  sender_id: number;
  timestamp?: string;
}

export default function useChatRoom(
  targetUserId: number,
  onMessage: (msg: MessagePayload) => void
) {
  const [roomId, setRoomId] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const { token } = useAuthStore();

  // Step 1: Get or create room
  useEffect(() => {
    if (!targetUserId || !token) return;

    async function createRoom() {
      try {
        // FIX: was hardcoded "https://b436a0944022.ngrok-free.app/..." (expired tunnel)
        // Now reads from env var — set NEXT_PUBLIC_API_BASE_URL in your .env.local
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL!;
        const url = baseUrl.endsWith("/")
          ? `${baseUrl}chat_service/get_or_create_room/`
          : `${baseUrl}/chat_service/get_or_create_room/`;

        const res = await fetch(url, {
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

  // Step 2: Connect WebSocket when roomId is available
  useEffect(() => {
    if (!roomId || !token) return;

    // FIX: was hardcoded "ws://buzz-referral-med-dakota.trycloudflare.com/..." (expired tunnel)
    // Now reads from NEXT_PUBLIC_WS_URL env var
    // Add NEXT_PUBLIC_WS_URL=wss://your-actual-domain.com to .env.local
    const wsBase = process.env.NEXT_PUBLIC_WS_URL!;

    // Token in URL is acceptable for WebSocket (can't set headers in browser WS)
    const url = `${wsBase}/ws/chat/${roomId}/?token=${token}`;
    const ws = new WebSocket(url);
    socketRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };

    ws.onerror = (err) => console.error("WebSocket error", err);

    return () => ws.close();
  }, [roomId, token, onMessage]);

  // Step 3: Send message
  const sendMessage = (text: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ message: text }));
    }
  };

  return { roomId, sendMessage };
}

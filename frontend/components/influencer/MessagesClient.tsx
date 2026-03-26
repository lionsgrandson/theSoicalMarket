"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  MoreHorizontal,
  Paperclip,
  Send,
  Bell,
  ArrowLeft,
  Loader,
} from "lucide-react";
import Image from "next/image";
import { useAuthStore } from "@/stores/useAuthStore";
import { apiClient } from "@/lib/apiClient";
import { uploadFile, uploadToCloudinary } from "@/lib/fileUpload";
import { toast } from "react-toastify";
import { Virtuoso } from "react-virtuoso";
import MessageBubble from "@/components/MessageBubble";

interface Room {
  room_id: string;
  other_user_id: string;
  last_message: string;
  timestamp: string;
  name?: string;
  other_user_avatar?: string;
  profile_picture?: string;
}
interface OtherUserProfile {
  id: string;
  first_name: string;
  brand_profile: {
    business_name: string;
    logo: string;
  };
  influencer_profile: {
    display_name: string;
    profile_picture: string;
  };
}
interface HistoryMessage {
  id: number;
  sender_id: string;
  is_me: boolean;
  message: string;
  timestamp: string;
  file: string;
}

interface Message {
  id: number | string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  fileUrl?: string;
  fileType?: string;
  fileName?: string;
}

type MessageWithRawTimestamp = Message & { rawTimestamp: Date };

interface ChatMessagePayload {
  type: "chat_message";
  message?: string;
  file?: string;
  file_type?: string | null;
  file_name?: string | null;
}

const IMAGE_EXTENSIONS = new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "bmp",
  "svg",
]);

const VIDEO_EXTENSIONS = new Set(["mp4", "mov", "webm", "avi", "mkv"]);

const looksLikeHttpUrl = (value?: string | null) =>
  !!value && /^https?:\/\//i.test(value.trim());

const inferFileMetaFromUrl = (url: string) => {
  const cleanUrl = url.split("?")[0];
  const fileName = cleanUrl.split("/").pop() || "file";
  const ext = fileName.split(".").pop()?.toLowerCase();

  if (!ext) return { fileType: undefined as string | undefined, fileName };

  if (IMAGE_EXTENSIONS.has(ext)) {
    const normalized = ext === "jpg" ? "jpeg" : ext;
    return { fileType: `image/${normalized}`, fileName };
  }

  if (VIDEO_EXTENSIONS.has(ext)) {
    return { fileType: `video/${ext}`, fileName };
  }

  return { fileType: undefined as string | undefined, fileName };
};

const getSafeImageSrc = (src?: string) => {
  if (
    !src ||
    src === "profile_picture" ||
    src === "null" ||
    src === "undefined"
  ) {
    return "/images/person.jpg";
  }

  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }

  if (src.startsWith("/")) {
    return "/images/person.jpg";
  }

  return "/images/person.jpg";
};


function InfluencerMessagesClientContent() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [newMessage, setNewMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [loadingOlderMessages, setLoadingOlderMessages] = useState<boolean>(false);
  const [hasMoreMessages, setHasMoreMessages] = useState<boolean>(true);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [otherUserProfile, setOtherUserProfile] =
    useState<OtherUserProfile | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuthStore();
  const currentUserId = user?.id;

  const router = useRouter();
  const searchParams = useSearchParams();
  const otherUserId = searchParams.get("id");

  const wsRef = useRef<WebSocket | null>(null);
  const virtuosoRef = useRef<any>(null);

  // Create or get room from URL parameter
  useEffect(() => {
    const createRoom = async () => {
      if (!otherUserId) {
        console.log("No otherUserId in URL");
        return;
      }

      try {
        console.log("📝 Creating room for user:", otherUserId);

        const token = localStorage.getItem("access_token");
        if (!token) {
          console.error("No access token");
          return;
        }

        const res = await apiClient("chat_service/get_or_create_room/", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            target_user_id: otherUserId,
          }),
        });

        console.log("✅ Room creation response:", res);

        if (res?.data?.room_id) {
          const roomId = res.data.room_id;
          console.log("🔑 Room ID:", roomId);

          // Create full Room object
          const newRoom: Room = {
            room_id: roomId,
            other_user_id: otherUserId,
            last_message: res.data.last_message || "Start a conversation",
            timestamp: res.data.timestamp || new Date().toISOString(),
            name: res.data.name || `User ${otherUserId}`,
            other_user_avatar: res.data.other_user_avatar,
          };

          console.log("🎯 Setting selected room:", newRoom);
          setSelectedRoom(newRoom);
        } else {
          console.error("No room_id in response:", res);
        }
      } catch (err) {
        console.error("Error creating room:", err);
      }
    };

    createRoom();
  }, [otherUserId]);

  useEffect(() => {
    const fetchOtherUserProfile = async () => {
      const targetId = selectedRoom?.other_user_id || otherUserId;
      if (!targetId) return;
      try {
        const response = await apiClient(
          `user_service/get_a_brand/${targetId}/`,
          {
            method: "GET",
          }
        );
        setOtherUserProfile(response?.data);
      } catch (error) {
        console.log("error", error);
      }
    };
    fetchOtherUserProfile();
  }, [otherUserId, selectedRoom]);



  // Fetch rooms for sidebar
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await apiClient("chat_service/get_my_rooms/", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response?.data) {
          setRooms(response.data);
          console.log(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch rooms:", err);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchRooms();

    // Set up polling - fetch every 10 seconds
    const interval = setInterval(fetchRooms, 10000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  // Load older messages (for pagination)
  const loadOlderMessages = async () => {
    if (!selectedRoom || loadingOlderMessages || !hasMoreMessages) return;

    setLoadingOlderMessages(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      // Get the oldest message ID to fetch messages before it
      const oldestMessage = messages[0];
      const oldestMessageId = oldestMessage?.id;

      const response = await apiClient(
        `chat_service/get_room_history/${selectedRoom.room_id}/?before=${oldestMessageId || ""}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response?.data && Array.isArray(response.data)) {
        if (response.data.length === 0) {
          setHasMoreMessages(false);
          return;
        }

        // Transform API response to Message format
        const formattedMessages: MessageWithRawTimestamp[] =
          response.data.map((msg: HistoryMessage) => ({
            id: msg.id,
            senderId: msg.sender_id,
            senderName: msg.is_me ? "You" : selectedRoom?.name || "User",
            content: msg.message,
            fileUrl: msg.file,
            timestamp: new Date(msg.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            isOwn: msg.is_me,
            rawTimestamp: new Date(msg.timestamp),
          }));

        // Sort messages by timestamp (oldest first)
        const sortedMessages = formattedMessages.sort(
          (a, b) => a.rawTimestamp.getTime() - b.rawTimestamp.getTime()
        );

        // Remove rawTimestamp before storing
        const cleanedMessages: Message[] = sortedMessages.map((msg) => {
          const { rawTimestamp, ...rest } = msg;
          return rest;
        });

        // Prepend older messages to the beginning
        setMessages((prev) => [...cleanedMessages, ...prev]);
      }
    } catch (err) {
      console.error("Failed to fetch older messages:", err);
    } finally {
      setLoadingOlderMessages(false);
    }
  };

  // Load chat history when room changes
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!selectedRoom) return;

      setLoadingHistory(true);
      setHasMoreMessages(true);
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await apiClient(
          `chat_service/get_room_history/${selectedRoom.room_id}/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response?.data && Array.isArray(response.data)) {
          // Transform API response to Message format
          const formattedMessages: MessageWithRawTimestamp[] =
            response.data.map((msg: HistoryMessage) => ({
              id: msg.id,
              senderId: msg.sender_id,
              senderName: msg.is_me ? "You" : selectedRoom?.name || "User",
              content: msg.message,
              fileUrl: msg.file,
              timestamp: new Date(msg.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              isOwn: msg.is_me,
              rawTimestamp: new Date(msg.timestamp), // Keep for sorting
            }));

          // Sort messages by timestamp (oldest first)
          const sortedMessages = formattedMessages.sort(
            (a, b) => a.rawTimestamp.getTime() - b.rawTimestamp.getTime()
          );

          // Remove rawTimestamp before storing (optional cleanup)
          const cleanedMessages: Message[] = sortedMessages.map((msg) => {
            const { rawTimestamp, ...rest } = msg;
            return rest;
          });

          console.log("Sorted Messages:", cleanedMessages);
          setMessages(cleanedMessages);
        }
      } catch (err) {
        console.error("Failed to fetch chat history:", err);
        setMessages([]); // Set empty array on error
      } finally {
        setLoadingHistory(false);
      }
    };

    loadChatHistory();
  }, [selectedRoom, router]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (virtuosoRef.current && messages.length > 0) {
      // Scroll to the last message (newest)
      setTimeout(() => {
        virtuosoRef.current?.scrollToIndex({
          index: messages.length - 1,
          behavior: "smooth",
        });
      }, 100);
    }
  }, [messages.length]);


  // Initialize WebSocket
  useEffect(() => {
    if (!selectedRoom || !currentUserId) {
      console.log(
        "⏳ Waiting for room or currentUserId. Room:",
        selectedRoom,
        "UserId:",
        currentUserId
      );
      return;
    }

    let isMounted = true;

    const initiateChat = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          console.error("No access token found");
          toast("Login expired");
          router.push("/auth/login");
          return;
        }

        console.log(
          "✨ Initiating WebSocket connection for room:",
          selectedRoom.room_id
        );

        // Close any existing connection
        if (wsRef.current) {
          console.log("Closing existing WebSocket");
          wsRef.current.close();
          wsRef.current = null;
        }

        // Build WebSocket URL using existing room
        const wsUrl = `wss://exhaust-minute-picked-reservations.trycloudflare.com/chat_handshake/ws/chat/${
          selectedRoom.room_id
        }/?token=${encodeURIComponent(token)}`;

        console.log("🔗 Connecting to WebSocket:", wsUrl);

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        const userId = currentUserId;

        ws.onopen = () => {
          console.log("✅ WebSocket connected to room:", selectedRoom.room_id);
          if (isMounted) {
            // Trigger a re-render to enable send button
            setMessages((prev) => prev);
          }
        };

        ws.onmessage = (event) => {
          if (!isMounted) return;

          try {
            const payload = JSON.parse(event.data);

            console.log("Message received:", {
              sender_id: payload.sender_id,
              current_user: userId,
              is_own: Number(payload.sender_id) !== Number(userId),
            });

            let incomingMessage = payload.message ?? "";
            let fileUrl = payload.file ?? undefined;
            let fileType = payload.file_type ?? undefined;
            let fileName = payload.file_name ?? undefined;

            if (!fileUrl && looksLikeHttpUrl(incomingMessage)) {
              fileUrl = incomingMessage.trim();
              const meta = inferFileMetaFromUrl(fileUrl);
              fileType = fileType || meta.fileType;
              fileName = fileName || meta.fileName;
              incomingMessage = "";
            }

            if (
              (incomingMessage || fileUrl) &&
              Number(payload.sender_id) !== Number(userId)
            ) {
              setMessages((prev) => [
                ...prev,
                {
                  id: payload.id || Date.now(),
                  content: incomingMessage,
                  fileUrl,
                  fileType,
                  fileName,
                  senderId: payload.sender_id,
                  isOwn: Number(payload.sender_id) === Number(userId),
                  timestamp: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  senderName: selectedRoom.name || "User",
                },
              ]);

              // Scroll to bottom
              setTimeout(() => {
                virtuosoRef.current?.scrollToIndex({
                  index: messages.length,
                  behavior: "smooth",
                });
              }, 100);
            }
          } catch (error) {
            console.error("Error processing message:", error);
          }
        };

        ws.onerror = (err) => {
          console.error("❌ WebSocket error:", err);
        };

        ws.onclose = () => {
          console.log("⚠️ WebSocket disconnected");
        };
      } catch (err) {
        console.error("Failed to initiate chat:", err);
      }
    };

    initiateChat();

    return () => {
      isMounted = false;
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [selectedRoom, currentUserId]);

  const handleSendMessage = async () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      toast("Not connected. Reconnecting...");
      return;
    }

    const hasText = newMessage.trim().length > 0;
    const hasFile = !!attachedFile;

    if (!hasText && !hasFile) return;

    let fileUrl: string | undefined;
    let fileType: string | undefined;
    let fileName: string | undefined;

    // Upload file first if attached
    if (hasFile && attachedFile) {
      setUploading(true);
      const uploadResult = await uploadToCloudinary(attachedFile);

      if (!uploadResult.success || !uploadResult.url) {
        alert(
          "Failed to upload file: " + (uploadResult.error || "Unknown error")
        );
        setUploading(false);
        return;
      }

      fileUrl = uploadResult.url;
      fileType = attachedFile.type;
      fileName = uploadResult.filename || attachedFile.name;
      setUploading(false);
    }

    // Prepare message payload
    const payload: ChatMessagePayload = {
      type: "chat_message",
    };

    if (hasText) payload.message = newMessage;
    if (fileUrl) {
      payload.file = fileUrl;
      payload.file_type = fileType;
      payload.file_name = fileName;
    }

    // Send via WebSocket
    wsRef.current.send(JSON.stringify(payload));

    // Optimistic update
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        content: hasText ? newMessage : "",

        senderId: currentUserId!,
        senderName: "You",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isOwn: true,
        fileUrl: fileUrl || undefined,
        fileType,
        fileName,
      },
    ]);

    // Reset input
    setNewMessage("");
    setAttachedFile(null);
    setFilePreview(null);

    // Scroll to bottom
    setTimeout(() => {
      virtuosoRef.current?.scrollToIndex({
        index: messages.length,
        behavior: "smooth",
      });
    }, 100);
  };

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
    setShowSidebar(false);
  };

  const filteredRooms = rooms.filter((room) =>
    (room.name || room.other_user_id)
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const formatLastMessage = (msg: string, timestamp: string) => {
    const safeMsg = msg || "No messages yet";
    const date = new Date(timestamp);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const displayedMessage =
      safeMsg.length > 50 ? safeMsg.substring(0, 50) + "..." : safeMsg;

    return {
      message: displayedMessage,
      time: isToday
        ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : date.toLocaleDateString([], { month: "short", day: "numeric" }),
    };
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optional: limit size (e.g. 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File too large. Max 10MB allowed.");
      return;
    }

    setAttachedFile(file);

    // Generate preview for images & videos
    if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
      const reader = new FileReader();
      reader.onload = () => setFilePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="h-[calc(100vh-48px)]  flex relative">
      {/* Mobile Overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden animate-in fade-in duration-200"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Left Sidebar - Rooms */}
      <div
        className={`
    fixed md:relative inset-y-0 left-0 z-30 w-full md:w-80 
    bg-white border-r border-gray-200 flex flex-col 
    transform transition-transform duration-300 ease-in-out
    ${showSidebar || !selectedRoom ? "translate-x-0" : "-translate-x-full"}
    md:translate-x-0 md:block
    ${selectedRoom ? "md:block" : "block"} 
    h-full
  `}
      >
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSidebar(false)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-bold text-primary">Messages</h1>
            </div>
            {/* <div className="flex items-center gap-2">
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all duration-200">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full"></span>
              </button>
            </div> */}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-gray-50 focus:bg-white transition-all duration-200 text-sm"
            />
          </div>
        </div>

        {/* <div className="p-4 border-b border-gray-200">
          <div
            onClick={() => {
              router.push("/influencer-dashboard/message-request");
            }}
            className="cursor-pointer flex items-center gap-3 p-3 bg-primary/20 rounded-xl transition-all duration-200 hover:bg-primary/30"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white text-sm">💬</span>
            </div>
            <div className="flex-1">
              <span className="text-sm font-semibold text-primary">
                1 request
              </span>
              <p className="text-xs text-primary">Tap to view</p>
            </div>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          </div>
        </div> */}

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p className="text-sm">No conversations yet</p>
            </div>
          ) : (
            filteredRooms.map((room) => {
              const { message, time } = formatLastMessage(
                room.last_message,
                room.timestamp
              );
              const profilePicture = getSafeImageSrc(room?.profile_picture)

              return (
                <div
                  key={room.room_id}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-all duration-200 ${
                    selectedRoom?.room_id === room.room_id
                      ? "border-l-4 border-l-primary bg-gray-50"
                      : ""
                  }`}
                  onClick={() => handleRoomSelect(room)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      {profilePicture ? (
                        <Image
                          src={profilePicture}
                          alt="name"
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full overflow-hidden"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
                          {room.name?.[0] || room.other_user_id?.[0] || "?"}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm truncate text-gray-900">
                          {room.name || room.other_user_id}
                        </p>
                        <span className="text-xs text-gray-400 ml-2">
                          {time}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {!selectedRoom ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-500">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700">
            Select a conversation
          </h3>
          <p className="text-sm">
            Choose a chat from the left to start messaging
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-200 p-4 shadow-sm sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSidebar(true)}
                  className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all duration-200"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </button>
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
                  {selectedRoom.profile_picture ? (
                    <Image
                      src={selectedRoom.profile_picture}
                      alt={selectedRoom.name || "name"}
                      width={48}
                      height={48}
                      className="w-[48px] h-[48px] rounded-full"
                    />
                  ) : (
                    <span>
                      {selectedRoom.name || otherUserProfile?.brand_profile?.business_name?.[0] ||
                        otherUserProfile?.influencer_profile
                          ?.display_name?.[0] ||
                        "?"}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-gray-900 truncate">
                    {selectedRoom.name || otherUserProfile?.brand_profile?.business_name ||
                      otherUserProfile?.influencer_profile?.display_name ||
                      "?"}
                  </p>
                  {/* <p className="text-sm text-gray-500">Active now</p> */}
                </div>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 bg-gray-50">
            {loadingHistory ? (
              <div className="flex items-center justify-center h-full">
                <Loader className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p className="text-sm">
                  No messages yet. Start a conversation!
                </p>
              </div>
            ) : (
              <Virtuoso
                ref={virtuosoRef}
                data={messages}
                initialTopMostItemIndex={messages.length - 1}
                followOutput="smooth"
                startReached={() => {
                  if (hasMoreMessages && !loadingOlderMessages) {
                    loadOlderMessages();
                  }
                }}
                itemContent={(index, message) => (
                  <div className="px-4">
                    <MessageBubble
                      message={message}
                      selectedRoomName={selectedRoom?.name}
                      selectedRoomOtherUserId={selectedRoom?.other_user_id}
                    />
                  </div>
                )}
                components={{
                  Header: () =>
                    loadingOlderMessages ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader className="h-5 w-5 animate-spin text-primary" />
                      </div>
                    ) : null,
                }}
              />
            )}
          </div>

          {/* Input Area */}
          <div className="bg-white border-t border-gray-200 p-4 sticky bottom-0">
            {/* File Preview */}
            {attachedFile && (
              <div className="mb-4 flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                {filePreview ? (
                  <div className="relative">
                    {attachedFile.type.startsWith("image/") ? (
                      <img
                        src={filePreview}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    ) : attachedFile.type.startsWith("video/") ? (
                      <video
                        src={filePreview}
                        controls
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 border-2 border-dashed rounded-lg flex items-center justify-center">
                        <Paperclip className="h-8 w-8 text-gray-500" />
                      </div>
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                        <Loader className="h-6 w-6 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-gray-200 border-2 border-dashed rounded-lg flex items-center justify-center">
                    <Paperclip className="h-8 w-8 text-gray-500" />
                  </div>
                )}

                <div className="flex-1">
                  <p className="text-sm font-medium truncate max-w-xs">
                    {attachedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(attachedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>

                <button
                  onClick={() => {
                    setAttachedFile(null);
                    setFilePreview(null);
                  }}
                  className="text-red-500 hover:bg-red-50 p-2 rounded-full transition"
                >
                  ×
                </button>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all duration-200 flex-shrink-0"
              >
                <Paperclip className="h-5 w-5" />
              </button>

              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && !e.shiftKey && handleSendMessage()
                }
                className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary outline-none text-sm bg-gray-50 focus:bg-white transition"
              />

              <button
                onClick={handleSendMessage}
                disabled={uploading || (!newMessage.trim() && !attachedFile)}
                className="p-3 bg-primary hover:bg-primary-dark disabled:bg-gray-300 text-white rounded-full transition-all shadow-sm disabled:cursor-not-allowed relative"
              >
                {uploading ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*,video/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function InfluencerMessagesClient() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-10"><Loader className="w-8 h-8 animate-spin text-primary" /></div>}>
      <InfluencerMessagesClientContent />
    </Suspense>
  );
}

"use client";

import { memo } from "react";
import Image from "next/image";

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

interface MessageBubbleProps {
  message: Message;
  selectedRoomName?: string;
  selectedRoomOtherUserId?: string;
}

const MessageBubble = memo(function MessageBubble({
  message,
  selectedRoomName,
  selectedRoomOtherUserId,
}: MessageBubbleProps) {
  return (
    <div
      className={`flex ${
        message.isOwn ? "justify-end" : "justify-start"
      }  my-2`}
    >
      <div className="flex items-end gap-2 max-w-[85%] sm:max-w-xs lg:max-w-md">
        {!message.isOwn && (
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
            {selectedRoomName?.[0] || selectedRoomOtherUserId?.[0] || "?"}
          </div>
        )}
        <div
          className={`px-4 py-3 rounded-2xl shadow-sm ${
            message.isOwn
              ? "bg-gradient-to-r from-primary to-primary text-white rounded-br-md"
              : "bg-white text-gray-900 rounded-bl-md border border-gray-200"
          }`}
        >
          {/* Show image/video/file */}
          {message.fileUrl && (
            <div className="mb-2 rounded-lg overflow-hidden bg-black/5">
              {message.fileType?.startsWith("image/") ? (
                <img
                  src={message.fileUrl}
                  alt="sent attachment"
                  className="w-full h-full object-contain max-w-sm"
                />
              ) : message.fileType?.startsWith("video/") ? (
                <video
                  src={message.fileUrl}
                  controls
                  className="w-full h-full object-contain max-w-sm"
                />
              ) : (
                <Image
                  src={message.fileUrl}
                  alt={message.fileUrl}
                  width={320}
                  height={320}
                  className="w-full h-full object-contain max-w-sm"
                />
              )}
            </div>
          )}

          {message.content && (
            <p className="text-sm break-words">{message.content}</p>
          )}
          <p
            className={`text-xs mt-1 ${
              message.isOwn ? "text-blue-100" : "text-gray-400"
            }`}
          >
            {message.timestamp}
          </p>
        </div>
      </div>
    </div>
  );
});

export default MessageBubble;


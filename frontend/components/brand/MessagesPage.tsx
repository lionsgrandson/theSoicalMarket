"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { Search, MoreHorizontal, Paperclip, Send, Bell } from "lucide-react";
import Image from "next/image";

// Mock data structure - easily replaceable with backend data
const mockContacts = [
  {
    id: 1,
    name: "Sarah Marketing",
    lastMessage: "Re: Collaboration Inquiry",
    avatar:
      "https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    isOnline: true,
    lastSeen: "Active 4m ago",
    hasUnread: false,
  },
  {
    id: 2,
    name: "Creator Admin",
    lastMessage: "Your profile is now live!",
    avatar:
      "https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    isOnline: false,
    lastSeen: "2h ago",
    hasUnread: false,
  },
  {
    id: 3,
    name: "Emily Business",
    lastMessage: "Follow up: Tech Gadget Review...",
    avatar:
      "https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    isOnline: false,
    lastSeen: "1d ago",
    hasUnread: false,
  },
  {
    id: 4,
    name: "David Creator",
    lastMessage: "Proposal for Fashion...",
    avatar:
      "https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    isOnline: true,
    lastSeen: "Active now",
    hasUnread: false,
  },
];

const mockChatRequest = {
  id: 1,
  requester: "Market Meetup",
  email: "fashionistaBusiness@gmail.com",
  message: "wants to chat with you",
  warning:
    "Message from unknown or unexpected people could be spam or phishing attempts. Never share your account information or authorize sign-in requests over chat.",
  safetyTip: "To be safe, preview their messages.",
};

const mockMessages = [
  {
    id: 1,
    senderId: 1,
    senderName: "Sarah Marketing",
    content: "Lorem ipsum dolor sit amet consectetur.",
    timestamp: "2:30 PM",
    isOwn: false,
  },
  {
    id: 2,
    senderId: "current-user",
    senderName: "You",
    content:
      "ype and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in",
    timestamp: "2:32 PM",
    isOwn: true,
  },
  {
    id: 3,
    senderId: 1,
    senderName: "Sarah Marketing",
    content: "Lorem ipsum dolor sit amet consectetur.",
    timestamp: "2:35 PM",
    isOwn: false,
  },
  {
    id: 4,
    senderId: "current-user",
    senderName: "You",
    content:
      "ype and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in",
    timestamp: "2:37 PM",
    isOwn: true,
  },
];

type Contact = {
  id: number;
  name: string;
  lastMessage: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: string;
  hasUnread: boolean;
};

export default function MessagesPage() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showChatRequest, setShowChatRequest] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState(mockMessages);

  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const { id } = params;
  console.log(id);

  useEffect(() => {
    const userId = searchParams.get("userId");
    const userName = searchParams.get("userName");
    const userImage = searchParams.get("userImage");

    if (userId) {
      let contact = mockContacts.find((c) => c.id === Number.parseInt(userId));

      // If contact doesn't exist in mock data but we have user info, create it
      if (!contact && userName) {
        contact = {
          id: Number.parseInt(userId),
          name: decodeURIComponent(userName),
          lastMessage: "Start a new conversation",
          avatar: userImage
            ? decodeURIComponent(userImage)
            : "/placeholder.svg",
          isOnline: true,
          lastSeen: "Active now",
          hasUnread: false,
        };
      }

      if (contact) {
        setSelectedContact(contact);
        setShowChatRequest(false); // Skip chat request and go directly to chat
      }
    }
  }, [searchParams]);

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    setShowChatRequest(false);
  };

  const handleAcceptRequest = () => {
    setShowChatRequest(false);
    // In real app, this would accept the chat request via API
  };

  const handleRejectRequest = () => {
    setShowChatRequest(false);
    setSelectedContact(null);
    // In real app, this would reject the chat request via API
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        senderId: "current-user",
        senderName: "You",
        content: newMessage,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isOwn: true,
      };
      setMessages([...messages, message]);
      setNewMessage("");
      // In real app, this would send message via API
    }
  };

  const filteredContacts = mockContacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Left Sidebar - Contacts */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">Messages</h1>
            <div className="flex items-center gap-2">
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                M
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Request Notification */}
        <div className="p-4 border-b border-gray-200">
          <div
            onClick={() => {
              router.push("/brand-dashboard/message-request-permission");
            }}
            className="cursor-pointer flex items-center gap-3 p-3 bg-primary rounded-lg"
          >
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-white text-sm">💬</span>
            </div>
            <span className="text-sm font-medium text-primary">1 request</span>
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedContact?.id === contact.id
                  ? "bg-primary border-primary"
                  : ""
              }`}
              onClick={() => handleContactSelect(contact)}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300">
                    <Image
                      height={40}
                      width={40}
                      src={contact.avatar || "/placeholder.svg"}
                      alt={contact.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {contact.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{contact.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {contact.lastMessage}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* See More */}
        <div className="p-4 border-t border-gray-200">
          <button className="text-sm text-gray-600 hover:text-gray-900">
            see more...
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4 shadow-4xl ">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300">
                    <Image
                      width={40}
                      height={40}
                      src={selectedContact.avatar || "/placeholder.svg"}
                      alt={selectedContact.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{selectedContact.name}</p>
                    <p className="text-sm text-gray-500">
                      {selectedContact.lastSeen}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      router.push(
                        `/brand-dashboard/influencers/${id}/send-proposal`
                      );
                    }}
                    className="px-4 py-2 bg-orange-400 hover:bg-orange-500 text-white rounded-md font-medium transition-colors cursor-pointer"
                  >
                    Hire
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Chat Content */}
            {showChatRequest ? (
              // Chat Request Dialog
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="max-w-md w-full text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <div className="w-8 h-8 bg-orange-400 rounded-full"></div>
                    <div className="w-6 h-6 bg-primary rounded-full -ml-2"></div>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {mockChatRequest.requester}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    ({mockChatRequest.email}) {mockChatRequest.message}
                  </p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-sm text-gray-600">
                    <p className="mb-2">{mockChatRequest.warning}</p>
                    <p>{mockChatRequest.safetyTip}</p>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={handleAcceptRequest}
                      className="px-6 py-2 bg-orange-400 hover:bg-orange-500 text-white rounded-md font-medium transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={handleRejectRequest}
                      className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md font-medium transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Active Chat
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.isOwn ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.isOwn
                          ? "bg-primary text-white"
                          : "bg-gray-200 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    {!message.isOwn && (
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-300 ml-2 mt-2">
                        <Image
                          src={selectedContact.avatar}
                          width={32}
                          height={32}
                          alt={selectedContact.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                  <Paperclip className="h-5 w-5" />
                </button>
                <input
                  type="text"
                  placeholder="Start chat"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
                <button
                  onClick={handleSendMessage}
                  className="p-2 bg-primary hover:bg-primary text-white rounded-md transition-colors"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          // No Chat Selected
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

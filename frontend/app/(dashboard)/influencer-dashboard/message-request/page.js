"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

const mockNotifications = [
  {
    id: 1,
    type: "collaboration",
    brand: "Fashionista Business",
    message:
      'New Campaign Invite - Glow Beauty Co. invited you to collaborate on "Winter Radiance Serum."',
    avatar:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQH6JImtRr_PORjJojfyorJksXR84hWSXq9yg&s",
    time: "2h ago",
    isNew: true,
  },
  {
    id: 2,
    type: "collaboration",
    brand: "Gucci beauty & Fashion Business",
    message:
      "we're impressed by your style! We'd love to collaborate on our upcoming fall beauty campaign. Let us know if you're interested.",
    avatar:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQH6JImtRr_PORjJojfyorJksXR84hWSXq9yg&s",
    time: "4h ago",
    isNew: false,
  },
  {
    id: 3,
    type: "collaboration",
    brand: "Velvet Halo Fashion",
    message:
      "Elegant minimalism for the modern woman. we're impressed by your style! We'd love to collaborate on our upcoming fall beauty campaign. Let us know if you're interested.",
    avatar:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQH6JImtRr_PORjJojfyorJksXR84hWSXq9yg&s",
    time: "6h ago",
    isNew: false,
  },
  {
    id: 4,
    type: "collaboration",
    brand: "Urban Threadline Fashion",
    message:
      "Streetwear meets sophistication. we're impressed by your style! We'd love to collaborate on our upcoming fall beauty campaign. Let us know if you're interested.",
    avatar:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQH6JImtRr_PORjJojfyorJksXR84hWSXq9yg&s",
    time: "8h ago",
    isNew: false,
  },
  {
    id: 5,
    type: "collaboration",
    brand: "Noir Luxe Fashion",
    message:
      "Luxury fashion with a high-contrast palette. we're impressed by your style! We'd love to collaborate on our upcoming fall beauty campaign. Let us know if you're interested.",
    avatar:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQH6JImtRr_PORjJojfyorJksXR84hWSXq9yg&s",
    time: "1d ago",
    isNew: false,
  },
  {
    id: 6,
    type: "collaboration",
    brand: "Petal & Stitch Fashion",
    message:
      "Feminine, floral-inspired fashion for spring & summer collections. we're impressed by your style! We'd love to collaborate on our upcoming fall beauty campaign. Let us know if you're interested.",
    avatar:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQH6JImtRr_PORjJojfyorJksXR84hWSXq9yg&s",
    time: "1d ago",
    isNew: false,
  },
  {
    id: 7,
    type: "collaboration",
    brand: "Louis Vuitton",
    message:
      "High-fashion, influencers-favorite Business with dramatic flair. we're impressed by your style! We'd love to collaborate on our upcoming fall beauty campaign. Let us know if you're interested.",
    avatar:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQH6JImtRr_PORjJojfyorJksXR84hWSXq9yg&s",
    time: "2d ago",
    isNew: false,
  },
  {
    id: 8,
    type: "collaboration",
    brand: "Bloom Vibe Fashion Shop",
    message:
      "Sustainable and eco-conscious fashion line. we're impressed by your style! We'd love to collaborate on our upcoming fall beauty campaign. Let us know if you're interested.",
    avatar:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQH6JImtRr_PORjJojfyorJksXR84hWSXq9yg&s",
    time: "2d ago",
    isNew: false,
  },
];

export default function MessageRequest() {
  const [notifications] = useState(mockNotifications);
  const [filter, setFilter] = useState("all"); // "all" or "requests"

  const messageRequests = notifications.filter(
    (n) => n.type === "collaboration"
  );
  const requestCount = messageRequests.length;

  const filteredNotifications =
    filter === "requests" ? messageRequests : notifications;
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/influencer-dashboard/messages"
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Notifications
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                You&apos;ve {requestCount} message request
              </p>
            </div>
          </div>
          {/* <div className="flex items-center gap-4">
            <Link
              href="/messages"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              Messages
            </Link>
            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
              <Image
                width={600}
                height={600}
                src="/user-profile-illustration.png"
                alt="User"
                className="w-full h-full object-cover"
              />
            </div>
          </div> */}
        </div>
      </header>

      <div className="p-6">
        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter("requests")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === "requests"
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
            {requestCount} request
          </button>
        </div>

        {/* Running Section */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span className="text-gray-400">▼</span>
            <span>Running</span>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => {
                router.push("/brand-dashboard/message-request-permission");
              }}
              className={`cursor-pointer bg-white rounded-lg p-4 border transition-colors hover:bg-gray-50 ${
                notification.isNew
                  ? "border-primary bg-primary"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                  <Image
                    width={100}
                    height={60}
                    src={notification.avatar || "/placeholder.svg"}
                    alt={`${notification.brand} logo`}
                    className="w-full h-15 object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {notification.brand}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {notification.message}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {notification.time}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <button className="text-sm text-gray-600 hover:text-gray-900 font-medium">
            see more...
          </button>
        </div>
      </div>
    </div>
  );
}

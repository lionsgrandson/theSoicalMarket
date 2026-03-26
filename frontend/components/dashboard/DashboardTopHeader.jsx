"use client";

import { useEffect, useRef, useState } from "react";
import { IoIosNotificationsOutline } from "react-icons/io";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ArrowRightLeft, Briefcase, ChevronDown, LogOut, Sparkles } from "lucide-react";

import { buildApiUrl } from "@/lib/backendUrls";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNotificationStore } from "@/stores/useNotificationStore";

const INFLUENCER_NOTIFICATIONS = ["CAMPAIGN_COMPLETED", "HIRING_PROPOSAL"];
const BRAND_NOTIFICATIONS = ["PROPOSAL_ACCEPTED", "PROPOSAL_REJECTED"];

const getNotificationLink = (notif) => {
  switch (notif.type_alias) {
    case "HIRING_PROPOSAL":
      return "/influencer-dashboard/campaigns";
    case "CAMPAIGN_COMPLETED":
      return `/influencer-dashboard/campaigns?${notif.campaign_id}`;
    case "PROPOSAL_ACCEPTED":
    case "PROPOSAL_REJECTED":
      return "/brand-dashboard?scrollTo=proposal";
    default:
      return "#";
  }
};

const filterByDashboard = (notifications, isBrandDashboard, isInfluencerDashboard) => {
  if (!notifications?.length) return [];
  const allowedTypes = isBrandDashboard
    ? BRAND_NOTIFICATIONS
    : isInfluencerDashboard
      ? INFLUENCER_NOTIFICATIONS
      : [];
  return notifications.filter(
    (notification) =>
      notification.type_alias && allowedTypes.includes(notification.type_alias)
  );
};

const buildNotificationSocketUrl = (wsBase, token) => {
  if (!wsBase || !token) return null;
  const trimmed = wsBase.trim().replace(/\/+$/, "");
  const root = trimmed.replace(/\/chat_handshake$/i, "");
  return `${root}/ws/notification/?token=${encodeURIComponent(token)}`;
};

const DashboardTopHeader = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const zustandNotifications = useNotificationStore((state) => state.notifications);
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  const wsRef = useRef(null);
  const reconnectRef = useRef(null);
  const pathnameRef = useRef(pathname);

  const isBrandDashboard = pathname.startsWith("/brand-dashboard");
  const isInfluencerDashboard = pathname.startsWith("/influencer-dashboard");

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    const wsUrl = buildNotificationSocketUrl(
      process.env.NEXT_PUBLIC_WS_URL,
      session?.accessToken || localStorage.getItem("access_token")
    );
    if (!wsUrl || wsRef.current?.readyState === WebSocket.OPEN) {
      return undefined;
    }

    const connectWebSocket = () => {
      const currentUrl = buildNotificationSocketUrl(
        process.env.NEXT_PUBLIC_WS_URL,
        session?.accessToken || localStorage.getItem("access_token")
      );
      if (!currentUrl || wsRef.current?.readyState === WebSocket.OPEN) {
        return;
      }

      const ws = new WebSocket(currentUrl);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const mappedNotification = {
            id: data.id || Date.now(),
            message: data.payload?.message || data.message || "",
            campaign_id: data.payload?.campaign_id || data.campaign_id,
            brand_id: data.payload?.brand_id || data.brand_id,
            type_alias: data.payload?.type_alias || data.type_alias,
            hire_id: data.payload?.hire_id || data.hire_id,
          };

          const currentPath = pathnameRef.current;
          const isBrand = currentPath.startsWith("/brand-dashboard");
          const isInfluencer = currentPath.startsWith("/influencer-dashboard");
          const allowedTypes = isBrand
            ? BRAND_NOTIFICATIONS
            : isInfluencer
              ? INFLUENCER_NOTIFICATIONS
              : [];

          if (
            mappedNotification.type_alias &&
            allowedTypes.includes(mappedNotification.type_alias)
          ) {
            setNotifications((prev) => {
              if (prev.some((notification) => notification.id === mappedNotification.id)) {
                return prev;
              }
              return [mappedNotification, ...prev];
            });
            setNotificationCount((count) => count + 1);
          }
        } catch {
          // Ignore malformed notification payloads.
        }
      };

      ws.onclose = () => {
        wsRef.current = null;
        reconnectRef.current = setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };

      wsRef.current = ws;
    };

    connectWebSocket();

    return () => {
      wsRef.current?.close();
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
      }
    };
  }, [session?.accessToken]);

  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      const token = session?.accessToken || localStorage.getItem("access_token");
      if (!token) return;

      try {
        const res = await fetch(
          buildApiUrl("chat_service/get_unread_noti/"),
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) return;

        const json = await res.json();
        const mapped = (json.data || []).map((notification) => ({
          id: notification.id,
          message: notification.payload?.message,
          campaign_id: notification.payload?.campaign_id,
          brand_id: notification.payload?.brand_id,
          type_alias: notification.payload?.type_alias,
          hire_id: notification.payload?.hire_id,
        }));

        const storeMapped = (zustandNotifications || []).map((notification) => ({
          id: notification.id,
          message: notification.message,
          campaign_id: notification.campaign_id,
          brand_id: notification.brand_id,
          type_alias: notification.type_alias,
          hire_id: notification.hire_id,
        }));

        const filtered = filterByDashboard(
          [...storeMapped, ...mapped],
          isBrandDashboard,
          isInfluencerDashboard
        );
        setNotifications(filtered);
        setNotificationCount(filtered.length);
      } catch {
        // Ignore notification fetch errors in the header.
      }
    };

    fetchUnreadNotifications();
  }, [
    pathname,
    isBrandDashboard,
    isInfluencerDashboard,
    zustandNotifications,
    session?.accessToken,
  ]);

  const handleNotificationClick = async () => {
    const nextState = !showNotifDropdown;
    setShowNotifDropdown(nextState);
    setShowProfileDropdown(false);

    if (nextState && notificationCount > 0) {
      try {
        const token = session?.accessToken || localStorage.getItem("access_token");
        if (!token) return;
        await fetch(buildApiUrl("chat_service/noti_seen_all/"), {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotificationCount(0);
      } catch {
        // Ignore mark-read errors here; the dropdown should still open.
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const token = session?.accessToken || localStorage.getItem("access_token");
      if (!token) return;
      await fetch(buildApiUrl("chat_service/noti_seen_all/"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotificationCount(0);
      setNotifications([]);
    } catch {
      // Ignore mark-read errors here; the UI stays usable.
    }
  };

  const handleLogout = async () => {
    try {
      logout();
      await signOut({ redirect: true, callbackUrl: "/" });
    } catch {
      window.location.href = "/";
    }
  };

  const switchDashboard = () => {
    router.push(
      isBrandDashboard ? "/influencer-dashboard" : "/brand-dashboard"
    );
    setShowProfileDropdown(false);
  };

  const profileImage = isBrandDashboard
    ? user?.brand_profile?.logo
    : isInfluencerDashboard
      ? user?.influencer_profile?.profile_picture
      : null;

  const displayName =
    (isBrandDashboard && user?.brand_profile?.business_name) ||
    (isInfluencerDashboard && user?.influencer_profile?.display_name) ||
    user?.user?.first_name ||
    "U";

  return (
    <div className="bg-white px-4 py-5 sm:px-8">
      <div className="flex items-center justify-between">
        <div className="mr-6 hidden items-center md:flex">
          <Link
            href={isBrandDashboard ? "/influencer-dashboard" : "/brand-dashboard"}
            className="group flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/5"
            title={
              isBrandDashboard
                ? "Currently logged in as Brand"
                : "Currently logged in as Influencer"
            }
          >
            {isBrandDashboard ? (
              <Briefcase size={16} className="opacity-70" />
            ) : (
              <Sparkles size={16} className="opacity-70" />
            )}
            <span>{isBrandDashboard ? "Brand Account" : "Influencer Account"}</span>
            <ArrowRightLeft
              size={14}
              className="ml-1 opacity-50 transition group-hover:opacity-80"
            />
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={handleNotificationClick}
              className="relative rounded-full bg-gray-100 p-2.5 transition hover:bg-gray-200"
            >
              <IoIosNotificationsOutline size={26} className="text-gray-700" />
              {notificationCount > 0 && (
                <span className="absolute right-0 top-0 flex h-5 w-5 translate-x-1/4 -translate-y-1/4 items-center justify-center rounded-full border-2 border-white bg-red-500 text-[10px] font-bold text-white">
                  {notificationCount > 99 ? "99+" : notificationCount}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifDropdown(false)}
                />
                <div className="pointer-events-none fixed inset-x-0 left-0 z-50 px-4 sm:px-0">
                  <div className="pointer-events-auto max-h-[70vh] w-full overflow-hidden rounded-t-2xl border border-gray-200 bg-white shadow-xl sm:absolute sm:right-0 sm:mt-2 sm:max-h-[300px] sm:w-80 sm:rounded-xl">
                    <div className="flex items-center justify-between border-b border-gray-100 p-4">
                      <h3 className="font-semibold text-gray-800">Notifications</h3>
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-primary hover:underline"
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-sm text-gray-500">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => {
                              router.push(getNotificationLink(notification));
                              setShowNotifDropdown(false);
                            }}
                            className="flex cursor-pointer gap-3 border-b border-gray-50 p-3 hover:bg-gray-50"
                          >
                            <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                            <div>
                              <p className="text-sm leading-snug text-gray-800">
                                {notification.message}
                                <span className="ml-1 text-primary underline">View</span>
                              </p>
                              <span className="mt-1 block text-xs text-gray-400">
                                Just now
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setShowProfileDropdown(!showProfileDropdown);
                setShowNotifDropdown(false);
              }}
              className="flex items-center gap-2 rounded-full p-1 pr-3 transition hover:bg-gray-50"
            >
              {profileImage ? (
                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-white ring-2 ring-gray-200">
                  <Image
                    src={profileImage}
                    alt="Profile"
                    width={44}
                    height={44}
                    className={`h-full w-full ${isBrandDashboard ? "object-contain p-1" : "object-cover"}`}
                  />
                </div>
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary font-semibold uppercase text-white">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <ChevronDown
                size={18}
                className={`text-gray-600 transition-transform ${
                  showProfileDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {showProfileDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProfileDropdown(false)}
                />
                <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                  <div className="border-b border-gray-100 p-4">
                    <p className="font-semibold text-primary">
                      {user?.user?.first_name || "User"}
                    </p>
                    <p className="truncate text-sm text-gray-500">
                      {user?.user?.email}
                    </p>
                  </div>
                  <div className="py-2">
                    {(isBrandDashboard || isInfluencerDashboard) && (
                      <button
                        onClick={switchDashboard}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-gray-50"
                      >
                        <span className="font-semibold text-primary">Switch</span>
                        <span className="text-sm text-gray-500">
                          - {isBrandDashboard ? "Influencer Dashboard" : "Brand Dashboard"}
                        </span>
                      </button>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      <span className="text-base">Log Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTopHeader;

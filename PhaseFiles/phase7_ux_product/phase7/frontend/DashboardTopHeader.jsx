"use client";

// components/dashboard/DashboardTopHeader.jsx
// Phase 7: Cleaned up version of the existing file.
// Changes:
//   - All debug log statements removed (were logging notification data)
//   - WebSocket connection uncommented and fixed to use env var (not hardcoded URL)
//   - Cookies import removed (NextAuth owns the cookie now)

import { useState, useEffect, useRef } from "react";
import { IoIosNotificationsOutline } from "react-icons/io";
import { useAuthStore } from "@/stores/useAuthStore";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { ChevronDown, LogOut, ArrowRightLeft, Briefcase, Sparkles } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useNotificationStore } from "@/stores/useNotificationStore";

const INFLUENCER_NOTIFICATIONS = ["CAMPAIGN_COMPLETED", "HIRING_PROPOSAL"];
const BRAND_NOTIFICATIONS = ["PROPOSAL_ACCEPTED", "PROPOSAL_REJECTED"];

const getNotificationLink = (notif) => {
  switch (notif.type_alias) {
    case "HIRING_PROPOSAL": return "/influencer-dashboard/campaigns";
    case "CAMPAIGN_COMPLETED": return `/influencer-dashboard/campaigns?${notif.campaign_id}`;
    case "PROPOSAL_ACCEPTED":
    case "PROPOSAL_REJECTED": return `/brand-dashboard?scrollTo=proposal`;
    default: return "#";
  }
};

const filterByDashboard = (notifications, isBrand, isInfluencer) => {
  if (!notifications?.length) return [];
  const allowed = isBrand ? BRAND_NOTIFICATIONS : isInfluencer ? INFLUENCER_NOTIFICATIONS : [];
  return notifications.filter((n) => n.type_alias && allowed.includes(n.type_alias));
};

const DashboardTopHeader = () => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const pathname = usePathname();
  const zustandNoti = useNotificationStore((s) => s.notifications);
  const { data: session } = useSession();

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  const wsRef = useRef(null);
  const reconnectRef = useRef(null);
  const pathnameRef = useRef(pathname);

  const isBrand = pathname.startsWith("/brand-dashboard");
  const isInfluencer = pathname.startsWith("/influencer-dashboard");

  useEffect(() => { pathnameRef.current = pathname; }, [pathname]);

  // Phase 7: WebSocket now uses env var instead of hardcoded tunnel URL
  const connectWebSocket = () => {
    const token = session?.accessToken || localStorage.getItem("access_token");
    if (!token || wsRef.current?.readyState === WebSocket.OPEN) return;

    const wsBase = process.env.NEXT_PUBLIC_WS_URL;
    if (!wsBase) return;

    const ws = new WebSocket(`${wsBase}/ws/notifications/?token=${token}`);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const mapped = {
          id: data.id || Date.now(),
          message: data.payload?.message || data.message || "",
          campaign_id: data.payload?.campaign_id || data.campaign_id,
          brand_id: data.payload?.brand_id || data.brand_id,
          type_alias: data.payload?.type_alias || data.type_alias,
          hire_id: data.payload?.hire_id || data.hire_id,
        };
        const cur = pathnameRef.current;
        const isCurBrand = cur.startsWith("/brand-dashboard");
        const isCurInfluencer = cur.startsWith("/influencer-dashboard");
        const allowed = isCurBrand ? BRAND_NOTIFICATIONS : isCurInfluencer ? INFLUENCER_NOTIFICATIONS : [];
        if (mapped.type_alias && allowed.includes(mapped.type_alias)) {
          setNotifications((prev) => {
            if (prev.some((n) => n.id === mapped.id)) return prev;
            return [mapped, ...prev];
          });
          setNotificationCount((n) => n + 1);
        }
      } catch {}
    };

    ws.onclose = () => {
      wsRef.current = null;
      reconnectRef.current = setTimeout(connectWebSocket, 3000);
    };

    wsRef.current = ws;
  };

  useEffect(() => {
    connectWebSocket();
    return () => {
      wsRef.current?.close();
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
    };
  }, [session]);

  // Fetch stored unread notifications on load
  useEffect(() => {
    const fetchUnread = async () => {
      const token = session?.accessToken || localStorage.getItem("access_token");
      if (!token) return;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}chat_service/get_unread_noti/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) return;
        const json = await res.json();
        const mapped = (json.data || []).map((n) => ({
          id: n.id,
          message: n.payload?.message,
          campaign_id: n.payload?.campaign_id,
          brand_id: n.payload?.brand_id,
          type_alias: n.payload?.type_alias,
          hire_id: n.payload?.hire_id,
        }));
        const zustand = (zustandNoti || []).map((n) => ({
          id: n.id, message: n.message,
          campaign_id: n.campaign_id, brand_id: n.brand_id,
          type_alias: n.type_alias, hire_id: n.hire_id,
        }));
        const combined = [...zustand, ...mapped];
        const filtered = filterByDashboard(combined, isBrand, isInfluencer);
        setNotifications(filtered);
        setNotificationCount(filtered.length);
      } catch {}
    };
    fetchUnread();
  }, [pathname, isBrand, isInfluencer, zustandNoti, session]);

  const handleNotificationClick = async () => {
    const next = !showNotifDropdown;
    setShowNotifDropdown(next);
    setShowProfileDropdown(false);
    if (next && notificationCount > 0) {
      try {
        const token = session?.accessToken || localStorage.getItem("access_token");
        if (!token) return;
        await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}chat_service/noti_seen_all/`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotificationCount(0);
      } catch {}
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const token = session?.accessToken || localStorage.getItem("access_token");
      if (!token) return;
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}chat_service/noti_seen_all/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotificationCount(0);
      setNotifications([]);
    } catch {}
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
    router.push(isBrand ? "/influencer-dashboard" : "/brand-dashboard");
    setShowProfileDropdown(false);
  };

  const profileImage = isBrand
    ? user?.brand_profile?.logo
    : isInfluencer
    ? user?.influencer_profile?.profile_picture
    : null;

  const displayName =
    (isBrand && user?.brand_profile?.business_name) ||
    (isInfluencer && user?.influencer_profile?.display_name) ||
    user?.user?.first_name || "U";

  return (
    <div className="bg-white px-4 sm:px-8 py-5">
      <div className="flex items-center justify-between">
        {/* Context switcher */}
        <div className="mr-6 hidden md:flex items-center">
          <Link
            href={isBrand ? "/influencer-dashboard" : "/brand-dashboard"}
            className="group flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-primary hover:bg-primary/5 transition whitespace-nowrap"
          >
            {isBrand ? <Briefcase size={16} className="opacity-70" /> : <Sparkles size={16} className="opacity-70" />}
            <span>{isBrand ? "Brand Account" : "Influencer Account"}</span>
            <ArrowRightLeft size={14} className="ml-1 opacity-50 group-hover:opacity-80 transition" />
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Notification bell */}
          <div className="relative">
            <button
              onClick={handleNotificationClick}
              className="relative p-2.5 bg-gray-100 rounded-full hover:bg-gray-200 transition"
            >
              <IoIosNotificationsOutline size={26} className="text-gray-700" />
              {notificationCount > 0 && (
                <span className="absolute top-0 right-0 flex h-5 w-5 translate-x-1/4 -translate-y-1/4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white">
                  {notificationCount > 99 ? "99+" : notificationCount}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifDropdown(false)} />
                <div className="fixed inset-x-0 left-0 z-50 px-4 sm:px-0 pointer-events-none">
                  <div className="pointer-events-auto overflow-y-auto sm:absolute sm:right-0 sm:mt-2 w-full sm:w-80 max-h-[70vh] sm:max-h-[300px] bg-white rounded-t-2xl sm:rounded-xl shadow-xl border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-800">Notifications</h3>
                      <button onClick={handleMarkAllRead} className="text-xs text-primary hover:underline">
                        Mark all read
                      </button>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-gray-500 text-sm">No new notifications</div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => { router.push(getNotificationLink(n)); setShowNotifDropdown(false); }}
                            className="p-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer flex gap-3"
                          >
                            <div className="w-2 h-2 mt-2 rounded-full bg-primary flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-800 leading-snug">
                                {n.message}
                                <span className="text-primary underline ml-1">View</span>
                              </p>
                              <span className="text-xs text-gray-400 mt-1 block">Just now</span>
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

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => { setShowProfileDropdown(!showProfileDropdown); setShowNotifDropdown(false); }}
              className="flex items-center gap-2 hover:bg-gray-50 rounded-full p-1 pr-3 transition"
            >
              {profileImage ? (
                <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-gray-200 bg-white flex items-center justify-center">
                  <Image src={profileImage} alt="Profile" width={44} height={44}
                    className={`w-full h-full ${isBrand ? "object-contain p-1" : "object-cover"}`} />
                </div>
              ) : (
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center font-semibold uppercase">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <ChevronDown size={18} className={`text-gray-600 transition-transform ${showProfileDropdown ? "rotate-180" : ""}`} />
            </button>

            {showProfileDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowProfileDropdown(false)} />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                  <div className="p-4 border-b border-gray-100">
                    <p className="font-semibold text-primary">{user?.user?.first_name || "User"}</p>
                    <p className="text-sm text-gray-500 truncate">{user?.user?.email}</p>
                  </div>
                  <div className="py-2">
                    {(isBrand || isInfluencer) && (
                      <button onClick={switchDashboard} className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition">
                        <span className="font-semibold text-primary">Switch</span>
                        <span className="text-sm text-gray-500">→ {isBrand ? "Influencer Dashboard" : "Brand Dashboard"}</span>
                      </button>
                    )}
                    <button onClick={handleLogout} className="w-full px-4 py-3 text-left hover:bg-red-50 text-red-600 flex items-center gap-3 transition">
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

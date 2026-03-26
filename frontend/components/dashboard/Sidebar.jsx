"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { LogOut } from "lucide-react";
import { useChatStore } from "@/stores/chatStore";
import { signOut } from "next-auth/react";

export function Sidebar({ links = [], setShowSideBar }) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const { user, logout } = useAuthStore();
    const unreadCount = useChatStore((state) => state.unreadCount);
    console.log("unreadCount from context",unreadCount);
 
    

  const handleLogOut = async () => {
    try {
      // 1. Clear Zustand/localStorage first
      logout();
      
      // 2. Then sign out from NextAuth
      await signOut({
        redirect: true,
        callbackUrl: "/",
      });
    } catch (err) {
      console.error("Logout error:", err);
      window.location.href = "/";
    }
  };
  return (
    <div
      style={{ boxShadow: "2px 0px 10px 0px rgba(0, 0, 0, 0.1)" }}
      className="w-64 bg-primary text-white flex flex-col rounded-r-3xl h-screen overflow-hidden"
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <Link href={"/"} className="w-auto h-auto rounded-lg flex items-center justify-center">
            <Image
              width={160}
              height={45}
              src={"/images/logo.png"}
              alt=""
            />
          </Link>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
         {links.map((item) => {
  const isActive = pathname === item.path;

  return (
    <li key={item.name} onClick={() => setShowSideBar?.(false)}>
      <Link
        href={item.path}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
          isActive
            ? "bg-secondary text-slate-800 font-medium"
            : "text-slate-300 hover:bg-primary hover:text-white"
        }`}
      >
        {/* Left side */}
        <div className="flex items-center gap-3">
          <span className="text-lg">{item.icon}</span>
          <span>{item.name}</span>
        </div>

        {/* 🔴 Unread badge */}
        {item.showUnread && unreadCount > 0 && (
          <span className="min-w-[22px] h-[22px] flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-semibold">
            {unreadCount}
          </span>
        )}
      </Link>
    </li>
  );
})}

        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-700">
        <button
          className="w-full flex items-center gap-2 cursor-pointer justify-start px-4 py-3 text-slate-300  hover:bg-primary hover:text-white rounded-lg transition-colors"
          onClick={handleLogOut}
        >
          <LogOut size={18} className="text-[14px]" />
          Logout
        </button>
      </div>

      
    </div>
  );
}

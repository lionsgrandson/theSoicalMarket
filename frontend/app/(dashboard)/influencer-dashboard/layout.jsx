// app/brand-dashboard/layout.js
"use client";
import { useEffect, useRef, useState } from "react";
import { Sidebar } from "../../../components/dashboard/Sidebar";
import { HiMenu, HiX } from "react-icons/hi";
import { influencerLinks } from "../../../config/sidebarLinks";
import { usePathname } from "next/navigation";
import DashboardTopHeader from "../../../components/dashboard/DashboardTopHeader";
import { PanelRightClose } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { useChatStore } from "@/stores/chatStore";

export default function BrandDashboardLayout({ children }) {
  const [showSideBar, setShowSideBar] = useState(false);
  const sideBarRef = useRef(null);
  const path = usePathname();
  const setRooms = useChatStore((state) => state.setRooms);

  useEffect(() => {
    const clickOutSideSideBar = (event) => {
      if (sideBarRef.current && !sideBarRef.current.contains(event.target)) {
        setShowSideBar(false);
      }
    };

    if (showSideBar) {
      document.addEventListener("mousedown", clickOutSideSideBar);
    } else {
      document.removeEventListener("mousedown", clickOutSideSideBar);
    }

    return () => {
      document.removeEventListener("mousedown", clickOutSideSideBar);
    };
  }, [showSideBar]);


  useEffect(() => {
  const fetchAllRooms = async () => {
    try {
      const res = await apiClient("chat_service/get_my_rooms/", {
        method: "GET",
        auth: true,
      });

      setRooms(res.data || []);
    } catch (error) {
      console.error("❌ API Error:", error);
    }
  };

  fetchAllRooms();
}, []);

  return (
    <div className="flex min-h-screen bg-[#FFFFFF]">
      {/* Sidebar fixed (desktop) */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white shadow z-10 hidden md:block">
        <Sidebar links={influencerLinks} />
      </aside>

      {/* Mobile toggle button */}
      {!showSideBar && (
  <button
    onClick={() => setShowSideBar(true)}
    className="fixed top-10 -left-4 z-30 p-2  text-primary rounded-lg md:hidden"
    aria-label="Open sidebar"
  >
    <PanelRightClose size={50} />
  </button>
)}

      {/* Sidebar collapsible (mobile) */}
      <div
        ref={sideBarRef}
        className={`fixed top-0 left-0 h-screen w-64 bg-white shadow z-20 transform transition-transform duration-300 md:hidden ${
          showSideBar ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* RIGHT-SIDE CLOSE BUTTON */}
        <button
          onClick={() => setShowSideBar(false)}
          className="
            absolute top-4 -right-0
            bg-secondary text-primary
            w-10 h-10 rounded-full
            flex items-center justify-center
            shadow-lg
            md:hidden
          "
          aria-label="Close sidebar"
        >
          <HiX size={20} />
        </button>
      
        <Sidebar links={influencerLinks} setShowSideBar={setShowSideBar} />
      </div>

      {/* Main content */}
      <main className="flex-1 ml-0 md:ml-64 p-6 overflow-y-auto min-h-screen">
        {path != "/influencer-dashboard/messages" && <DashboardTopHeader />}
        {children}
      </main>
    </div>
  );
}

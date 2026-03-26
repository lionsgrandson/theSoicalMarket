// app/brand-dashboard/layout.js
"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { Sidebar } from "../../../components/dashboard/Sidebar";
import { HiMenu, HiX } from "react-icons/hi";
import { brandLinks } from "../../../config/sidebarLinks";
import DashboardTopHeader from "../../../components/dashboard/DashboardTopHeader";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { PanelRightClose } from "lucide-react";

function SubscriptionStatusToast() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const status = searchParams.get("status");
    if (status === "success") {
      toast("Subscription completed successfully! 🎉");

      const url = new URL(window.location.href);
      url.searchParams.delete("status");
      router.replace(url.pathname);
    }
  }, [searchParams, router]);

  return null;
}

export default function BrandDashboardLayout({ children }) {
  const [showSideBar, setShowSideBar] = useState(false);
  const sideBarRef = useRef(null);
  const path = usePathname();

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

  return (
    <div className="flex min-h-screen bg-[#FFFFFF]">
      <Suspense fallback={null}>
        <SubscriptionStatusToast />
      </Suspense>
      {/* Sidebar fixed (desktop) */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white shadow z-10 hidden md:block">
        <Sidebar links={brandLinks} />
      </aside>

      {/* Mobile toggle button */}
      {!showSideBar && (
  <button
    onClick={() => setShowSideBar(true)}
    className="fixed top-10 -left-4 z-30 p-2  text-primary rounded-lg md:hidden"
    aria-label="Open sidebar"
  >
    <PanelRightClose size={45} />
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

  <Sidebar links={brandLinks} setShowSideBar={setShowSideBar} />
</div>


      {/* Main content */}
      <main className="flex-1 ml-0 md:ml-64 p-6 overflow-y-auto min-h-screen">
        {path != "/brand-dashboard/messages" && <DashboardTopHeader />}
        {children}
      </main>
    </div>
  );
}

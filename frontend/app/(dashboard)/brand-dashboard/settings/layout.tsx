"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ProfileLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  const tabs = [
    { name: "Profile Setup", href: "/brand-dashboard/settings" },
    // { name: "Invoice", href: "/brand-dashboard/settings/invoice" },
    { name: "Account Details", href: "/brand-dashboard/settings/account" },
  ];

  return (
    <div className="min-h-screen">
      {/* Tabs */}
      <div className="flex gap-6 mt-2 border-gray-200 mb-6">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`pb-2 text-sm font-medium transition-colors ${
                isActive
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-600 hover:text-primary"
              }`}
            >
              {tab.name}
            </Link>
          );
        })}
      </div>

      {/* Page Content */}
      <div>{children}</div>
    </div>
  );
};
export default ProfileLayout;

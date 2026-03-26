import Image from "next/image";
import Link from "next/link";
import { FaEdit } from "react-icons/fa";
import { useAuthStore } from "@/stores/useAuthStore";

export function DashboardHeader() {
  const { user, logout } = useAuthStore();
  console.log("brand_header",user);
const businessType=user?.brand_profile?.business_type?.split("–")[0];
const logo = user?.brand_profile?.logo;

  return (
    <>
      <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 hover:shadow-lg transition-shadow duration-300">
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
    
    {/* Logo + Info */}
    <div className="flex items-center gap-4">
      {/* Brand Logo */}
      <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
  {logo ? (
    <Image
      src={logo}
      alt="Profile image"
      width={64}
      height={64}
      className="w-full h-full object-contain object-center"
      
    />
  ) : (
    <span className="text-gray-500 font-bold text-xl">
      {(
        user?.brand_profile?.business_name?.[0] ||
        user?.user?.first_name?.[0]
      )?.toUpperCase()}
    </span>
  )}
</div>

      {/* Brand Info */}
      <div className="flex flex-col">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate max-w-[200px]">
          {user?.brand_profile?.business_name || user?.user?.first_name}
        </h2>
        <span className="text-gray-500 text-sm sm:text-base">
          {businessType || "Industry / Category"}
        </span>
      </div>
    </div>

    {/* Action Buttons */}
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
      <Link
        href="/brand-dashboard/settings"
        className="px-4 py-2 rounded-lg bg-secondary  text-primary font-medium text-sm flex items-center justify-center gap-2 transition"
      >
        <FaEdit className="text-base" /> Edit Profile
      </Link>

      {/* Optional: Featured badge button */}
      {user?.brand_profile?.isFeatured && (
        <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 font-semibold text-xs uppercase tracking-wide">
          Featured
        </span>
      )}
    </div>
  </div>
</div>


    </>
  );
}

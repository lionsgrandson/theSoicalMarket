"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Search, Star, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FaInstagram } from "react-icons/fa";
import { MdInsertEmoticon } from "react-icons/md";
import { apiClient } from "@/lib/apiClient";
import type { Brand } from "@/types/brand";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";

interface BrandProfileResponse {
  business_name?: string;
  short_bio?: string;
  logo?: string;
  business_type?: string;
  website?: string;
  platforms?: string[];
  timezone?: string;
}

interface BrandApiResponse {
  id?: string | number;
  brand_profile?: BrandProfileResponse | null;
  user?: {
    id?: string | number;
    first_name?: string;
  };
}

const PAGE_SIZE = 12;
const splitContentNiches = (value: string): string[] => {
  if (!value) return [];

  return value
    .split(/,\s(?=[A-Z][^,]*(?:&|–))/)
    .map((s) => s.trim());
};

export default function BrandPage() {
  // ────── UI state ──────
  const [searchQuery, setSearchQuery] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [timeZone, setTimeZone] = useState("");
  const [loading, setLoading] = useState(true);
  const [appliedSearch, setAppliedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  // ────── Data ──────
  const [allBrands, setAllBrands] = useState<Brand[]>([]);
  const [filterByNiches, setFilterByNiches] = useState(false);
  const { user } = useAuthStore();
  const contententNiches = user?.influencer_profile?.content_niches;

  // ────── Constants ──────
  const timeZones = [
    {
      value: "America/New_York",
      label:
        "Eastern Standard Time – EST (UTC−5) / Eastern Daylight Time – EDT (UTC−4)",
    },
    {
      value: "America/Chicago",
      label:
        "Central Standard Time – CST (UTC−6) / Central Daylight Time – CDT (UTC−5)",
    },
    {
      value: "America/Denver",
      label:
        "Mountain Standard Time – MST (UTC−7) / Mountain Daylight Time – MDT (UTC−6)",
    },
    {
      value: "America/Phoenix",
      label: "Mountain Standard Time – MST (UTC−7) – no DST",
    },
    {
      value: "America/Los_Angeles",
      label:
        "Pacific Standard Time – PST (UTC−8) / Pacific Daylight Time – PDT (UTC−7)",
    },
    {
      value: "America/Anchorage",
      label:
        "Alaska Standard Time – AKST (UTC−9) / Alaska Daylight Time – AKDT (UTC−8)",
    },
    {
      value: "Pacific/Honolulu",
      label: "Hawaii Standard Time – HST (UTC−10)",
    },
  ];

  const businessTypes = [
    "Beauty & Skincare Brands – makeup, skincare, haircare",
    "Fashion & Apparel – clothing lines, modest fashion brands, boutique shops",
    "Jewelry & Accessories – watches, handbags, eyewear",
    "Health & Wellness – supplements, fitness programs, healthy living",
    "Food & Beverage – restaurants, cafes, packaged foods, specialty drinks",
    "Hospitality & Travel – hotels, resorts, Airbnb hosts, travel agencies",
    "Events & Experiences – retreats, workshops, conferences",
    "E-commerce Stores – online boutiques, curated shops, niche product sellers",
    "Local Service Providers – gyms, salons, spas, personal trainers",
    "Tech & Gadgets – phone accessories, smart devices, apps",
    "Education & Coaching – online courses, coaches, masterminds",
    "Parenting & Family Brands – baby products, toys, household goods",
    "Home & Lifestyle – decor, furniture, kitchenware, cleaning products",
    "Financial & Professional Services – investment apps, insurance, credit repair",
    "Nonprofits & Causes – charities, community organizations, social impact campaigns",
    "Others",
  ];

  const getCleanCategory = (rawString?: string) => {
    if (!rawString) return "Others";
    return rawString.split(/[–-]/)[0].split(",")[0].trim();
  };
  // ────── Fetch + Normalise ──────
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const res = await apiClient("user_service/get_all_brands/", {
          method: "GET",
        });

        const data: BrandApiResponse[] = Array.isArray(res.data)
          ? res.data
          : [];

        const normalised: Brand[] = data.map((raw) => {
          const bp = raw.brand_profile ?? {};
          const platforms: string[] = Array.isArray(bp.platforms)
            ? bp.platforms
            : [];

          return {
            id: String(raw.id ?? ""),
            userId: raw.user?.id ? String(raw.user.id) : undefined,
            name: bp.business_name || raw?.user?.first_name || "Unnamed Brand",
            description: bp.short_bio ?? "",
            timeZone: bp.timezone ?? "Others",
            logo: bp.logo ?? undefined,
            businessType: getCleanCategory(bp.business_type) ?? undefined,
            website: bp.website ?? undefined,
            designation: bp.business_type ?? "",
            socialLinks: {
              instagram: platforms.includes("instagram") ? "#" : undefined,
              tiktok: platforms.includes("tiktok") ? "#" : undefined,
              youtube: platforms.includes("youtube") ? "#" : undefined,
            },
          };
        });

        setAllBrands(normalised);
        console.log(normalised);
      } catch (err) {
        console.error("Failed to load brands", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  // ────── Filtering & Search (memoised) ──────
  const filteredBrands = useMemo(() => {
  let list = [...allBrands];

  // 1. Search
  if (appliedSearch.trim()) {
    const q = appliedSearch.toLowerCase();
    list = list.filter((b) =>
      b.name.toLowerCase().includes(q)
    );
  }

  if (filterByNiches ) {
    const userNiches =contententNiches ? splitContentNiches(contententNiches as string):[];
    
    list = list.filter((b) => {
      if (!b.businessType) return false;
      
      const businessType = b.businessType;
      // Check if brand's business type matches any of the user's content niches
      return userNiches.some(niche => 
        businessType.toLowerCase().includes(niche.toLowerCase()) ||
        niche.toLowerCase().includes(businessType.toLowerCase())
      );
    });
  }

  // 2. Business type
  if (businessType && businessType !== "All") {
    list = list.filter(
      (b) => b.businessType === getCleanCategory(businessType)
    );
  }

  // 3. Time zone
  if (timeZone && timeZone !== "All") {
    list = list.filter(
      (b) => b.timeZone === timeZone
    );
  }

  return list;
}, [allBrands, businessType, timeZone, appliedSearch, filterByNiches, contententNiches]);

  const handleSearch = () => {
    setAppliedSearch(searchQuery);
  };

  // ────── Pagination Logic ──────
  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [businessType, timeZone, appliedSearch, filterByNiches]);

  const totalPages = Math.ceil(filteredBrands.length / PAGE_SIZE);
  const paginatedBrands = filteredBrands.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const clearFilters = () => {
  setSearchQuery("");
  setAppliedSearch("");
  setBusinessType("All");
  setTimeZone("All");
  setFilterByNiches(false);
};


  const handleReviewMatches = () => {
    // if (!contententNiches) {
    //   console.warn("No content niches available for matching");
    //   return;
    // }
    // Re-apply search & filters with niche matching
    setFilterByNiches(true);
    setAppliedSearch(searchQuery);
    setCurrentPage(1);
  };


  // ────── Render ──────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Find Brands You Love
        </h1>
      </div>

      {/* Search + Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        {/* Search */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-secondary hover:bg-[var(--secondaryhover)] text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Search
          </button>
          <button
              onClick={handleReviewMatches}
              className={`px-6 md:px-8 py-3 cursor-pointer rounded-xl transition-colors font-medium flex items-center gap-2 justify-center shadow-sm border  bg-white text-gray-700 border-gray-300 hover:bg-gray-50
              `}
            >
              <Star
                className={`w-4 h-4`}
              />
              Review Matches
            </button>
        </div>

        {/* Filter row */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Business Type Select */}
          <div className="relative w-full">
            <Select value={businessType} onValueChange={setBusinessType}>
              <SelectTrigger className="w-full h-[50px] bg-white border border-gray-300 rounded-lg px-4 text-sm sm:text-base focus:ring-2 focus:ring-primary/40 transition-all hover:bg-gray-50 hover:border-gray-400">
                <SelectValue placeholder="All Business Types" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] max-w-[calc(100vw-2rem)] sm:w-[600px]" position="popper" align="start">
                <SelectItem value="All">All Business Types</SelectItem>
                {businessTypes.map((t) => (
                  <SelectItem
                    key={t}
                    value={t}
                    className="cursor-pointer py-2.5 sm:truncate break-words"
                  >
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Zone Select */}
          <div className="relative w-full">
            <Select value={timeZone} onValueChange={setTimeZone}>
              <SelectTrigger className="w-full max-w-full h-[50px] bg-white border border-gray-300 rounded-lg px-4 text-sm sm:text-base focus:ring-2 focus:ring-primary/40 transition-all hover:bg-gray-50 hover:border-gray-400">
                <SelectValue placeholder="All Time Zones" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] w-screen max-w-[calc(100vw-2rem)] sm:w-[600px]"position="popper" align="start">
                <SelectItem value="All">All Time Zones</SelectItem>
                {timeZones.map((tz) => (
                  <SelectItem
                    key={tz.value}
                    value={tz.value}
                    className="cursor-pointer py-2.5 break-words sm:truncate"
                  >
                    {tz.label}
                  </SelectItem>
                ))}
                <SelectItem value="Others" className="cursor-pointer py-2.5">
                  Others
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters Button */}
          <div className="w-full sm:w-auto">
            <button
              onClick={clearFilters}
              className="
                py-1
                w-full sm:w-auto
                border border-gray-300 
                hover:bg-gray-100 
                active:bg-gray-200
                text-gray-700 
                px-6 
                rounded-lg 
                font-medium 
                flex items-center justify-center gap-2
                transition duration-200
                focus:outline-none focus:ring-2 focus:ring-primary/40 
                whitespace-nowrap
              "
            >
              <XCircle size={18} className="text-gray-500" />
              Clear Filters
            </button>
          </div>
          <div className="w-full sm:w-auto bg-white border-1 rounded-md flex items-center justify-center text-gray-700 font-medium ">
            <button
            onClick={clearFilters}
            className=" px-2 py-1  cursor-pointer"
          >
            All
          </button>
          </div>

          
        </div>
      </div>

      {/* Grid */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Featured brands
        </h2>

        {paginatedBrands.length === 0 ? (
          <p className="text-center text-gray-500">
            No brands match the current filters.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginatedBrands.map((brand) => (
              <div
                key={brand.id}
                className="bg-white rounded-lg border border-gray-200 p-6 text-center"
              >
                {/* Logo */}
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-white shadow-sm overflow-hidden">
  {brand.logo ? (
    <div className="w-full h-full flex items-center justify-center">
      <Image
        src={brand.logo}
        alt={brand.name}
        width={64}
        height={64}
        className="object-cover w-full h-full"
        unoptimized
      />
    </div>
  ) : (
    <div className="w-full h-full rounded-full flex items-center justify-center text-2xl font-bold text-primary">
      {brand?.name?.charAt(0) || "N"}
    </div>
  )}
</div>


                {/* Name */}
                <h3 className="font-semibold text-[17px] text-[#242524] mb-1">
                  {brand.name}
                </h3>

                {/* Category */}
                <p className="text-sm text-[#363635] mb-2">
                  Category: {brand.businessType ?? "Others"}
                </p>

                {/* Platform icons */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  {brand.socialLinks?.instagram && (
                    <div className="w-6 h-6 bg-pink-100 rounded flex items-center justify-center">
                      <FaInstagram className="text-xs text-pink-600" />
                    </div>
                  )}
                  {brand.socialLinks?.tiktok && (
                    <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
                      <MdInsertEmoticon className="text-xs text-white" />
                    </div>
                  )}
                  {brand.socialLinks?.youtube && (
                    <div className="w-6 h-6 bg-red-100 rounded flex items-center justify-center">
                      <span className="text-xs">TV</span>
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex items-stretch gap-3">
                  <Link
                    href={`/influencer-dashboard/brand/${brand.userId}`}
                    className="flex flex-1 items-center justify-center border border-secondary text-primary px-4 py-2 rounded-lg text-sm font-medium transition-colors text-center"
                  >
                    View Profile
                  </Link>

                  <Link
                    href={`/influencer-dashboard/messages?id=${brand.userId}`}
                    className="flex flex-1 items-center justify-center bg-secondary hover:bg-[var(--secondaryhover)] text-primary px-4 py-2 rounded-lg text-sm font-medium transition-colors text-center"
                  >
                    Message
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12 mb-10">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 border border-gray-200"
          >
            ←
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // Logic to show a sliding window of pages could be added here
            // For simple cases, just showing first 5 or using current page context
            const page = i + 1;
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  page === currentPage
                    ? "bg-primary text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            );
          })}

          {totalPages > 5 && (
            <>
              <span className="px-2">...</span>
              <button
                onClick={() => setCurrentPage(totalPages)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  totalPages === currentPage
                    ? "bg-primary text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 border border-gray-200"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}

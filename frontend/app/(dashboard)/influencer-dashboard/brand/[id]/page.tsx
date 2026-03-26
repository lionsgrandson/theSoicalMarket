
"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  MessageCircle,
  Copy,
  Star,
  MapPin,
  Globe,
  Mail,
  Phone,
  Linkedin,
  Twitter,
  Instagram,
  FileText,
  Video,
  ImageIcon,
  Loader2,
  Clock,
  Building,
  Briefcase,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import type { Brand } from "@/types/brand";
interface OtherUserData{
  hires_data:number;
  campaigns:number;
}

interface CollaborationData {
  campaigns?: number;
  hires_data?: number;
  total_invested?: number;
  campaigns_data?: Array<{
    id: string | number;
    campaign_name: string;
    campaign_status: string;
    campaign_description: string;
    campaign_timeline: string;
  }>;
}
interface BrandProfileResponse {
  id?: string | number;
  business_name?: string;
  short_bio?: string;
  logo?: string;
  is_verified?: boolean;
  timezone?: string;
  website?: string;
  email?: string;
  phone?: string;
  instagram_handle?: string;
  tiktok_handle?: string;
  linkedin_profile?: string;
  x_handle?: string;
  mission?: string;
  business_type?: string;
  contact_person_title?: string;
  designation?: string;
  campaigns_total?: number;
  campaigns_creators?: number;
  campaigns_avg_rating?: number;
  campaigns_total_invested?: number;
  active_campaigns?: unknown[];
  reviews?: unknown[];
  resources?: unknown[];
  platforms?: string[];
  youtube_handle?: string;
  user?: {
    id?: string | number;
  };
}

interface BrandResponse {
  brand_profile?: BrandProfileResponse;
}

export default function BrandProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const[userOtherData,setUserOtherData]=useState<OtherUserData>({ hires_data: 0, campaigns: 0 });
  const[collaboration,setCollaboration]=useState<CollaborationData>({});

  // -------------------------------------------------
  // 1. FETCH brand by id
  // -------------------------------------------------
  useEffect(() => {
    const fetchBrand = async () => {
      try {
        setLoading(true);
        const res = await apiClient(`user_service/get_a_brand/${id}/`, {
          method: "GET",
        });
        setUserOtherData(res?.data?.res);
        console.log(res);
        

        // ---- Normalise API → Brand ----
        const raw =
          (res.data.data as BrandResponse | undefined)?.brand_profile ?? {};
          console.log(raw);
          

        const platforms: string[] = Array.isArray(raw.platforms)
          ? raw.platforms
          : [];

        const normalised: Brand = {
          id: raw?.id ,
          userId: res?.data?.data?.user?.id ? String(res?.data?.data?.user?.id) : undefined,
          name: raw.business_name || res?.data?.data?.user?.first_name || "No Name",
          description: raw.short_bio ?? "",
          designation: raw.designation ?? "",
          logo: raw.logo ?? undefined,
          verified: raw.is_verified ?? false,
          location: raw.timezone,
          website: raw.website ?? "user.com",
          email: raw.email ?? "",
          phone: raw.phone ?? "",
          socialLinks: {
            instagram: raw?.instagram_handle,
            tiktok: raw?.tiktok_handle,
            youtube: raw?.youtube_handle,
            linkedin: raw?.linkedin_profile,
            twitter: raw?.x_handle,
          },
          mission: raw.mission ?? "",
          businessType: raw.business_type?.split( ' – ' )[0] ?? "",
          contactPerson: {
            name: raw.business_name ?? "",
            title: raw.contact_person_title ?? "",
          },
          
          activeCampaigns: raw.active_campaigns ?? [],
          reviews: raw.reviews ?? [],
          resources: raw.resources ?? [],
        };

        setBrand(normalised);
      } catch (err: unknown) {
        console.error("Brand fetch error:", err);
        const status =
          typeof err === "object" &&
          err !== null &&
          "response" in err &&
          typeof (err as { response?: { status?: number } }).response ===
            "object" &&
          (err as { response?: { status?: number } }).response !== null
            ? (err as { response?: { status?: number } }).response?.status
            : undefined;
        if (status === 404) {
          notFound();
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBrand();
  }, [id]);


  useEffect(()=>{
    const fetchData=async()=>{
      if (!id || !brand?.id) return;
      const data=await apiClient(`campaign_service/${id}/${brand?.id}/hires_and_campaigns/`,{
            method:"GET"
          });
          setCollaboration(data);
    }
    fetchData();
          
  },[id, brand?.id]);
  

  // -------------------------------------------------
  // 3. Loading / Not-found UI
  // -------------------------------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" strokeWidth={2.5} />
      </div>
    );
  }

  if (!brand) {
    notFound();
  }
const router=useRouter();
  // -------------------------------------------------
  // 4. Render the full profile
  // -------------------------------------------------
  return (
    <div className="min-h-screen ">
      <div className="">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-gray-600">Back</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Brand Header Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
    {/* Brand identity section */}
    <div className="flex items-center gap-5">
      {/* Logo / Fallback */}
      {brand.logo ? (
        <div className="relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
          <Image
            src={brand.logo}
            alt={`${brand.name} logo`}
            fill
            className="object-contain p-2"
            sizes="64px"
            unoptimized // keep as in original
          />
        </div>
      ) : (
        <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-primary flex items-center justify-center text-white text-2xl font-bold">
          {brand.name.charAt(0).toUpperCase()}
        </div>
      )}

      {/* Brand details */}
      <div className="min-w-0">
        <div className="flex items-center gap-2.5 mb-1.5">
          <h1 className="text-2xl font-bold text-gray-900 truncate">
            {brand.name}
          </h1>
          {brand.verified && (
            <div className="flex items-center gap-1.5 bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-medium border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Verified
            </div>
          )}
        </div>

        {/* Designation badge */}
        {brand.designation && (
          <div className="mb-3">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-sm font-semibold border border-blue-100">
              <Briefcase className="w-4 h-4" />
              {brand.designation}
            </div>
          </div>
        )}

        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
          {brand.website && (
            <div className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 flex-shrink-0" />
              <a
                href={brand.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 hover:underline transition-colors"
              >
                {brand.website.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            </div>
          )}

          {brand.location && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>{brand.location}</span>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Action buttons */}
    <div className="flex items-center gap-3 self-start md:self-center">
      <Link href={`/influencer-dashboard/messages?id=${brand?.userId}`}>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2">
          <MessageCircle className="w-4 h-4" />
          Message
        </button>
      </Link>

      {/* You can add more buttons later if needed */}
    </div>
  </div>
</div>
          {/* About */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              About the Brand
            </h2>
            <div>
                <h3 className="font-medium text-gray-900 mb-2">Business Bio</h3>
                 <p className="text-gray-600 mb-6">{brand.description}</p>
              </div>
           

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Mission</h3>
                <p className="text-gray-600 text-sm">
                  {brand.mission || "Not added"}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  Business Type
                </h3>
                <p className="text-gray-600 text-sm">
                  {brand.businessType || "Not added"}
                </p>
              </div>
            </div>
          </div>
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Campaign
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {collaboration?.campaigns ?? 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Campaigns</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {collaboration?.hires_data ?? 0}
                  </div>
                  <div className="text-sm text-gray-600">Micro-influencers</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    ${collaboration?.total_invested ?? 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Invested</div>
                </div>
              </div>
            </div>

            {/* Active Campaigns */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 h-[400px] overflow-y-scroll">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Active Campaigns
              </h2>
              {collaboration.campaigns_data?.length ? (
                <div className="space-y-4">
                  {collaboration.campaigns_data.map((c) => (
                    <div
                      key={c.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900">
                          {c.campaign_name}
                        </h3>
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                          {c.campaign_status}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        {c.campaign_description}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Deadline: {c.campaign_timeline}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">
                  No active campaigns at the moment.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

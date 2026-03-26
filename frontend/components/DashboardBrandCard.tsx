import Link from "next/link";
import { Instagram, Youtube, Twitter, Globe, Facebook, CheckCircle2 } from "lucide-react";
import { ProtectedImage } from "./ui/ProtectedImage";

const PlatformIcon = ({ platform }: { platform: string }) => {
  const p = platform.toLowerCase();
  if (p === 'instagram') return <Instagram className="w-4 h-4 text-pink-600" />;
  if (p === 'youtube') return <Youtube className="w-4 h-4 text-red-600" />;
  if (p === 'twitter' || p === 'x') return <Twitter className="w-4 h-4 text-blue-400" />;
  if (p === 'facebook') return <Facebook className="w-4 h-4 text-blue-700" />;
  if (p === 'tiktok') return <span className="text-[10px] font-bold text-black">Tk</span>;
  return <Globe className="w-4 h-4 text-gray-400" />;
};

export default function BrandCard({ brand }: { brand: any }) {
  // Logic to show platforms
  const platforms = Object.keys(brand.socialLinks || {}).filter((k) => brand.socialLinks[k]);

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-xl hover:border-secondary/40 transition-all duration-300 flex flex-col h-full relative overflow-hidden">
      
      {/* Decorative Top Gradient (Optional Professional Touch) */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary/40 to-transparent" />

      {/* 1. Header: Faded Logo & Verification */}
      <div className="flex items-start justify-between mb-4">
        <ProtectedImage
          src={brand.logo || "/images/placeholder.jpg"}
          alt={brand.name}
          isLocked={true} // Locked for Influencers browsing
          className="w-16 h-16 rounded-xl border border-gray-100 shadow-sm"
        />
        {brand.verified && (
          <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border border-green-100">
            <CheckCircle2 className="w-3 h-3" />
            Verified
          </div>
        )}
      </div>

      {/* 2. Body: Category & Name */}
      <div className="mb-4">
        <span className="inline-block px-2.5 py-1 mb-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-md uppercase tracking-wider">
          {brand.businessType || "Brand"}
        </span>
        <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
          {brand.name}
        </h3>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
          {brand.description || "Looking for authentic creators to showcase our products."}
        </p>
      </div>

      {/* 3. Campaign Details (Handling Missing Budget) */}
      <div className="mt-auto space-y-4">
        
        {/* Platforms Row */}
        <div className="flex items-center gap-3 py-3 border-t border-b border-gray-50">
          <span className="text-xs text-gray-400 font-medium">Platforms:</span>
          <div className="flex gap-2">
            {platforms.length > 0 ? (
              platforms.map((p) => (
                <div key={p} className="p-1.5 bg-gray-50 rounded-full">
                  <PlatformIcon platform={p} />
                </div>
              ))
            ) : (
              <span className="text-xs text-gray-300">Open</span>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link href={`/influencer-dashboard/brand/${brand.id}`} className="w-full">
            <button className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">
              View Details
            </button>
          </Link>
          <Link href={`/influencer-dashboard/messages?id=${brand.id}`} className="w-full">
            <button className="w-full py-2.5 rounded-xl bg-secondary text-primary text-sm font-semibold hover:brightness-110 transition-colors shadow-sm">
              Apply Now
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
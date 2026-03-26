import Link from "next/link";
import { MapPin, Users, TrendingUp } from "lucide-react";
import { ProtectedImage } from "./ui/ProtectedImage";

export default function InfluencerCard({ creator }: { creator: any }) {
  const hasPlatforms = creator.socialLinks && creator.socialLinks.length > 0;

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-xl transition-all duration-300">
      
      {/* 1. Header: Locked Profile & Key Stat */}
      <div className="flex justify-between items-start mb-4">
        {/* Faded Profile Photo */}
        <ProtectedImage
          src={creator.profileImage}
          alt={creator.name}
          isLocked={true} // Locked for Brands
          className="w-20 h-20 rounded-full border-2 border-white shadow-md"
        />

        {/* Key Selling Point: Follower Count */}
        <div className="text-right">
          <div className="bg-gradient-to-r from-secondary/10 to-secondary/5 px-3 py-2 rounded-xl border border-secondary/20 inline-block">
            <div className="flex items-center gap-1.5 text-secondary">
              <Users className="w-4 h-4" />
              <span className="font-bold text-lg leading-none">{creator.followers}</span>
            </div>
            <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Total Reach</span>
          </div>
        </div>
      </div>

      {/* 2. Body: Niche & Location */}
      <div className="mb-5">
        <div className="flex flex-wrap gap-2 mb-2">
          <span className="px-2.5 py-1 bg-slate-900 text-white text-xs font-bold rounded-md">
            {creator.niche || "Lifestyle"}
          </span>
          {creator.timeZone && (
            <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
              <MapPin className="w-3 h-3" />
              {/* Clean up timezone string if needed */}
              {creator.timeZone.split('/')[1]?.replace('_', ' ') || "Global"}
            </span>
          )}
        </div>
        
        {/* We hide the real name if locked, typically showing "Creator #ID" or First Name only */}
        <h3 className="font-bold text-lg text-gray-900 truncate">
          {creator.name}
        </h3>
      </div>

      {/* 3. Platforms Indicators */}
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
        <span className="text-xs text-gray-400 mr-1">Active on:</span>
        {hasPlatforms ? (
          creator.socialLinks.slice(0, 4).map((p: string) => (
            <div key={p} className="w-2 h-2 rounded-full bg-green-500" title={p} />
          ))
        ) : (
          <span className="text-xs text-gray-300">No platforms connected</span>
        )}
        {hasPlatforms && <span className="text-xs text-gray-400 ml-1">Verified</span>}
      </div>

      {/* 4. Footer: Actions */}
      <div className="flex gap-3">
        <Link 
          href={`/brand-dashboard/microinfluencerspage/${creator.id}`}
          className="flex-1"
        >
          <button className="w-full py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
            View Profile
          </button>
        </Link>
        <button 
          onClick={() => {/* Router push */}} 
          className="flex-1 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <TrendingUp className="w-4 h-4" />
          Hire
        </button>
      </div>
    </div>
  );
}
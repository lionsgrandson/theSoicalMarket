import { FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";
import { TbWorld } from "react-icons/tb";
import { useAuthStore } from "@/stores/useAuthStore";
import { useMemo } from "react";
const splitContentNiches = (value) => {
  if (!value) return [];

  return value
    .split(/,\s(?=[A-Z][^,]*(?:&|–))/)
    .map((s) => s.trim());
};
export function BusinessBio() {
  const { user } = useAuthStore();
  const niches = useMemo(
  () => splitContentNiches(user?.brand_profile?.business_type),
  [user?.brand_profile?.business_type]
);

  return (
    <div className="bg-white rounded-lg p-6 border border-slate-200">
      <h3 className="text-xl font-bold text-slate-700 mb-4">
        Business Bio
      </h3>

      <div className="space-y-4">
        <p className="text-slate-600 leading-relaxed">{user?.brand_profile?.short_bio}</p>

        {/* <div>
          <h4 className="font-medium text-slate-800 mb-2">Mission:</h4>
          <p className="text-slate-600">
            Empowering confidence through science-backed skincare
          </p>
        </div> */}

<div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm sm:text-base">
  <h4 className="font-medium text-slate-800 whitespace-nowrap">Business Type:</h4>
  <div className="flex flex-wrap gap-1.5 sm:gap-2">
    {niches.map((tag, i) => (
  <span key={i} className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-primary sm:px-3 sm:text-sm">
    {tag}
  </span>
))}

  </div>
</div>

        <div className="flex space-x-3 pt-2">
          <TbWorld />
          <FaInstagram color="red" />
          <FaTiktok />
          <FaYoutube color="red" />
        </div>
      </div>
    </div>
  );
}

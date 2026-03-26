import Link from "next/link";
import { Plus, Layout, ArrowRight, CircleDot } from "lucide-react";
import type { DashboardCampaign } from "./BDashboard";

interface CampaignsSectionProps {
  allCampaigns?: DashboardCampaign[];
}

export function CampaignsSection({ allCampaigns = [] as DashboardCampaign[] }: CampaignsSectionProps) {
  // Logic to show only the latest 2
  const displayedCampaigns = allCampaigns.slice(0, 2);
  const hasMore = allCampaigns.length > 2;

  return (
    <div className="bg-white rounded-xl px-2 py-6 border border-slate-200 shadow-sm transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Layout className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-slate-700">My Sent Proposals</h3>
        </div>
        
        <Link
          href="/brand-dashboard/campaigns?create=true"
          className="flex items-center gap-1.5 bg-secondary hover:bg-[var(--secondaryhover)] text-slate-800 text-sm px-4 py-2 rounded-lg transition-all font-semibold shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Create new
        </Link>
      </div>

      {/* Content */}
      {allCampaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <CircleDot className="w-8 h-8 text-slate-300 mb-2" />
          <p className="text-sm font-medium text-slate-500">No campaigns available yet.</p>
          <Link href="/brand-dashboard/campaigns" className="text-xs text-primary font-bold mt-1 hover:underline">
            Launch your first campaign
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedCampaigns.map((campaign, index) => (
            <div
              key={index}
              className="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-primary/30 hover:shadow-md transition-all duration-200"
            >
              <div className="flex flex-col">
                <h4 className="font-normal text-slate-700 group-hover:text-primary transition-colors">
                  {campaign?.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  ID: <span className="text-slate-700 font-mono uppercase">{campaign?.id || 'N/A'}</span>
                </p>
              </div>

              <div className="flex items-center gap-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    campaign?.statusColor || "bg-emerald-50 text-emerald-700 border-emerald-100"
                  }`}
                >
                  {campaign?.campaignStatus || "Active"}
                </span>
                
              </div>
            </div>
          ))}

          {/* Footer Link - Only shows if more than 2 items */}
          {hasMore && (
            <Link
              href="/brand-dashboard/campaigns"
              className="flex items-center justify-center w-full py-2 text-sm font-bold text-primary hover:bg-primary/5 rounded-lg transition-colors mt-2"
            >
              View all campaigns ({allCampaigns.length})
            </Link>
          )}
        </div>
      )}
    </div>
  );
}


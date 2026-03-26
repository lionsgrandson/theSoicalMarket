"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import {
  Eye,
  Calendar,
  DollarSign,
  FileText,
  Paperclip,
  X,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  ArrowUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

/* -------------------- TYPES -------------------- */
interface Attachment {
  id: number;
  link: string;
}

interface Campaign {
  id: number;
  campaign_name: string;
}

interface Proposal {
  id: number;
  owner_id: number;
  campaign_id: number;
  hired_influencer_id: number;
  start_date: string;
  end_date: string;
  proposal_message: string;
  campaign_deliverables: string;
  attachments: Attachment[];
  is_accepted_by_influencer: boolean;
  is_rejected_by_influencer: boolean;
  is_completed_marked_by_brand: boolean;
  budget: number;
  rating: number;
  campaign: Campaign;
  isBudgetNegotiable:Boolean;
}

type ProposalStatus = "Accepted" | "Rejected" | "Pending";

/* -------------------- HELPERS -------------------- */
const getProposalStatus = (p: Proposal): ProposalStatus => {
  if (p.is_accepted_by_influencer) return "Accepted";
  if (p.is_rejected_by_influencer) return "Rejected";
  return "Pending";
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

/* -------------------- COMPONENT -------------------- */
const SentProposal = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(
    null
  );
  const [expandedCampaignId, setExpandedCampaignId] = useState<number | null>(null);

  const [hiredInfluenceName, setHiredInfluenceName] = useState("");

  // ✅ Cache influencer names (prevents repeated API calls)
  const influencerCache = useRef<Record<number, string>>({});

  /* -------------------- FETCH PROPOSALS -------------------- */
  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const res = await apiClient("campaign_service/proposals/", {
          method: "GET",
          auth: true,
        });
        setProposals(res || []);
      } catch (err) {
        console.error("Failed to fetch proposals", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProposals();
  }, []);

  /* -------------------- GROUP BY CAMPAIGN -------------------- */
  const groupedByCampaign = useMemo(() => {
    const map: Record<number, { campaign: Campaign; proposals: Proposal[] }> =
      {};

    proposals.forEach((p) => {
      if (!map[p.campaign_id]) {
        map[p.campaign_id] = {
          campaign: p.campaign,
          proposals: [],
        };
      }
      map[p.campaign_id].proposals.push(p);
    });

    return Object.values(map);
  }, [proposals]);

  /* -------------------- FETCH INFLUENCER (CACHED) -------------------- */
  useEffect(() => {
    const influencerId = selectedProposal?.hired_influencer_id;
    if (!influencerId) return;

    if (influencerCache.current[influencerId]) {
      setHiredInfluenceName(influencerCache.current[influencerId]);
      return;
    }

    const fetchInfluencer = async () => {
      try {
        const res = await apiClient(
          `user_service/get_a_influencer/${influencerId}/`,
          { method: "GET", auth: true }
        );

        const name =
          res?.data?.influencer_profile?.display_name ||
          res?.data?.user?.first_name ||
          "";

        influencerCache.current[influencerId] = name;
        setHiredInfluenceName(name);
      } catch (err) {
        console.error("Influencer fetch failed", err);
      }
    };

    fetchInfluencer();
  }, [selectedProposal?.hired_influencer_id]);

  /* -------------------- STATUS BADGE -------------------- */
  const StatusBadge = ({ status }: { status: ProposalStatus }) => {
    const styles = {
      Accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
      Rejected: "bg-rose-50 text-rose-700 border-rose-200",
      Pending: "bg-amber-50 text-amber-700 border-amber-200",
    };
    const icons = {
      Accepted: <CheckCircle2 size={14} />,
      Rejected: <XCircle size={14} />,
      Pending: <Clock size={14} />,
    };

    return (
      <span
        className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}
      >
        {icons[status]} {status}
      </span>
    );
  };

  /* -------------------- LOADING / EMPTY -------------------- */
  if (loading)
    return (
      <div className="flex justify-center p-10">
        <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" />
      </div>
    );

  if (!proposals.length)
    return (
      <div className="border-1 rounded-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 border-gray-300 py-6 px-4">
  <div>
    <h2 className="text-xl font-bold text-primary">My Campaigns</h2>
    {/* <p className="text-sm text-gray-500">
      Proposals grouped by campaign
    </p> */}
  </div>

  <Link
    href="/brand-dashboard/campaigns?create=true"
    className="flex items-center justify-center gap-1.5 
               bg-secondary hover:bg-[var(--secondaryhover)] 
               text-slate-800 text-sm px-4 py-2 
               rounded-lg transition-all font-semibold 
               shadow-sm active:scale-95
               w-full sm:w-auto"
  >
    <Plus className="w-4 h-4" />
    Create new
  </Link>
</div>

        <div className="p-12 text-center  ">
          <FileText size={36} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500">No proposals sent yet</p>
        </div>
      </div>
    );

  /* -------------------- RENDER -------------------- */
  return (
    <div className="bg-white rounded-xl border shadow-sm">
      <div className="flex items-center justify-between mb-6 border-b-1 border-gray-300 py-6 px-4">
        <div className="">
          <h2 className="text-xl font-bold text-primary">My Campaigns</h2>
          <p className="text-sm text-gray-500">Proposals grouped by campaign</p>
        </div>
        <Link
          href="/brand-dashboard/campaigns?create=true"
          className="flex items-center gap-1.5 bg-secondary hover:bg-[var(--secondaryhover)] text-slate-800 text-sm px-4 py-2 rounded-lg transition-all font-semibold shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Create new
        </Link>
      </div>

      <div className="max-h-[520px] overflow-y-auto p-4 space-y-6">
        {groupedByCampaign.map((group) => (
          <div
            key={group.campaign?.id}
            className="border rounded-2xl p-4 bg-gray-50"
          >
            {/* Campaign Header */}
            <h3
              className="text-[16px] font-semibold text-primary mb-3 cursor-pointer flex justify-between items-center"
              onClick={() =>
                setExpandedCampaignId(
                  expandedCampaignId === group.campaign?.id
                    ? null
                    : group.campaign.id
                )
              }
            >
              {group.campaign?.campaign_name}
              <span>
                {expandedCampaignId === group.campaign?.id ? (
                  <ChevronUp />
                ) : (
                  <ChevronDown />
                )}
              </span>
            </h3>

            {/* Proposals */}
            <AnimatePresence>
              {expandedCampaignId === group.campaign?.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-3"
                >
                  <div className="space-y-3">
                    {group.proposals.map((p) => (
                      <div
                        key={p.id}
                        className="flex justify-between items-center bg-white p-4 border rounded-xl hover:shadow-md transition"
                      >
                        <div>
                          <div className="flex items-center gap-3">
                            <h4 className="font-medium">Proposal #{p.id}</h4>
                            <StatusBadge status={getProposalStatus(p)} />
                          </div>

                          <div className="flex gap-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center gap-1">
  <DollarSign size={14} />
  {p?.isBudgetNegotiable || p.budget === 0
    ? "Open to discussion"
    : `$${p.budget}`}
</span>
                            <span className="flex items-center gap-1">
                              <Calendar size={14} /> {formatDate(p.start_date)}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedProposal(p)}
                          className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* -------------------- MODAL -------------------- */}
      {selectedProposal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-bold text-lg">Proposal Details</h3>
              <button onClick={() => setSelectedProposal(null)}>
                <X />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <p>
                <span className="text-sm uppercase tracking-wider text-gray-700 font-semibold">Influencer:</span>{" "}
                {hiredInfluenceName ? (
                  <Link
                    href={`/brand-dashboard/microinfluencerspage/${selectedProposal.hired_influencer_id}`}
                    className="text-primary uppercase tracking-wider underline text-sm font-[500]"
                  >
                    {hiredInfluenceName}
                  </Link>
                ) : (
                  "Not Exist"
                )}
              </p>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Proposal Message
                </h4>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedProposal.proposal_message || "No Message"}
                </div>
              </div>
              <div className="font-semibold  md:text-lg">
  <h4 className="m-0 text-gray-700 uppercase tracking-wider text-sm">
    Budget:{" "}
    {selectedProposal.isBudgetNegotiable || selectedProposal.budget === 0
      ? "Open to discussion"
      : `$${selectedProposal.budget}`}
  </h4>
</div>

              <div>
                <h4 className="font-semibold  text-sm uppercase tracking-wider text-gray-700 mb-2">
                  Content Deliverables
                </h4>
                {selectedProposal.campaign_deliverables &&
                  (() => {
                    try {
                      const deliverablesArray =
                        typeof selectedProposal.campaign_deliverables ===
                        "string"
                          ? JSON.parse(selectedProposal.campaign_deliverables)
                          : selectedProposal.campaign_deliverables;

                      // 2. Render the array
                      if (Array.isArray(deliverablesArray)) {
                        return (
                          <div className="flex flex-wrap gap-2">
                            {deliverablesArray.map(
                              (item: string, index: number) => (
                                <span
                                  key={index}
                                  className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium border border-blue-100 capitalize"
                                >
                                  {/* 3. Format "socialPost" to "Social Post" using Regex */}
                                  {item.replace(/([A-Z])/g, " $1").trim()}
                                </span>
                              )
                            )}
                          </div>
                        );
                      }
                      return null;
                    } catch (e) {
                      console.error("Error parsing deliverables", e);
                      return (
                        <p className="text-sm text-gray-500">
                          No deliverables specified
                        </p>
                      );
                    }
                  })()}
              </div>
              {selectedProposal.attachments &&
                selectedProposal.attachments.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Paperclip className="w-4 h-4" /> Attachments
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedProposal.attachments.map((att) => (
                        <Link
                          href={att.link}
                          key={att.id}
                          target="_blank"
                          className="group relative block overflow-hidden rounded-lg border border-gray-200 hover:border-primary transition-colors"
                        >
                          <div className="aspect-video bg-gray-100 relative">
                            {/* Simple check for image extension for preview, otherwise generic icon */}
                            {/\.(jpg|jpeg|png|gif|webp)$/i.test(att.link) ? (
                              <Image
                                src={att.link}
                                alt="Attachment"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full text-gray-400">
                                <Paperclip className="w-8 h-8" />
                              </div>
                            )}
                          </div>
                          <div className="p-2 bg-white text-xs text-center text-gray-600 truncate px-2">
                            View Attachment {att.id}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            <div className="p-4 border-t text-right">
              <button
                onClick={() => setSelectedProposal(null)}
                className="px-6 py-2 bg-primary text-white rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SentProposal;

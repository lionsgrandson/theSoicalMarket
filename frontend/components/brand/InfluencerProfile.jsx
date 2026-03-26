"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Swal from "sweetalert2";
import Image from "next/image";

// Mock data - replace with API call when backend is ready
const mockInfluencerData = {
  1: {
    id: 1,
    name: "Maya Fashionista",
    displayName: "Maya",
    tagline: "Where Trendsetting Meets Authentic Influence",
    isVerified: true,
    website: "fashionista.com",
    location: "New York, NY",
    profileImage:
      "https://wallpapers.com/images/hd/cool-profile-picture-paper-bag-head-4co57dtwk64fb7lv.jpg",
    about:
      "Empowering women through bold fashion and clean beauty tips. Partnered with 20+ businesses in the skincare and lifestyle space",
    creatorType:
      "Fashion Stylist, Beauty Guru, Lifestyle Creator, or Content Educator",
    contact: {
      name: "Maya Fashionista",
      title: "Professional Creator",
      email: "maya.collab@email.com",
      phone: "+1 (444) 156-4567",
      socialMedia: {
        linkedin: "#",
        twitter: "#",
        instagram: "#",
      },
    },
    performance: {
      totalCampaigns: 18,
      engagementRate: 4.2,
      avgRating: 4.9,
      previousEngagements: 14,
    },
    campaigns: [
      {
        id: 1,
        title: "Showcasing recent collaborations and top-performing content",
        description:
          "Create engaging video content to highlight our new automation dashboard and drive campaign visibility",
        deadline: "Dec 15, 2024",
        status: "Active",
      },
      {
        id: 2,
        title: "Highlighting standout creator work and strategic partnerships",
        description:
          "Feature our automation dashboard in your most compelling content for maximum user adoption",
        deadline: "Dec 15, 2024",
        status: "Active",
      },
    ],
    campaignInfo: {
      contentTypes: ["Instagram Reels", "YouTube Reviews", "LinkedIn Posts"],
      budgetRange: "$500 - $1,500 per campaign",
    },
    contentNiches: [
      "Spring Chic",
      "Glow & Go",
      "Purpose of Style",
      "Herbs & Hues",
      "Coquette Edit",
      "Thread Talk",
      "Day to Night",
    ],
    reviews: {
      rating: 4.8,
      totalReviews: 67,
      testimonials: [
        {
          id: 1,
          text: "Exceptional collaboration experience. Clear communication and fair compensation.",
          author: "Top Tier Fashionista",
          verified: true,
        },
        {
          id: 2,
          text: "Professional team with great products. Highly recommend working with them!",
          author: "Beauty_Reviewer",
          verified: true,
        },
      ],
    },
  },
};

export default function InfluencerProfile() {
  const router = useRouter();
  const params = useParams();
  const [influencer, setInfluencer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call - replace with actual backend integration
    const fetchInfluencer = async () => {
      console.log("[v0] Fetching influencer profile for ID:", params.id);

      try {
        // Mock API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const influencerData = mockInfluencerData[params.id];
        if (influencerData) {
          setInfluencer(influencerData);
          console.log("[v0] Influencer data loaded:", influencerData);
        } else {
          console.log("[v0] Influencer not found for ID:", params.id);
        }
      } catch (error) {
        console.error("[v0] Error fetching influencer:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchInfluencer();
    }
  }, [params.id]);

  const handleBack = () => {
    console.log("[v0] Navigating back to micro-influencers page");
    router.push("/brand-dashboard/microinfluencerspage");
  };

  const handleMessage = () => {
    console.log(
      "[v0] Message button clicked for influencer:",
      influencer?.name
    );

    Swal.fire({
      title: "Do you want to chat?",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      buttonsStyling: false, // ✅ disable default SweetAlert2 styling
      customClass: {
        actions: "flex justify-center gap-x-4", // 👈 add spacing between buttons
        confirmButton:
          "bg-secondary text-black font-semibold px-5 py-2 rounded-md border-2 border-secondary hover:bg-[var(--secondaryhover)] transition",
        cancelButton:
          "bg-white text-black font-semibold px-5 py-2 rounded-md border-2 border-secondary hover:bg-gray-100 transition",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        router.push(`message`);
      }
    });
  };

  const handleSave = () => {
    console.log("[v0] Save button clicked for influencer:", influencer?.name);
    // Add save/bookmark functionality here
  };

  const handleCopyLink = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl);
    console.log("[v0] Profile link copied to clipboard:", currentUrl);
    // Add success notification here
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg text-gray-600">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!influencer) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg text-gray-600">Influencer not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back
              </button>
            </div>

            {/* <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-gray-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 2L3 7v11a2 2 0 002 2h10a2 2 0 002-2V7l-7-5z" />
                </svg>
              </div>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-medium">
                M
              </div>
            </div> */}
          </div>
        </div>

        {/* Profile Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-6">
          <div className="flex items-start space-x-4">
            <Image
              height={64}
              width={64}
              src={influencer.profileImage || "/placeholder.svg"}
              alt={influencer.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  Meet {influencer.name} ({influencer.displayName})
                </h1>
                {influencer.isVerified && (
                  <span className="flex items-center text-green-600 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                    Verified
                  </span>
                )}
              </div>
              <p className="text-gray-600 mb-3">{influencer.tagline}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 10-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5a2 2 0 11-2.828-2.828l3-3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {influencer.website}
                </span>
                <span className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {influencer.location}
                </span>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleMessage}
                className="bg-secondary hover:bg-[var(--secondaryhover)] text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                💬 Message
              </button>
              <button
                onClick={handleSave}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
              >
                📌 Save
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* About the Creator */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  About the Creator
                </h2>
                <p className="text-gray-600 mb-4">{influencer.about}</p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Creator Type
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {influencer.creatorType}
                  </p>
                </div>
              </div>

              {/* Collaboration Performance */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Collaboration Performance
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-800 text-white p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-400">
                      {influencer.performance.totalCampaigns}
                    </div>
                    <div className="text-sm text-gray-300">Total Campaigns</div>
                  </div>
                  <div className="bg-slate-800 text-white p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-400">
                      {influencer.performance.engagementRate} %
                    </div>
                    <div className="text-sm text-gray-300">Engagement Rate</div>
                  </div>
                  <div className="bg-slate-800 text-white p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-400">
                      {influencer.performance.avgRating}
                    </div>
                    <div className="text-sm text-gray-300">Avg Rating</div>
                  </div>
                  <div className="bg-slate-800 text-white p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-400">
                      {influencer.performance.previousEngagements}+
                    </div>
                    <div className="text-sm text-gray-300">
                      Previous Engagements
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Campaigns */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Active Campaigns
                </h2>
                <div className="space-y-4">
                  {influencer.campaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900">
                          {campaign.title}
                        </h3>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          {campaign.status}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        {campaign.description}
                      </p>
                      <p className="text-gray-500 text-xs">
                        Deadline: {campaign.deadline}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews & Testimonials */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Reviews & Testimonials
                </h2>
                <div className="flex items-center mb-4">
                  <div className="text-3xl font-bold text-gray-900 mr-2">
                    {influencer.reviews.rating}
                  </div>
                  <div>
                    <div className="flex text-orange-500 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className="w-4 h-4 fill-current"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                    <div className="text-sm text-gray-500">
                      Based on {influencer.reviews.totalReviews} reviews
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  {influencer.reviews.testimonials.map((testimonial) => (
                    <div
                      key={testimonial.id}
                      className="border-l-4 border-green-400 pl-4"
                    >
                      <p className="text-gray-600 italic mb-2">
                        "{testimonial.text}"
                      </p>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">
                          {testimonial.author}
                        </span>
                        {testimonial.verified && (
                          <svg
                            className="w-4 h-4 text-green-500 ml-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Contact Information
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 text-gray-400 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <div className="font-medium text-gray-900">
                        {influencer.contact.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {influencer.contact.title}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 text-gray-400 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <span className="text-gray-600">
                      {influencer.contact.email}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 text-gray-400 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <span className="text-gray-600">
                      {influencer.contact.phone}
                    </span>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <a
                      href={influencer.contact.socialMedia.linkedin}
                      className="w-8 h-8 bg-primary text-white rounded flex items-center justify-center hover:bg-primary transition-colors"
                    >
                      <span className="text-xs font-bold">in</span>
                    </a>
                    <a
                      href={influencer.contact.socialMedia.twitter}
                      className="w-8 h-8 bg-primary text-white rounded flex items-center justify-center hover:bg-primary transition-colors"
                    >
                      <span className="text-xs font-bold">tw</span>
                    </a>
                    <a
                      href={influencer.contact.socialMedia.instagram}
                      className="w-8 h-8 bg-pink-500 text-white rounded flex items-center justify-center hover:bg-pink-600 transition-colors"
                    >
                      <span className="text-xs font-bold">ig</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Campaign Info */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Campaign Info
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      Content Types
                    </h3>
                    <div className="space-y-1">
                      {influencer.campaignInfo.contentTypes.map(
                        (type, index) => (
                          <div
                            key={index}
                            className="flex items-center text-sm text-gray-600"
                          >
                            <svg
                              className="w-3 h-3 text-green-500 mr-2"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {type}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      Budget Range
                    </h3>
                    <p className="text-sm text-gray-600">
                      {influencer.campaignInfo.budgetRange}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content Niches */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Content Niches
                </h2>
                <div className="flex flex-wrap gap-2">
                  {influencer.contentNiches.map((niche, index) => (
                    <span
                      key={index}
                      className="bg-primary text-primary text-xs px-3 py-1 rounded-full"
                    >
                      {niche}
                    </span>
                  ))}
                </div>
              </div>

              {/* Share Profile */}
              {/* <div className="bg-slate-800 text-white rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Share Profile</h2>
                <button
                  onClick={handleCopyLink}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                    <path d="M3 5a2 2 0 012-2 3 3 0 003 3h6a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11.586l-3-3a1 1 0 00-1.414 0L8 11.172V9a1 1 0 00-2 0v4a1 1 0 001 1h4a1 1 0 100-2H9.414l2.293-2.293A1 1 0 0015 11.586z" />
                  </svg>
                  Copy Link
                </button>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

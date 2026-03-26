import Link from "next/link";
import React from "react";
import { IoPersonOutline } from "react-icons/io5";
import KeywordMotion from "./KeywordMotion";

const Feature = () => {
  return (
    <section className="py-16 lg:py-[100px] bg-gradient-to-b from-[#F5FAFF] to-[#F4FAFF]">
      <KeywordMotion />

      <div className="grid md:grid-cols-2 gap-8 container mx-auto">
        {/* For Brands Card */}
        <Link href={"/auth/signup?role=brand&returnTo=/brand-onboarding"}>
          <div className="bg-white rounded-2xl shadow-lg flex flex-col justify-between  gap-4  overflow-hidden h-full">
            <div className=" bg-primary text-white text-center py-6">
              <h3 className="text-2xl font-bold">For Brands</h3>
            </div>

            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4 bg-[#F7F8F9] shadow p-1 rounded border-white border-3 text-[#838689] text-[24px]">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <IoPersonOutline />
                </div>
                <div>
                  <span className="text-lg font-semibold">
                    Create your free profile
                  </span>
                  <p className="text-sm">
                    Set up your brand profile in minutes and get ready to
                    connect.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-[#F7F8F9] shadow p-1 rounded border-white border-3 text-[#838689] text-[24px]">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <div>
                  <span className="text-lg font-semibold">
                    Post Your Campaign
                  </span>
                  <p className="text-sm">
                    Share your goals and discover micro-influencers who are the
                    perfect fit for your brand.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-[#F7F8F9] shadow p-1 rounded border-white border-3 text-[#838689] text-[24px]">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <div>
                  <span className="text-lg font-semibold">Match Instantly</span>
                  <p className="text-sm">
                    Get connected right away with the micro-influencers that
                    align best with your campaign.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-[#F7F8F9] shadow p-1 rounded border-white border-3 text-[#838689] text-[24px]">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="7" cy="7" r="3" />
                    <circle cx="17" cy="7" r="3" />

                    <path d="M3 20h18" />
                    <path d="M7 20v-3a4 4 0 0 1 4-4h0a4 4 0 0 1 4 4v3" />
                    <polyline points="3 14 8 10 12 13 17 9 21 12" />
                  </svg>
                </div>
                <div>
                  <span className="text-lg font-semibold">
                    Collaborate & Track Results
                  </span>
                  <p className="text-sm">
                    Work directly, manage partnerships with ease, and see your
                    success grow in real time.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <button className="w-full cursor-pointer  bg-secondary hover:bg-[var(--secondaryhover)] text-primary font-semibold py-4 rounded-lg transition-colors duration-200 text-lg ">
                Grow My Brand
              </button>
            </div>
          </div>
        </Link>

        {/* For Influencer Card */}
        <Link href={"/auth/signup?role=influencer&returnTo=/influencer-onboarding"}>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden  flex flex-col justify-between h-full">
            <div className="bg-primary text-white text-center py-6">
              <h3 className="text-2xl font-bold">For Influencer</h3>
            </div>
            <div className="space-y-6 p-8">
              <div className="flex items-center gap-4 bg-[#F7F8F9] shadow p-1 rounded border-white border-3 text-[#838689] text-[24px]">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <span className="text-lg font-semibold">
                    Create your free profile
                  </span>
                  <p className="text-sm">
                    Set up a simple profile to share who you are and what you
                    love.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-[#F7F8F9] shadow p-1 rounded border-white border-3 text-[#838689] text-[24px]">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <div>
                  <span className="text-lg font-semibold">
                    Browse Brand Campaigns
                  </span>
                  <p className="text-sm">
                    See opportunities from brands looking for authentic voices
                    like yours.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-[#F7F8F9] shadow p-1 rounded border-white border-3 text-[#838689] text-[24px]">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <div>
                  <span className="text-lg font-semibold">Match Instantly</span>
                  <p className="text-sm">
                    Get connected right away with brands that fit your style,
                    audience, and platforms.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-[#F7F8F9] shadow p-1 rounded border-white border-3 text-[#838689] text-[24px]">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="7" cy="7" r="3" />
                    <circle cx="17" cy="7" r="3" />

                    <path d="M3 20h18" />
                    <path d="M7 20v-3a4 4 0 0 1 4-4h0a4 4 0 0 1 4 4v3" />
                    <polyline points="3 14 8 10 12 13 17 9 21 12" />
                  </svg>
                </div>
                <div>
                  <span className="text-lg font-semibold">
                    Collaborate & Pay Off
                  </span>
                  <p className="text-sm">
                    Work with brands, build your presence, and watch your
                    influence pay off!
                  </p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <button className="w-full cursor-pointer bg-secondary hover:bg-[var(--secondaryhover)] text-primary font-semibold py-4 rounded-lg transition-colors duration-200 text-lg ">
                
                  Monetize My Influence
                
              </button>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
};

export default Feature;

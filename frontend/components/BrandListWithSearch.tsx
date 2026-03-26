"use client";

import { useState } from "react";
import Image from "next/image"; 
import BrandCard from "./BrandCard";
import { FaSearch } from "react-icons/fa";

type BrandData = {
  id: any;
  name: string;
  location: string;
  category: string;
  description: string;
  image: string;
  logo: string;
  service: string;
  rating: number;
  reviews: number;
  userId:number
  
  
};
interface BrandListWithSearchProps {
  brands: BrandData[];
}

export default function BrandListWithSearch({ brands }: BrandListWithSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter logic
  const filteredBrands = brands.filter((brand) => {
    const term = searchTerm.toLowerCase();
    return (
      brand.name.toLowerCase().includes(term) ||
      brand.category.toLowerCase().includes(term) ||
      brand.description.toLowerCase().includes(term) ||
      brand.location.toLowerCase().includes(term)
    );
  });

  return (
    <section>
      {/* --- HERO SECTION --- */}
      <section className="bg-gradient-to-b from-white to-gray-50">
        <main className="container mx-auto px-4 pt-8 lg:pt-16 pb-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-1 space-y-8 flex-1">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold text-primary leading-tight">
                  Discover Brands You’ll Love Sharing
                </h1>
              </div>

              <p className="text-primary text-[16px] leading-relaxed max-w-lg">
                Browse campaigns from brands that value your authentic voice.
                Choose partnerships that fit your style, share them with your
                audience, and get paid for creating real influence.
              </p>

              {/* SEARCH INPUT - Placed directly below content */}
              <div className="relative max-w-lg w-full mt-8 shadow-lg rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaSearch className="text-primary/50 text-lg" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name, category, or location..."
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {/* <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">
                  {filteredBrands.length} brands
                </div> */}
              </div>
            </div>

            {/* Right Image */}
            <div className="relative mt-8 lg:mt-0">
              <Image
                width={833}
                height={519}
                src={"/images/brand-hero1.png"}
                alt="Two stylish women representing micro-influencers"
                className="w-full h-auto max-w-md mx-auto lg:max-w-full "
                priority 
              />
            </div>
          </div>
        </main>
      </section>

      {/* --- BRAND LIST SECTION --- */}
      <div className="container mx-auto px-4 py-16 lg:py-[60px]">
        <div className="space-y-12">
          {filteredBrands.length > 0 ? (
            filteredBrands.map((brand) => (
              <BrandCard key={brand.id} {...brand} />
            ))
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FaSearch className="text-gray-400 text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700">No brands found</h3>
              <p className="text-gray-500 mt-2">Try checking your spelling or using general terms.</p>
              <button 
                onClick={() => setSearchTerm("")}
                className="mt-4 text-primary font-semibold hover:underline"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
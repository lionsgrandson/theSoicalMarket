import Image from "next/image";
import React from "react";

const WhySocial = () => {
  return (
    <div className="md:pb-[100px] pb-16  px-4 sm:px-6 lg:px-8">
      <h1 className="text-center font-bold text-3xl sm:text-[40px] text-primary mb-12">
        Why The Social Market?
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 container mx-auto">
        {/* Affordable Section */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center w-20 h-20 mb-6">
            <Image
              src="/images/why-icon3.png"
              width={76}
              height={76}
              alt="Affordable"
              className="w-auto h-auto"
            />
          </div>
          <h3 className="text-xl sm:text-2xl font-semibold text-primary mb-3">
            Affordable
          </h3>
          <p className="text-primary text-[24px] max-w-xs">
            Lower cost than traditional ads
          </p>
        </div>

        {/* Authentic Section */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center w-20 h-20 mb-6">
            <Image
              src="/images/why-icon2.png"
              width={76}
              height={76}
              alt="Authentic"
              className="w-auto h-auto"
            />
          </div>
          <h3 className="text-xl sm:text-2xl font-semibold text-primary mb-3">
            Authentic
          </h3>
          <p className="text-primary text-[24px] max-w-xs">
            Recommendations that people actually trust
          </p>
        </div>

        {/* Effective Section */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center w-20 h-20 mb-6">
            <Image
              src="/images/why-icon1.png"
              width={76}
              height={76}
              alt="Effective"
              className="w-auto h-auto"
            />
          </div>
          <h3 className="text-xl sm:text-2xl font-semibold text-primary mb-3">
            Effective
          </h3>
          <p className="text-primary text-[24px] max-w-xs">
            More engagement, more conversions, more results
          </p>
        </div>
      </div>
    </div>
  );
};

export default WhySocial;

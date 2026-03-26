import Image from "next/image";
import React from "react";

const GlobalSection = () => {
  return (
    <div>
      <section className="pb-16 md:pb-24 px-4">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-[32px] md:text-[40px]  font-semibold text-primary mb-8">
            Start now. Grow anywhere
          </h2>
          <p className="text-lg md:text-[24px] text-primary leading-relaxed mb-16 max-w-2xl mx-auto">
            You built something incredible. Now it&apos;s about the people. People seeing your product. People using it. People sharing it
            because they actually love it. That&apos;s why we built The Social
            Market: to make growth simple, authentic and effective.
          </p>

          {/* World Map */}
          <div className="relative max-w-4xl mx-auto">
  <div className="flex justify-center">
    <Image
      width={600}
      height={600}
      src="/images/globe.png"
      alt="World map showing global reach with location pins"
      className="w-full h-auto translate-x-4 md:translate-x-8" 
    />
  </div>
</div>

        </div>
      </section>
    </div>
  );
};

export default GlobalSection;

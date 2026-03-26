import Image from "next/image";
import Link from "next/link";
import React from "react";

const HowItWorks = () => {
  return (
    <section id="HowItWorks" className="relative ">
      <div className="relative z-10 py-16 lg:py-[100px] px-4 container mx-auto">
        <div className="container mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-[40px] font-bold text-primary">
            Where brands and influencers<br /> grow together
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 place-items-center">
          {/* Left side boxes */}
          <Link href={"/auth/signup?role=brand&returnTo=/brand-onboarding"}>
            <div className="w-[326px]">
              <div className="bg-white rounded shadow-md  text-left">
                <div className="flex gap-4 items-center justify-center bg-primary py-2 px-2 rounded">
                  <h3 className="text-xl font-bold text-[#ffffff] mb-2">
                    Brands
                  </h3>
                </div>
                <div className="px-6 pb-6">
                  <p className="text-[#838689] text-sm md:text-[19px] text-center  py-6">
                      Run authentic campaigns that build trust and drive sales.
                  </p>

                  <button className="bg-secondary hover:bg-[var(--secondaryhover)] w-full py-2 font-[600] text-[16px] text-primary rounded cursor-pointer">
                     Start Here
                  </button>
                </div>
              </div>
            </div>
          </Link>

          {/* Center image */}
          <div className="flex justify-center">
            <Image
              src="/images/work-img.png"
              alt="How it works illustration"
              width={400}
              height={400}
              className=" w-auto h-auto"
            />
          </div>

          {/* Right side boxes */}
          <Link href={"/auth/signup?role=influencer&returnTo=/influencer-onboarding"}>
            <div className="w-[326px]">
              <div className="bg-white rounded shadow-md  text-left">
                <div className="flex gap-4 items-center justify-center bg-primary py-2 px-2 rounded">
                  {/* <Image
                    src={"/images/work-icon1.png"}
                    width={62}
                    height={41}
                    alt="icon"
                  /> */}
                  <h3 className="text-xl font-bold text-[#ffffff] mb-2">
                    Influencers
                  </h3>
                </div>
                <div className="px-6 pb-6">
                  <p className="text-[#838689] text-sm md:text-[19px] text-center  py-6">
                    Monetize your influence by sharing products you love.
                  </p>

                  <button className="bg-secondary hover:bg-[var(--secondaryhover)] w-full py-2 font-[600] text-[16px] text-primary rounded cursor-pointer">
                    Start Here
                  </button>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

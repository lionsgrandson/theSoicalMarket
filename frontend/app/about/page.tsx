"use client";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/apiClient";
import Image from "next/image";
import { useState } from "react";
export default function AboutPage() {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [successMessage,setSuccessMessage]=useState(false);
  const[loading,setLoading]=useState(false);

  const handleFeedbackSubmit =async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(e.currentTarget);
      const payload = {
    email: formData.get("email") as string,
    subject: formData.get("subject") as string,
    feedback: formData.get("message") as string,
  };
  setLoading(true);
    try {
      


      const res= await apiClient("user_service/feedback/",{
        method:"POST",
        body:JSON.stringify(payload)
      });
      if (res?.success) {
        setSuccessMessage(true);
        form.reset(); 
    setIsFeedbackOpen(false);
      }
      
      
    } catch (error) {
      console.error("Feedback submit failed", error);
    }finally{
      setLoading(false);
    }
    
  };

  return (
    <div className="">
      {/* First Section */}
      <section className="bg-gradient-to-b from-[#ffffff] to-[#E9F4FF]">
        <main className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 items-center">
            {/* Left Content */}
            <div className="space-y-8 pb-8 md:pt-36 pt-16">
              <div className="space-y-4">
                <p className="text-primary text-[16px] leading-relaxed">
                  Hi — we’re so glad you’re here! Truly. Whether you stumbled in
                  out of curiosity or came looking for something specific,
                  you’re part of a community we’re excited to welcome.
                </p>
              </div>
              <div className="w-full space-y-6">
                <h1 className="text-4xl md:text-5xl font-bold text-primary leading-tight">
                  The Social Market Backstory
                </h1>
                
                <p className="text-primary text-[16px] leading-relaxed">
                  I had all these events and programs I wanted to share with the
                  world. But every time I looked into advertising, it felt like
                  the only option was spending a fortune on big influencers.
                </p>

                <p className="text-primary text-[16px] leading-relaxed">
                  That didn’t sit right with me—I wanted authentic growth that
                  was affordable. The kind that comes from people who align with
                  my values, who share because they care, not just because
                  they’re paid.
                </p>

                {/* Pull Quote */}
                <blockquote className="border-l-4 border-secondary pl-4 italic text-secondary text-lg font-medium">
                  “Real growth comes from genuine connections, not expensive
                  campaigns.”
                </blockquote>

                <p className="text-primary text-[16px] leading-relaxed ">
                  Then, randomly, I saw my friend—a health coach—posting about
                  these adorable pajamas her girls were wearing. They were
                  probably gifted, and it hit me: Wait. This is it. Maybe we
                  don’t need giant influencers. Maybe we can help each other.
                </p>
                <p className="text-primary text-[16px] leading-relaxed ">
                  That’s when the idea for{" "}
                  <span className="font-semibold text-[16px]">
                    The Social Market.
                  </span>{" "}
                  started forming. A space where brands and influencers
                  can easily find each other, collaborate, and grow—organically
                  . Welcome to{" "}
                  <span className="font-semibold text-[16px]">
                    The Social Market.
                  </span>{" "}
                  It’s good to see you here 😉
                </p>
              </div>

              {/* Feedback Button under paragraph */}
              <button
                onClick={() => setIsFeedbackOpen(true)}
                className="mt-4 bg-secondary text-primary font-semibold px-6 py-3 rounded-lg hover:bg-[var(--secondaryhover)] cursor-pointer transition"
              >
                Share Your Feedback
              </button>
            </div>

            {/* Right Image */}
            <div className="relative md:block hidden">
              <Image
                width={833}
                height={519}
                src={"/images/about-hero1.png"}
                alt="Two stylish women representing influencers"
                className="w-full h-[619px] max-w-md mx-auto lg:max-w-full"
                priority
              />
            </div>
          </div>
        </main>
      </section>

      {/* Second Section */}
      <main className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 items-center lg:gap-16">
          {/* Left Content */}
          <div className="space-y-8 lg:col-span-1">
            <h1 className="text-3xl md:text-4xl font-semibold text-primary leading-tight">
              Start Earning by Joining The Social Market
            </h1>

            <div className="space-y-6 text-[20px] text-primary leading-relaxed">
              <p>
                At The Social Market, we connect brands and influencers to
                create authentic growth. Whether you&apos;re a brand looking to
                expand your reach or a influencer wanting to monetize your
                influence, our platform makes it easy.
              </p>

              <p>
                Brands share their products, and influencers share their
                passion—it&apos;s that simple. By working together, everyone
                grows.
              </p>
            </div>
          </div>

          {/* Right Images */}
          <div className="relative ">
            <div className="grid grid-cols-2">
              <div className="space-y-4">
                <div className="border-white border-6  rounded-full overflow-hidden h-full">
                  <Image
                    width={500}
                    height={1000}
                    src="/images/about-img3.png"
                    alt="Professional working"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              </div>
              <div className="relative -ml-15 space-y-4 pt-8 z-20">
                <div className="border-white border-6 rounded-full overflow-hidden w-fit">
                  <Image
                    src="/images/about-img2.png"
                    alt="Content creation"
                    width={162}
                    height={262}
                    style={{ width: "162px", height: "260px" }}
                    className="object-cover rounded-full"
                  />
                </div>
                <div className="border-white border-6 rounded-full relative -mt-20 z-10 overflow-hidden w-fit">
                  <Image
                    src="/images/about-img1.png"
                    alt="Content creation"
                    width={162}
                    height={262}
                    style={{ width: "162px", height: "260px" }}
                    className="object-cover rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Feedback Modal */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-primary w-full max-w-md p-6 rounded-xl shadow-lg relative">
            {/* Close Button */}
            <button
              onClick={() => setIsFeedbackOpen(false)}
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-200"
            >
              ✕
            </button>

            <h2 className="text-2xl font-semibold text-white mb-4">
              Share Your Feedback
            </h2>

            <form
              onSubmit={handleFeedbackSubmit}
              className="flex flex-col gap-4"
            >
              <label className="text-white font-normal text-sm">
                Enter Your Email
              </label>
              <Input type="email"
              className="w-full  text-white placeholder:text-white/50"
    name="email"
    placeholder="Enter Your Email"
    required/>
              <label className="text-white font-normal text-sm">
                Subject
              </label>
              <Input type="text"
    name="subject"
    className="w-full  text-white placeholder:text-white/50"
    placeholder="Enter Your Subject"
    required/>
              <textarea
              name="message"
                value={feedback}
                placeholder="Write Your Message"
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded resize-none text-white placeholder:text-white/50"
                rows={5}
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFeedbackOpen(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
                >
                  Cancel
                </button>
                <button
                disabled={loading}
                  type="submit"
                  className="px-4 py-2 bg-secondary text-primary cursor-pointer rounded-lg hover:bg-[var(--secondaryhover)] font-semibold transition"
                >
                  {loading?
                  "Submitting...":"Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {successMessage && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
    <div className="bg-white w-full max-w-md mx-4 rounded-xl shadow-2xl relative animate-in zoom-in-95 duration-300">
      {/* Close button */}
      <button
        onClick={() => setSuccessMessage(false)}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Success Icon */}
      <div className="flex flex-col items-center text-center p-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-500 delay-150">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Success Message */}
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Message Sent Successfully!
        </h3>
        <p className="text-gray-600 text-sm mb-6">
          Your message has been delivered. The Social Market will be notified and can respond to you shortly.
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3 w-full">
          <button
            onClick={() => setSuccessMessage(false)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
          
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

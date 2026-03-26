"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaMinus, FaPlus } from "react-icons/fa";

const faqs = [
  // Influencers
  {
    question: "What is The Social Market?",
    answer:
      "The Social Market is a matchmaking platform that connects brands with influencers for authentic, affordable, and effective collaborations. Brands can easily find creators who are a great fit for their ideal clientele, and smaller and midsize  influencers can discover paid or gifted opportunities that match their style, values, and niche.",
  },
  {
    question: "Who can join as a influencer?",
    answer:
      "Anyone with a small to medium-sized social media audience who wants to share products they care about. Whether you have 50 followers or 50,000, your authentic voice matters. You don’t need to be a professional content creator — passion, creativity, and trustworthiness are what brands love.",
  },
  {
    question: "Do I have to pay to join?",
    answer:
      "Limited browsing the platform is free — you can explore a selection of brands and influencers without signing up. To fully join and access all features, there’s a very low monthly subscription. Even better: the first 100 users get free lifetime access as a thank-you for helping us build the platform.",
  },
  {
    question: "Do I have to post on Instagram?",
    answer:
      "Nope! You can share content wherever your audience engages — YouTube, WhatsApp Status, or even your podcast!",
  },
  {
    question: "How do I set my rates for paid collaborations?",
    answer:
      "When creating your profile, you’ll see suggested ranges: Free, $0–$100, $101–$499, $500+, or a custom amount. Plus, in your profile you can indicate exactly how you’d like to get compensated. Brands will see your preferences and match you with campaigns that fit.",
  },
  {
    question: "Can I work with multiple brands at the same time?",
    answer: "Absolutely! You can manage as many campaigns as you would like at the same time.",
  },
  {
    question: "What happens after I sign up?",
    answer:
      "You’ll have full access to browse potential brands and you’ll be able to contact them with just a click. Once you fill out your profile, brands can find you and reach out to you as well!",
  },
  {
    question: "I don’t have a big following — can I still make money?",
    answer:
      "Totally! Many brands care more about engagement and authenticity than numbers. Even small, dedicated audiences can be very effective.",
  },
  {
    question:
      "I just want to repost  to my WhatsApp Status or social feed — is that okay?",
    answer:
      "Yep. Many users start by sharing Status or social posts. You decide what to share and when, and brands will compensate you based on what you agree on.",
  },

  // Brands
  {
    question: "What types of brands succeed here?",
    answer:
      "Any size — from small to growing e-commerce businesses or mid-sized lifestyle brands. Popular categories include beauty, wellness, fashion, food, and nonprofit and lifestyle. Success comes from campaigns that resonate with influencers and their audiences.",
  },
  {
    question: "How do I create a campaign?",
    answer: `Creating a campaign is super easy! Just add your product or campaign details:
- Description of the product or service you offer
- Relevant Images or media for reposting
- Campaign type: Paid, gifted, or both
- Target audience filters (content niche, demographics, audience size, timezone)
- Suggested rates or budget
We’ve made it super simple to set up your campaign so that the right micro-influencers can find it quickly and start growing your brand immediately.`,
  },
  {
    question: "How do I match with the right micro-influencers?",
    answer:
      "You can filter by audience size, content niche, demographics, timezone, and compensation preference (paid, gift, or both). We’ve made this super easy — once you set the parameters, you’ll see influencers who match, so finding the right partners is fast and stress-free.",
  },
  {
    question: "Can I offer free products instead of paying?",
    answer:
      "Yessss! One of the options for micro-influencers in their profile is how they want to get compensated — gifts only, paid only, or a mix. If an influencer only wants gifts, you can filter for that and only see matches who prefer gifting campaigns.",
  },
  {
    question: "Do I have to pay to join as a brand?",
    answer:
      "Limited browsing of potential influencers is free. Full access and campaign creation require a subscription. Early adopters (first 100 users) get free lifetime access.",
  },

  // Platform & General
  {
    question: "Do I need to choose between being a brand or micro-influencer?",
    answer:
      "Nope! Many users are both. You’ll just complete both profiles and have separate dashboards for each. And btw if you are both, we have a discount created specifically for you.",
  },
  {
    question:
      "I am running multiple campaigns and working with several different micro-influencers. How do I keep track of what’s working and which influencers are bringing results?",
    answer:
      "Once each campaign is live, the dashboards give analytics for engagement, reach, and performance, so you can see what’s working and optimize campaigns.",
  },
  {
    question: "What if I need help?",
    answer:
      "Support is always available! You can reach out to us anytime at info@thesocialmarket.ai for assistance.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold mb-10 text-primary text-center">
          Frequently Asked Questions
        </h2>

        <div className="space-y-8"> {/* increased spacing */}
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-200 pb-6">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex justify-between items-center w-full text-left text-primary text-[24px] font-medium cursor-pointer hover:text-secondary transition-colors"
              >
                {faq.question}
                <span className="text-xl ml-2">
                  {openIndex === index ? <FaMinus size={14} /> : <FaPlus size={14} />}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.p
                    key="content"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="mt-4 text-primary text-base md:text-[17px] leading-relaxed overflow-hidden whitespace-pre-line"
                  >
                    {faq.answer}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

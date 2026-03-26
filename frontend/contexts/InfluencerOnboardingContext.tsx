import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
interface InfluencerOnboardingData {
  // From micro-influencer profile
  display_name: string;
  short_bio: string;
  gender:string;
  profile_picture: string;
  instagram_handle: string;
  tiktok_handle: string;
  youtube_handle: string;
  twitter_handle: string;
  linkedin_handle: string;
  facebook_handle:string;
  whatsapp_handle: string;
  podcast_handle:string;
  blog_url:string;
  content_niches: string[];
  audience_demographics: string[];
  keyword_and_tags: string;

  // From Collaboration preferences
  content_formats: string[];
  payment_preferences: string[];
  rate_range_for_social_post: string;
  rate_range_for_youtube_video: string;
  rate_range_for_blog_post: string;
  rate_range_for_facebook_post: string;
  rate_range_for_youtube_short: string;
  rate_range_for_repost: string;
  rate_range_for_instagram_story: string;
  rate_range_for_instagram_reel: string;
  rate_range_for_tiktok_video: string;
  rate_range_for_podcast_mention: string;
  rate_range_for_live_stream: string;
  rate_range_for_ugc_creation: string;
  rate_range_for_whatsapp_status_post: string;
  rate_range_for_affiliate_marketing_percent: string;
  rate_range_for_twitter_post:string;
  rate_range_for_linkedin_post:string;

  // From Communication & payment
  response_time: string;
  notifications: {
    email: boolean;
    push: boolean;
  };
  payment_method: string;
  account_holder_name: string;
  account_number: number;
  bank_name: string;
  paypal_email: string;
  routing_number: number;
  stripeConnected: boolean;
  insta_follower:string | number,
  facebook_follower:string | number,
  tiktok_follower:string | number,
  linkedin_follower:string | number,
  youtube_follower:string | number,
  blog_follower:string | number,
  twitter_follower:string | number,
  whatsapp_follower:string | number,
  podcast_follower:string | number,
}

interface InfluencerOnboardingContextType {
  onboardingDataInfluencer: InfluencerOnboardingData;
  setOnboardingDataInfluencer: React.Dispatch<
    React.SetStateAction<InfluencerOnboardingData>
  >;
}
const InfluencerOnboardingContext = createContext<
  InfluencerOnboardingContextType | undefined
>(undefined);
const initialState: InfluencerOnboardingData = {
  display_name: "",
  short_bio: "",
  gender:"",
  profile_picture: "",
  instagram_handle: "",
  tiktok_handle: "",
  youtube_handle: "",
  twitter_handle: "",
  linkedin_handle: "",
  facebook_handle:"",
  whatsapp_handle: "",
  podcast_handle:"",
  blog_url:"",
  content_niches: [],
  audience_demographics: [],
  keyword_and_tags: "",
  content_formats: [],
  payment_preferences: [],

  rate_range_for_social_post: "",
  rate_range_for_youtube_video: "",
  rate_range_for_blog_post: "",
  rate_range_for_facebook_post: "",
  rate_range_for_youtube_short: "",
  rate_range_for_repost: "",
  rate_range_for_instagram_story: "",
  rate_range_for_instagram_reel: "",
  rate_range_for_tiktok_video: "",
  rate_range_for_podcast_mention: "",
  rate_range_for_live_stream: "",
  rate_range_for_ugc_creation: "",
  rate_range_for_whatsapp_status_post: "",
  rate_range_for_affiliate_marketing_percent: "",
  rate_range_for_twitter_post:"",
  rate_range_for_linkedin_post:"",
  response_time: "",
  notifications: {
    email: true,
    push: true,
  },
  payment_method: "",
  account_holder_name: "",
  bank_name: "",
  paypal_email: "",
  account_number: 0,
  routing_number: 0,
  stripeConnected: false,
  insta_follower:"",
  facebook_follower:"",
  tiktok_follower:"",
  linkedin_follower:"",
  youtube_follower:"",
  blog_follower:"",
  twitter_follower:"",
  whatsapp_follower:"",
  podcast_follower:"",
};
const InfluencerOnboardingProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [onboardingDataInfluencer, setOnboardingDataInfluencer] =
    useState<InfluencerOnboardingData>(() => {
      if (typeof window === "undefined" || !window.localStorage) {
        return initialState;
      }
      try {
        const storedData = localStorage.getItem("InfluencerOnboardingData");
        return storedData ? JSON.parse(storedData) : initialState;
      } catch (error) {
        console.error(
          "Failed to parse influencer onboardingDataInfluencer data from localStorage",
          error
        );
        return initialState;
      }
    });

  useEffect(() => {
    localStorage.setItem(
      "InfluencerOnboardingData",
      JSON.stringify(onboardingDataInfluencer)
    );
  }, [onboardingDataInfluencer]);

  return (
    <InfluencerOnboardingContext.Provider
      value={{ onboardingDataInfluencer, setOnboardingDataInfluencer }}
    >
      {children}
    </InfluencerOnboardingContext.Provider>
  );
};
export default InfluencerOnboardingProvider;

export const useInfluencerOnboarding = () => {
  const context = useContext(InfluencerOnboardingContext);
  if (!context) {
    throw new Error(
      "useInfluencerOnboarding must be used within a InfluencerOnboardingProvider"
    );
  }
  return context;
};

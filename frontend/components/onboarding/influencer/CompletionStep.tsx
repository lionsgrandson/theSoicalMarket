import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Search, MessageCircle, Gift, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/apiClient";
import { useAuthStore } from "@/stores/useAuthStore";
import { useInfluencerOnboarding } from "@/contexts/InfluencerOnboardingContext";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";

interface CompletionStepProps {
  onComplete: () => void;
}

interface InfluencerOnboardingData {
  display_name?: string;
  short_bio?: string;
  gender?:string;
  profile_picture?: string;
  instagram_handle?: string;
  tiktok_handle?: string | null;
  youtube_handle?: string;
  twitter_handle?: string;
  linkedin_handle?: string;
  whatsapp_handle?: string;
  facebook_handle?: string;
  podcast_handle:string;
  blog_url:string;
  youtube_follower:number;
  whatsapp_follower:number;
  twitter_follower:number;
tiktok_follower:number;
podcast_follower:number;
linkedin_follower:number;
insta_follower:number;
facebook_follower:number;
blog_follower:number;
  content_niches?: string[];
  audience_demographics?: string[];
  keyword_and_tags?: string;
  content_formats?: string[];
  payment_preferences?: string[];
  rate_range_for_social_post?: string;
  rate_range_for_youtube_video?: string;
  rate_range_for_blog_post?: string;
  rate_range_for_youtube_short?: string;
  rate_range_for_repost?: string;
  rate_range_for_instagram_story?: string;
  rate_range_for_instagram_reel?: string;
  rate_range_for_tiktok_video?: string;
  rate_range_for_podcast_mention?: string;
  rate_range_for_live_stream?: string;
  rate_range_for_ugc_creation?: string;
  rate_range_for_whatsapp_status_post?: string;
  rate_range_for_facebook_post?: string;
  rate_range_for_affiliate_marketing_percent?: string;
  response_time?: string;
  payment_method?: string;
  account_holder_name?: string;
  account_number?: string | number;
  bank_name?: string;
  paypal_email?: string;
  notifications:{
    email?:boolean,
    push?:boolean,
  }
}

const transformInfluencerDataForAPI = (data: InfluencerOnboardingData) => {
  console.log("profile_picture:", data.profile_picture);

  const payload = {
    is_influencer_profile_complete:true,
    influencer_profile: {
      display_name: data.display_name,
      short_bio: data.short_bio,
      gender:data.gender,
      profile_picture: data.profile_picture,
      instagram_handle: data.instagram_handle,
      tiktok_handle: data.tiktok_handle === "null" ? "" : data.tiktok_handle,
      youtube_handle: data.youtube_handle,
      twitter_handle: data.twitter_handle,
      linkedin_handle: data.linkedin_handle,
      whatsapp_handle: data.whatsapp_handle,
      facebook_handle: data.facebook_handle,
      blog_handle:data.blog_url,
      podcast_handle:data.podcast_handle,

      content_niches: Array.isArray(data.content_niches)
        ? data.content_niches.join(", ")
        : "",
      audience_demographics: Array.isArray(data.audience_demographics)
        ? data.audience_demographics.join(", ")
        : "",
      keyword_and_tags: data.keyword_and_tags,
      content_formats: Array.isArray(data.content_formats)
        ? data.content_formats.join(", ")
        : "",
      payment_preferences: Array.isArray(data.payment_preferences)
        ? data.payment_preferences.join(", ")
        : "",
      // Rate and payment fields
      rate_range_for_social_post: data.rate_range_for_social_post,
      rate_range_for_youtube_video: data.rate_range_for_youtube_video,
      rate_range_for_blog_post: data.rate_range_for_blog_post,
      rate_range_for_youtube_short: data.rate_range_for_youtube_short,
      rate_range_for_repost: data.rate_range_for_repost,
      rate_range_for_instagram_story: data.rate_range_for_instagram_story,
      rate_range_for_instagram_reel: data.rate_range_for_instagram_reel,
      rate_range_for_tiktok_video: data.rate_range_for_tiktok_video,
      rate_range_for_podcast_mention: data.rate_range_for_podcast_mention,
      rate_range_for_live_stream: data.rate_range_for_live_stream,
      rate_range_for_ugc_creation: data.rate_range_for_ugc_creation,
      rate_range_for_whatsapp_status_post:
        data.rate_range_for_whatsapp_status_post,
      rate_range_for_affiliate_marketing_percent:
        data.rate_range_for_affiliate_marketing_percent,
      response_time: data.response_time,
      payment_method: data.payment_method,
      account_holder_name: data.account_holder_name,
      account_number: data.account_number ? String(data.account_number) : "",
      bank_name: data.bank_name,
      paypal_email: data.paypal_email,
      notifications_email:data.notifications.email,
      notifications_push:data.notifications.push,
      insta_follower: data.insta_follower || 0,
    tiktok_follower: data.tiktok_follower || 0,
    youtube_follower: data.youtube_follower || 0,
    facebook_follower: data.facebook_follower || 0,
    linkedin_follower: data.linkedin_follower || 0,
    blog_follower: data.blog_follower || 0,
    whatsapp_follower: data.whatsapp_follower || 0,
    podcast_follower: data.podcast_follower || 0,
    twitter_follower: data.twitter_follower || 0,
    },
  };
  return payload;
};

const CompletionStep = ({ onComplete }: CompletionStepProps) => {
      const { data: session, status: sessionStatus } = useSession(); 
    const {setUser}=useAuthStore();
  const nextSteps = [
    {
      icon: Search,
      title: "Browse Campaigns",
      description: "Find brand campaigns that match your niche and interests",
      action: "Explore Campaigns",
      href: "/influencer-dashboard/campaigns",
    },
    {
      icon: MessageCircle,
      title: "Complete Your Profile",
      description: "Add more details to attract better brand partnerships",
      action: "Finish Profile",
      href: "/influencer-dashboard/settings",
    },
  ];

 

  
//   useEffect(() => {
//       const  token  = localStorage.getItem("access_token");
//       const effectiveToken = token || useAuthStore.getState().token || session?.accessToken;
// if (effectiveToken) {
//   return;
// }
//     const submitOnboardingData = async () => {
//       const storedData = localStorage.getItem("InfluencerOnboardingData");
//       if (!storedData) return;

//       try {
//         const onboardingData = JSON.parse(storedData) as InfluencerOnboardingData;
//         console.log("profile_picture:", onboardingData.profile_picture);

//         const apiPayload = transformInfluencerDataForAPI(onboardingData);

//        const res= await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}user_service/update_user_profile/`, {
//           method: "PATCH",
//           headers: {
//             Authorization: `Bearer ${effectiveToken}`,
//           },
//           body: JSON.stringify(apiPayload),
//         });
//         if (res) {
//           toast( "Profile Saved!");
//         }

        
        
//       } catch (error) {
//         console.error("Failed to submit influencer onboarding data:", error);
//         toast("Error Saving Profile");
//       }
//     };

  
//       submitOnboardingData();
    
//   }, []);
useEffect(() => {
  const tokenFromLS = localStorage.getItem("access_token");
  const tokenFromStore = useAuthStore.getState().token;
  const tokenFromSession = session?.accessToken;

  const effectiveToken =
    tokenFromStore || tokenFromSession || tokenFromLS;

  // 🚫 Stop if no token
  if (!effectiveToken) {
    console.warn("No auth token available, skipping onboarding submit");
    return;
  }

  const submitOnboardingData = async () => {
    const storedData = localStorage.getItem("InfluencerOnboardingData");
    if (!storedData) return;

    try {
      const onboardingData = JSON.parse(storedData) as InfluencerOnboardingData;
      const apiPayload = transformInfluencerDataForAPI(onboardingData);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}user_service/update_user_profile/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${effectiveToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiPayload),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status} - ${text}`);
      }

      const responseData = await res.json();
      if (responseData.code === 200 || res.status === 200) {
        setUser(responseData.data);
        localStorage.removeItem("InfluencerOnboardingData");
        // toast("Profile Saved!");
      }
    } catch (error) {
      console.error("Failed to submit influencer onboarding data:", error);
      toast("Error Saving Profile");
    }
  };

  submitOnboardingData();
}, [session?.accessToken]);

  return (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-secondary" />
        </div>
        <h1 className="text-4xl font-bold text-primary">
          Welcome to <span className="">The Social Market</span>!
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your influencer profile is complete and you&apos;re ready to
          start earning! Get ready to collaborate with amazing brands and grow
          your influence.
        </p>
      </div>

      {/* Creator Status */}
      <Card className="bg-secondary/5 border-secondary/20">
        <CardContent className="p-6 text-center space-y-4">
          <Badge variant="secondary" className="text-secondary bg-secondary/10">
            influencers Account Active
          </Badge>
          <h3 className="font-semibold text-lg">Ready to Start Earning</h3>
          <p className="text-sm text-muted-foreground">
            Your profile is live and visible to brands. Start browsing campaigns
            or wait for brands to discover you!
          </p>
          {/* <div className="flex items-center justify-center gap-6 text-sm">
            <div className="text-center">
              <div className="font-semibold text-secondary">85%</div>
              <div className="text-muted-foreground">Your Earnings</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-secondary">Weekly</div>
              <div className="text-muted-foreground">Payouts</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-secondary">24/7</div>
              <div className="text-muted-foreground">Support</div>
            </div>
          </div> */}
        </CardContent>
      </Card>

      {/* Next Steps */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">What&apos;s Next?</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {nextSteps.map((step, index) => (
            <Card key={index} className="hover-lift cursor-pointer">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto">
                  <step.icon className="w-6 h-6 text-secondary" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Link href={step.href}>
          {step.action}
        </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      

      {/* Pro Tips */}
      <Card className="bg-muted/30">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-lg">💡 Pro Tips for Success</h3>
          <div className="grid md:grid-cols-2 gap-4 text-left">
            <div className="space-y-2">
              <h4 className="font-medium">Profile Optimization</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Add high-quality profile photos</li>
                <li>• Include your best content examples</li>
                <li>• Keep your bio authentic and engaging</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Collaboration Success</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Respond to brand messages quickly</li>
                <li>• Always meet your deadlines</li>
                <li>• Communicate proactively</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
        <Button variant="hero" size="lg" onClick={onComplete} className="cursor-pointer">
          Go to Dashboard
        </Button>
        
      </div>
    </div>
  );
};

export default CompletionStep;

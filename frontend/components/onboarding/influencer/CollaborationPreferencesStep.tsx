"use client";

import { useInfluencerOnboarding } from "@/contexts/InfluencerOnboardingContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Video,
  Image,
  Mic,
  FileText,
  DollarSign,
  Gift,
  Percent,
  Crown,
  Repeat,
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface CollaborationPreferencesStepProps {
  onNext: () => void;
  onBack: () => void;
}

const CollaborationPreferencesStep = ({
  onNext,
  onBack,
}: CollaborationPreferencesStepProps) => {
  const { onboardingDataInfluencer, setOnboardingDataInfluencer } =
    useInfluencerOnboarding();

  const contentFormats = [
    
    
    { id: "instagramStory", label: "Instagram Story", icon: Image },
    { id: "instagramReel", label: "Instagram Reel", icon: Video },
    { id: "tiktokVideo", label: "TikTok Video", icon: Video },
    { id: "youtubeVideo", label: "YouTube Video", icon: Video },
    { id: "youtubeShort", label: "YouTube Short", icon: Video },
    { id: "blogPost", label: "Blog Post", icon: FileText },
    { id: "facebookPost", label: "Facebook Post", icon: FileText },
    { id: "podcastMention", label: "Podcast Mention", icon: Mic },
    { id: "liveStream", label: "Live Stream", icon: Video },
    { id: "userGeneratedContent", label: "UGC Creation", icon: Video },
    { id: "whatsappStatus", label: "WhatsApp Status Post", icon: Image },
    { id: "socialPost", label: "Whatsapp Group Post", icon: Image },
    { id: "repost", label: "Repost", icon: Repeat },
    { id: "twitterPost", label: "Twitter/X Post", icon: FileText },
    { id: "linkedinPost", label: "LinkedIn Post", icon: FileText },
  ];

  const paymentTypes = [
    { id: "gifted", label: "Gifted Products or Services", icon: Gift, description: "Receive free products in exchange for content" },
    { id: "paid", label: "Paid Collaborations", icon: DollarSign, description: "Get paid for your content creation" },
    { id: "affiliate", label: "Affiliate Marketing", icon: Percent, description: "Earn commission on sales you generate" },
    { id: "ambassador", label: "Brand Ambassador", icon: Crown, description: "Long-term partnerships with ongoing benefits" },
  ];

  const rateRanges = [
    { value: "custom", label: "Custom amount" },
    { value: "free", label: "Free" },
    { value: "0-100", label: "$0 – $100" },
    { value: "101-499", label: "$101 – $499" },
    { value: "500+", label: "$500+" },
  ];

  const handleArrayChange = (
    field: "content_formats" | "payment_preferences",
    value: string,
    checked: boolean
  ) => {
    setOnboardingDataInfluencer((prev) => ({
      ...prev,
      [field]: checked
        ? [...prev[field], value]
        : prev[field].filter((item) => item !== value),
    }));
  };

  const handleAffiliatePercentageChange = (value: string) => {
    setOnboardingDataInfluencer((prev) => ({
      ...prev,
      rate_range_for_affiliate_marketing_percent: value,
    }));
  };

  const isValid =
    onboardingDataInfluencer.content_formats.length > 0 &&
    onboardingDataInfluencer.payment_preferences.length > 0;

  // ─────────────────────────────────────────────────────────────────────
  // RATE RANGE LOGIC – THIS IS THE FIXED PART
  // ─────────────────────────────────────────────────────────────────────
  const fieldMap: Record<string, keyof typeof onboardingDataInfluencer> = {
    socialPost: "rate_range_for_social_post",
    repost: "rate_range_for_repost",
    instagramStory: "rate_range_for_instagram_story",
    instagramReel: "rate_range_for_instagram_reel",
    tiktokVideo: "rate_range_for_tiktok_video",
    youtubeVideo: "rate_range_for_youtube_video",
    youtubeShort: "rate_range_for_youtube_short",
    blogPost: "rate_range_for_blog_post",
    facebookPost: "rate_range_for_facebook_post",
    podcastMention: "rate_range_for_podcast_mention",
    liveStream: "rate_range_for_live_stream",
    userGeneratedContent: "rate_range_for_ugc_creation",
    whatsappStatus: "rate_range_for_whatsapp_status_post",
    linkedinPost: "rate_range_for_linkedin_post",
    twitterPost: "rate_range_for_twitter_post",
  };

  const predefinedValues = ["free", "0-100", "101-499", "500+"];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl text-primary font-bold">Collaboration preferences</h1>
        <p className="text-muted-foreground">
          Help brands understand how you like to work and what you charge
        </p>
      </div>

      <div className="grid  gap-8">
        {/* Content Formats */}
        <Card>
          <CardHeader><CardTitle>Content Formats *</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contentFormats.map((format) => (
                <div
                  key={format.id}
                  className="flex items-center space-x-3 p-3 pô border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={format.id}
                    checked={onboardingDataInfluencer.content_formats.includes(format.id)}
                    onCheckedChange={(checked) =>
                      handleArrayChange("content_formats", format.id, checked as boolean)
                    }
                  />
                  <format.icon className="w-4 h-4 text-muted-foreground" />
                  <Label htmlFor={format.id} className="text-sm font-normal cursor-pointer">
                    {format.label}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="flex md:flex-row flex-col gap-4">
          {/* Payment Preferences */}
        <Card className="w-full">
          <CardHeader><CardTitle>Payment Preferences *</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {paymentTypes.map((type) => (
                <div
                  key={type.id}
                  className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id={type.id}
                      checked={onboardingDataInfluencer.payment_preferences.includes(type.id)}
                      onCheckedChange={(checked) =>
                        handleArrayChange("payment_preferences", type.id, checked as boolean)
                      }
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <type.icon className="w-4 h-4 text-muted-foreground" />
                        <Label htmlFor={type.id} className="text-sm font-medium cursor-pointer">
                          {type.label}
                        </Label>
                      </div>
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                    </div>
                  </div>

                  {/* Affiliate % input */}
                  {type.id === "affiliate" &&
                    onboardingDataInfluencer.payment_preferences.includes(type.id) && (
                      <div className="flex flex-col">
                        <Label className="text-xs font-medium">Percentage (%)</Label>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          placeholder="e.g. 20"
                          value={onboardingDataInfluencer.rate_range_for_affiliate_marketing_percent}
                          onChange={(e) => handleAffiliatePercentageChange(e.target.value)}
                        />
                      </div>
                    )}
                </div>
              ))}
            </div>
            <div className="mt-4">
              {onboardingDataInfluencer.payment_preferences.map((pref) => (
                <Badge key={pref} variant="secondary" className="mr-2 mb-2">
                  {paymentTypes.find((p) => p.id === pref)?.label}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        {/* RATE RANGES – FIXED & WORKING */}
        {onboardingDataInfluencer.payment_preferences.includes("paid") && (
  <Card className="w-full border-none shadow-sm">
    <CardHeader className="pb-4 border-b border-gray-100">
      <CardTitle className="text-xl flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-primary" />
        Your Rate Ranges
      </CardTitle>
      <CardDescription>
        {onboardingDataInfluencer.content_formats.length > 0
          ? "Set your base rates for the content formats selected above."
          : "Select content formats above to set rates."}
      </CardDescription>
    </CardHeader>
    
    <CardContent className="pt-6">
      {onboardingDataInfluencer.content_formats.length > 0 ? (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {onboardingDataInfluencer.content_formats.map((formatId) => {
            const field = fieldMap[formatId];
            // Safety check: if field mapping doesn't exist, skip
            if (!field) return null;

            const label = contentFormats.find((f) => f.id === formatId)?.label || formatId;
            const currentValue = (onboardingDataInfluencer[field] as string) || "";
            
            // Determine if the current value is a custom number or a preset range
            const isCustom = !predefinedValues.includes(currentValue) && currentValue !== "";
            const selectValue = isCustom ? "custom" : currentValue;

            return (
              <div
                key={formatId}
                className="grid sm:grid-cols-[1fr_140px_100px] gap-3 items-center p-3 bg-gray-50 rounded-lg border border-gray-100 transition-all hover:border-gray-200"
              >
                {/* Label */}
                <span 
                  className="text-sm font-medium text-gray-700 truncate" 
                  title={label}
                >
                  {label}
                </span>

                {/* Dropdown */}
                <Select
                  value={selectValue}
                  onValueChange={(value) => {
                    if (value === "custom") {
                      // If custom selected, clear value to allow typing
                      setOnboardingDataInfluencer((prev) => ({
                        ...prev,
                        [field]: "",
                      }));
                    } else {
                      // If range selected, save the range string
                      setOnboardingDataInfluencer((prev) => ({
                        ...prev,
                        [field]: value,
                      }));
                    }
                  }}
                >
                  <SelectTrigger className="h-9 text-xs bg-white">
                    <SelectValue placeholder="Select rate" />
                  </SelectTrigger>
                  <SelectContent>
                    {rateRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value} className="text-xs">
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Custom Input (Only appears if 'Custom' is selected or value is numeric) */}
                <div className="relative">
                  {(selectValue === "custom" || selectValue === "") && (
                    <>
                      <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={isCustom ? currentValue : ""}
                        onChange={(e) => {
                          setOnboardingDataInfluencer((prev) => ({
                            ...prev,
                            [field]: e.target.value,
                          }));
                        }}
                        className="h-9 pl-6 text-xs bg-white"
                      />
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Empty State
        <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground p-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
          <DollarSign className="w-8 h-8 mb-2 opacity-20" />
          <p className="text-sm">No content formats selected.</p>
        </div>
      )}
    </CardContent>
  </Card>
)}
        </div>
        

        
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" onClick={onNext} disabled={!isValid}>
          Continue
        </Button>
      </div>
    </div>
  );
};

export default CollaborationPreferencesStep;
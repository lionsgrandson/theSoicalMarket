"use client";

import { useRef, useState } from "react";
import {
  Upload,
  X,
  DollarSign,
  Percent,
  ChevronDown,
  Repeat,
  Video,
  FileText,
  Mic,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import { uploadToCloudinary } from "@/lib/fileUpload";
import { apiClient } from "@/lib/apiClient";
import { toast } from "react-toastify";
import { useAuthStore } from "@/stores/useAuthStore";

type StoredInfluencerProfile = {
  content_niches?: string | null;
  content_formats?: string | null;
  payment_preferences?: string | null;
  rate_range_for_affiliate_marketing_percent?: string | null;
  [key: string]: string | null | undefined;
};

const placeholders: Record<string, string> = {
  instagram: "https://www.instagram.com/username",
  facebook: "https://www.facebook.com/username",
  tiktok: "https://www.tiktok.com/@username",
  twitter: "https://twitter.com/username",
  youtube: "Full channel URL (e.g., youtube.com/@YourChannel)",
  linkedin: "Full profile or page URL (e.g., linkedin.com/in/yourname",
  whatsapp: "WhatsApp link (e.g., wa.me/15551234567)",
};

const contentNiches = [
  "Beauty & Skincare Brands – makeup, skincare, haircare",
  "Fashion & Apparel – clothing lines, modest fashion brands, boutique shops",
  "Jewelry & Accessories – watches, handbags, eyewear",
  "Health & Wellness – supplements, fitness programs, healthy living",
  "Food & Beverage – restaurants, cafes, packaged foods, specialty drinks",
  "Hospitality & Travel – hotels, resorts, Airbnb hosts, travel agencies",
  "Events & Experiences – retreats, workshops, conferences",
  "E-commerce Stores – online boutiques, curated shops, niche product sellers",
  "Local Service Providers – gyms, salons, spas, personal trainers",
  "Tech & Gadgets – phone accessories, smart devices, apps",
  "Education & Coaching – online courses, coaches, masterminds",
  "Parenting & Family Brands – baby products, toys, household goods",
  "Home & Lifestyle – decor, furniture, kitchenware, cleaning products",
  "Financial & Professional Services – investment apps, insurance, credit repair",
  "Nonprofits & Causes – charities, community organizations, social impact campaigns",
  "Other",
];

const contentFormats = [
  { id: "socialPost", label: "Whatsapp Group Post", icon: Image },
  { id: "repost", label: "Repost", icon: Repeat },
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
  { id: "linkedinPost", label: "LinkedIn Post", icon: FileText },
  { id: "twitterPost", label: "Twitter/X Post", icon: FileText },
];

const rateRanges = [
  { value: "free", label: "Free" },
  { value: "0-100", label: "$0 – $100" },
  { value: "101-499", label: "$101 – $499" },
  { value: "500+", label: "$500+" },
  { value: "custom", label: "Custom amount" },
];

const fieldMap: Record<string, string> = {
  socialPost: "rate_range_for_social_post",
  repost: "rate_range_for_repost",
  instagramStory: "rate_range_for_instagram_story",
  instagramReel: "rate_range_for_instagram_reel",
  tiktokVideo: "rate_range_for_tiktok_video",
  youtubeVideo: "rate_range_for_youtube_video",
  youtubeShort: "rate_range_for_youtube_short",
  blogPost: "rate_range_for_blog_post",
  podcastMention: "rate_range_for_podcast_mention",
  liveStream: "rate_range_for_live_stream",
  userGeneratedContent: "rate_range_for_ugc_creation",
  whatsappStatus: "rate_range_for_whatsapp_status_post",
  facebookPost: "rate_range_for_facebook_post",
  linkedinPost: "rate_range_for_linkedin_post",
  twitterPost: "rate_range_for_twitter_post",

};
const splitContentNiches = (value: string): string[] => {
  if (!value) return [];

  return value
    .split(/,\s(?=[A-Z][^,]*(?:&|–))/)
    .map((s) => s.trim());
};
export default function ProfilePage() {
  const { user,setUser } = useAuthStore();
  console.log(user);
  
  const p: StoredInfluencerProfile =
    (user?.influencer_profile as StoredInfluencerProfile | undefined) ?? {};
  const fileInputRef = useRef<HTMLInputElement>(null);

  const normalizePaymentPref = (pref?: string | null) => {
    if (!pref) return null;
    const val = pref.toLowerCase();
    if (val.includes("gifted")) return "gifted";
    if (val.includes("paid")) return "paid";
    if (val.includes("affiliate")) return "affiliate";
    if (val.includes("ambassador")) return "ambassador";
    return null;
  };

  const initialNiches = p.content_niches
  ? splitContentNiches(p.content_niches)
  : [];
  const initialFormats = p.content_formats
    ? p.content_formats.split(",").map((s: string) => s.trim())
    : [];
  const paymentPrefs = p.payment_preferences
    ? p.payment_preferences
        .split(",")
        .map((s: string) => normalizePaymentPref(s.trim()))
        .filter(Boolean) as string[]
    : [];

  const [selectedNiches, setSelectedNiches] = useState<string[]>(initialNiches);
  const [selectedFormats, setSelectedFormats] = useState<string[]>(initialFormats);

  const [paymentModels, setPaymentModels] = useState({
    gifted: paymentPrefs.includes("gifted"),
    paid: paymentPrefs.includes("paid"),
    affiliate: paymentPrefs.includes("affiliate"),
    ambassador: paymentPrefs.includes("ambassador"),
  });

  const [affiliatePercent, setAffiliatePercent] = useState(
    p.rate_range_for_affiliate_marketing_percent || ""
  );

  const [rates, setRates] = useState<
    Record<string, { type: string; custom: string }>
  >(
    Object.fromEntries(
      contentFormats.map((f) => {
        const rawValue = p[fieldMap[f.id]];
        const value = typeof rawValue === "string" ? rawValue : "";
        const isCustom =
          value && !["free", "0-100", "101-499", "500+"].includes(value);
        return [
          f.id,
          { type: isCustom ? "custom" : value, custom: isCustom ? value : "" },
        ];
      })
    )
  );

  const [formData, setFormData] = useState({
    fullName: p.display_name || "",
    bio: p.short_bio || "",
    socialLinks: {
      instagram: p.instagram_handle || "",
      facebook: p.facebook_handle || "",
      tiktok: p.tiktok_handle || "",
      youtube: p.youtube_handle || "",
      twitter: p.twitter_handle || "",
      linkedin: p.linkedin_handle || "",
      whatsapp: p.whatsapp_handle || "",
      blog:p.blog_handle || "",
      podcast:p.podcast_handle || "",
    },
    followers: {
    instagram: p.insta_follower || "",
    tiktok: p.tiktok_follower || "",
    youtube: p.youtube_follower || "",
    facebook: p.facebook_follower || "",
    linkedin: p.linkedin_follower || "",
    blog: p.blog_follower || "",
    whatsapp:p.whatsapp_follower || "", 
    podcast:p.podcast_follower || "", 
    twitter:p.twitter_follower || "", 
  }
  });

  const [imagePreview, setImagePreview] = useState<string | null>(
    p.profile_picture || null
  );
  const [saving, setSaving] = useState(false);
  
  

  const handleSubmit = async () => {

    
    setSaving(true);

    const ratePayload: Record<string, string> = {};
    selectedFormats.forEach((id) => {
      const r = rates[id];
      ratePayload[fieldMap[id]] = r.type === "custom" ? r.custom : r.type;
    });

    const payload = {
      influencer_profile: {
        display_name: formData.fullName || null,
        profile_picture: imagePreview || null,
        short_bio: formData.bio || null,
        instagram_handle: formData.socialLinks.instagram || null,
        tiktok_handle: formData.socialLinks.tiktok || null,
        youtube_handle: formData.socialLinks.youtube || null,
        twitter_handle: formData.socialLinks.twitter || null,
        linkedin_handle: formData.socialLinks.linkedin || null,
        whatsapp_handle: formData.socialLinks.whatsapp || null,
        facebook_handle: formData.socialLinks.facebook || null,
        blog_handle: formData.socialLinks.blog || null,
        content_niches: selectedNiches.length ? selectedNiches.join(", ") : null,
        content_formats: selectedFormats.length ? selectedFormats.join(", ") : null,
        payment_preferences: Object.entries(paymentModels)
          .filter(([_, v]) => v)
          .map(([k]) =>
            k === "gifted"
              ? "Gifted Products or Services"
              : k === "paid"
              ? "Paid Collaborations"
              : k === "affiliate"
              ? "Affiliate Marketing"
              : "Brand Ambassadorship"
          )
          .join(", ") || null,
        ...ratePayload,
        rate_range_for_affiliate_marketing_percent: paymentModels.affiliate
          ? affiliatePercent
          : null,
      insta_follower: formData.followers.instagram || 0,
    tiktok_follower: formData.followers.tiktok || 0,
    youtube_follower: formData.followers.youtube || 0,
    facebook_follower: formData.followers.facebook || 0,
    linkedin_follower: formData.followers.linkedin || 0,
    blog_follower: formData.followers.blog || 0,
    whatsapp_follower: formData.followers.whatsapp || 0,
    podcast_follower: formData.followers.podcast || 0,
    twitter_follower: formData.followers.twitter || 0,
      
        },
    };

    try {
      const res = await apiClient("user_service/update_user_profile/", {
        method: "PATCH",
        auth: true,
        body: JSON.stringify(payload),
      });
      if (res.code == 200) {
        setUser(res?.data);
        toast.success("Profile updated successfully!");
      } else {
        toast.error("Update failed");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { url } = await uploadToCloudinary(file);
      if (!url) {
        toast.error("Upload failed");
        return;
      }
      setImagePreview(url);
      toast.success("Image uploaded");
    } catch {
      toast.error("Upload failed");
    }
  };

  return (
    <div className="min-h-screen ">
      <div className=" space-y-8 py-10 ">
        
        {/* Header Section */}
        <div className="text-center space-y-2 mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
            Influencer Profile
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Complete your profile to increase visibility and attract premium brand partnerships.
          </p>
        </div>

        {/* Basic Information */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-4 border-b border-gray-100">
            <CardTitle className="text-xl">Basic Information</CardTitle>
            <CardDescription>Your public profile details seen by brands</CardDescription>
          </CardHeader>
          <CardContent className="grid lg:grid-cols-[1fr_300px] gap-8 pt-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Jane Doe"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value.slice(0,200) })}
                  className="min-h-[140px] resize-none"
                  placeholder="Tell brands about your audience, style, and past collaborations..."
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.bio.length} /200 characters
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Label className="text-sm font-medium">Profile Picture</Label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImage}
                className="hidden"
                accept="image/*"
              />
              {imagePreview ? (
                <div className="relative group w-full aspect-square rounded-xl overflow-hidden border border-gray-200">
                  <Image
                    src={imagePreview}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => setImagePreview(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="p-4 bg-white rounded-full shadow-sm mb-3">
                    <Upload className="h-6 w-6 text-gray-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">Upload Photo</p>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 10MB</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Combined Social Presence & Reach Card */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-4 border-b border-gray-100">
            <CardTitle className="text-xl">Social Presence & Reach</CardTitle>
            <CardDescription>
              Connect your accounts and specify your audience size for each platform.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-6">
            
            {[
              { id: "instagram", label: "Instagram", hasStats: true, placeholder: "https://instagram.com/username" },
              { id: "tiktok", label: "TikTok", hasStats: true, placeholder: "https://tiktok.com/@username" },
              { id: "youtube", label: "YouTube", hasStats: true, placeholder: "https://youtube.com/@channel" },
              { id: "facebook", label: "Facebook", hasStats: true, placeholder: "https://facebook.com/username" },
              { id: "linkedin", label: "LinkedIn", hasStats: true, placeholder: "https://linkedin.com/in/profile" },
              { id: "twitter", label: "Twitter", hasStats: true, placeholder: "https://twitter.com/username" },
              { id: "podcast", label: "Podcast", hasStats: true, placeholder: "https://www.example.com/podcast" },
              { id: "whatsapp", label: "WhatsApp", hasStats: true, placeholder: "wa.me/15551234567" },
            ].map((platform) => (
              <div 
                key={platform.id} 
                className={`grid gap-4 ${platform.hasStats ? 'md:grid-cols-2' : 'grid-cols-1'}`}
              >
                {/* 1. Link Input */}
                <div className="space-y-2">
                  <Label htmlFor={`${platform.id}_handle`} className="text-sm font-medium">
                    {platform.label} Link
                  </Label>
                  <Input
                    id={`${platform.id}_handle`}
                    value={formData.socialLinks[platform.id as keyof typeof formData.socialLinks] || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: {
                          ...formData.socialLinks,
                          [platform.id]: e.target.value,
                        },
                      })
                    }
                    placeholder={platform.placeholder}
                    className="h-11"
                  />
                </div>

                {/* 2. Follower Count Input (Only rendered if hasStats is true) */}
                {platform.hasStats && (
                  <div className="space-y-2">
                    <Label htmlFor={`${platform.id}_followers`} className="text-sm font-medium">
                      {platform.label === "YouTube" ? "Subscribers / Followers" : 
                       platform.label === "LinkedIn" ? "Connections / Followers" :platform.label === "WhatsApp"  ?"Average Status View / Group Size": "Followers"}
                    </Label>
                    <Input
                      id={`${platform.id}_followers`}
                      type="number"
                      min="0"
                      placeholder="e.g. 5000"
                      value={formData.followers[platform.id as keyof typeof formData.followers] || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          followers: {
                            ...formData.followers,
                            [platform.id]: e.target.value,
                          },
                        })
                      }
                      className="h-11"
                    />
                  </div>
                )}
              </div>
            ))}

            
            <div className="grid md:grid-cols-2 gap-4 pt-2 border-t border-gray-50">
              <div className="space-y-2">
                <Label htmlFor="blog_url" className="text-sm font-medium">Blog / Website URL</Label>
                <Input
                  id="blog_url"
                  
                  value={formData.socialLinks['blog' as keyof typeof formData.socialLinks] || ""} 
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialLinks: {
                        ...formData.socialLinks,
                        blog: e.target.value, 
                      },
                    })
                  }
                  placeholder="https://myblog.com"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="blog_visitors" className="text-sm font-medium">Monthly Visitors</Label>
                <Input
                  id="blog_visitors"
                  type="number"
                  min="0"
                  placeholder="e.g. 1500"
                  value={formData.followers.blog || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      followers: {
                        ...formData.followers,
                        blog: e.target.value,
                      },
                    })
                  }
                  className="h-11"
                />
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Content Niches */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-4 border-b border-gray-100">
            <CardTitle className="text-xl">Content Niches</CardTitle>
            <CardDescription>Select the categories that best describe your content</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between h-12 text-left font-normal border-gray-300 hover:bg-white focus:ring-2 focus:ring-primary/20"
                >
                  <span className={selectedNiches.length ? "text-gray-900" : "text-muted-foreground"}>
                    {selectedNiches.length
                      ? `${selectedNiches.length} niches selected`
                      : "Select your niches..."}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[300px] overflow-y-auto p-1">
                {contentNiches.map((niche) => (
                  <DropdownMenuCheckboxItem
                    key={niche}
                    checked={selectedNiches.includes(niche)}
                    onCheckedChange={(checked) => {
                      if (checked) setSelectedNiches([...selectedNiches, niche]);
                      else setSelectedNiches(selectedNiches.filter((n) => n !== niche));
                    }}
                    className="cursor-pointer py-2.5 px-3"
                  >
                    {niche}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {selectedNiches.length > 0 && (
              <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
                {selectedNiches.map((n) => (
                  <span
                    key={n}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 shadow-sm"
                  >
                    {n}
                    <button
                      onClick={() => setSelectedNiches(selectedNiches.filter((x) => x !== n))}
                      className="hover:bg-gray-100 p-0.5 rounded-full text-gray-400 hover:text-red-500/80 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content Formats */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-4 border-b border-gray-100">
            <CardTitle className="text-xl">Content Formats</CardTitle>
            <CardDescription>What type of content do you create?</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {contentFormats.map((format) => {
                const isSelected = selectedFormats.includes(format.id);
                return (
                  <div
                    key={format.id}
                    onClick={() => {
                        if (isSelected) setSelectedFormats(selectedFormats.filter((id) => id !== format.id));
                        else setSelectedFormats([...selectedFormats, format.id]);
                    }}
                    className={`
                      flex items-center gap-3 p-3.5 rounded-lg border cursor-pointer transition-all duration-200
                      ${isSelected 
                        ? "border-primary bg-primary/5 shadow-sm" 
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}
                    `}
                  >
                    <Checkbox
                      checked={isSelected}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label className="cursor-pointer font-medium text-sm text-gray-700 flex-1">
                      {format.label}
                    </Label>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Payment Models */}
          <Card className="border-none shadow-sm h-full">
            <CardHeader className="pb-4 border-b border-gray-100">
              <CardTitle className="text-xl">Payment Preferences</CardTitle>
              <CardDescription>How do you want to be compensated?</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              {(["gifted", "paid", "affiliate", "ambassador"] as const).map(
                (model) => (
                  <div
                    key={model}
                    className={`
                      flex items-center justify-between p-4 rounded-xl border transition-all duration-200
                      ${paymentModels[model] ? "border-primary bg-primary/5" : "border-gray-200"}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={paymentModels[model]}
                        onCheckedChange={(checked) =>
                          setPaymentModels({
                            ...paymentModels,
                            [model]: !!checked,
                          })
                        }
                      />
                      <Label className="font-medium text-gray-900 cursor-pointer">
                        {model === "gifted"
                          ? "Gifted Products or Services"
                          : model === "paid"
                          ? "Paid Collaborations"
                          : model === "affiliate"
                          ? "Affiliate Marketing"
                          : "Brand Ambassadorship"}
                      </Label>
                    </div>
                    {model === "affiliate" && paymentModels.affiliate && (
                      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border border-gray-200 shadow-sm">
                        <Input
                          value={affiliatePercent}
                          onChange={(e) => setAffiliatePercent(e.target.value)}
                          className="w-14 h-8 text-center border-none p-0 focus-visible:ring-0"
                          placeholder="10"
                        />
                        <span className="text-sm font-medium text-gray-500">%</span>
                      </div>
                    )}
                  </div>
                )
              )}
            </CardContent>
          </Card>

          {/* Rate Ranges */}
          <Card className={`border-none shadow-sm h-full ${!paymentModels.paid ? 'opacity-60 grayscale pointer-events-none' : ''}`}>
            <CardHeader className="pb-4 border-b border-gray-100">
              <CardTitle className="text-xl">$ Your Rate Ranges</CardTitle>
              <CardDescription>
                {selectedFormats.length > 0 
                  ? "Set your base rates for selected formats" 
                  : "Select content formats above to set rates"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {selectedFormats.length > 0 ? (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {selectedFormats.map((id) => {
                    const label = contentFormats.find((f) => f.id === id)?.label || "";
                    const currentRate = rates[id];
                    
                    return (
                      <div key={id} className="grid sm:grid-cols-[1fr_140px_100px] gap-3 items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="text-sm font-medium text-gray-700 truncate" title={label}>
                          {label}
                        </span>
                        
                        <Select
                          value={currentRate?.type || ""}
                          onValueChange={(v) =>
                            setRates({
                              ...rates,
                              [id]: { type: v, custom: currentRate?.custom || "" },
                            })
                          }
                        >
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {rateRanges.map((r) => (
                              <SelectItem key={r.value} value={r.value} className="text-xs">
                                {r.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {currentRate?.type === "custom" && (
                          <div className="relative">
                            <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                            <Input
                              type="number"
                              placeholder="0"
                              value={currentRate.custom}
                              onChange={(e) =>
                                setRates({
                                  ...rates,
                                  [id]: { ...rates[id], custom: e.target.value },
                                })
                              }
                              className="h-9 pl-6 text-xs"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground p-4 border-2 border-dashed border-gray-200 rounded-xl">
                  <DollarSign className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-sm">No content formats selected.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer Actions */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-10 md:static md:bg-transparent md:border-none md:p-0">
          <div className="max-w-7xl mx-auto flex items-center justify-end gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.location.reload()}
              className="h-11 px-8 text-base font-medium"
            >
              Discard Changes
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving}
              size="lg"
              className="h-11 px-8 text-base font-medium min-w-[160px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  Saving...
                </span>
              ) : (
                "Save Profile"
              )}
            </Button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
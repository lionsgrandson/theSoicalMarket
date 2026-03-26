// app/influencer/profile/ProfileClient.tsx
"use client";

import { useState, useRef } from "react";
import { Upload, X, DollarSign, Percent, ChevronDown } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { uploadToCloudinary } from "@/lib/fileUpload";
import { apiClient } from "@/lib/apiClient";
import { toast } from "react-toastify";

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
  { id: "socialPost", label: "Whatsapp Group Post" },
  { id: "repost", label: "Repost" },
  { id: "instagramStory", label: "Instagram Story" },
  { id: "instagramReel", label: "Instagram Reel" },
  { id: "tiktokVideo", label: "TikTok Video" },
  { id: "youtubeVideo", label: "YouTube Video" },
  { id: "youtubeShort", label: "YouTube Short" },
  { id: "blogPost", label: "Blog Post" },
  { id: "podcastMention", label: "Podcast Mention" },
  { id: "liveStream", label: "Live Stream" },
  { id: "userGeneratedContent", label: "UGC Creation" },
  { id: "whatsappStatus", label: "WhatsApp Status Post" },
];

const rateRanges = [
  { value: "free", label: "Free" },
  { value: "0-100", label: "$0 – $100" },
  { value: "101-499", label: "$101 – $499" },
  { value: "500+", label: "$500+" },
  { value: "custom", label: "Custom amount" },
];

// Map backend field → format ID
const fieldToFormatId: Record<string, string> = {
  rate_range_for_social_post: "socialPost",
  rate_range_for_repost: "repost",
  rate_range_for_instagram_story: "instagramStory",
  rate_range_for_instagram_reel: "instagramReel",
  rate_range_for_tiktok_video: "tiktokVideo",
  rate_range_for_youtube_video: "youtubeVideo",
  rate_range_for_youtube_short: "youtubeShort",
  rate_range_for_blog_post: "blogPost",
  rate_range_for_podcast_mention: "podcastMention",
  rate_range_for_live_stream: "liveStream",
  rate_range_for_ugc_creation: "userGeneratedContent",
  rate_range_for_whatsapp_status_post: "whatsappStatus",
};

const formatIdToField = Object.fromEntries(
  Object.entries(fieldToFormatId).map(([k, v]) => [v, k])
);

interface InfluencerProfileData {
  content_niches?: string | null;
  content_formats?: string | null;
  payment_preferences?: string | null;
  rate_range_for_affiliate_marketing_percent?: string;
  display_name?: string | null;
  short_bio?: string | null;
  instagram_handle?: string | null;
  tiktok_handle?: string | null;
  youtube_handle?: string | null;
  twitter_handle?: string | null;
  linkedin_handle?: string | null;
  whatsapp_handle?: string | null;
  profile_picture?: string | null;
  [key: string]: string | null | undefined;
}

export default function ProfileClient({
  initialData,
}: {
  initialData: InfluencerProfileData;
}) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse API data
  const niches = initialData.content_niches
    ? initialData.content_niches.split(", ").map((s: string) => s.trim()).filter(Boolean)
    : [];
  const formats = initialData.content_formats
    ? initialData.content_formats.split(",").map((s: string) => s.trim())
    : [];
  const paymentPrefs = initialData.payment_preferences
    ? initialData.payment_preferences.split(", ").map((s: string) => {
        const str = s.trim().toLowerCase();
        if (str.includes("gifted")) return "gifted";
        if (str.includes("paid")) return "paid";
        if (str.includes("affiliate")) return "affiliate";
        if (str.includes("ambassador")) return "ambassador";
        return "";
      }).filter(Boolean)
    : [];

  const [selectedNiches, setSelectedNiches] = useState<string[]>(niches);
  const [selectedContentFormats, setSelectedContentFormats] = useState<string[]>(formats);
  const [paymentModels, setPaymentModels] = useState({
    gifted: paymentPrefs.includes("gifted"),
    paid: paymentPrefs.includes("paid"),
    affiliate: paymentPrefs.includes("affiliate"),
    ambassador: paymentPrefs.includes("ambassador"),
  });
  const [paymentPercentages, setPaymentPercentages] = useState({
    affiliate: initialData.rate_range_for_affiliate_marketing_percent || "",
  });

  const [rates, setRates] = useState<Record<string, { type: string; custom: string }>>(
    Object.fromEntries(
      contentFormats.map((c) => {
        const field = formatIdToField[c.id];
        const value = field ? initialData[field] : "";
        const isCustom = value && !["free", "0-100", "101-499", "500+"].includes(value);
        return [
          c.id,
          {
            type: isCustom ? "custom" : (value || ""),
            custom: isCustom ? value : "",
          },
        ];
      })
    )
  );

  const [formData, setFormData] = useState({
    fullName: initialData.display_name || "",
    bio: initialData.short_bio || "",
    socialLinks: {
      instagram: initialData.instagram_handle || "",
      tiktok: initialData.tiktok_handle || "",
      youtube: initialData.youtube_handle || "",
      twitter: initialData.twitter_handle || "",
      linkedin: initialData.linkedin_handle || "",
      whatsapp: initialData.whatsapp_handle || "",
    },
  });

  const [imagePreview, setImagePreview] = useState<string | null>(initialData.profile_picture || null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const { url } = await uploadToCloudinary(file);
      if (!url) {
        toast.error("Upload failed");
        return;
      }
      setImagePreview(url);
      toast.success("Image uploaded!");
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const ratePayload: Record<string, string> = {};
    selectedContentFormats.forEach((id) => {
      const rate = rates[id];
      const field = formatIdToField[id];
      if (field) {
        ratePayload[field] = rate.type === "custom" && rate.custom ? rate.custom : rate.type;
      }
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
        content_niches: selectedNiches.length ? selectedNiches.join(", ") : null,
        content_formats: selectedContentFormats.length ? selectedContentFormats.join(", ") : null,
        payment_preferences: Object.entries(paymentModels)
          .filter(([_, v]) => v)
          .map(([k]) => {
            if (k === "gifted") return "Gifted Products or Services";
            if (k === "paid") return "Paid Collaborations";
            if (k === "affiliate") return "Affiliate Marketing";
            return "Brand Ambassadorship";
          })
          .join(", ") || null,
        ...ratePayload,
        rate_range_for_affiliate_marketing_percent: paymentModels.affiliate ? paymentPercentages.affiliate : null,
      },
    };

    try {
      const res = await apiClient("user_service/update_user_profile/", {
        method: "PATCH",
        auth: true,
        body: JSON.stringify(payload),
      });
      if (res.code === "200") {
        toast.success("Profile updated successfully!");
      } else {
        toast.error("Update failed");
      }
    } catch (err) {
      toast.error("Network error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedNichesText = () => {
    if (selectedNiches.length === 0) return "Select your niches";
    if (selectedNiches.length === 1) return selectedNiches[0];
    return `${selectedNiches.length} niches selected`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Micro-Influencer Profile</h1>
            <p className="text-gray-600 mt-1">Update your information to keep connecting with Brands.</p>
          </div>
        </div>

        {/* Basic Information */}
        <Card>
          <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div><Label>Full Name</Label><Input value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} placeholder="Enter your full name" /></div>
                <div><Label>Bio / About Me</Label><Textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} placeholder="Tell us about yourself" className="min-h-[120px]" /></div>
              </div>
              <div>
                <Label>Profile Picture</Label>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                {imagePreview ? (
                  <div className="relative w-full h-64 mt-2 rounded-lg overflow-hidden">
                    <Image src={imagePreview} alt="Profile" fill className="object-cover" />
                    <Button variant="destructive" size="icon" className="absolute top-2 right-2" onClick={() => { setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-12 text-center mt-2 cursor-pointer hover:bg-gray-50" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600">Click to upload</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader><CardTitle>Social Media Accounts</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.keys(formData.socialLinks).map((platform) => (
                <div key={platform}>
                  <Label className="capitalize">{platform}</Label>
                  <Input
                    value={formData.socialLinks[platform as keyof typeof formData.socialLinks]}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, [platform]: e.target.value },
                    })}
                    placeholder={platform === "whatsapp" ? "+1 555-123-4567" : "@username or URL"}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Content Niches */}
        <Card>
          <CardHeader><CardTitle>Content Niches</CardTitle></CardHeader>
          <CardContent>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {getSelectedNichesText()} <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full max-h-64 overflow-y-auto">
                {contentNiches.map((niche) => (
                  <DropdownMenuCheckboxItem
                    key={niche}
                    checked={selectedNiches.includes(niche)}
                    onCheckedChange={(c) => {
                      if (c) setSelectedNiches([...selectedNiches, niche]);
                      else setSelectedNiches(selectedNiches.filter((n) => n !== niche));
                    }}
                  >
                    {niche}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex flex-wrap gap-2 mt-4">
              {selectedNiches.map((n) => (
                <span key={n} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full text-sm">
                  {n} <button onClick={() => setSelectedNiches(selectedNiches.filter((x) => x !== n))}><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Content Formats */}
        <Card>
          <CardHeader><CardTitle>Content Formats</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contentFormats.map((f) => (
                <div key={f.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                  <Checkbox
                    checked={selectedContentFormats.includes(f.id)}
                    onCheckedChange={(c) => {
                      if (c) setSelectedContentFormats([...selectedContentFormats, f.id]);
                      else setSelectedContentFormats(selectedContentFormats.filter((x) => x !== f.id));
                    }}
                  />
                  <Label className="cursor-pointer">{f.label}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Models */}
        <Card>
          <CardHeader><CardTitle>Payment Models</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {["gifted", "paid", "affiliate", "ambassador"].map((m) => (
                <div key={m} className="flex items-center gap-3">
                  <Checkbox
                    checked={paymentModels[m as keyof typeof paymentModels]}
                    onCheckedChange={(c) => setPaymentModels({ ...paymentModels, [m]: c })}
                  />
                  <span className="capitalize">
                    {m === "gifted" ? "Gifted Products or Services" : m === "paid" ? "Paid Collaborations" : m === "affiliate" ? "Affiliate Marketing" : "Brand Ambassadorship"}
                  </span>
                  {m === "affiliate" && paymentModels.affiliate && (
                    <div className="flex items-center gap-2 ml-auto">
                      <Percent className="w-4 h-4" />
                      <Input
                        type="number"
                        className="w-20"
                        value={paymentPercentages.affiliate}
                        onChange={(e) => setPaymentPercentages({ affiliate: e.target.value })}
                        placeholder="%"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rates */}
        {paymentModels.paid && selectedContentFormats.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign /> Your Rate Ranges</CardTitle></CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {selectedContentFormats.map((id) => {
                  const label = contentFormats.find((f) => f.id === id)?.label || "";
                  return (
                    <div key={id} className="space-y-2">
                      <Label>{label}</Label>
                      <Select
                        value={rates[id]?.type || ""}
                        onValueChange={(v) => setRates({ ...rates, [id]: { ...rates[id], type: v } })}
                      >
                        <SelectTrigger><SelectValue placeholder="Select range" /></SelectTrigger>
                        <SelectContent>
                          {rateRanges.map((r) => (
                            <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {rates[id]?.type === "custom" && (
                        <Input
                          type="number"
                          placeholder="e.g. $100 "
                          value={rates[id].custom}
                          onChange={(e) => setRates({ ...rates, [id]: { ...rates[id], custom: e.target.value } })}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit */}
        <div className="flex justify-end pt-8">
          <Button onClick={handleSubmit} disabled={loading} size="lg" className="px-12">
            {loading ? "Saving..." : "Update Profile"}
          </Button>
        </div>
      </div>
    </div>
  );
}
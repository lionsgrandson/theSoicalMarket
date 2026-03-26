import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Target,
  DollarSign,
  Calendar,
  Image as ImageIcon,
  Video,
  Mic,
  FileText,
  Upload,
  X,
  Repeat,
  
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { apiClient } from "@/lib/apiClient";
import { uploadToCloudinary } from "@/lib/fileUpload";
import { toast } from "react-toastify";
import { demographics } from "@/constants/demographics";
import { DragEvent } from "react";
import { Campaign } from "@/types/campaign";
import Image from 'next/image';

// --- Interfaces ---

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (campaign: Campaign) => void;
}

interface CampaignFormData {
  campaign_name: string;
  campaign_objective: string;
  campaign_poster: string | null;
  budget_range: number;
  budget_type: string;
  payment_preference: string[];
  campaign_description: string;
  content_deliverables: string[];
  campaign_timeline: string;
  target_audience: string[];
  keywords: string;
  content_approval_required: boolean;
  auto_match_micro_influencers: boolean;
  campaign_status: string;
  platforms: {
    instagram: boolean;
    tiktok: boolean;
    youtube: boolean;
    facebook: boolean;
  };
  targetReach: string;
  endDate: string;
  creativeType: string;
  creatorsNeeded: string;
  keywords_and_hashtags: string[];
  ageRange: number[];
  location: string;
  timeZone: string;
  gender: string;
  campaignGoals: {
    awareness: boolean;
    engagement: boolean;
    conversions: boolean;
    growth: boolean;
  };
  paymentMethod: string;
  posterFile: File | null;
  posterPreview: string | null;
}

interface DeliverableType {
  id: string;
  label: string;
  icon: React.ElementType;
}

const deliverableTypes: DeliverableType[] = [
  { id: "instagramStory", label: "Instagram Story", icon: FileText },
  { id: "instagramReel", label: "Instagram Reel", icon: Video },
  { id: "tiktokVideo", label: "TikTok Video", icon: Video },
  { id: "youtubeVideo", label: "YouTube Video", icon: Video },
  { id: "youtubeShort", label: "YouTube Short", icon: Video },
  { id: "blogPost", label: "Blog Post", icon: FileText },
  { id: "facebookPost", label: "Facebook Post", icon: FileText },
  { id: "podcastMention", label: "Podcast Mention", icon: Mic },
  { id: "liveStream", label: "Live Stream", icon: Video },
  { id: "userGeneratedContent", label: "UGC Creation", icon: Video },
  { id: "whatsappStatus", label: "WhatsApp Status Post", icon: FileText },
  { id: "socialPost", label: "Whatsapp Group Post", icon: FileText },
  { id: "linkedinPost", label: "Linkedin Post", icon: FileText },
  { id: "twitterPost", label: "Twitter/X  Post", icon: FileText },
  { id: "repost", label: "Repost", icon: Repeat },
];

const timelineOptions = [
  { value: "asap", label: "ASAP (Immediate)" },
  { value: "1-week", label: "Within 1 week" },
  { value: "2-weeks", label: "Within 2 weeks" },
  { value: "1-month", label: "Within 1 month" },
  { value: "flexible", label: "Flexible timing" },
];

export default function CreateCampaignModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateCampaignModalProps) {
  const [formData, setFormData] = useState<CampaignFormData>({
    campaign_name: "",
    campaign_objective: "",
    campaign_poster: null,
    budget_range: 500,
    budget_type: "total",
    payment_preference: [],
    campaign_description: "",
    content_deliverables: [],
    campaign_timeline: "",
    target_audience: [],
    keywords: "",
    content_approval_required: true,
    auto_match_micro_influencers: false,
    campaign_status: "Active",
    platforms: {
      instagram: false,
      tiktok: false,
      youtube: false,
      facebook: false,
    },
    targetReach: "",
    endDate: "",
    creativeType: "Nano (1K-10K)",
    creatorsNeeded: "",
    keywords_and_hashtags: ["#lifestyle", "#fashion"],
    ageRange: [18, 45],
    location: "United States",
    timeZone: "America/New_York",
    gender: "",
    campaignGoals: {
      awareness: false,
      engagement: false,
      conversions: false,
      growth: false,
    },
    paymentMethod: "Fixed Fee",
    posterFile: null,
    posterPreview: null,
  });

  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const router = useRouter();

  // Generic field updater for top-level fields
  const handleInputChange = (field: keyof CampaignFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // PaymentPreferences toggle (array)
  const togglePaymentPreference = (pref: string) => {
    setFormData((prev) => {
      const current = prev.payment_preference || [];
      return current.includes(pref)
        ? { ...prev, payment_preference: current.filter((p) => p !== pref) }
        : { ...prev, payment_preference: [...current, pref] };
    });
  };

  const handleDeliverableChange = (id: string, checked: boolean) => {
    if (id === "Repost Only" && checked) {
      setFormData((prev) => ({
        ...prev,
        content_deliverables: ["Repost Only"],
      }));
      return;
    }
    if (
      id !== "Repost Only" &&
      formData.content_deliverables.includes("Repost Only")
    ) {
      setFormData((prev) => ({
        ...prev,
        content_deliverables: checked
          ? [
              ...prev.content_deliverables.filter((d) => d !== "Repost Only"),
              id,
            ]
          : prev.content_deliverables.filter((d) => d !== id),
      }));
      return;
    }

    if (checked) {
      setFormData((prev) => ({
        ...prev,
        content_deliverables: [...prev.content_deliverables, id],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        content_deliverables: prev.content_deliverables.filter((d) => d !== id),
      }));
    }
  };

  // Poster upload validation
  const validateFile = (file: File) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    if (!validTypes.includes(file.type)) {
      setUploadError("Please upload a valid image (JPG, PNG, WebP, or GIF)");
      return false;
    }

    if (file.size > maxSize) {
      setUploadError("Image size must be less than 5MB");
      return false;
    }

    setUploadError("");
    return true;
  };

  // Handle poster upload
  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file before upload
    if (!validateFile(file)) {
      return;
    }

    setUploadingImage(true);
    setUploadError("");

    try {
      const res = await uploadToCloudinary(file);
      // Assuming uploadToCloudinary returns { url: string }
      if (res?.url) {
        setFormData((prev) => ({
          ...prev,
          campaign_poster: res.url ?? null,
          posterFile: file,
          posterPreview: URL.createObjectURL(file), // Local preview for speed
        }));
        // toast.success("Image uploaded successfully");
      } else {
        setUploadError("Upload failed - no URL returned");
      }
    } catch (err) {
      console.error("Upload failed", err);
      setUploadError("Upload failed. Please try again.");
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  // Drag & drop (assets)
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (!validateFile(file)) {
        return;
      }

      setUploadingImage(true);
      setUploadError("");

      try {
        const res = await uploadToCloudinary(file);
        if (res?.url) {
          setFormData((prev) => ({
            ...prev,
            campaign_poster: res.url ?? null,
            posterFile: file,
            posterPreview: URL.createObjectURL(file),
          }));
          toast.success("Image uploaded successfully");
        } else {
          setUploadError("Upload failed - no URL returned");
        }
      } catch (err) {
        console.error("Upload failed", err);
        setUploadError("Upload failed. Please try again.");
        toast.error("Failed to upload image");
      } finally {
        setUploadingImage(false);
      }
    }
  };

  // Remove poster
  const handleRemovePoster = () => {
    setFormData((prev) => ({
      ...prev,
      posterFile: null,
      posterPreview: null,
    }));
    setUploadError("");
  };
const getMissingFields = () => {
  const missing: string[] = [];

  if (!formData.campaign_name) missing.push("Campaign Name");
  if (!formData.campaign_description) missing.push("Campaign Description");
  if (!formData.campaign_poster) missing.push("Campaign Flyer");
  if (!formData.campaign_objective) missing.push("Campaign Objective");
  if (!formData.content_deliverables.length)
    missing.push("Content Deliverables");
  if (!formData.campaign_timeline) missing.push("Campaign Timeline");
  if (!(formData.payment_preference || []).length)
    missing.push("Payment Preference");

  return missing;
};

  const handleSaveDraft = async () => {
    const missingFields = getMissingFields();

  if (missingFields.length > 0) {
    toast(`Please fill: ${missingFields.join(", ")}`);
    return;
  }

    try {
      const campaignData = {
        campaign_name: formData.campaign_name,
        campaign_objective: formData.campaign_objective,
        campaign_description: formData.campaign_description.substring(0, 50),
        budget_range: String(formData.budget_range),
        budget_type: formData.budget_type,
        payment_preference: formData.payment_preference.join(","),
        content_deliverables: formData.content_deliverables.join(","),
        campaign_timeline: formData.campaign_timeline,
        target_audience: formData.target_audience,
        keywords_and_hashtags: formData.keywords_and_hashtags.join(","),
        content_approval_required: formData.content_approval_required,
        auto_match_micro_influencers: formData.auto_match_micro_influencers,
        campaign_status: "draft",
        campaign_poster: formData.campaign_poster,
      };
      const res = await apiClient("campaign_service/create_campaign/", {
        auth: true,
        method: "POST",
        body: JSON.stringify(campaignData),
      });
      if (res) {
        toast("Saved campaign  successfully");
        onSuccess(res.data);
        onClose();
        console.log(res);
      } else if (res?.status === "failure" && res?.error) {
        // Loop through the error object (e.g., target_audience, budget_range, etc.)
        Object.keys(res.error).forEach((field) => {
          const messages = res.error[field];

          // Ensure messages is an array before mapping
          if (Array.isArray(messages)) {
            messages.forEach((msg) => {
              // Optional: Make the field name readable (e.g., "target_audience" -> "Target Audience")
              const readableField = field.replace(/_/g, " ").toUpperCase();

              // Show the toast
              toast(`${readableField}: ${msg}`);
              console.log(`${readableField}: ${msg}`);
            });
          }
        });
      } else {
        // Fallback for unknown errors
        toast("Something went wrong. Please try again.");
      }
    } catch (error) {
      toast("There is an error!");
      console.log(error);
    }

    console.log("Creating campaign:", formData);
  };

  const handleCreateCampaign = async () => {
    const missingFields = getMissingFields();

  if (missingFields.length > 0) {
    toast(`Please fill: ${missingFields.join(", ")}`);
    return;
  }

    try {
      const campaignData = {
        campaign_name: formData.campaign_name,
        campaign_objective: formData.campaign_objective,
        campaign_description: formData.campaign_description.substring(0, 50),
        budget_range: formData.budget_range,
        budget_type: formData.budget_type,
        payment_preference: formData.payment_preference.join(","),
        content_deliverables: formData.content_deliverables.join(","),
        campaign_timeline: formData.campaign_timeline,
        target_audience: formData.target_audience.join(","),
        keywords_and_hashtags: formData.keywords_and_hashtags.join(","),
        content_approval_required: formData.content_approval_required,
        auto_match_micro_influencers: formData.auto_match_micro_influencers,
        campaign_status: "active",
        campaign_poster: formData.campaign_poster,
      };
      const res = await apiClient("campaign_service/create_campaign/", {
        auth: true,
        method: "POST",
        body: JSON.stringify(campaignData),
      });
      if (res) {
        toast("Campaign created successfully");
        onSuccess(res.data);
        onClose();
        if (formData.auto_match_micro_influencers) {
  router.push("/brand-dashboard/microinfluencerspage?review=true");
}
        console.log(res);
      }
    } catch (error) {
      toast("There is an error!");
      console.log(error);
    }

    console.log("Creating campaign:", formData);
  };

  if (!isOpen) return null;

  const handleArrayChange = (
    field: "target_audience",
    value: string,
    checked: boolean
  ) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...prev[field], value],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: prev[field].filter((item) => item !== value),
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl text-primary font-semibold">
              Create New Campaign
            </h2>
            <p className="text-sm text-gray-500 mt-1">Set up your campaign</p>
          </div>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Campaign Basics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Campaign Basics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="campaign_name">Campaign Name *</Label>
                  <Input
                    id="campaign_name"
                    value={formData.campaign_name}
                    onChange={(e) =>
                      handleInputChange("campaign_name", e.target.value)
                    }
                    placeholder="Summer Collection Launch"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Campaign objective *</Label>
                  <Select
                    value={formData.campaign_objective}
                    onValueChange={(value) =>
                      handleInputChange("campaign_objective", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select campaign_objective" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="awareness">Brand Awareness</SelectItem>
                      <SelectItem value="engagement">Engagement</SelectItem>
                      <SelectItem value="sales">Sales & Conversions</SelectItem>
                      <SelectItem value="traffic">Website Traffic</SelectItem>
                      <SelectItem value="app">App Downloads</SelectItem>
                      <SelectItem value="launch">Product Launch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="campaign_description" className="mb-2">
                  Campaign description *
                </Label>
                <Textarea
                  id="campaign_description"
                  value={formData.campaign_description}
                  maxLength={250}
                  onChange={(e) =>
                    handleInputChange("campaign_description", e.target.value)
                  }
                  placeholder="Describe your campaign goals, target audience, key messages, and any specific requirements..."
                  rows={4}
                />
                <div className="flex justify-end mt-1">
                  <span
                    className={`text-xs ${
                      formData.campaign_description.length >= 500
                        ? "text-red-500 font-semibold" 
                        : "text-gray-400" 
                    }`}
                  >
                    {formData.campaign_description.length}/500 characters
                  </span>
                </div>
              </div>

              <div>
                <Label htmlFor="campaignposter" className="mb-2">
                  Campaign Flyer *
                </Label>
                <p className="text-xs text-gray-500 mb-3">
  Use a landscape image (16:9). Recommended size: 1280×720 or 1920×1080.
</p>
                {!formData.posterPreview ? (
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition ${
                      dragActive
                        ? "border-primary bg-primary/5"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Drag and drop your poster or click to browse
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="poster-input"
                    />
                    <label htmlFor="poster-input">
                      <Button
                        type="button"
                        variant="outline"
                        asChild
                        className="cursor-pointer"
                      >
                        <span>Choose File</span>
                      </Button>
                    </label>
                  </div>
                ) : (
                  <div className="relative rounded-lg overflow-hidden w-full aspect-[16/9] rounded-t-lg border border-gray-200">
                    <Image
                    fill
                      src={formData.posterPreview}
                      alt="Poster preview"
                      className="object-cover"
                    />
                    <button
                      onClick={handleRemovePoster}
                      className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {uploadError && (
                  <p className="text-sm text-red-500 mt-2">{uploadError}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Budget */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Budget
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-6 flex-wrap">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="total-budget"
                      checked={formData.budget_type === "total"}
                      onCheckedChange={() =>
                        handleInputChange("budget_type", "total")
                      }
                    />
                    <Label htmlFor="total-budget">Total Campaign Budget</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="monthly-budget"
                      checked={formData.budget_type === "monthly"}
                      onCheckedChange={() =>
                        handleInputChange("budget_type", "monthly")
                      }
                    />
                    <Label htmlFor="monthly-budget">Monthly Budget</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="weekly-budget"
                      checked={formData.budget_type === "weekly"}
                      onCheckedChange={() =>
                        handleInputChange("budget_type", "weekly")
                      }
                    />
                    <Label htmlFor="weekly-budget">Weekly Budget</Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Label>Budget Amount: ${formData.budget_range}</Label>
                    <Badge variant="secondary">
                      {formData.budget_type === "total"
                        ? "Total"
                        : formData.budget_type === "monthly"
                        ? "Monthly"
                        : "Weekly"}
                    </Badge>
                  </div>

                  <Slider
                    value={[formData.budget_range]}
                    onValueChange={(value) =>
                      handleInputChange("budget_range", value[0])
                    }
                    max={1000}
                    min={10}
                    step={1}
                    className="w-full"
                  />

                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>$10</span>
                    <span>$10,000+</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Preferences *</CardTitle>
              <p className="text-sm text-muted-foreground">
                Select how you plan to compensate micro-influencers for this
                campaign
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div
                  className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer ${
                    formData.payment_preference.includes("gifted")
                      ? "bg-primary/10 border-primary"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => togglePaymentPreference("gifted")}
                >
                  <Checkbox
                    checked={formData.payment_preference.includes("gifted")}
                    id="gifted"
                  />
                  <Label htmlFor="gifted">Gifted Products or Services</Label>
                </div>

                <div
                  className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer ${
                    formData.payment_preference.includes("paid")
                      ? "bg-primary/10 border-primary"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => togglePaymentPreference("paid")}
                >
                  <Checkbox
                    checked={formData.payment_preference.includes("paid")}
                    id="paid"
                  />
                  <Label htmlFor="paid">Paid Collaborations</Label>
                </div>

                <div
                  className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer ${
                    formData.payment_preference.includes("affiliate")
                      ? "bg-primary/10 border-primary"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => togglePaymentPreference("affiliate")}
                >
                  <Checkbox
                    checked={formData.payment_preference.includes("affiliate")}
                    id="affiliate"
                  />
                  <Label htmlFor="affiliate">Affiliate Marketing</Label>
                </div>

                <div
                  className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer ${
                    formData.payment_preference.includes("ambassador")
                      ? "bg-primary/10 border-primary"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => togglePaymentPreference("ambassador")}
                >
                  <Checkbox
                    checked={formData.payment_preference.includes("ambassador")}
                    id="ambassador"
                  />
                  <Label htmlFor="ambassador">Brand Ambassador</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deliverables */}
          <Card>
            <CardHeader>
              <CardTitle>Content Deliverables *</CardTitle>
              <p className="text-sm text-muted-foreground">
                Select the type of content you want influencers to produce
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {deliverableTypes.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      id={d.id}
                      checked={formData.content_deliverables.includes(d.id)}
                      onCheckedChange={(checked) =>
                        handleDeliverableChange(d.id, checked == true)
                      }
                    />
                    <d.icon className="w-4 h-4 text-muted-foreground" />
                    <Label
                      htmlFor={d.id}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {d.label}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Campaign timeline *
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={formData.campaign_timeline}
                  onValueChange={(value) =>
                    handleInputChange("campaign_timeline", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    {timelineOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Campaign Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Auto-match influencers</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically find matching influencers
                    </p>
                  </div>
                  <Switch
                    checked={formData.auto_match_micro_influencers}
                    onCheckedChange={(c) =>
                      handleInputChange("auto_match_micro_influencers", c)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Target Audience & Keywords */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Target Audience</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Men */}
                  <div className="space-y-3">
                    {demographics.men.map((demo) => (
                      <div key={demo} className="flex items-center space-x-2">
                        <Checkbox
                          id={demo}
                          checked={(formData.target_audience || []).includes(
                            demo
                          )}
                          onCheckedChange={(checked) =>
                            handleArrayChange(
                              "target_audience",
                              demo,
                              !!checked
                            )
                          }
                        />
                        <Label htmlFor={demo} className="text-sm font-normal">
                          {demo}
                        </Label>
                      </div>
                    ))}
                  </div>

                  {/* Women */}
                  <div className="space-y-3">
                    {demographics.women.map((demo) => (
                      <div key={demo} className="flex items-center space-x-2">
                        <Checkbox
                          id={demo}
                          checked={(formData.target_audience || []).includes(
                            demo
                          )}
                          onCheckedChange={(checked) =>
                            handleArrayChange(
                              "target_audience",
                              demo,
                              !!checked
                            )
                          }
                        />
                        <Label htmlFor={demo} className="text-sm font-normal">
                          {demo}
                        </Label>
                      </div>
                    ))}
                  </div>

                  {/* Kids / Teens */}
                  <div className="space-y-3">
                    {demographics.youth.map((demo) => (
                      <div key={demo} className="flex items-center space-x-2">
                        <Checkbox
                          id={demo}
                          checked={(formData.target_audience || []).includes(
                            demo
                          )}
                          onCheckedChange={(checked) =>
                            handleArrayChange(
                              "target_audience",
                              demo,
                              !!checked
                            )
                          }
                        />
                        <Label htmlFor={demo} className="text-sm font-normal">
                          {demo}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Keywords & Hashtags</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.keywords}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      keywords: e.target.value,
                    }))
                  }
                  placeholder="#sustainablefashion #ecoFriendly #consciousliving"
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="flex md:flex-row flex-col items-center justify-center p-6 border-t bg-gray-50 rounded-b-lg">
          <div className="flex md:flex-row flex-col items-center justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => {
                handleSaveDraft();
              }}
            >
              Save & Continue
            </Button>

            <Button
              onClick={handleCreateCampaign}
              className="bg-secondary hover:bg-secondaryhover text-primary"
            >
              {formData.auto_match_micro_influencers
                ? "Create Campaign & Find micro-influencers"
                : "Create Campaign"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

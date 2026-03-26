import { useState, ChangeEvent } from "react";
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
import {
  Target,
  DollarSign,
  Calendar,
  Image as ImageIcon,
  Video,
  Mic,
  FileText,
  Repeat,
  Upload,
  X,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBrandOnBoarding } from "@/contexts/BrandOnboardingContext";
import { demographics } from "@/constants/demographics";
import { uploadToCloudinary } from "@/lib/fileUpload";
import Image from "next/image";

interface CampaignStepProps {
  onNext: () => void;
  onBack: () => void;
}

const CampaignStep = ({ onBack,onNext }: CampaignStepProps) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const router = useRouter();
    const token =localStorage.getItem("access_token");
    const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);


  const { onboardingData, setOnboardingData } = useBrandOnBoarding();

  const objectives = [
    {
      value: "awareness",
      label: "Brand Awareness",
      description: "Increase visibility and reach",
    },
    {
      value: "engagement",
      label: "Engagement",
      description: "Drive likes, comments, and shares",
    },
    {
      value: "sales",
      label: "Sales & Conversions",
      description: "Generate leads and sales",
    },
    {
      value: "traffic",
      label: "Website Traffic",
      description: "Drive visitors to your site",
    },
    {
      value: "app",
      label: "App Downloads",
      description: "Promote mobile app adoption",
    },
    {
      value: "launch",
      label: "Product Launch",
      description: "Introduce new products/services",
    },
  ];

  const deliverableTypes = [
    
    
    { id: "instagramStory", label: "Instagram Story", icon: ImageIcon },
    { id: "instagramReel", label: "Instagram Reel", icon: Video },
    { id: "tiktokVideo", label: "TikTok Video", icon: Video },
    { id: "youtubeVideo", label: "YouTube Video", icon: Video },
    { id: "youtubeShort", label: "YouTube Short", icon: Video },
    { id: "blogPost", label: "Blog Post", icon: FileText },
    { id: "facebookPost", label: "Facebook Post", icon: FileText },
    { id: "podcastMention", label: "Podcast Mention", icon: Mic },
    { id: "liveStream", label: "Live Stream", icon: Video },
    { id: "userGeneratedContent", label: "UGC Creation", icon: Video },
    { id: "whatsappStatus", label: "WhatsApp Status Post", icon: ImageIcon },
    { id: "socialPost", label: "Whatsapp Group Post", icon: ImageIcon },
    { id: "linkedinPost", label: "Linkedin Post", icon: FileText },
    { id: "twitterPost", label: "Twitter/X  Post", icon: FileText },
    { id: "repost", label: "Repost", icon: Repeat },
  ];

  const timelineOptions = [
    { value: "asap", label: "ASAP (Immediate )" },
    { value: "1-week", label: "Within 1 week" },
    { value: "2-weeks", label: "Within 2 weeks" },
    { value: "1-month", label: "Within 1 month" },
    { value: "flexible", label: "Flexible timing" },
  ];

  const handleDeliverableChange = (id: string, checked: boolean) => {
    if (checked) {
      setOnboardingData((prev) => ({
        ...prev,
        deliverables: [...prev.deliverables, id],
      }));
    } else {
      setOnboardingData((prev) => ({
        ...prev,
        deliverables: prev.deliverables.filter((d) => d !== id),
      }));
    }
  };

  const isValid =
    onboardingData.campaignName &&
    onboardingData.objective &&
    onboardingData.campaign_poster &&
    onboardingData.deliverables.length > 0 &&
    onboardingData.timeline &&
    onboardingData.paymentPreferences.length > 0 &&
    onboardingData.description.length >0 ;

  const handleCreateCampaign = () => {
    if (!isValid) return;

    // Save draft campaign to localStorage (optional, so they don’t lose data)
    localStorage.setItem("draftCampaign", JSON.stringify(onboardingData));
    if (token) {
      onNext();
    }else{
         setShowAuthModal(true);
    }
    

    // Redirect to signup with "returnTo" param
    // router.push(`/auth/signup?role=brand&returnTo=/brand-onboarding?step=6`);
    return;
  };

  const handleArrayChange = (
    field: "targetAudience" ,
    value: string,
    checked: boolean
  ) => {
    if (checked) {
      setOnboardingData((prev) => ({
        ...prev,
        [field]: [...prev[field], value],
      }));
    } else {
      setOnboardingData((prev) => ({
        ...prev,
        [field]: prev[field].filter((item) => item !== value),
      }));
    }
  };


  // Poster upload validation
    const validateFile = (file:File) => {
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

      if (!validateFile(file)) return;

      try {
        setUploadingImage(true);
        setUploadError("");
        const res = await uploadToCloudinary(file);
        // Only update state if upload was successful and has a URL
        if (res?.url) {
          setOnboardingData((prev) => ({
            ...prev,
            campaign_poster: res.url, 
            posterFile: file,
            posterPreview: URL.createObjectURL(file),
          }));
        } else {
          setUploadError("Upload failed - no URL returned");
        }
      } catch (err) {
        console.error("Upload failed", err);
        setUploadError("Upload failed");
      } finally {
        setUploadingImage(false);
      }
    };
  
    // Drag & drop (assets)
    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
      if (e.type === "dragleave") setDragActive(false);
    };
  
    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (!validateFile(file)) return;

        try {
          setUploadingImage(true);
          setUploadError("");
          const res = await uploadToCloudinary(file);
          if (res?.url) {
            setOnboardingData((prev) => ({
              ...prev,
              campaign_poster: res.url,
              posterFile: file,
              posterPreview: URL.createObjectURL(file),
            }));
          } else {
            setUploadError("Upload failed - no URL returned");
          }
        } catch (err) {
          console.error("Upload failed", err);
          setUploadError("Upload failed");
        } finally {
          setUploadingImage(false);
        }
      }
    };
  
    // Remove poster
    const handleRemovePoster = () => {
      setOnboardingData((prev) => ({
        ...prev,
        posterFile: null,
        posterPreview: "",
      }));
      setUploadError("");
    };


  return (
    <>
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl text-primary font-bold">
            Create your first campaign
          </h1>
          <p className="text-muted-foreground">
            Let&apos;s set up a campaign to find the perfect micro-influencer
            for your brand
          </p>
        </div>

        <div className="grid gap-8">
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
                  <Label htmlFor="campaignName">Campaign Name *</Label>
                  <Input
                    id="campaignName"
                    value={onboardingData.campaignName}
                    onChange={(e) =>
                      setOnboardingData((prev) => ({
                        ...prev,
                        campaignName: e.target.value,
                      }))
                    }
                    placeholder="Summer Collection Launch"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Campaign Objective *</Label>
                  <Select
                    value={onboardingData.objective}
                    onValueChange={(value) =>
                      setOnboardingData((prev) => ({
                        ...prev,
                        objective: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select objective" />
                    </SelectTrigger>
                    <SelectContent>
                      {objectives.map((obj) => (
                        <SelectItem key={obj.value} value={obj.value}>
                          <div>
                            <div className="font-medium">{obj.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {obj.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Campaign Description *</Label>
                <Textarea
                  id="description"
                  value={onboardingData.description}
                  onChange={(e) =>
                    setOnboardingData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe your campaign goals, target audience, key messages, and any specific requirements..."
                  rows={4}
                  maxLength={500}
                />
                <div className="flex justify-end mt-1">
                  <span
                    className={`text-xs ${
                      onboardingData.description.length >= 500
                        ? "text-red-500 font-semibold" // Red if limit reached
                        : "text-gray-400" // Grey otherwise
                    }`}
                  >
                    {onboardingData.description.length}/500 characters
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
                {!onboardingData.posterPreview ? (
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
                      disabled={uploadingImage}
                    />
                    <label htmlFor="poster-input">
                      <Button
                        type="button"
                        variant="outline"
                        asChild
                        className="cursor-pointer"
                        disabled={uploadingImage}
                      >
                        <span>{uploadingImage ? "Uploading..." : "Choose File"}</span>
                      </Button>
                    </label>
                    {uploadingImage && (
                      <div className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-600">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Uploading...</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative rounded-lg w-full aspect-[16/9] rounded-t-lg overflow-hidden border border-gray-200">
                    {onboardingData.posterPreview && (
  <Image
    fill
    src={onboardingData.posterPreview}
    alt="Poster preview"
    className="object-cover"
  />
)}
                    <button
                      onClick={handleRemovePoster}
                      className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-sm gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Uploading...</span>
                      </div>
                    )}
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
                      checked={onboardingData.budgetType === "total"}
                      onCheckedChange={() =>
                        setOnboardingData((prev) => ({
                          ...prev,
                          budgetType: "total",
                        }))
                      }
                    />
                    <Label htmlFor="total-budget">Total Campaign Budget</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="monthly-budget"
                      checked={onboardingData.budgetType === "monthly"}
                      onCheckedChange={() =>
                        setOnboardingData((prev) => ({
                          ...prev,
                          budgetType: "monthly",
                        }))
                      }
                    />
                    <Label htmlFor="monthly-budget">Monthly Budget</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="weekly-budget"
                      checked={onboardingData.budgetType === "weekly"}
                      onCheckedChange={() =>
                        setOnboardingData((prev) => ({
                          ...prev,
                          budgetType: "weekly",
                        }))
                      }
                    />
                    <Label htmlFor="weekly-budget">Weekly Budget</Label>
                  </div>

                  {/* <div className="flex items-center space-x-2">
                    <Checkbox
                      id="per-micro-influencers"
                      checked={onboardingData.budgetType === "per-micro-influencers"}
                      onCheckedChange={() =>
                        setOnboardingData((prev) => ({
                          ...prev,
                          budgetType: "per-micro-influencers",
                        }))
                      }
                    />
                    <Label htmlFor="per-micro-influencers">
                      Per micro-influencers Budget
                    </Label>
                  </div> */}
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Label>Budget Amount: ${onboardingData.budget[0]}</Label>
                    <Badge variant="secondary">
                      {onboardingData.budgetType === "total"
                        ? "Total"
                        : onboardingData.budgetType === "monthly"
                        ? "Monthly"
                        : onboardingData.budgetType === "weekly"
                        ? "Weekly"
                        : ""}
                    </Badge>
                  </div>
                  <Slider
                    value={onboardingData.budget}
                    onValueChange={(value) =>
                      setOnboardingData((prev) => ({ ...prev, budget: value }))
                    }
                    max={10000}
                    min={100}
                    step={100}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>$100</span>
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
                Select how you plan to compensate influencers for this
                campaign
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Gifted Products */}
                <div
                  className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer ${
                    onboardingData.paymentPreferences?.includes("gifted")
                      ? "bg-primary/10 border-primary"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() =>
                    setOnboardingData((prev) => {
                      const current = prev.paymentPreferences || [];
                      return current.includes("gifted")
                        ? {
                            ...prev,
                            paymentPreferences: current.filter(
                              (p) => p !== "gifted"
                            ),
                          }
                        : {
                            ...prev,
                            paymentPreferences: [...current, "gifted"],
                          };
                    })
                  }
                >
                  <Checkbox
                    checked={onboardingData.paymentPreferences?.includes(
                      "gifted"
                    )}
                    id="gifted"
                  />
                  <Label htmlFor="gifted">Gifted Products or Services</Label>
                </div>

                {/* Paid Collaborations */}
                <div
                  className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer ${
                    onboardingData.paymentPreferences?.includes("paid")
                      ? "bg-primary/10 border-primary"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() =>
                    setOnboardingData((prev) => {
                      const current = prev.paymentPreferences || [];
                      return current.includes("paid")
                        ? {
                            ...prev,
                            paymentPreferences: current.filter(
                              (p) => p !== "paid"
                            ),
                          }
                        : { ...prev, paymentPreferences: [...current, "paid"] };
                    })
                  }
                >
                  <Checkbox
                    checked={onboardingData.paymentPreferences?.includes(
                      "paid"
                    )}
                    id="paid"
                  />
                  <Label htmlFor="paid">Paid Collaborations</Label>
                </div>

                {/* Affiliate Marketing */}
                <div
                  className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer ${
                    onboardingData.paymentPreferences?.includes("affiliate")
                      ? "bg-primary/10 border-primary"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() =>
                    setOnboardingData((prev) => {
                      const current = prev.paymentPreferences || [];
                      return current.includes("affiliate")
                        ? {
                            ...prev,
                            paymentPreferences: current.filter(
                              (p) => p !== "affiliate"
                            ),
                          }
                        : {
                            ...prev,
                            paymentPreferences: [...current, "affiliate"],
                          };
                    })
                  }
                >
                  <Checkbox
                    checked={onboardingData.paymentPreferences?.includes(
                      "affiliate"
                    )}
                    id="affiliate"
                  />
                  <Label htmlFor="affiliate">Affiliate Marketing</Label>
                </div>

                {/* Brand Ambassador */}
                <div
                  className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer ${
                    onboardingData.paymentPreferences?.includes("ambassador")
                      ? "bg-primary/10 border-primary"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() =>
                    setOnboardingData((prev) => {
                      const current = prev.paymentPreferences || [];
                      return current.includes("ambassador")
                        ? {
                            ...prev,
                            paymentPreferences: current.filter(
                              (p) => p !== "ambassador"
                            ),
                          }
                        : {
                            ...prev,
                            paymentPreferences: [...current, "ambassador"],
                          };
                    })
                  }
                >
                  <Checkbox
                    checked={onboardingData.paymentPreferences?.includes(
                      "ambassador"
                    )}
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
                Select the type of content you want micro-influencers to produce
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {deliverableTypes.map((deliverable) => (
                  <div
                    key={deliverable.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      id={deliverable.id}
                      checked={onboardingData.deliverables.includes(
                        deliverable.id
                      )}
                      onCheckedChange={(checked) =>
                        handleDeliverableChange(
                          deliverable.id,
                          checked as boolean
                        )
                      }
                    />
                    <deliverable.icon className="w-4 h-4 text-muted-foreground" />
                    <Label
                      htmlFor={deliverable.id}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {deliverable.label}
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
                  value={onboardingData.timeline}
                  onValueChange={(value) =>
                    setOnboardingData((prev) => ({ ...prev, timeline: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    {timelineOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
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
                {/* <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Content Approval Required</Label>
                    <p className="text-xs text-muted-foreground">
                      Review content before publishing
                    </p>
                  </div>
                  <Switch
                    checked={onboardingData.approvalRequired}
                    onCheckedChange={(checked) =>
                      setOnboardingData((prev) => ({
                        ...prev,
                        approvalRequired: checked,
                      }))
                    }
                  />
                </div> */}

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Auto-match influencers</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically find matching influencers
                    </p>
                  </div>
                  <Switch
                    checked={onboardingData.autoMatch}
                    onCheckedChange={(checked) =>
                      setOnboardingData((prev) => ({
                        ...prev,
                        autoMatch: checked,
                      }))
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
    <h4 className="text-sm font-medium text-gray-700">Men</h4>
    {demographics.men.map((demo) => (
      <div key={demo} className="flex items-center space-x-2">
        <Checkbox
          id={demo}
          checked={onboardingData.targetAudience.includes(demo)}
          onCheckedChange={(checked) =>
            handleArrayChange(
              "targetAudience",
              demo,
              checked as boolean
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
    <h4 className="text-sm font-medium text-gray-700">Women</h4>
    {demographics.women.map((demo) => (
      <div key={demo} className="flex items-center space-x-2">
        <Checkbox
          id={demo}
          checked={onboardingData.targetAudience.includes(demo)}
          onCheckedChange={(checked) =>
            handleArrayChange(
              "targetAudience",
              demo,
              checked as boolean
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
    <h4 className="text-sm font-medium text-gray-700">Kids & Teens</h4>
    {demographics.youth.map((demo) => (
      <div key={demo} className="flex items-center space-x-2">
        <Checkbox
          id={demo}
          checked={onboardingData.targetAudience.includes(demo)}
          onCheckedChange={(checked) =>
            handleArrayChange(
              "targetAudience",
              demo,
              checked as boolean
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
                  value={onboardingData.keywords}
                  onChange={(e) =>
                    setOnboardingData((prev) => ({
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

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button
            variant="primary"
            onClick={handleCreateCampaign}
            disabled={!isValid}
          >
            {onboardingData.autoMatch
              ? "Create Campaign & Find Influencers"
              : "Create Campaign & Next"}
          </Button>
        </div>
      </div>
      {/* Auth Required Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign up required</DialogTitle>
            <DialogDescription>
              Please sign up or log in to continue creating your campaign.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() =>
                router.push("/auth/login?returnTo=/brand-onboarding?step=4")
              }
            >
              Log in
            </Button>
            <Button
              onClick={() =>
                router.push(
                  "/auth/signup?role=brand&returnTo=/brand-onboarding"
                )
              }
            >
              Sign up
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CampaignStep;

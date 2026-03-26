import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Building, Globe, MapPin, X, ChevronDown } from "lucide-react";
import PageHeaderWithSwitcher from "@/components/PageHeaderWithSwitcher";
import { useBrandOnBoarding } from "@/contexts/BrandOnboardingContext";
import { uploadToCloudinary } from "@/lib/fileUpload";
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BusinessInfoStepProps {
  onNext: () => void;
  onBack: () => void;
}

const BusinessInfoStep = ({ onNext, onBack }: BusinessInfoStepProps) => {
  const { onboardingData, setOnboardingData } = useBrandOnBoarding();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [timeZone, setTimeZone] = useState("");
  const [previewLogo,setPreviewLogo]=useState<string | null>(
    onboardingData.logoUrl || null
  );
  const [uploading, setUploading] = useState(false);

  const businessTypes = [
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

  const timeZones = [
  {
    value: "America/New_York",
    label: "Eastern Standard Time – EST (UTC−5) / Eastern Daylight Time – EDT (UTC−4)",
  },
  {
    value: "America/Chicago",
    label: "Central Standard Time – CST (UTC−6) / Central Daylight Time – CDT (UTC−5)",
  },
  {
    value: "America/Denver",
    label: "Mountain Standard Time – MST (UTC−7) / Mountain Daylight Time – MDT (UTC−6)",
  },
  {
    value: "America/Phoenix",
    label: "Mountain Standard Time – MST (UTC−7) – no DST",
  },
  {
    value: "America/Los_Angeles",
    label: "Pacific Standard Time – PST (UTC−8) / Pacific Daylight Time – PDT (UTC−7)",
  },
  {
    value: "America/Anchorage",
    label: "Alaska Standard Time – AKST (UTC−9) / Alaska Daylight Time – AKDT (UTC−8)",
  },
  {
    value: "Pacific/Honolulu",
    label: "Hawaii Standard Time – HST (UTC−10)",
  },
];


  const handleBusinessTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setOnboardingData((prev) => ({
        ...prev,
        businessTypes: [...prev.businessTypes, type],
      }));
    } else {
      setOnboardingData((prev) => ({
        ...prev,
        businessTypes: prev.businessTypes.filter((t) => t !== type),
      }));
    }
  };

  const isValid =
    onboardingData.businessName && onboardingData.website && onboardingData.timeZone && onboardingData.bio && onboardingData.logoUrl &&  onboardingData.businessTypes.length > 0;

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewLogo(objectUrl);
      setUploading(true);

      try {
        const res = await uploadToCloudinary(file);
        const imgUrl = res.url;

        setOnboardingData((prev) => ({
          ...prev,
          logoUrl: imgUrl || "",
        }));
        // Update to remote URL after upload
        setPreviewLogo(imgUrl || "");
      } catch (error) {
        console.error("Upload failed", error);
        // Revert on failure
        setPreviewLogo(null);
      } finally {
        setUploading(false);
      }
    }
  };
  const removeLogo = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering file input
    setPreviewLogo(null);
    setOnboardingData((prev) => ({ ...prev, logoUrl: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-8">
      <PageHeaderWithSwitcher role="brand" />
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-primary">
          Tell us about your business
        </h1>
        <p className="text-muted-foreground">
          This helps us match you with the most relevant influencers for your brand
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column - Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                value={onboardingData.businessName}
                onChange={(e) =>
                  setOnboardingData((prev) => ({
                    ...prev,
                    businessName: e.target.value,
                  }))
                }
                placeholder="Your company name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="designation">Title *</Label>
              <Input
                id="designation"
                value={onboardingData.designation}
                onChange={(e) =>
                  setOnboardingData((prev) => ({
                    ...prev,
                    designation: e.target.value,
                  }))
                }
                placeholder="example: owner
"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessName">Mission *</Label>
              <Input
                id="mission"
                value={onboardingData.mission}
                onChange={(e) =>
                  setOnboardingData((prev) => ({
                    ...prev,
                    mission: e.target.value,
                  }))
                }
                placeholder="Your Business Mission
"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website *</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="website"
                  value={onboardingData.website}
                  onChange={(e) =>
                    setOnboardingData((prev) => ({
                      ...prev,
                      website: e.target.value,
                    }))
                  }
                  placeholder="https://yourwebsite.com"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
  
  
  <div className="space-y-2">
  <Label htmlFor="timezone">Time Zone *</Label>
  <Select value={onboardingData.timeZone || ""} onValueChange={(value) =>
      setOnboardingData((prev) => ({
        ...prev,
        timeZone: value,
      }))
    }>
    <SelectTrigger 
      id="timezone"
      className="
        w-full h-[50px]
        bg-white 
        rounded-lg 
        border-gray-200 
        text-base text-gray-900
        focus:ring-2 focus:ring-secondary focus:ring-offset-0
        hover:border-gray-400 
        transition-colors
      "
    >
      <SelectValue placeholder="Select Time Zone (US)" />
    </SelectTrigger>
    
    <SelectContent>
      {timeZones.map((tz) => (
        <SelectItem key={tz.value} value={tz.value}>
          {tz.label}
        </SelectItem>
      ))}
      <SelectItem value="Others">Other</SelectItem>
    </SelectContent>
  </Select>
</div>
</div>

            <div className="space-y-2">
              <Label htmlFor="bio">Short Bio (250 characters) *</Label>
              <Textarea
                id="bio"
                maxLength={250}
                value={onboardingData.bio}
                onChange={(e) =>
                  setOnboardingData((prev) => ({
                    ...prev,
                    bio: e.target.value,
                  }))
                }
                placeholder="Brief description of your business and what you do..."
                rows={4}
              />
              <div className="flex justify-end mt-1">
                  <span
                    className={`text-xs ${
                      onboardingData.bio.length >= 250
                        ? "text-red-500 font-semibold" 
                        : "text-gray-400" 
                    }`}
                  >
                    {onboardingData.bio.length}/250 characters
                  </span>
                </div>
            </div>

            {/* Logo Upload */}
            <div className="space-y-2">
              <Label>Logo *</Label>
              
              <div
                onClick={handleClick}
                className={`
                  relative group cursor-pointer 
                  border-2 border-dashed rounded-xl 
                  transition-all duration-200 ease-in-out
                  ${previewLogo 
                    ? "border-primary/50 bg-gray-50 h-48" 
                    : "border-gray-300 hover:border-primary hover:bg-gray-50 h-32"
                  }
                  flex flex-col items-center justify-center
                `}
              >
                {previewLogo ? (
                  <>
                    <div className="relative w-full h-full p-4">
                      <Image 
                        src={previewLogo} 
                        alt="Logo Preview" 
                        fill
                        className={`object-contain transition-opacity duration-300 ${uploading ? "opacity-50" : "opacity-100"}`}
                      />
                      {/* Loading Spinner Overlay */}
                      {uploading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      )}
                    </div>
                    
                    {/* Hover Actions Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                      <p className="text-white font-medium text-sm">Change Logo</p>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={removeLogo}
                      className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors z-10"
                      title="Remove logo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <div className="bg-gray-100 p-3 rounded-full inline-block mb-3 group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6 text-gray-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">
                      Click to upload logo
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      SVG, PNG, JPG (max 2MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/svg+xml"
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Business Type */}
        <Card>
          <CardHeader>
            <CardTitle>Business Type *</CardTitle>
            <p className="text-sm text-muted-foreground">
              Select all that apply to your business
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3  overflow-y-auto">
              {businessTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={type}
                    checked={onboardingData.businessTypes.includes(type)}
                    onCheckedChange={(checked) =>
                      handleBusinessTypeChange(type, checked as boolean)
                    }
                  />
                  <Label htmlFor={type} className="text-sm font-normal">
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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

export default BusinessInfoStep;

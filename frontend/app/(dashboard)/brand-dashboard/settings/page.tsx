"use client";

import { useRef, useState, useEffect } from "react";
import {
  Paperclip,
  X,
  Globe,
  Mail,
  Building2,
  ChevronDown,
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
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { uploadToCloudinary } from "@/lib/fileUpload";
import { apiClient } from "@/lib/apiClient";
import { toast } from "react-toastify";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type BrandProfile = Partial<{
  business_name: string | null;
  display_name: string | null;
  short_bio: string | null;
  mission: string | null;
  designation: string | null;
  logo: string | null;
  business_type: "";
  website: string | null;
  timezone: string | null;
  description: string | null;
  instagram_handle: string | null;
  tiktok_handle: string | null;
  x_handle: string | null;
  linkedin_profile: string | null;
  whatsapp_business: string | null;
  email_notifications: boolean;
}>;

type FormDataState = {
  business_name: string;
  display_name: string;
  short_bio: string;
  mission: string;
  designation: string;
  logo: string | null;
  business_type: string[];
  website: string;
  timezone: string;
  description: string;
  instagramHandle: string;
  tiktokHandle: string;
  xHandle: string;
  linkedinProfile: string;
  whatsappBusiness: string;
  emailNotifications: boolean;
};

const timeZones = [
  {
    value: "America/New_York",
    label:
      "Eastern Standard Time – EST (UTC−5) / Eastern Daylight Time – EDT (UTC−4)",
  },
  {
    value: "America/Chicago",
    label:
      "Central Standard Time – CST (UTC−6) / Central Daylight Time – CDT (UTC−5)",
  },
  {
    value: "America/Denver",
    label:
      "Mountain Standard Time – MST (UTC−7) / Mountain Daylight Time – MDT (UTC−6)",
  },
  {
    value: "America/Phoenix",
    label: "Mountain Standard Time – MST (UTC−7) – no DST",
  },
  {
    value: "America/Los_Angeles",
    label:
      "Pacific Standard Time – PST (UTC−8) / Pacific Daylight Time – PDT (UTC−7)",
  },
  {
    value: "America/Anchorage",
    label:
      "Alaska Standard Time – AKST (UTC−9) / Alaska Daylight Time – AKDT (UTC−8)",
  },
  {
    value: "Pacific/Honolulu",
    label: "Hawaii Standard Time – HST (UTC−10)",
  },
];

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

const splitBusinessTypes = (value: string): string[] => {
  if (!value) return [];
  // Splits by comma + space, but only if the next character starts a new category
  // (starts with Uppercase and contains & or –)
  return value.split(/,\s(?=[A-Z][^,]*(?:&|–))/).map((s) => s.trim());
};

export default function BrandSetupPage() {
  const { user, setUser } = useAuthStore();
  console.log(user);

  const profile = (user?.brand_profile as BrandProfile | undefined) ?? {};
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormDataState>({
    business_name: "",
    display_name: "",
    short_bio: "",
    mission: "",
    designation: "",
    logo: null as string | null,
    business_type: [],
    website: "",
    timezone: "",
    description: "",
    instagramHandle: "",
    tiktokHandle: "",
    xHandle: "",
    linkedinProfile: "",
    whatsappBusiness: "",
    emailNotifications: true,
  });

  const [saving, setSaving] = useState(false);
  const toggleBusinessType = (type: string) => {
    setFormData((prev) => {
      const isSelected = prev.business_type.includes(type);
      const updatedTypes = isSelected
        ? prev.business_type.filter((t) => t !== type)
        : [...prev.business_type, type];

      return { ...prev, business_type: updatedTypes };
    });
  };
  // Load data from user.brand_profile
  useEffect(() => {
    if (!profile || Object.keys(profile).length === 0) return;

    setFormData({
      ...formData,
      business_name: profile.business_name || "",
      display_name: profile.display_name || "",
      short_bio: profile.short_bio || "",
      mission: profile.mission || "",
      designation: profile.designation || "",
      logo: profile.logo || null,
      business_type: profile.business_type
        ? splitBusinessTypes(profile.business_type)
        : [],
      website: profile.website || "",
      timezone: profile.timezone || "",
      description: profile.description || "",
      instagramHandle: profile.instagram_handle || "",
      tiktokHandle: profile.tiktok_handle || "",
      xHandle: profile.x_handle || "",
      linkedinProfile: profile.linkedin_profile || "",
      whatsappBusiness: profile.whatsapp_business || "",
      emailNotifications: profile.email_notifications ?? true,
    });
  }, [profile]);

  const handleInputChange = <K extends keyof FormDataState>(
    field: K,
    value: FormDataState[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { url } = await uploadToCloudinary(file);
      if (!url) {
        toast.error("Upload failed");
        return;
      }
      setFormData((prev) => ({ ...prev, logo: url }));
      toast.success("Logo uploaded");
    } catch {
      toast.error("Upload failed");
    }
  };

  const handleSubmit = async () => {
    setSaving(true);

    const payload = {
      brand_profile: {
        business_name: formData.business_name || null,
        display_name: formData.display_name || null,
        short_bio: formData.short_bio || null,
        mission: formData.mission || null,
        designation: formData.designation || null,
        logo: formData.logo || null,
        business_type:
          formData.business_type.length > 0
            ? formData.business_type.join(", ")
            : null,
        website: formData.website || null,
        timezone: formData.timezone || null,
        description: formData.description || null,
        instagram_handle: formData.instagramHandle || null,
        tiktok_handle: formData.tiktokHandle || null,
        x_handle: formData.xHandle || null,
        linkedin_profile: formData.linkedinProfile || null,
        whatsapp_business: formData.whatsappBusiness || null,
        email_notifications: formData.emailNotifications,
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
        toast.success("Brand profile updated!");
      }
    } catch (err) {
      toast.error("Update failed");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/40 py-8  ">
      <div className="">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-primary" />
            Brand Profile Setup
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Complete your brand profile to connect with influencers
          </p>
        </div>

        <Card className="border-0">
          <CardContent className=" space-y-12">
            {/* Basic Profile Information */}
            <section className="space-y-6 px-2">
              {/* <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  Basic Profile Information
                </h2>
              </div> */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                {/* Logo Upload */}
                <div className="space-y-2">
                  <Label className="text-base font-medium">Business Logo</Label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    className="hidden"
                    accept="image/*"
                  />
                  {formData.logo ? (
                    <div className="relative group w-24 h-24">
                      <Image
                        src={formData.logo}
                        alt="Logo Preview"
                        fill
                        className="rounded-lg border border-gray-200 object-contain bg-white p-2"
                      />

                      <Button
                        size="icon"
                        className="absolute -top-1 -right-5 h-7 w-7 bg-red-500 text-white
               opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleInputChange("logo", null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Paperclip className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm font-medium text-gray-700">
                        Click to upload logo
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG</p>
                    </div>
                  )}
                </div>
                <div></div>
                <div className="space-y-2">
                  <Label
                    htmlFor="business_name"
                    className="text-base font-medium"
                  >
                    Business Name
                  </Label>
                  <Input
                    id="business_name"
                    value={formData.business_name}
                    onChange={(e) =>
                      handleInputChange("business_name", e.target.value)
                    }
                    placeholder="Enter business name"
                    className="h-11"
                  />
                </div>

                {/* <div className="space-y-2">
                  <Label htmlFor="display_name" className="text-base font-medium">
                    Display Name
                  </Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) => handleInputChange("display_name", e.target.value)}
                    placeholder="Enter Your Full Name"
                    className="h-11"
                  />
                </div> */}
                
                <div className="space-y-2">
                  <Label
                    htmlFor="designation"
                    className="text-base font-medium"
                  >
                    Title
                  </Label>
                  <Input
                    id="designation"
                    value={formData.designation}
                    onChange={(e) =>
                      handleInputChange("designation", e.target.value)
                    }
                    placeholder="example: owner
"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="short_bio" className="text-base font-medium">
                    Short Bio (250 characters)
                  </Label>
                  <Input
                    id="short_bio"
                    maxLength={250}
                    value={formData.short_bio}
                    onChange={(e) =>
                      handleInputChange("short_bio", e.target.value)
                    }
                    placeholder="Brief description of your business and what you do..."
                    className="h-11"
                  />
                  <div className="flex justify-end mt-1">
                    <span
                      className={`text-xs ${
                        formData.short_bio.length >= 250
                          ? "text-red-500 font-semibold"
                          : "text-gray-400"
                      }`}
                    >
                      {formData.short_bio.length}/250 characters
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mission" className="text-base font-medium">
                    Mission
                  </Label>
                  <Input
                    id="mission"
                    value={formData.mission}
                    onChange={(e) =>
                      handleInputChange("mission", e.target.value)
                    }
                    placeholder="Your Business Mission"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website" className="text-base font-medium">
                    Website
                  </Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) =>
                      handleInputChange("website", e.target.value)
                    }
                    placeholder="https://yourbrand.com"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone" className="text-base font-medium">
                    Time Zone
                  </Label>
                  <Select
                    value={formData.timezone}
                    onValueChange={(v) => handleInputChange("timezone", v)}
                  >
                    <SelectTrigger id="timezone" className="h-11">
                      <SelectValue placeholder="Select time zone" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeZones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4 md:col-span-2">
                  <Label className="text-base font-medium">
                    Business Types
                  </Label>
                  <Card className="border-none border border-gray-100">
                    <CardContent className="p-0 space-y-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between h-12 text-left font-normal border-gray-300 hover:bg-white focus:ring-2 focus:ring-primary/20"
                          >
                            <span
                              className={
                                formData.business_type.length
                                  ? "text-gray-900"
                                  : "text-muted-foreground"
                              }
                            >
                              {formData.business_type.length
                                ? `${formData.business_type.length} categories selected`
                                : "Select your business categories..."}
                            </span>
                            <ChevronDown className="h-4 w-4 text-gray-500 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[400px] overflow-y-auto p-1"
                          align="start"
                        >
                          {businessTypes.map((type) => (
                            <DropdownMenuCheckboxItem
                              key={type}
                              checked={formData.business_type.includes(type)}
                              onCheckedChange={() => toggleBusinessType(type)}
                              // Prevents the dropdown from closing after every single click
                              onSelect={(e) => e.preventDefault()}
                              className="cursor-pointer py-3 px-3 border-b border-gray-50 last:border-0"
                            >
                              <span className="text-sm leading-relaxed">
                                {type}
                              </span>
                            </DropdownMenuCheckboxItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {formData.business_type.length > 0 && (
                        <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
                          {formData.business_type.map((type) => (
                            <span
                              key={type}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-700 shadow-sm transition-all hover:border-gray-300"
                            >
                              {type}
                              <button
                                type="button"
                                onClick={() =>
                                  handleInputChange(
                                    "business_type",
                                    formData.business_type.filter(
                                      (t) => t !== type,
                                    ),
                                  )
                                }
                                className="hover:bg-gray-100 p-0.5 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                
              </div>

              {/* <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description" className="text-base font-medium">
                  Business Profile Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe your brand briefly..."
                  className="min-h-32 resize-none"
                />
              </div> */}
            </section>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                size="lg"
                onClick={() => window.history.back()}
                className="px-8"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={saving}
                size="lg"
                className="px-10 bg-primary hover:bg-primary/90"
              >
                {saving ? "Saving..." : "Update Profile"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

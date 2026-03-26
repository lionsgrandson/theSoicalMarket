"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Hash, Users, Camera } from "lucide-react";
import Image from "next/image";
import { industriesNiches } from "@/constants/niches";
import { demographics } from "@/constants/demographics";
import { useInfluencerOnboarding } from "@/contexts/InfluencerOnboardingContext";
import { uploadToCloudinary } from "@/lib/fileUpload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProfileSetupStepProps {
  onNext: () => void;
  onBack: () => void;
}

const ProfileSetupStep = ({ onNext, onBack }: ProfileSetupStepProps) => {
  const { onboardingDataInfluencer, setOnboardingDataInfluencer } =
    useInfluencerOnboarding();
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleArrayChange = (
    field: "content_niches" | "audience_demographics",
    value: string,
    checked: boolean
  ) => {
    if (checked) {
      setOnboardingDataInfluencer((prev) => ({
        ...prev,
        [field]: [...prev[field], value],
      }));
    } else {
      setOnboardingDataInfluencer((prev) => ({
        ...prev,
        [field]: prev[field].filter((item) => item !== value),
      }));
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    try {
      setUploading(true);
      const { url } = await uploadToCloudinary(file);
      if (!url) {
        console.error("Upload failed: missing URL");
        return;
      }

      // 3️⃣ update onboarding data with Cloudinary URL
      setOnboardingDataInfluencer((prev) => ({
        ...prev,
        profile_picture: url,
      }));
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const isValid =
    onboardingDataInfluencer.display_name &&
    onboardingDataInfluencer.profile_picture &&
    ((onboardingDataInfluencer.instagram_handle && onboardingDataInfluencer.insta_follower) || 
    (onboardingDataInfluencer.tiktok_handle && onboardingDataInfluencer.tiktok_follower) ||
    (onboardingDataInfluencer.blog_url && onboardingDataInfluencer.blog_follower) ||
    (onboardingDataInfluencer.whatsapp_handle && onboardingDataInfluencer.whatsapp_follower) ||
    (onboardingDataInfluencer.podcast_handle && onboardingDataInfluencer.podcast_follower) ||
    (onboardingDataInfluencer.twitter_handle && onboardingDataInfluencer.twitter_follower) ||
    (onboardingDataInfluencer.linkedin_handle && onboardingDataInfluencer.linkedin_follower) ||
    (onboardingDataInfluencer.facebook_handle && onboardingDataInfluencer.facebook_follower) ||
    (onboardingDataInfluencer.youtube_handle && onboardingDataInfluencer.youtube_follower) )&&
    onboardingDataInfluencer.short_bio &&
    onboardingDataInfluencer.gender &&
    onboardingDataInfluencer.content_niches.length > 0;

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl text-primary  font-bold">
          Create your influencer profile
        </h1>
        <p className="text-muted-foreground">
          Show brands who you are and what makes your content special
        </p>
      </div>

      <div className="grid gap-8">
        {/* Basic Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Basic Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Profile Photo Upload */}
              <div className="space-y-2 ">
                <Label>Profile Photo *</Label>
                <label
                  htmlFor="profilePhoto"
                  className="aspect-square w-32  border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors overflow-hidden"
                >
                  {!uploading && (preview || onboardingDataInfluencer.profile_picture) ? (
                    <Image
                      width={500}
                      height={500}
                      src={preview || onboardingDataInfluencer.profile_picture}
                      alt="Profile preview"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <>
                      <Camera className="w-8 h-8 text-muted-foreground mb-2" />
                      <p className="text-xs text-muted-foreground text-center">
                        Upload Photo
                      </p>
                    </>
                  )}
                </label>
                <input
                  type="file"
                  id="profilePhoto"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>

              {/* Basic Info */}
              <div className="space-y-4 flex-1">
  {/* Display Name */}
  <div className="space-y-2">
    <Label htmlFor="displayName">Display Name *</Label>
    <Input
      id="displayName"
      value={onboardingDataInfluencer.display_name}
      onChange={(e) =>
        setOnboardingDataInfluencer((prev) => ({
          ...prev,
          display_name: e.target.value,
        }))
      }
      placeholder="Your influencer name"
    />
  </div>

  {/* Gender */}
  <div className="space-y-2">
    <Label htmlFor="gender">Gender *</Label>
    <Select
      value={onboardingDataInfluencer.gender || ""}
      onValueChange={(value) =>
        setOnboardingDataInfluencer((prev) => ({
          ...prev,
          gender: value,
        }))
      }
    >
      <SelectTrigger id="gender" className="w-full">
        <SelectValue placeholder="Select your gender" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="male">Male</SelectItem>
        <SelectItem value="female">Female</SelectItem>
        <SelectItem value="prefer_not_to_say">No preference</SelectItem>
      </SelectContent>
    </Select>
  </div>

  {/* Short Bio */}
  <div className="space-y-2">
    <Label htmlFor="bio">Short Bio (200 characters) *</Label>
    <Textarea
      id="bio"
      value={onboardingDataInfluencer.short_bio}
      onChange={(e) =>
        setOnboardingDataInfluencer((prev) => ({
          ...prev,
          short_bio: e.target.value.slice(0, 200), 
        }))
      }
      placeholder="Tell brands what makes you unique..."
      rows={3}
      maxLength={200}
    />
    <p className="text-xs text-muted-foreground text-right">
      {onboardingDataInfluencer.short_bio.length}/200 characters
    </p>
  </div>
</div>
            </div>
          </CardContent>
        </Card>

        

        <Card>
  <CardHeader>
    <CardTitle>Social Presence & Reach *</CardTitle>
    <p className="text-sm text-muted-foreground">
      Connect your accounts and specify your audience size for each platform.
    </p>
  </CardHeader>

  <CardContent className="space-y-6">
    {/* Instagram */}
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="instagram_handle">Instagram Link</Label>
        <Input
          id="instagram_handle"
          value={onboardingDataInfluencer.instagram_handle}
          onChange={(e) =>
            setOnboardingDataInfluencer((prev) => ({
              ...prev,
              instagram_handle: e.target.value,
            }))
          }
          placeholder="https://www.instagram.com/username"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="insta_follower">Followers</Label>
        <Input
          id="insta_follower"
          type="number"
          min="0"
          value={onboardingDataInfluencer.insta_follower}
          onChange={(e) =>
            setOnboardingDataInfluencer((prev) => ({
              ...prev,
              insta_follower: e.target.value,
            }))
          }
          placeholder="e.g. 5000"
        />
      </div>
    </div>

    {/* TikTok */}
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="tiktok_handle">TikTok Link</Label>
        <Input
          id="tiktok_handle"
          value={onboardingDataInfluencer.tiktok_handle}
          onChange={(e) =>
            setOnboardingDataInfluencer((prev) => ({
              ...prev,
              tiktok_handle: e.target.value,
            }))
          }
          placeholder="https://www.tiktok.com/@username"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tiktok_follower">Followers</Label>
        <Input
          id="tiktok_follower"
          type="number"
          min="0"
          value={onboardingDataInfluencer.tiktok_follower}
          onChange={(e) =>
            setOnboardingDataInfluencer((prev) => ({
              ...prev,
              tiktok_follower: e.target.value,
            }))
          }
          placeholder="e.g. 10000"
        />
      </div>
    </div>

    {/* YouTube */}
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="youtube_handle">YouTube Channel URL</Label>
        <Input
          id="youtube_handle"
          value={onboardingDataInfluencer.youtube_handle}
          onChange={(e) =>
            setOnboardingDataInfluencer((prev) => ({
              ...prev,
              youtube_handle: e.target.value,
            }))
          }
          placeholder="youtube.com/@YourChannel"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="youtube_follower">Subscribers</Label>
        <Input
          id="youtube_follower"
          type="number"
          min="0"
          value={onboardingDataInfluencer.youtube_follower}
          onChange={(e) =>
            setOnboardingDataInfluencer((prev) => ({
              ...prev,
              youtube_follower: e.target.value,
            }))
          }
          placeholder="e.g. 1000"
        />
      </div>
    </div>

    {/* Facebook */}
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="facebook_handle">Facebook Page URL</Label>
        <Input
          id="facebook_handle"
          value={onboardingDataInfluencer.facebook_handle}
          onChange={(e) =>
            setOnboardingDataInfluencer((prev) => ({
              ...prev,
              facebook_handle: e.target.value,
            }))
          }
          placeholder="https://facebook.com/username"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="facebook_follower">Followers</Label>
        <Input
          id="facebook_follower"
          type="number"
          min="0"
          value={onboardingDataInfluencer.facebook_follower}
          onChange={(e) =>
            setOnboardingDataInfluencer((prev) => ({
              ...prev,
              facebook_follower: e.target.value,
            }))
          }
          placeholder="e.g. 2500"
        />
      </div>
    </div>

    {/* LinkedIn */}
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="linkedin_handle">LinkedIn Profile URL</Label>
        <Input
          id="linkedin_handle"
          value={onboardingDataInfluencer.linkedin_handle}
          onChange={(e) =>
            setOnboardingDataInfluencer((prev) => ({
              ...prev,
              linkedin_handle: e.target.value,
            }))
          }
          placeholder="linkedin.com/in/yourname"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="linkedin_follower">Connections / Followers</Label>
        <Input
          id="linkedin_follower"
          type="number"
          min="0"
          value={onboardingDataInfluencer.linkedin_follower}
          onChange={(e) =>
            setOnboardingDataInfluencer((prev) => ({
              ...prev,
              linkedin_follower: e.target.value,
            }))
          }
          placeholder="e.g. 500"
        />
      </div>
    </div>

    

    

    {/*  WhatsApp  */}
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="twitter_handle">Twitter/X Link</Label>
        <Input
          id="twitter_handle"
          value={onboardingDataInfluencer.twitter_handle}
          onChange={(e) =>
            setOnboardingDataInfluencer((prev) => ({
              ...prev,
              twitter_handle: e.target.value,
            }))
          }
          placeholder="https://twitter.com/username"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="whatsapp_handle">Followers</Label>
        <Input
          id="twitter_follower"
          type="number"
          value={onboardingDataInfluencer.twitter_follower}
          onChange={(e) =>
            setOnboardingDataInfluencer((prev) => ({
              ...prev,
              twitter_follower: e.target.value,
            }))
          }
          placeholder="e.g. 500"
        />
      </div>
    </div>
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="twitter_handle">Podcast Mention</Label>
        <Input
          id="twitter_handle"
          value={onboardingDataInfluencer.podcast_handle}
          onChange={(e) =>
            setOnboardingDataInfluencer((prev) => ({
              ...prev,
              podcast_handle: e.target.value,
            }))
          }
          placeholder="https://www.example.com/podcast"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="whatsapp_handle">Followers</Label>
        <Input
          id="twitter_follower"
          type="number"
          value={onboardingDataInfluencer.podcast_follower}
          onChange={(e) =>
            setOnboardingDataInfluencer((prev) => ({
              ...prev,
              podcast_follower: e.target.value,
            }))
          }
          placeholder="e.g. 500"
        />
      </div>
    </div>
    
      <div className="grid md:grid-cols-2 gap-4">
    <div className="space-y-2">
        <Label htmlFor="whatsapp_handle">WhatsApp</Label>
        <Input
          id="whatsapp_handle"
          value={onboardingDataInfluencer.whatsapp_handle}
          onChange={(e) =>
            setOnboardingDataInfluencer((prev) => ({
              ...prev,
              whatsapp_handle: e.target.value,
            }))
          }
          placeholder="e.g. wa.me/15551234567"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="whatsapp_handle">Average Status Views / Group Size</Label>
        <Input
          id="twitter_follower"
          type="number"
          value={onboardingDataInfluencer.whatsapp_follower}
          onChange={(e) =>
            setOnboardingDataInfluencer((prev) => ({
              ...prev,
              whatsapp_follower: e.target.value,
            }))
          }
          placeholder="e.g. 500"
        />
      </div>
      </div>
      {/* Blog (New Corresponding URL field added) */}
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="blog_url">Blog / Website URL</Label>
        <Input
          id="blog_url"
          value={onboardingDataInfluencer.blog_url } 
          onChange={(e) =>
            setOnboardingDataInfluencer((prev) => ({
              ...prev,
              blog_url: e.target.value,
            }))
          }
          placeholder="https://myblog.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="blog_follower">Monthly Visitors</Label>
        <Input
          id="blog_follower"
          type="number"
          min="0"
          value={onboardingDataInfluencer.blog_follower}
          onChange={(e) =>
            setOnboardingDataInfluencer((prev) => ({
              ...prev,
              blog_follower: e.target.value,
            }))
          }
          placeholder="e.g. 1500"
        />
      </div>
    </div>
  </CardContent>
</Card>

        {/* Content Niches */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="w-5 h-5" />
              Content Niches *
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Select your primary content categories 
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {industriesNiches.map((niche) => (
                <div key={niche} className="flex items-center space-x-2">
                  <Checkbox
                    id={niche}
                    checked={onboardingDataInfluencer.content_niches.includes(
                      niche
                    )}
                    onCheckedChange={(checked) =>
                      handleArrayChange(
                        "content_niches",
                        niche,
                        checked as boolean
                      )
                    }
                  />
                  <Label htmlFor={niche} className="text-sm font-normal">
                    {niche}
                  </Label>
                </div>
              ))}
            </div>
            <div className="mt-4">
              {onboardingDataInfluencer.content_niches.map((niche) => (
                <Badge key={niche} variant="secondary" className="mr-2 mb-2">
                  {niche}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Audience Demographics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Audience Demographics
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Help brands understand who follows you
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {/* Men Column */}
  <div className="space-y-3">
    <h4 className="font-medium text-sm text-gray-700">Men</h4>
    {demographics.men.map((demo) => (
      <div key={demo} className="flex items-center space-x-2">
        <Checkbox
          id={demo}
          checked={onboardingDataInfluencer.audience_demographics.includes(demo)}
          onCheckedChange={(checked) =>
            handleArrayChange(
              "audience_demographics",
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

  {/* Women Column */}
  <div className="space-y-3">
    <h4 className="font-medium text-sm text-gray-700">Women</h4>
    {demographics.women.map((demo) => (
      <div key={demo} className="flex items-center space-x-2">
        <Checkbox
          id={demo}
          checked={onboardingDataInfluencer.audience_demographics.includes(demo)}
          onCheckedChange={(checked) =>
            handleArrayChange(
              "audience_demographics",
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

  {/* Kids / Teens Column */}
  <div className="space-y-3">
    <h4 className="font-medium text-sm text-gray-700">Youth</h4>
    {demographics.youth.map((demo) => (
      <div key={demo} className="flex items-center space-x-2">
        <Checkbox
          id={demo}
          checked={onboardingDataInfluencer.audience_demographics.includes(demo)}
          onCheckedChange={(checked) =>
            handleArrayChange(
              "audience_demographics",
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

        {/* Keywords */}
        <Card>
          <CardHeader>
            <CardTitle>Keywords & Hashtags</CardTitle>
            <p className="text-sm text-muted-foreground">
              Add keywords that describe your content style and expertise
            </p>
          </CardHeader>
          <CardContent>
            <Textarea
              value={onboardingDataInfluencer.keyword_and_tags}
              onChange={(e) =>
                setOnboardingDataInfluencer((prev) => ({
                  ...prev,
                  keyword_and_tags: e.target.value,
                }))
              }
              placeholder="#sustainablefashion #ecoFriendly #consciousliving"
              rows={3}
            />
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

export default ProfileSetupStep;

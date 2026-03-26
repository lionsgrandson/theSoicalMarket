import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Users, Hash, Heart, Users2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBrandOnBoarding } from "@/contexts/BrandOnboardingContext";

interface ProfileSetupStepProps {
  onNext: () => void;
  onBack: () => void;
}

const ProfileSetupStep = ({ onNext, onBack }: ProfileSetupStepProps) => {
  const { onboardingData, setOnboardingData } = useBrandOnBoarding();

const targetAudiencesByColumn = {
  men: [
    { label: "Men 18–24", tooltip: "Gen Z – early adopters, trend-driven." },
    { label: "Men 25–34", tooltip: "Millennials – tech-savvy, lifestyle & career focused." },
    { label: "Men 35–44", tooltip: "Older Millennials / Gen X – higher disposable income." },
    { label: "Men 45+", tooltip: "Gen X / Boomers – loyalty and financial stability." },
  ],
  women: [
    { label: "Women 18–24", tooltip: "Gen Z – digital natives, heavy TikTok/IG use." },
    { label: "Women 25–34", tooltip: "Millennials – young professionals / family-forming stage." },
    { label: "Women 35–44", tooltip: "Older Millennials / Gen X – career stability & young families." },
    { label: "Women 45+", tooltip: "Gen X / Boomers – loyalty and financial stability." },
  ],
  youth: [
    { label: "Kids", tooltip: "Ages 6–12 – purchasing decisions influenced by parents, education, entertainment, and brand familiarity." },
    { label: "Teens", tooltip: "Ages 13–17 – highly influenced by social media trends, peers, and short-form video content." },
  ],
};


  const brandValues = [
  // CORE from your original list (Prioritized)
  "Relatable",
  "Authentic",
  "Honest",
  "Funny",
  "High-Energy",
  "Vibrant",
  "Playful",
  "Bold",
  "Creative",
  "Expressive",
  "Educational",
  "Informative",
  "Motivational",
  "Uplifting",
  "Empowering",

  // AESTHETIC & FEEL (Elevating the presentation)
  "Polished",
  "Chic",
  "Clean",
  "Modern",
  "Contemporary",

  // CHARACTER & APPROACH (Deepening the persona)
  "Confident",
  "Approachable",
  "Supportive",
  "Trustworthy",
  "Heartfelt",

  // ASPIRATION & IMPACT (The higher-purpose layer)
  "Aspirational",
  "Innovative",
  "Purpose-Driven",
  "Visionary"
];

  const handleArrayChange = (
    field: keyof typeof onboardingData,
    value: string,
    checked: boolean
  ) => {
    if (checked) {
      setOnboardingData((prev) => ({
        ...prev,
        [field]: [...(prev[field] as string[]), value],
      }));
    } else {
      setOnboardingData((prev) => ({
        ...prev,
        [field]: (prev[field] as string[]).filter((item) => item !== value),
      }));
    }
  };

  const isValid =
    onboardingData.targetAudience.length > 0;

  return (
    <TooltipProvider>
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-primary">
            Build your brand profile
          </h1>
          <p className="text-muted-foreground">
            Help influencers understand your brand and find the perfect
            collaboration fit
          </p>
        </div>

        <div className="grid gap-8">
          {/* Target Audience */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users2 className="w-5 h-5" />
                Target Audiences *
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select the audiences most relevant to your brand</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
  {/* Men Column */}
  <div className="space-y-2">
    {targetAudiencesByColumn.men.map((audience) => (
      <div key={audience.label} className="flex items-center space-x-2">
        <Checkbox
          id={audience.label}
          checked={onboardingData.targetAudience.includes(audience.label)}
          onCheckedChange={(checked) =>
            handleArrayChange("targetAudience", audience.label, checked as boolean)
          }
        />
        <Label htmlFor={audience.label} className="flex items-center gap-1 text-sm font-normal">
          {audience.label}
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="w-4 h-4 text-muted-foreground cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-sm">{audience.tooltip}</TooltipContent>
          </Tooltip>
        </Label>
      </div>
    ))}
  </div>

  {/* Women Column */}
  <div className="space-y-2">
    {targetAudiencesByColumn.women.map((audience) => (
      <div key={audience.label} className="flex items-center space-x-2">
        <Checkbox
          id={audience.label}
          checked={onboardingData.targetAudience.includes(audience.label)}
          onCheckedChange={(checked) =>
            handleArrayChange("targetAudience", audience.label, checked as boolean)
          }
        />
        <Label htmlFor={audience.label} className="flex items-center gap-1 text-sm font-normal">
          {audience.label}
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="w-4 h-4 text-muted-foreground cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-sm">{audience.tooltip}</TooltipContent>
          </Tooltip>
        </Label>
      </div>
    ))}
  </div>

  {/* Kids/Teens Column */}
  <div className="space-y-2">
    {targetAudiencesByColumn.youth.map((audience) => (
      <div key={audience.label} className="flex items-center space-x-2">
        <Checkbox
          id={audience.label}
          checked={onboardingData.targetAudience.includes(audience.label)}
          onCheckedChange={(checked) =>
            handleArrayChange("targetAudience", audience.label, checked as boolean)
          }
        />
        <Label htmlFor={audience.label} className="flex items-center gap-1 text-sm font-normal">
          {audience.label}
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="w-4 h-4 text-muted-foreground cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-sm">{audience.tooltip}</TooltipContent>
          </Tooltip>
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
              <CardTitle className="flex items-center gap-2">
                <Hash className="w-5 h-5" />
                Keywords & Hashtags
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Keywords that represent your brand (with hash)</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
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
                rows={3}
              />
            </CardContent>
          </Card>

          <div className="">
            

            {/* Brand Values */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Brand tone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {brandValues.map((value) => (
                    <div key={value} className="flex items-center space-x-2">
                      <Checkbox
                        id={value}
                        checked={onboardingData.values.includes(value)}
                        onCheckedChange={(checked) =>
                          handleArrayChange("values", value, checked as boolean)
                        }
                      />
                      <Label htmlFor={value} className="text-sm font-normal">
                        {value}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
    </TooltipProvider>
  );
};

export default ProfileSetupStep;

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertCircle, CheckCircle, FileText, Star } from "lucide-react";

interface GuidelinesStepProps {
  onNext: () => void;
  onBack: () => void;
}

const GuidelinesStep = ({ onNext, onBack }: GuidelinesStepProps) => {
  const [agreements, setAgreements] = useState({
    ftcGuidelines: false,
    qualityStandards: false,
    brandFriendly: false,
    disclosureRules: false,
  });

  const guidelines = [
    {
      id: "ftcGuidelines",
      title: "FTC Disclosure Guidelines",
      icon: Shield,
      description:
        "I understand and will follow FTC guidelines for sponsored content",
      details: [
        "Use #ad, #sponsored, or #partnership hashtags clearly",
        "Disclose partnerships at the beginning of posts/videos",
        "Be honest and transparent about brand relationships",
        "Follow platform-specific disclosure requirements",
      ],
    },
    {
      id: "qualityStandards",
      title: "Content Quality Standards",
      icon: Star,
      description: "I will maintain high-quality content standards",
      details: [
        "Create authentic, engaging content that resonates with my audience",
        "Ensure good lighting, clear audio, and professional presentation",
        "Proofread captions and descriptions for accuracy",
        "Deliver content on time as agreed in contracts",
      ],
    },
    {
      id: "brandFriendly",
      title: "Brand-Friendly Content",
      icon: CheckCircle,
      description: "I will create content that aligns with brand values",
      details: [
        "Avoid controversial or offensive language/imagery",
        "Respect brand guidelines and messaging requirements",
        "Create content that positively represents the brand",
        "Maintain professionalism in all communications",
      ],
    },
    {
      id: "disclosureRules",
      title: "Platform Disclosure Rules",
      icon: AlertCircle,
      description:
        "I will follow each platform's specific disclosure requirements",
      details: [
        "Instagram: Use 'Paid partnership with' feature when available",
        "TikTok: Include disclosure in video and caption",
        "YouTube: Use 'Includes paid promotion' checkbox",
        "Blog posts: Include clear disclosure at the top of posts",
      ],
    },
  ];

  const handleAgreementChange = (id: string, checked: boolean) => {
    setAgreements((prev) => ({ ...prev, [id]: checked }));
  };

  const allAgreed = Object.values(agreements).every((agreed) => agreed);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl text-primary font-bold">
          Content & disclosure guidelines
        </h1>
        <p className="text-muted-foreground">
          Please review and agree to our content standards and legal
          requirements
        </p>
      </div>

      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          These guidelines ensure you stay compliant with regulations and
          maintain trust with your audience and brand partners.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        {guidelines.map((guideline) => (
          <Card key={guideline.id} className="hover-lift">
            <CardHeader>
              <div className="flex items-start gap-3">
                <Checkbox
                  id={guideline.id}
                  checked={agreements[guideline.id as keyof typeof agreements]}
                  onCheckedChange={(checked) =>
                    handleAgreementChange(guideline.id, checked as boolean)
                  }
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <guideline.icon className="w-5 h-5 text-primary" />
                    <Label
                      htmlFor={guideline.id}
                      className="text-lg font-semibold cursor-pointer"
                    >
                      {guideline.title}
                    </Label>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    {guideline.description}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-2">
                {guideline.details.map((detail, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Important Notice */}
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> Failure to follow these guidelines may
          result in account suspension and loss of collaboration opportunities.
          When in doubt, always err on the side of transparency and honesty.
        </AlertDescription>
      </Alert>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" onClick={onNext} disabled={!allAgreed}>
          I Agree to These Guidelines
        </Button>
      </div>
    </div>
  );
};

export default GuidelinesStep;

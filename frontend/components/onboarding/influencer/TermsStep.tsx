import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  Shield,
  Eye,
  Star,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const TermsAndGuidelinesStep = ({ onNext, onBack }: Props) => {
  const [agreed, setAgreed] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const router = useRouter();

  // const token =
  //   typeof window !== "undefined"
  //     ? localStorage.getItem("access_token")
  //     : null;

  const handleContinue = () => {
    if (!agreed) return;
    onNext();
    // token ? onNext() : setShowAuthModal(true);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">
            Terms, Privacy & Content Guidelines
          </h1>
          <p className="text-muted-foreground">
            Please read everything carefully before continuing
          </p>
        </div>

        {/* Scrollable Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Platform Policies & Requirements
            </CardTitle>
          </CardHeader>

          <CardContent>
            <ScrollArea className="h-[480px] pr-4">
              <div className="space-y-10 text-sm">

                {/* TERMS OF SERVICE */}
                <section className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Terms of Service
                  </h3>

                  {/* <p><strong>1. Account Registration</strong></p>
                  <p>
                    You must be at least 18 years old to create an account. You
                    are responsible for maintaining the security of your account
                    credentials.
                  </p> */}

                  <p><strong>1. Influencer Responsibilities</strong></p>
                  <p>
                    You agree to create authentic, high-quality content that
                    complies with platform guidelines and brand requirements.
                    You must disclose sponsored content according to FTC
                    guidelines.
                  </p>

                  <p><strong>2. Payment Terms</strong></p>
                  <p>
                    Payments are managed directly between brands and influencers. The platform does not handle transactions and operates solely on a subscription model.
                  </p>

                  <p><strong>3. Content Ownership</strong></p>
                  <p>
                    You retain ownership of your content but grant brands usage
                    rights as specified in individual campaign agreements.
                  </p>

                  <p><strong>4. Platform Usage</strong></p>
                  <p>
                    You agree not to bypass the platform for direct payments or
                    use the platform for illegal activities.
                  </p>
                </section>

                {/* PRIVACY POLICY */}
                <section className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Privacy Policy
                  </h3>

                  <p><strong>1. Data Collection</strong></p>
                  <p>
                    We collect information you provide during registration,
                    including profile data, social media links, and payment
                    information. Usage data is also collected to improve the
                    platform.
                  </p>

                  <p><strong>2. Data Usage</strong></p>
                  <p>
                    Your data is used to match you with brands, process payments,
                    and provide customer support. We do not sell personal data.
                  </p>

                  <p><strong>3. Data Sharing</strong></p>
                  <p>
                    Necessary data is shared with brands and payment processors
                    securely and only for collaboration purposes.
                  </p>

                  <p><strong>4. Data Security</strong></p>
                  <p>
                    Industry-standard security and encryption methods are used
                    to protect your information.
                  </p>

                  <p><strong>5. Your Rights</strong></p>
                  <p>
                    You can access, update, or delete your data at any time via
                    account settings.
                  </p>
                </section>

                {/* CONTENT POLICY */}
                <section className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Eye className="w-4 h-4" /> Content Policy
                  </h3>

                  <p><strong>1. Content Standards</strong></p>
                  <p>
                    Content must be original, authentic, and comply with
                    community guidelines.
                  </p>

                  <p><strong>2. Prohibited Content</strong></p>
                  <p>
                    Illegal activity, hate speech, violence, or misleading
                    content is prohibited.
                  </p>

                  <p><strong>3. Brand Safety</strong></p>
                  <p>
                    Content must align with brand values and guidelines.
                  </p>

                  <p><strong>4. Intellectual Property</strong></p>
                  <p>
                    You must own or have rights to all published content.
                  </p>

                  <p><strong>5. Compliance</strong></p>
                  <p>
                    Sponsored content must follow all disclosure regulations.
                  </p>
                </section>

                {/* GUIDELINES */}
                <section className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Star className="w-4 h-4" /> Content & Disclosure Guidelines
                  </h3>

                  <ul className="space-y-3">
                    <li className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-1" />
                      Follow FTC guidelines (#ad, #sponsored, clear disclosures)
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-1" />
                      Maintain high-quality visuals, audio, and captions
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-1" />
                      Create brand-safe, professional content
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-1" />
                      Follow platform-specific disclosure tools (Instagram,
                      TikTok, YouTube, blogs)
                    </li>
                  </ul>
                </section>

                {/* WARNING */}
                <section className="flex gap-2 text-destructive">
                  <AlertCircle className="w-4 h-4 mt-1" />
                  <p>
                    Violations may result in suspension, termination, or loss of
                    collaboration opportunities.
                  </p>
                </section>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Single Checkbox */}
        <div className="flex items-center gap-3">
          <Checkbox
            id="agree"
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(checked as boolean)}
          />
          <Label htmlFor="agree">
            I have read and agree to all Terms, Privacy Policy & Guidelines
          </Label>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={handleContinue} disabled={!agreed}>
            Accept & Continue
          </Button>
        </div>
      </div>

      {/* Auth Modal */}
      {/* <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign up required</DialogTitle>
            <DialogDescription>
              Please log in or sign up to continue.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() =>
                router.push("/auth/login?returnTo=/influencer-onboarding?step=6")
              }
            >
              Log in
            </Button>
            <Button
              onClick={() =>
                router.push(
                  "/auth/signup?role=influencer&returnTo=/influencer-onboarding?step=6"
                )
              }
            >
              Sign up
            </Button>
          </div>
        </DialogContent>
      </Dialog> */}
    </>
  );
};

export default TermsAndGuidelinesStep;

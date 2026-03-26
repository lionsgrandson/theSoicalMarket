"use client";
import { useEffect, useState } from "react";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import WelcomeStep from "@/components/onboarding/influencer/WelcomeStep";
import ProfileSetupStep from "@/components/onboarding/influencer/ProfileSetupStep";
import CollaborationPreferencesStep from "@/components/onboarding/influencer/CollaborationPreferencesStep";
import GuidelinesStep from "@/components/onboarding/influencer/GuidelinesStep";
import WorkflowStep from "@/components/onboarding/influencer/WorkflowStep";
import PaymentSetupStep from "@/components/onboarding/influencer/PaymentSetupStep";
import TermsStep from "@/components/onboarding/influencer/TermsStep";
import CompletionStep from "@/components/onboarding/influencer/CompletionStep";
import { toast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import InfluencerOnboardingProvider from "@/contexts/InfluencerOnboardingContext";

const InfluencerOnboardingPage = () => {
  const params = useSearchParams();
  const stepParam = parseInt(params.get("step") || "1", 10);
  const [currentStep, setCurrentStep] = useState(stepParam);
  const navigate = useRouter();

  const steps = [
    { title: "Welcome", description: "Get started as a influencer" },
    {
      title: "Profile Setup",
      description: "Create your influencer profile",
    },
    {
      title: "Collaboration Preferences",
      description: "Set your rates and preferences",
    },
    // {
    //   title: "Content Guidelines",
    //   description: "Review quality and disclosure rules",
    // },
    {
      title: "Communication & Workflow",
      description: "Learn how collaborations work",
    },
    // { title: "Payment Setup", description: "Choose how you get paid" },
    { title: "Terms & Privacy", description: "Review and accept our policies" },
    { title: "Complete", description: "You're ready to start earning!" },
  ];

  const totalSteps = steps.length;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);

      // Payment setup confirmation
      if (currentStep === 6) {
        toast({
          title: "Payment method added!",
          description:
            "You're all set to start earning from your collaborations.",
        });
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    toast({
      title: "Onboarding complete!",
      description:
        "Welcome to CreatorHub. Let's start creating amazing content!",
    });
    navigate.push("/influencer-dashboard");
  };

  useEffect(() => {
    // Scroll to top whenever currentStep changes
    window.scrollTo(0, 0);

    // Optional: Also update URL query param to reflect current step
    const newUrl = `${window.location.pathname}?step=${currentStep}`;
    window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
  }, [currentStep]);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeStep onNext={handleNext} />;
      case 2:
        return <ProfileSetupStep onNext={handleNext} onBack={handleBack} />;
      case 3:
        return (
          <CollaborationPreferencesStep
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      // case 4:
      //   return <GuidelinesStep onNext={handleNext} onBack={handleBack} />;
      case 4:
        return <WorkflowStep onNext={handleNext} onBack={handleBack} />;
      // case 6:
      //   return <PaymentSetupStep onNext={handleNext} onBack={handleBack} />;
      case 5:
        return <TermsStep onNext={handleNext} onBack={handleBack} />;
      case 6:
        return <CompletionStep onComplete={handleComplete} />;
      default:
        return <WelcomeStep onNext={handleNext} />;
    }
  };

  return (
    <InfluencerOnboardingProvider>
      <OnboardingLayout
        currentStep={currentStep}
        totalSteps={totalSteps}
        onBack={currentStep > 1 ? handleBack : undefined}
        stepTitle={steps[currentStep - 1].title}
        stepDescription={steps[currentStep - 1].description}
        showBack={currentStep > 1 && currentStep < 6}
        skipRole="influencer"
        finalStep ="6"
      >
        {renderStep()}
      </OnboardingLayout>
    </InfluencerOnboardingProvider>
  );
};

export default InfluencerOnboardingPage;

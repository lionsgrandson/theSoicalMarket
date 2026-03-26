import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CreditCard, Shield } from "lucide-react";

interface PaymentStepProps {
  onNext: () => void;
  onBack: () => void;
}

// Define a proper type for the plans
interface Plan {
  title: string;
  price: number;
  description: string;
  savings?: string;
}

const PaymentStep = ({ onNext, onBack }: PaymentStepProps) => {
  const [acceptedTOS, setAcceptedTOS] = useState(false);
  const [isYearly, setIsYearly] = useState(false);

  

  // Define plans with consistent structure
  const yearlyPlans: Plan[] = [
    {
      title: "I'm a Influencer",
      price: 100,
      description: "Ideal for influencers no matter your audience size. ",
      savings: "",
    },
    {
      title: "I'm a Brand",
      price: 100,
      description: "Perfect for Growing Businesses",
      savings: "",
    },
    {
      title: "I'm (Brand + Influencer)",
      price: 180,
      description:
        "Bundle (Brand + Influencer) and Save: Perfect for anyone growing their own business and also open to helping others grow (and getting paid!)",
      savings: "Save over 15%",
    },
  ];

  const monthlyPlans: Plan[] = [
    {
      title: "I'm a Influencer",
      price: 12,
      description: "Ideal for influencers no matter your audience size. ",
    },
    {
      title: "I'm a Brand",
      price: 12,
      description: "Perfect for Growing Businesses",
    },
    {
      title: "I'm (Brand + Influencer)",
      price: 20,
      description:
        "Bundle (Brand + Influencer) and Save: Perfect for anyone growing their own business and also open to helping others grow (and getting paid!)",
      savings: "Save over 15%",
    },
  ];

  const currentPlans = isYearly ? yearlyPlans : monthlyPlans;

  

  // Add a function to handle plan selection
  const handlePlanSelect = (planTitle: string) => {
    console.log("Selected plan:", planTitle);
    // You can store the selected plan here if needed
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl text-primary font-bold">Choose your plan</h1>
        <p className="text-muted-foreground">
          Start with a free trial and upgrade anytime. All plans include secure
          payments .
        </p>
      </div>

      

      {/* Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex justify-center bg-gray-200 rounded-lg ">
          <button
            onClick={() => setIsYearly(false)}
            className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
              !isYearly
                ? "bg-primary text-white shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
              isYearly
                ? "bg-primary text-white shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6 max-w-5xl mx-auto">
        {currentPlans.map((plan, index) => (
          <div
            key={index}
            className="bg-[#f6f8fa] rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <div className="p-8 text-center flex flex-col h-full justify-between">
              <h3 className="text-[40px] font-semibold text-primary mb-8">
                {plan.title}
              </h3>

              <div className="mb-6">
                <span className="md:text-[64px] text-3xl font-semibold text-primary">
                  ${plan.price}
                </span>
                <span className="text-[28px] text-primary font-semibold ml-1">
                  /{isYearly ? "Year" : "month"}
                </span>
              </div>

              {plan.savings && (
                <div className="mb-4">
                  <span className="text-red-500 font-semibold text-sm">
                    {plan.savings}
                  </span>
                </div>
              )}

              <p className="text-primary text-[24px] mb-8 leading-relaxed">
                {plan.description}
              </p>

              <button
                className="w-full bg-primary hover:bg-primary hover:text-white text-white font-semibold py-4 rounded-lg transition-colors duration-200"
                onClick={() => handlePlanSelect(plan.title)}
              >
                Select
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-medium">Secure Payment Processing</span>
            </div>
            <p className="text-sm text-muted-foreground">
              No payment required for your 14-day free trial. Add your payment
              method to continue after the trial period.
            </p>
          </div>

          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <CreditCard className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Payment method will be added after trial activation
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Terms & Conditions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Checkbox
              id="tos"
              checked={acceptedTOS}
              onCheckedChange={(checked) => setAcceptedTOS(checked as boolean)}
            />
            <div className="space-y-2">
              <Label htmlFor="tos" className="text-sm font-normal">
                I agree to the{" "}
                <button className="text-primary hover:underline">
                  Terms of Service
                </button>{" "}
                and{" "}
                <button className="text-primary hover:underline">
                  Privacy Policy
                </button>
              </Label>
              <p className="text-xs text-muted-foreground">
                By continuing, you acknowledge that you understand and agree to
                our terms and conditions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" onClick={onNext} disabled={!acceptedTOS}>
          Start Free Trial
        </Button>
      </div>
    </div>
  );
};

export default PaymentStep;

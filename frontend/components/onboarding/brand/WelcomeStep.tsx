import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Target, Users, TrendingUp } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
}

const WelcomeStep = ({ onNext }: WelcomeStepProps) => {
  const benefits = [
    {
      icon: Target,
      title: "Targeted Campaigns",
      description:
        "Find influencers who match your brand values and target audience",
    },
    {
      icon: Users,
      title: "Verified influencers",
      description:
        "Work with authenticated influencers with proven engagement rates",
    },
    {
      icon: TrendingUp,
      title: "Track Performance",
      description: "Get detailed analytics and ROI tracking for all campaigns",
    },
  ];

  return (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Sparkles className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-primary">
          Welcome to <span className="">The Social Market</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          You&apos;re about to join thousands of brands who&apos;ve discovered
          the power of authentic influencers partnerships. Let&apos;s get
          your brand set up for success.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {benefits.map((benefit, index) => (
          <Card key={index} className="hover-lift">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <benefit.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground">
                {benefit.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <Button
          variant="hero"
          size="lg"
          onClick={onNext}
          className="cursor-pointer"
        >
          Start Free Trial
        </Button>
        <p className="text-sm text-muted-foreground">
          14-day free trial • No credit card required • Cancel anytime
        </p>
      </div>
    </div>
  );
};

export default WelcomeStep;

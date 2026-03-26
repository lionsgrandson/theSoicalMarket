import PageHeaderWithSwitcher from "@/components/PageHeaderWithSwitcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, DollarSign, Users } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
}

const WelcomeStep = ({ onNext }: WelcomeStepProps) => {
  const benefits = [
    {
      icon: DollarSign,
      title: "Monetize Your Content",
      description:
        "Turn your passion into profit by partnering with brands that need your voice.",
    },
    {
      icon: Users,
      title: "Work with  Brands",
      description:
        "Collaborate with trusted brands that align with your style and values.",
    },
    {
      icon: TrendingUp,
      title: "Boost Your Visibility",
      description:
        "Grow your reach and get noticed with brands that believe in you.",
    },
  ];

  return (
    <div className="text-center space-y-8">
      <PageHeaderWithSwitcher role="influencers" />
      <div className="space-y-4">
        {/* <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mx-auto">
          <Star className="w-10 h-10 text-secondary" />
        </div> */}
        <h1 className="text-[30px] font-bold text-primary">
          Welcome to <span className="">The Social Market</span>
        </h1>
        <p className="text-[16px] text-muted-foreground max-w-2xl mx-auto">
          You&apos;re about to join thousands of influencers who&apos;ve
          turned their passion into profit. Let&apos;s get your
          influencer profile set up and start earning!
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {benefits.map((benefit, index) => (
          <Card key={index} className="hover-lift">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto">
                <benefit.icon className="w-6 h-6 text-secondary" />
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
        <Button variant="hero" size="lg" onClick={onNext}>
          Let&apos;s Get Started
        </Button>
        {/* <p className="text-sm text-muted-foreground">
          Free to join • Keep 85% of earnings • Get paid weekly
        </p> */}
      </div>
    </div>
  );
};

export default WelcomeStep;

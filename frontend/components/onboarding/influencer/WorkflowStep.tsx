import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  Bell,
  Mail,
} from "lucide-react";
import { useInfluencerOnboarding } from "@/contexts/InfluencerOnboardingContext";

interface WorkflowStepProps {
  onNext: () => void;
  onBack: () => void;
}

const WorkflowStep = ({ onNext, onBack }: WorkflowStepProps) => {
  const { onboardingDataInfluencer, setOnboardingDataInfluencer } =
    useInfluencerOnboarding();
  // const [preferences, setPreferences] = useState({
  //   responseTime: "24-hours",
  //   notifications: {
  //     email: true,
  //     push: true,
  //     sms: false,
  //   },
  //   autoAccept: false,
  //   weekendWork: true,
  // });

  const workflowSteps = [
    {
      step: 1,
      title: "Browse & Apply",
      description:
        "Discover campaigns that match your niche and apply to collaborate",
      icon: MessageCircle,
      color: "text-primary",
    },
    {
      step: 2,
      title: "Receive Offers",
      description:
        "Brands send you collaboration offers with campaign details and budgets",
      icon: Mail,
      color: "text-green-500",
    },
    {
      step: 3,
      title: "Negotiate Terms",
      description:
        "Discuss deliverables, timelines, and compensation through our platform",
      icon: MessageCircle,
      color: "text-secondary",
    },
    {
      step: 4,
      title: "Accept & Create",
      description:
        "Accept the offer and start creating amazing content for the brand",
      icon: CheckCircle,
      color: "text-purple-500",
    },
    {
      step: 5,
      title: "Submit & Get Paid",
      description:
        "Submit your content for approval and receive payment upon completion",
      icon: CheckCircle,
      color: "text-green-600",
    },
  ];

  const responseTimeOptions = [
    { value: "1-hour", label: "Within 1 hour" },
    { value: "4-hours", label: "Within 4 hours" },
    { value: "24-hours", label: "Within 24 hours" },
    { value: "48-hours", label: "Within 48 hours" },
    { value: "flexible", label: "Flexible (2-3 days)" },
  ];

  const handleNotificationChange = (type: string, enabled: boolean) => {
    setOnboardingDataInfluencer((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [type]: enabled },
    }));
  };

  const isValid=onboardingDataInfluencer.response_time;

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl text-primary font-bold">
          Communication & workflow
        </h1>
        <p className="text-muted-foreground">
          Learn how collaborations work and set your communication preferences
        </p>
      </div>

      {/* Workflow Overview */}
      <Card>
        <CardHeader>
          <CardTitle>How Collaborations Work</CardTitle>
          <p className="text-sm text-muted-foreground">
            Here&apos;s what to expect when working with brands on The Social
            Market
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {workflowSteps.map((step, index) => (
              <div key={step.step} className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {step.step}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <step.icon className={`w-4 h-4 ${step.color}`} />
                    <h3 className="font-semibold">{step.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
                {index < workflowSteps.length - 1 && (
                  <div className="absolute left-4 mt-8 w-px h-6 bg-border" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Communication Preferences */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Response Time *
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              How quickly do you typically respond to messages?
            </p>
          </CardHeader>
          <CardContent >
            <Select
            
              value={onboardingDataInfluencer.response_time}
              onValueChange={(value) =>
                setOnboardingDataInfluencer((prev) => ({
                  ...prev,
                  response_time: value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Response Time" />
              </SelectTrigger>
              <SelectContent>
                {responseTimeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              Faster response times can lead to more collaboration opportunities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Preferences
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              How would you like to receive updates?
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <Label>Email notifications</Label>
              </div>
              <Switch
                checked={onboardingDataInfluencer?.notifications?.email}
                onCheckedChange={(checked) =>
                  handleNotificationChange("email", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                <Label>Push notifications</Label>
              </div>
              <Switch
                checked={onboardingDataInfluencer?.notifications?.push}
                onCheckedChange={(checked) =>
                  handleNotificationChange("push", checked)
                }
              />
            </div>

            {/* <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <Label>SMS alerts (optional)</Label>
              </div>
              <Switch
                checked={preferences.notifications.sms}
                onCheckedChange={(checked) =>
                  handleNotificationChange("sms", checked)
                }
              />
            </div> */}
          </CardContent>
        </Card>
      </div>

      {/* Work Preferences */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Work Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Available on weekends</Label>
              <p className="text-xs text-muted-foreground">
                Can you work on campaigns during weekends?
              </p>
            </div>
            <Switch
              checked={preferences.weekendWork}
              onCheckedChange={(checked) =>
                setPreferences((prev) => ({ ...prev, weekendWork: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Auto-accept small campaigns</Label>
              <p className="text-xs text-muted-foreground">
                Automatically accept campaigns under $100 that match your
                criteria
              </p>
            </div>
            <Switch
              checked={preferences.autoAccept}
              onCheckedChange={(checked) =>
                setPreferences((prev) => ({ ...prev, autoAccept: checked }))
              }
            />
          </div>
        </CardContent>
      </Card> */}

      {/* Key Expectations */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Key Expectations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Response Times</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Respond to messages within your set timeframe</li>
                
                <li>• Communicate any delays proactively</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Content Delivery</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Meet agreed deadlines</li>
                <li>• Follow brand guidelines exactly</li>
                
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" onClick={onNext} disabled={!isValid}>
          Got it, Continue
        </Button>
      </div>
    </div>
  );
};

export default WorkflowStep;

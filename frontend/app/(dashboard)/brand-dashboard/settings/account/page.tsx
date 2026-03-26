"use client";

import { useState } from "react";
import {
  AlertCircle,
  Bell,
  Book,
  Check,
  CheckCircle,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  HelpCircle,
  Lock,
  Mail,
  MessageCircle,
  Shield,
  Smartphone,
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { apiClient } from "@/lib/apiClient";
import { toast } from "react-toastify";
type NotificationKeys = "email" | "push" | "sms" | "marketing";

interface NotificationItem {
  key: NotificationKeys;
  label: string;
  description: string;
}
export default function SettingsPage() {
const { user,setUser } = useAuthStore();
  const [notifications, setNotifications] = useState<
    Record<NotificationKeys, boolean>
  >({
    email: !!user?.brand_profile?.notifications_email,
    push: !!user?.brand_profile?.notifications_push,
    sms: false,
    marketing: true,
  });
  
  console.log(user);
  


  const supportItems = [
    {
      id: "faq",
      title: "FAQs",
      description: "Find answers to commonly asked questions",
      href: "/faq",
      icon: HelpCircle,
    },
    {
      id: "guides",
      title: "Guides & Documentation",
      description: "Step-by-step tutorials and resources",
      href: "https://www.youtube.com/watch?",
      icon: Book,
    },
    {
      id: "contact",
      title: "Contact Support",
      description: "Get help from our support team",
      href: "mailto:info@thesocialmarket.ai",
      icon: MessageCircle,
    },
  ];

  const notificationItems: NotificationItem[] = [
    {
      key: "email",
      label: "Email Notifications",
      description: "Receive updates via email",
    },
    {
      key: "push",
      label: "Push Notifications",
      description: "Browser push notifications",
    },
    
  ];

   const handleSave =async () => {
      const payload = {
      influencer_profile: {
            notifications_email:notifications.email,
            notifications_push:notifications.push,
      }
    }
      const res = await apiClient(
          `user_service/update_user_profile/`,
          {
            method: "PATCH",
            auth:true,
            body: JSON.stringify(payload),
          }
        );
        if (res.status=='success') {
          setUser(res?.data);
          toast("Settings saved ✅");
        }
  
      
    };

  return (
    <div className=" p-0 mx-auto">
      <h1 className="text-3xl font-semibold text-primary mb-8">Settings</h1>

      <div className="space-y-10">
        {/* Email Section */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div
            className="px-6 py-5 border-b border-gray-200"
            style={{ backgroundColor: "#0d2f4f" }}
          >
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Email Address
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all outline-none"
                  style={
                    { "--tw-ring-color": "#0d2f4f" } as React.CSSProperties
                  }
                  value={user?.user?.email}
                  readOnly
                  placeholder={user?.user?.email || "your.email@example.com"}
                />
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500">
                This email will be used for login and notifications
              </p>
            </div>
          </div>
        </section>

        

        {/* Notifications Section */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div
            className="px-6 py-5 border-b border-gray-200"
            style={{ backgroundColor: "#0d2f4f" }}
          >
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Preferences
            </h2>
            <p className="text-sm text-white/80 mt-1">
              Manage how you receive updates and alerts
            </p>
          </div>
          <div className="p-6 space-y-4">
            {notificationItems.map((item) => (
              <label
                key={item.key}
                className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                <div className="relative flex items-center h-6">
                  <input
                    type="checkbox"
                    checked={notifications[item.key]}
                    onChange={(e) =>
                      setNotifications((prev) => ({
                        ...prev,
                        [item.key]: e.target.checked,
                      }))
                    }
                    className="w-5 h-5 rounded border-gray-300 focus:ring-2 cursor-pointer"
                    style={
                      {
                        accentColor: "#0d2f4f",
                        "--tw-ring-color": "#0d2f4f",
                      } as React.CSSProperties
                    }
                  />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{item.label}</div>
                  <div className="text-sm text-gray-500">
                    {item.description}
                  </div>
                </div>
                {notifications[item.key] && (
                  <Check
                    className="w-5 h-5 flex-shrink-0"
                    style={{ color: "#0d2f4f" }}
                  />
                )}
              </label>
            ))}
          </div>
        </section>

       

        {/* Support / Help */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 bg-primary">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-white" />
              Support & Help
            </h2>
            <p className="text-sm text-white mt-1">
              We&apos;re here to help you get the most out of our platform
            </p>
          </div>

          {/* Support Items */}
          <div className="divide-y divide-gray-100">
            {supportItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  className="group flex items-center gap-4 px-6 py-4 transition-all duration-200 hover:bg-gray-50 active:bg-gray-100"
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/30 flex items-center justify-center group-hover:bg-primary/40 transition-colors duration-200">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium text-gray-900 group-hover:text-primary transition-colors duration-200">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {item.description}
                    </p>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                </a>
              );
            })}
          </div>

          {/* Footer CTA */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <p className="text-sm text-gray-600 text-center">
              Still need help?{" "}
              <a
                href="mailto:info@thesocialmarket.ai"
                className="font-medium text-primary hover:text-primary hover:underline"
              >
                Contact our support team
              </a>
            </p>
          </div>
        </section>

        <button
          onClick={handleSave}
          className="px-6 py-3 bg-secondary text-primary font-semibold rounded hover:bg-secondary transition"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}

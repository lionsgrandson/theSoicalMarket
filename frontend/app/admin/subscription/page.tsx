import { redirect } from "next/navigation";

export default function SubscriptionAdminRedirectPage() {
  const targetUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:8001/admin/subscription/subscription/"
      : "https://backend.thesocialmarket.ai/api/subscription_service/admin/subscription/subscription/";

  redirect(targetUrl);
}

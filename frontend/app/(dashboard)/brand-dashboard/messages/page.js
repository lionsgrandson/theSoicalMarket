// app/brand-dashboard/messages/page.jsx
import { Suspense } from "react";
import MessagesClient from "../../../../components/brand/MessagesClient";

export default function MessagesDashboard() {
  return (
    <Suspense fallback={<div>Loading messages...</div>}>
      <MessagesClient />
    </Suspense>
  );
}

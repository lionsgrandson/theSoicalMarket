"use client";

import { useState } from "react";

export default function RequestChatInterface({
  onAcceptRequest,
  onRejectRequest,
  onSearchContacts,
  onSelectContact,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const pendingRequest = { id: "req_1", name: "TechBusiness Inc.", email: "contact@techbusiness.com" };
  const contacts = [
    { id: "c_1", name: "Fashion Forward", email: "hello@fashionforward.com" },
    { id: "c_2", name: "Beauty Bloom", email: "team@beautybloom.com" },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2">Pending Chat Request</h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">{pendingRequest.name}</div>
            <div className="text-sm text-gray-500">{pendingRequest.email}</div>
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-2 rounded bg-green-600 text-white"
              onClick={() => onAcceptRequest?.(pendingRequest)}
            >
              Accept
            </button>
            <button
              className="px-3 py-2 rounded border border-gray-300"
              onClick={() => onRejectRequest?.(pendingRequest)}
            >
              Reject
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">Contacts</h2>
        <div className="mb-3">
          <input
            value={searchTerm}
            onChange={(e) => {
              const value = e.target.value;
              setSearchTerm(value);
              onSearchContacts?.(value);
            }}
            placeholder="Search contacts..."
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <ul className="divide-y">
          {contacts.map((c) => (
            <li key={c.id} className="py-2 flex items-center justify-between">
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-sm text-gray-500">{c.email}</div>
              </div>
              <button
                className="px-3 py-2 rounded bg-secondary text-white"
                onClick={() => onSelectContact?.(c)}
              >
                Open
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}



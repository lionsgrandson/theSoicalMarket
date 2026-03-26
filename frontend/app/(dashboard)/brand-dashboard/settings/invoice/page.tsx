"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([
    {
      id: "INV-001",
      issuedAt: "2025-09-01",
      description: "Campaign Subscription - September",
      payer: "Acme Corp",
      transactionId: "TXN123456",
      amount: 200,
      currency: "USD",
    },
    {
      id: "INV-002",
      issuedAt: "2025-08-15",
      description: "Premium Analytics - August",
      payer: "Global Media",
      transactionId: "TXN987654",
      amount: 150,
      currency: "USD",
    },
    {
      id: "INV-003",
      issuedAt: "2025-09-20",
      description: "Brand Campaign Collaboration",
      payer: "TechWave",
      transactionId: "TXN567890",
      amount: 300,
      currency: "USD",
    },
  ]);

  // Summary calculation
  const totalInvoices = invoices.length;
  const totalEarnings = useMemo(
    () => invoices.reduce((sum, inv) => sum + inv.amount, 0),
    [invoices]
  );

  // Delete invoice
  const handleDelete = (id: string) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold text-primary mb-6">Invoices</h1>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-sm text-gray-500">Total Invoices</p>
          <p className="text-xl font-semibold">{totalInvoices}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-sm text-gray-500">Total Earnings</p>
          <p className="text-xl font-semibold">{totalEarnings} USD</p>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="py-3 px-4 text-left">Invoice ID</th>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-left">Description</th>
              <th className="py-3 px-4 text-left">Payer</th>
              <th className="py-3 px-4 text-left">Transaction ID</th>
              <th className="py-3 px-4 text-left">Amount</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{inv.id}</td>
                <td className="py-3 px-4">
                  {new Date(inv.issuedAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">{inv.description}</td>
                <td className="py-3 px-4">{inv.payer}</td>
                <td className="py-3 px-4">{inv.transactionId}</td>
                <td className="py-3 px-4">
                  {inv.amount} {inv.currency}
                </td>
                <td className="py-3 px-4">
                  <Button
                    variant="destructive"
                    className="text-white"
                    size="sm"
                    onClick={() => handleDelete(inv.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

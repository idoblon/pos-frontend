import React from "react";
import { useSelector } from "react-redux";
import { Banknote, CreditCard, WalletCards } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const numberValue = (value) => Number(value) || 0;
const money = (value) => `Rs ${numberValue(value).toLocaleString()}`;

const getPaymentIcon = (type = "") => {
  const normalized = type.toLowerCase();
  if (normalized.includes("cash")) return Banknote;
  if (normalized.includes("card")) return CreditCard;
  return WalletCards;
};

const PaymentSummaryCard = ({ shiftData: propData } = {}) => {
  const reduxData = useSelector((state) => state.shiftReport.currentShift);
  const shiftData = propData ?? reduxData;
  const totalSales = numberValue(shiftData?.totalSales);

  return (
    <Card className="h-full rounded-lg py-0">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-gray-900">Payment Summary</h2>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            <WalletCards className="h-4 w-4" />
          </div>
        </div>

        <div className="space-y-2">
          {shiftData?.paymentSummaries?.length > 0 ? shiftData.paymentSummaries.map((payment) => {
            const Icon = getPaymentIcon(payment.type);
            const amount = numberValue(payment.totalAmount);
            const percent = totalSales > 0 ? ((amount / totalSales) * 100).toFixed(1) : "0.0";

            return (
              <div className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 p-3" key={payment.type}>
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-gray-700">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-gray-900">{payment.type || "Unknown"}</div>
                    <div className="text-xs text-gray-500">{numberValue(payment.transactionCount)} transactions</div>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-sm font-bold text-gray-900">{money(amount)}</div>
                  <div className="text-xs text-gray-500">{percent}%</div>
                </div>
              </div>
            );
          }) : (
            <p className="py-6 text-center text-sm text-gray-400">No payments yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentSummaryCard;

import React from "react";
import { useSelector } from "react-redux";
import { ReceiptText, RotateCcw, TrendingUp, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const numberValue = (value) => Number(value) || 0;
const money = (value) => `Rs ${numberValue(value).toLocaleString()}`;

const SummaryRow = ({ label, value, icon, valueClassName = "text-gray-900" }) => {
  const RowIcon = icon;

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 p-3">
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-gray-700">
          <RowIcon className="h-4 w-4" />
        </div>
        <span className="truncate text-sm text-gray-600">{label}</span>
      </div>
      <span className={`shrink-0 text-sm font-semibold ${valueClassName}`}>{value}</span>
    </div>
  );
};

const SalesSummaryCard = ({ shiftData: propData } = {}) => {
  const reduxData = useSelector((state) => state.shiftReport?.currentShift);
  const shiftData = propData ?? reduxData;

  return (
    <Card className="h-full rounded-lg py-0">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-gray-900">Sales Summary</h2>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>

        <div className="space-y-2">
          <SummaryRow label="Total Orders" value={numberValue(shiftData?.totalOrders)} icon={ReceiptText} />
          <SummaryRow label="Total Sales" value={money(shiftData?.totalSales)} icon={Wallet} />
          <SummaryRow label="Total Refund" value={money(shiftData?.totalRefunds)} icon={RotateCcw} valueClassName="text-red-600" />

          <div className="mt-3 rounded-lg bg-gray-950 p-3 text-white">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-gray-200">Net Sales</span>
              <span className="text-lg font-bold">{money(shiftData?.netSale)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesSummaryCard;

import React from "react";
import { useSelector } from "react-redux";
import { Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const numberValue = (value) => Number(value) || 0;
const money = (value) => `Rs ${numberValue(value).toLocaleString()}`;

const TopSellingItems = ({ shiftData: propData } = {}) => {
  const reduxData = useSelector((state) => state.shiftReport?.currentShift);
  const shiftData = propData ?? reduxData;

  return (
    <Card className="h-full rounded-lg py-0">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-gray-900">Top Selling Items</h2>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
            <Package className="h-4 w-4" />
          </div>
        </div>

        <div className="space-y-2">
          {shiftData?.topSellingProducts?.length > 0 ? shiftData.topSellingProducts.map((product, index) => (
            <div key={product.id || product.productId || product.name || index} className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-950 text-xs font-bold text-white">
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm font-medium text-gray-900">{product.name || "Unknown item"}</span>
                  <span className="shrink-0 text-sm font-semibold text-gray-900">{money(product.sellingPrice)}</span>
                </div>
                <div className="mt-0.5 text-xs text-gray-500">{numberValue(product.quantity)} units sold</div>
              </div>
            </div>
          )) : (
            <p className="py-6 text-center text-sm text-gray-400">No sales yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopSellingItems;

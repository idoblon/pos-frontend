import React from "react";
import { useSelector } from "react-redux";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const numberValue = (value) => Number(value) || 0;
const money = (value) => `Rs ${numberValue(value).toLocaleString()}`;

const RefundsTable = ({ shiftData: propData } = {}) => {
  const reduxData = useSelector((state) => state.shiftReport?.currentShift);
  const shiftData = propData ?? reduxData;

  return (
    <Card className="rounded-lg py-0">
      <CardContent className="p-4">
        <h2 className="mb-3 text-base font-semibold text-gray-900">Refunds</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Refund ID</TableHead>
                <TableHead className="text-xs">Order ID</TableHead>
                <TableHead className="text-xs">Reason</TableHead>
                <TableHead className="text-right text-xs">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shiftData?.refunds?.length > 0 ? shiftData.refunds.map((refund, index) => (
                <TableRow key={refund.id || refund.refundId || index}>
                  <TableCell className="font-medium text-sm">REF-{refund.id || refund.refundId || "N/A"}</TableCell>
                  <TableCell className="text-sm">ORD-{refund.orderId || refund.order?.id || "N/A"}</TableCell>
                  <TableCell className="max-w-xs truncate text-sm">{refund.reason || "N/A"}</TableCell>
                  <TableCell className="text-right text-sm font-semibold text-red-600">{money(refund.amount || refund.refundAmount)}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="py-6 text-center text-sm text-gray-400">No refunds yet</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RefundsTable;

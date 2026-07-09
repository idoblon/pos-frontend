import React from "react";
import { useSelector } from "react-redux";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const numberValue = (value) => Number(value) || 0;
const money = (value) => `Rs ${numberValue(value).toLocaleString()}`;

const formatDateTime = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};

const RecentOrdersTable = ({ shiftData: propData } = {}) => {
  const reduxData = useSelector((state) => state.shiftReport?.currentShift);
  const shiftData = propData ?? reduxData;

  return (
    <Card className="rounded-lg py-0">
      <CardContent className="p-4">
        <h2 className="mb-3 text-base font-semibold text-gray-900">Recent Orders</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Order ID</TableHead>
                <TableHead className="text-xs">Time</TableHead>
                <TableHead className="text-xs">Payment</TableHead>
                <TableHead className="text-right text-xs">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shiftData?.recentOrders?.length > 0 ? shiftData.recentOrders.map((order, index) => (
                <TableRow key={order.id || order.orderId || index}>
                  <TableCell className="font-medium text-sm">#{order.id || order.orderId || "N/A"}</TableCell>
                  <TableCell className="text-sm">{formatDateTime(order.createdAt || order.date)}</TableCell>
                  <TableCell>
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                      {order.paymentType || order.paymentMethod || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-sm font-semibold">{money(order.totalAmount || order.grandTotal)}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="py-6 text-center text-sm text-gray-400">No orders yet</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentOrdersTable;

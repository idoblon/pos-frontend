import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

const returnReasons = [
  "Wrong product",
  "Damage product",
  "Not interested any more",
  "Other",
];

const refundMethods = ["esewa", "CARD", "CASH"];

const ReturnItemSection = ({ selectedOrder, setShowReturnReciptDialog }) => {
  const [returnReason, setReturnReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [refundMethod, setRefundMethod] = useState("");
  const processRefund = () => {
    console.log("Processing refund for order:", selectedOrder.id);
    console.log("Return Reason:", returnReason);
    console.log("Other Reason:", otherReason);
    console.log("Refund Method:", refundMethod);
    setShowReturnReciptDialog(true);
  };
  return (
    <div className="p-4 w-1/2">
      <Card className="mt-4">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Return Reason</Label>
              <Select
                value={returnReason}
                onValueChange={(value) => setReturnReason(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a Reason..." />
                </SelectTrigger>
                <SelectContent>
                  {returnReasons.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {returnReason === "Other" && (
              <div>
                <Label className="block mb-2">Specify reason</Label>
                <Textarea
                  id="other-reason"
                  placeholder="please specify the return reason"
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                />
              </div>
            )}
            <div>
              <Label className="mb-2 block">Refund Method</Label>
              <Select
                value={refundMethod}
                onValueChange={(value) => setRefundMethod(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a Refund Method..." />
                </SelectTrigger>
                <SelectContent>
                  {refundMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="pt-4 border-t mt-4">
              <div className="flex justify-between text-lg font-semibold mb-4">
                <span>Total Refund Amount: रु {selectedOrder.totalAmount}</span>
              </div>
              <Button onClick={processRefund} className="w-full py-6">
                Process Refund
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReturnItemSection;

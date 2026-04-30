import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Search } from "lucide-react";

const CustomerPaymentSection = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Customer
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-4">
          {/* Search Customer */}
          <div>
            <Label className="text-sm mb-2 block">Search Customer</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Selected Customer Display */}
          {selectedCustomer ? (
            <div className="p-4 border rounded-lg bg-blue-50">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-sm">{selectedCustomer.name}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedCustomer(null)}
                >
                  Change
                </Button>
              </div>
              <p className="text-sm text-gray-600">{selectedCustomer.phone}</p>
              <p className="text-xs text-gray-500 mt-1">{selectedCustomer.email}</p>
            </div>
          ) : (
            <div className="p-8 border-2 border-dashed rounded-lg text-center">
              <User className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-500">No customer selected</p>
              <p className="text-xs text-gray-400 mt-1">Search or walk-in customer</p>
            </div>
          )}

          {/* Walk-in Customer Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setSelectedCustomer({ name: "Walk-in Customer", phone: "N/A", email: "N/A" })}
          >
            Walk-in Customer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerPaymentSection;

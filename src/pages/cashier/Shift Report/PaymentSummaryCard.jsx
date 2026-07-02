import {Card, CardContent} from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import React from 'react'
import { useSelector } from "react-redux";


const PaymentSummaryCard = ({ shiftData: propData } = {}) => {
  const reduxData = useSelector((state) => state.shiftReport.currentShift);
  const shiftData = propData ?? reduxData;
    return (
        <Card className="h-full">
          <CardContent className={"p-4"}>
            <h2 className='text-base font-semibold mb-3 text-gray-900'>Payment Summary</h2>
            <div className='space-y-2'>
              { shiftData?.paymentSummaries?.length > 0 ? shiftData.paymentSummaries.map((payment) => (
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg" key={payment.type}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "#1a1d23", opacity: 0.1 }}>
                      <CreditCard className="h-4 w-4" style={{ color: "#1a1d23" }}/>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{payment.type}</div>
                      <div className="text-xs text-gray-500">{payment.transactionCount} transactions</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900 text-sm">रु{(payment.totalAmount ?? 0).toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{shiftData?.totalSales > 0 ? ((payment.totalAmount / shiftData.totalSales) * 100).toFixed(1) : 0}%</div>
                  </div>
                </div>
              )) : <p className="text-sm text-gray-400 text-center py-4">No payments yet</p> }
            </div>
          </CardContent>
        </Card>
    )
}

export default PaymentSummaryCard
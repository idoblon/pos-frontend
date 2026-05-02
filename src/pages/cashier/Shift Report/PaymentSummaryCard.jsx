import {Card, CardContent} from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import React from 'react'

const shiftData={
  paymentSummaries:[
    {
       type:"CASH",
       totalAmount:3535,
       transactionCount:5
    },
    {
       type:"CARD",
       totalAmount:457456,
       transactionCount:8
    },
    {
       type:"Wallet",
       totalAmount:2566564,
       transactionCount:15
    },
  ],
  totalSales:9879879,
}

const PaymentSummaryCard = () => {
    return (
        <Card className="h-full">
          <CardContent className={"p-4"}>
            <h2 className='text-base font-semibold mb-3 text-gray-900'>Payment Summary</h2>
            <div className='space-y-2'>
              {
                shiftData.paymentSummaries.map((payment) => (
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg" key={payment.type}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-blue-600"/>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{payment.type}</div>
                      <div className="text-xs text-gray-500">{payment.transactionCount} transactions</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900 text-sm">रु{payment.totalAmount.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{((payment.totalAmount/shiftData.totalSales) * 100).toFixed(1)}%</div>
                  </div>
                </div>
                ))
              }
            </div>
          </CardContent>
        </Card>
    )
}

export default PaymentSummaryCard
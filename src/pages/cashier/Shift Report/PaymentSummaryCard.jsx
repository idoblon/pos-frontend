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
        <Card>
          <CardContent className={"p-6"}>
            <h2 className='text-xl font-semibold mb-4'>Payment Summary</h2>
            <div className='space-y-4'>
              {
                shiftData.paymentSummaries:((payment)=>
                <div className="flex itmes-center" key={payment.type}>
                  <div className="w-10 h-10 roudned-full bg-primary/10 flex items-cneter justify-center mr-4">
                  <CreditCard/>
                  </div>
                  <div className="flex-1">
                    <div className="flex-justify-between"
                    <span className="font-medium">{Payment.type}</span>
                    <span className="font-bold">रु{payment.totalAmount}</span>
                  </div>
                  <div className="flex justify-betwee text-sm text-muted-foreground">
                    <span>{payment.transactionCount}transactions</span>
                    <span>{((paymetn.totalAmount/shiftData.totalSales) * 100).toFixed(1)}%</span>
                  </div>
                </div>)
              }
            </div>
          </CardContent>
        </Card>
    )
}

export default PaymentSummaryCard
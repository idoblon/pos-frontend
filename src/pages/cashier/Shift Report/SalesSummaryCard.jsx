import {Card, CardContent} from '@/components/ui/card'
import React from 'react'
const shiftData={
    cashier:{
        fullName:"Pablo Escobar"
    },
    shiftStart:"Aug 8, 2026, 09:34 AM",
    shiftEnd:"",
    totalOrders:56,
    totalSales:9879879,
    totalRefund:32423,
    netSales:4500000
}

const SalesSummaryCard = () => {
    return (
       <Card>
       <CardContent>
                <h2 className ='text-xl font-semibold mb-4'>Sales Summary</h2>
                  <div className="space-y-2">
                      <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Orders: </span>
                          <span className="font-medium">{shiftData.totalOrders}</span>
                  </div>
      
                   <div className="space-y-2">
                      <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Sales: </span>
                          <span className="font-medium">रु{shiftData.totalSales}</span>
                  </div>
      
                   <div className="space-y-2">
                      <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Refun: </span>
                          <span className="font-medium text-red-500">{shiftData.totalRefund}</span>
                  </div>
                   <div className="space-y-2">
                      <div className="flex justify-between border-t">
                          <span className="text-muted-foreground">Net Sales: </span>
                          <span className="font-medium">रु{shiftData.netSales}</span>
                  </div>
               </div>
              </CardContent>
           </Card>
    )
}

export default SalesSummaryCard
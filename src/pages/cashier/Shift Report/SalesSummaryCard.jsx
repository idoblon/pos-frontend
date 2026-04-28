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
       <Card className="h-full">
       <CardContent className="p-6">
                <h2 className='text-lg font-semibold mb-4 text-gray-900'>Sales Summary</h2>
                <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-sm text-gray-600">Total Orders</span>
                        <span className="font-semibold text-gray-900">{shiftData.totalOrders}</span>
                    </div>
      
                    <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-sm text-gray-600">Total Sales</span>
                        <span className="font-semibold text-green-600">रु{shiftData.totalSales.toLocaleString()}</span>
                    </div>
      
                    <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-sm text-gray-600">Total Refund</span>
                        <span className="font-semibold text-red-600">रु{shiftData.totalRefund.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 bg-gray-50 px-3 rounded-lg mt-2">
                        <span className="text-base font-semibold text-gray-900">Net Sales</span>
                        <span className="text-xl font-bold text-green-600">रु{shiftData.netSales.toLocaleString()}</span>
                    </div>
                </div>
              </CardContent>
           </Card>
    )
}

export default SalesSummaryCard
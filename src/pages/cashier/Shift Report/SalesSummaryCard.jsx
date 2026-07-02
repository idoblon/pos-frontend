import { useSelector } from 'react-redux'
import {Card, CardContent} from '@/components/ui/card'
import React from 'react'


const SalesSummaryCard = ({ shiftData: propData } = {}) => {
    const reduxData = useSelector(state => state.shiftReport?.currentShift);
    const shiftData = propData ?? reduxData;
    return (
       <Card className="h-full">
       <CardContent className="p-4">
                <h2 className='text-base font-semibold mb-3 text-gray-900'>Sales Summary</h2>
                <div className="space-y-2">
                    <div className="flex justify-between items-center py-1.5 border-b">
                        <span className="text-sm text-gray-600">Total Orders</span>
                        <span className="font-semibold text-gray-900 text-sm">{shiftData?.totalOrders}</span>
                    </div>
      
                    <div className="flex justify-between items-center py-1.5 border-b">
                        <span className="text-sm text-gray-600">Total Sales</span>
                        <span className="font-semibold text-gray-900 text-sm">रु{shiftData?.totalSales?.toLocaleString()}</span>
                    </div>
      
                    <div className="flex justify-between items-center py-1.5 border-b">
                        <span className="text-sm text-gray-600">Total Refund</span>
                        <span className="font-semibold text-red-600 text-sm">रु{shiftData?.totalRefunds?.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 bg-gray-50 px-3 rounded-lg mt-2">
                        <span className="text-sm font-semibold text-gray-900">Net Sales</span>
                        <span className="text-lg font-bold text-gray-900">रु{shiftData?.netSale?.toLocaleString()}</span>
                    </div>
                </div>
              </CardContent>
           </Card>
    )
}

export default SalesSummaryCard
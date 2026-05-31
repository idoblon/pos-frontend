import { Card, CardContent } from '@/components/ui/card'
import React from 'react'
import { useSelector } from 'react-redux'



const TopSellingItems = () => {
    const shiftData=useSelector((state)=> state.shiftReport?.currentShift);
    return (
       <Card className="h-full">
        <CardContent className="p-4">
            <h2 className='text-base font-semibold mb-3 text-gray-900'>Top Selling Items</h2>
            <div className='space-y-2'>
                {shiftData?.topSellingProducts?.length > 0 ? shiftData.topSellingProducts.map((product, index) => (
                <div key={product.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                        {index+1}
                    </div>
                    <div className="flex-1">
                        <div className='flex justify-between items-center'>
                            <span className="font-medium text-gray-900 text-sm">{product.name}</span>
                            <span className="font-semibold text-gray-900 text-sm">रु{(product.sellingPrice ?? 0).toLocaleString()}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                            {product.quantity} units sold
                        </div>
                    </div>
                </div>
                )) : <p className="text-sm text-gray-400 text-center py-4">No sales yet</p>}
            </div>
        </CardContent>
       </Card>
    )
}

export default TopSellingItems
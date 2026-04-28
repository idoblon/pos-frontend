import {Card, CardContent} from '@/components/ui/card'
import React from 'react'

const shiftData={
    TopSellingProducts:[
        {id:"1",  
            name:"books",
            sellingPrice:23,
            quantity: 5,
        },
         {id:"2",    
            name:"grocery",
            sellingPrice:25,
            quantity: 54,
        },
    ]
}

const TopSellingItems = () => {
    return (
       <Card className="h-full">
        <CardContent className="p-6">
            <h2 className='text-lg font-semibold mb-4 text-gray-900'>Top Selling Items</h2>
            <div className='space-y-3'>
                {shiftData.TopSellingProducts.map((product, index) => (
                <div key={product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                        {index+1}
                    </div>
                    <div className="flex-1">
                        <div className='flex justify-between items-center'>
                            <span className="font-medium text-gray-900">{product.name}</span>
                            <span className="font-semibold text-gray-900">रु{product.sellingPrice.toLocaleString()}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            {product.quantity} units sold
                        </div>
                    </div>
                </div>
                ))}
            </div>
        </CardContent>
       </Card>
    )
}

export default TopSellingItems
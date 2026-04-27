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
       <Card>
        <CardContent>
            <h2 className='text-x1 font-semibold mb-4'>Top Selling Items</h2>
            <div className='space-y-3'>
                {shiftData.TopSellingProducts.map((product)=>
                <div key={product.id} className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-3 text-sm font-medium">
                    {index+1}
                    <div className="flex-0">
                        <div className='flex justify-between'>
                            <span>{product.name}</span>
                            <span>रु{product.sellingPrice}</span>
                    </div>
                    <div className="flex justify-betwenn text-sm text-muted-foreground">
                        <span>{product.quantity} units sold</span>
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
import { Badge } from 'lucide-react'
import {Card, CardContent} from "@/components/ui/card"
import React from 'react'

const OrderInformation = ({selectedOrder}) => {
  return (
    <Card>
      <CardContent className={"p-4"}>
        <h3 className='font-semiblod mb-2'>Order Information</h3>
        <div className='space-y-1 text-sm'>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Date :</span>
            <span>{selectedOrder.createdAt}</span>

          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Status :</span>
            <Badge className={"capitalize"}>
              {selectedOrder.status}
            </Badge>

          </div>
          <div className='flex justify-between'>
               <span className='text-muted-foreground'>Payment Method :</span>
               <span>{selectedOrder.paymentType}</span>
            <div className='flex justify-between'>
               <span className='text-muted-foreground'>Total Amount:</span>
               <span>रु {selectedOrder.totalAmount}</span>

          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default OrderInformation
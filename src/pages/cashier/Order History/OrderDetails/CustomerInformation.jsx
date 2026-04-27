import { Badge } from 'lucide-react'
import {Card, CardContent} from "@/components/ui/card"
import React from 'react'

const CustomerInformation = () => {
  return (
    <Card>
      <CardContent className={"p-4"}>
        <h3 className='font-semiblod mb-2'>Customer Information</h3>
        <div className='space-y-1 text-sm'>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Name:</span>
            <span>{selectedOrder.customer.fullName}</span>

          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Phone :</span>
            <Badge className={"capitalize"}>
              {selectedOrder.customer.phone}
            </Badge>

          </div>
        
        </div>
      </CardContent>
    </Card>
  )
}

export default CustomerInformation
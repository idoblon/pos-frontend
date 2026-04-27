import {Card} from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import React from 'react'

const OrderItemTable = ({selectedOrder}) => {
  return (
    <Card>
           <CardContent>
               <h2 className='text-xl font-semiblod mb-4'>Order Items</h2>
               <Table>
                   <TableHeader>
                       <TableRow>
                           <TableHead className="w-[150px]">Image</TableHead>
                           <TableHead className="w-[150px]">Item</TableHead>
                           <TableHead className="w-[150px]">Quantity</TableHead>
                           <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                       </TableRow>
                   </TableHeader>
                   <TableBody>
                       {selectedOrder.items.map((item)=>(
                           <TableRow key={item.id}>
                               <TableCell>
                                <div className='w-10 h-10'>
                                  {item.product?.image && <img src={item.product.image} className='w-10 h-10 object-cover rounded-md'/>}
                                </div>
                               </TableCell>
                               <TableCell>
                                <div className='flex flex-col'>
                                  <span className='font-medium'>{item.product.name.slice(0,20)}...</span>
                                  <span className='text-xs text-grey-500'>SKU l{item.product?.sku}</span>
                                </div>
                               </TableCell>
                               <TableCell>{item.quantity}</TableCell>
                               <TableCell>रु {item.product?.sellingPrice}</TableCell>
                               <TableCell className="text-right">रु {(item.product.sellingPrice*item.quantity)?.toFixed(1)}</TableCell>
                           </TableRow>
                       ))}
                   </TableBody>
               </Table>
           </CardContent>
          </Card>
  )
}

export default OrderItemTable
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import React from 'react'

const orders=[
  {
    id:1,
    createdAt:"Jul 8, 2025, 12:37 PM",
    customer:{
      fullName:"Pablo Escobar",
      phone:"123243435"
    },
    totalAmount:2134,
    paymentType:"CASH",
    status:"COMPLETED",
    items:[
      {
        id:2,
        prodcut:{
          image:"",
          name:"Product 1",
          sku:"PROD001",
          sellingPrice:"123"
        },
        quantity:2
      }
    ]
  }
]
const OrderTable = ({handleViewOrderDetails}) => {
  return (
    <div>
       <h2 className='text-xl font-semiblod mb-4'>Recent Order</h2>
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead className="w-[150px]">Order Id</TableHead>
                              <TableHead className="w-[150px]">Date/Time</TableHead>
                              <TableHead className="w-[150px]">Customer</TableHead>
                              <TableHead className="">Amount</TableHead>
                               <TableHead className="">Payment Type</TableHead>
                                <TableHead className="">Status</TableHead>
                                 <TableHead className="text-right">Action</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {orders.map((order)=>(
                              <TableRow key={order.id}>
                                  <TableCell>{order.id}</TableCell>
                                  <TableCell>{order.createdAt}</TableCell>
                                   <TableCell>{order.customer?.fullName}</TableCell>
                                    <TableCell>रु {order.totalAmount}</TableCell>
                                  <TableCell>{order.paymentType}</TableCell>
                                   <TableCell>{order.status}</TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                      <Button onClick={
                                        () => handleViewOrderDetails(order)
                                      } variant={"ghost"} size="icon">
                                        <EyeIcon className="h-4 w-4"/>
                                      </Button>

                                       <Button variant={"ghost"} size="icon">
                                        <Printer className="h-4 w-4"/>
                                      </Button>
                                    </div>
                                  </TableCell>
                              </TableRow>
                          ))}
                      </TableBody>
                  </Table>
    </div>
  )
}

export default OrderTable
import {Card} from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import React from 'react';

const shiftData = {
    recentOrders:[
        {
            id:1,
            createdAt:"01:25 PM",
            paymentType:"CASH",
            totalAmount:5958
        },
        {
            id:2,
            createdAt:"03:25 PM",
            paymentType:"CARD",
            totalAmount:6564
        },
        {
            id:3,
            createdAt:"11:25 PM",
            paymentType:"CASH",
            totalAmount:54348
        }
    ]
}
const RecentOrdersTable = () => {
    return (
       <Card>
        <CardContent>
            <h2 className='text-xl font-semiblod mb-4'>Recent Order</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[150px]">Order Id</TableHead>
                        <TableHead className="w-[150px]">Time</TableHead>
                        <TableHead className="w-[150px]">Payment</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {shiftData.recentOrders.map((order)=>(
                        <TableRow key={order.id}>
                            <TableCell>{order.id}</TableCell>
                            <TableCell>{order.createdAt}</TableCell>
                            <TableCell>{order.paymentType}</TableCell>
                            <TableCell className="text-right">रु {order.totalAmount}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
       </Card>
    )
}

export default RecentOrdersTable
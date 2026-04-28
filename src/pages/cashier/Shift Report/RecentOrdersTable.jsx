import {Card, CardContent} from '@/components/ui/card'
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
        <CardContent className="p-6">
            <h2 className='text-lg font-semibold mb-4 text-gray-900'>Recent Orders</h2>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {shiftData.recentOrders.map((order)=>(
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">#{order.id}</TableCell>
                                <TableCell>{order.createdAt}</TableCell>
                                <TableCell>
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                        {order.paymentType}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right font-semibold">रु {order.totalAmount.toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
       </Card>
    )
}

export default RecentOrdersTable
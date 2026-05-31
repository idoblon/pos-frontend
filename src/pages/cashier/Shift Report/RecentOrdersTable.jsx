import {Card, CardContent} from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import React from 'react';
import { useSelector } from 'react-redux';


const RecentOrdersTable = () => {
    const shiftData=useSelector((state)=> state.shiftReport?.currentShift);
    return (
       <Card>
        <CardContent className="p-4">
            <h2 className='text-base font-semibold mb-3 text-gray-900'>Recent Orders</h2>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-xs">Order ID</TableHead>
                            <TableHead className="text-xs">Time</TableHead>
                            <TableHead className="text-xs">Payment</TableHead>
                            <TableHead className="text-right text-xs">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {shiftData?.recentOrders?.length > 0 ? shiftData.recentOrders.map((order)=>(
                            <TableRow key={order.id}>
                                <TableCell className="font-medium text-sm">#{order.id}</TableCell>
                                <TableCell className="text-sm">{order.createdAt}</TableCell>
                                <TableCell>
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                                        {order.paymentType}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right font-semibold text-sm">रु {(order.totalAmount ?? 0).toLocaleString()}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow><TableCell colSpan={4} className="text-center text-gray-400 text-sm py-4">No orders yet</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
       </Card>
    )
}

export default RecentOrdersTable
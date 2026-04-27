import {Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import React from 'react';

const shiftData={
    refunds:[
        {
            id:12,
            orderId:3,
            reason:"wrong product received",
            amount:2355
        }
    ]
}

const RefundsTable = () => {
    return (
         <Card>
        <CardContent>
            <h2 className='text-xl font-semiblod mb-4'>Recent Order</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[150px]">Refund Id</TableHead>
                        <TableHead className="w-[150px]">Order ID</TableHead>
                        <TableHead className="w-[150px]">Reason</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {shiftData.recentOrders.map((refund)) => (
                        <TableRow key={refund.id}>
                            <TableCell>RED - {refund.id}</TableCell>
                            <TableCell>ORD - {refund.orderId}</TableCell>
                            <TableCell>{refund.reason}</TableCell>
                            <TableCell className="text-right">रु {refund.amount}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
       </Card>
    )
}

export default RefundsTable
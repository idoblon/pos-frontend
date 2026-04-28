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
        <CardContent className="p-6">
            <h2 className='text-lg font-semibold mb-4 text-gray-900'>Refunds</h2>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Refund ID</TableHead>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {shiftData.refunds.map((refund) => (
                            <TableRow key={refund.id}>
                                <TableCell className="font-medium">REF-{refund.id}</TableCell>
                                <TableCell>ORD-{refund.orderId}</TableCell>
                                <TableCell className="max-w-xs truncate">{refund.reason}</TableCell>
                                <TableCell className="text-right font-semibold text-red-600">रु {refund.amount.toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
       </Card>
    )
}

export default RefundsTable
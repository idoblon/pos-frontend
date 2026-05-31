import {Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import React from 'react';
import { useSelector } from "react-redux";



const RefundsTable = () => {
    const shiftData=useSelector((state)=> state.shiftReport?.currentShift);
    return (
         <Card>
        <CardContent className="p-4">
            <h2 className='text-base font-semibold mb-3 text-gray-900'>Refunds</h2>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-xs">Refund ID</TableHead>
                            <TableHead className="text-xs">Order ID</TableHead>
                            <TableHead className="text-xs">Reason</TableHead>
                            <TableHead className="text-right text-xs">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {shiftData?.refunds?.length > 0 ? shiftData.refunds.map((refund) => (
                            <TableRow key={refund.id}>
                                <TableCell className="font-medium text-sm">REF-{refund.id}</TableCell>
                                <TableCell className="text-sm">ORD-{refund.orderId}</TableCell>
                                <TableCell className="max-w-xs truncate text-sm">{refund.reason}</TableCell>
                                <TableCell className="text-right font-semibold text-red-600 text-sm">रु {(refund.amount ?? 0).toLocaleString()}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow><TableCell colSpan={4} className="text-center text-gray-400 text-sm py-4">No refunds yet</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
       </Card>
    )
}

export default RefundsTable
import {Card, CardContent} from "@/components/ui/card";
import React from "react";

const shiftData={
    cashier:{
        fullName:"Pablo Escobar"
    },
    shiftStart:"Aug 8, 2026, 09:34 AM",
    shiftEnd:""
}
const ShiftInformation = () => {
    return (
     <Card className="h-full">
        <CardContent className="p-6">
            <h2 className='text-lg font-semibold mb-4 text-gray-900'>Shift Information</h2>
            <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-gray-600">Cashier</span>
                    <span className="font-medium text-gray-900">{shiftData.cashier.fullName}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-gray-600">Shift Start</span>
                    <span className="font-medium text-gray-900">{shiftData.shiftStart}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-gray-600">Shift End</span>
                    <span className="font-medium text-gray-900">{shiftData.shiftEnd ? shiftData.shiftEnd : "Ongoing"}</span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">Duration</span>
                    <span className="font-medium text-gray-900">{"8 hours"}</span>
                </div>
            </div>
        </CardContent>
     </Card>
    )
}

export default ShiftInformation
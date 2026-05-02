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
        <CardContent className="p-4">
            <h2 className='text-base font-semibold mb-3 text-gray-900'>Shift Information</h2>
            <div className="space-y-2">
                <div className="flex justify-between items-center py-1.5 border-b">
                    <span className="text-sm text-gray-600">Cashier</span>
                    <span className="font-medium text-gray-900 text-sm">{shiftData.cashier.fullName}</span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b">
                    <span className="text-sm text-gray-600">Shift Start</span>
                    <span className="font-medium text-gray-900 text-sm">{shiftData.shiftStart}</span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b">
                    <span className="text-sm text-gray-600">Shift End</span>
                    <span className="font-medium text-gray-900 text-sm">{shiftData.shiftEnd ? shiftData.shiftEnd : "Ongoing"}</span>
                </div>
                
                <div className="flex justify-between items-center py-1.5">
                    <span className="text-sm text-gray-600">Duration</span>
                    <span className="font-medium text-gray-900 text-sm">{"8 hours"}</span>
                </div>
            </div>
        </CardContent>
     </Card>
    )
}

export default ShiftInformation
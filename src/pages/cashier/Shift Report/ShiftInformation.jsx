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
     <Card>
        <CardContent>
            <h2 className ='text-xl font-semibold mb-4'>Shift Information</h2>
            <div className="space-y-2">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Cashier: </span>
                    <span className="font-medium">{shiftData.cashier.fullName}</span>
            </div>

             <div className="space-y-2">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Shift Start: </span>
                    <span className="font-medium">{shiftData.shiftStart}</span>
            </div>

             <div className="space-y-2">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Shift End: </span>
                    <span className="font-medium">{shiftData.shiftEnd?shiftData.shiftEnd:"ongoing"}</span>
            </div>
             <div className="space-y-2">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration: </span>
                    <span className="font-medium">{"8 hours"}</span>
            </div>
         </div>
        </CardContent>
     </Card>
    )
}

export default ShiftInformation
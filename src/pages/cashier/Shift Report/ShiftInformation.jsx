import { useDispatch, useSelector } from 'react-redux';
import {Card, CardContent} from "@/components/ui/card";
import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import secureStorage from "@/util/secureStorage";

const ShiftInformation = () => {
    const shiftData = useSelector(state => state.shiftReport?.currentShift);
    const [currentShiftHours, setCurrentShiftHours] = useState(0);

    // Calculate current shift duration
    useEffect(() => {
        if (shiftData?.shiftStart) {
            const startTime = new Date(shiftData.shiftStart);
            const endTime = shiftData.shiftEnd ? new Date(shiftData.shiftEnd) : new Date();
            const hours = (endTime - startTime) / (1000 * 60 * 60);
            setCurrentShiftHours(Math.max(0, Math.round(hours * 10) / 10));
        }
    }, [shiftData]);

    return (
        <div className="space-y-4">
            {/* Current Shift Information */}
            <Card className="h-full">
                <CardContent className="p-4">
                    <h2 className='text-base font-semibold mb-3 text-gray-900'>Current Shift Information</h2>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center py-1.5 border-b">
                            <span className="text-sm text-gray-600">Cashier</span>
                            <span className="font-medium text-gray-900 text-sm">{shiftData?.cashier?.fullName || 'N/A'}</span>
                        </div>

                        <div className="flex justify-between items-center py-1.5 border-b">
                            <span className="text-sm text-gray-600">Shift Start</span>
                            <span className="font-medium text-gray-900 text-sm">
                                {shiftData?.shiftStart ? new Date(shiftData.shiftStart).toLocaleString() : 'N/A'}
                            </span>
                        </div>

                        <div className="flex justify-between items-center py-1.5 border-b">
                            <span className="text-sm text-gray-600">Shift End</span>
                            <span className="font-medium text-gray-900 text-sm">
                                {shiftData?.shiftEnd ? new Date(shiftData.shiftEnd).toLocaleString() : "Ongoing"}
                            </span>
                        </div>
                        
                        <div className="flex justify-between items-center py-1.5">
                            <span className="text-sm text-gray-600 flex items-center gap-1">
                                <Clock size={12} />
                                Duration
                            </span>
                            <span className={`font-medium text-sm ${
                                currentShiftHours > 10 ? 'text-red-600' : 'text-gray-900'
                            }`}>
                                {currentShiftHours}h
                                {currentShiftHours > 10 && (
                                    <span className="ml-1 text-xs bg-red-100 text-red-600 px-1 rounded">OT</span>
                                )}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default ShiftInformation
import { useDispatch, useSelector } from 'react-redux';
import {Card, CardContent} from "@/components/ui/card";
import React, { useState, useEffect } from "react";
import { Clock, Calendar, TrendingUp } from "lucide-react";
import { getShiftsByBranch } from "@/Redux Toolkit/Features/shiftReport/shiftReportThunk";
import secureStorage from "@/util/secureStorage";

const ShiftInformation = () => {
    const dispatch = useDispatch();
    const shiftData = useSelector(state => state.shiftReport?.currentShift);
    const { shiftsByBranch } = useSelector(state => state.shiftReport);
    const userData = secureStorage.getUserData();
    const branchId = userData?.branchId;
    const userId = userData?.userId;

    const [currentShiftHours, setCurrentShiftHours] = useState(0);

    useEffect(() => {
        if (branchId) {
            dispatch(getShiftsByBranch(branchId));
        }
    }, [dispatch, branchId]);

    // Calculate current shift duration
    useEffect(() => {
        if (shiftData?.shiftStart) {
            const startTime = new Date(shiftData.shiftStart);
            const endTime = shiftData.shiftEnd ? new Date(shiftData.shiftEnd) : new Date();
            const hours = (endTime - startTime) / (1000 * 60 * 60);
            setCurrentShiftHours(Math.max(0, Math.round(hours * 10) / 10));
        }
    }, [shiftData]);

    // Calculate monthly working hours
    const getMonthlyHours = () => {
        if (!shiftsByBranch || !userId) return { totalHours: 0, shiftsCount: 0, avgHours: 0 };
        
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const userShifts = shiftsByBranch.filter(shift => {
            const matchesUser = shift.cashierId === userId || shift.userId === userId || shift.employeeId === userId;
            if (!matchesUser || !shift.startTime) return false;
            
            const shiftDate = new Date(shift.startTime);
            return shiftDate.getMonth() === currentMonth && shiftDate.getFullYear() === currentYear;
        });
        
        let totalHours = 0;
        userShifts.forEach(shift => {
            if (shift.startTime) {
                const start = new Date(shift.startTime);
                const end = shift.endTime ? new Date(shift.endTime) : new Date();
                const hours = (end - start) / (1000 * 60 * 60);
                totalHours += Math.max(0, hours);
            }
        });
        
        return {
            totalHours: Math.round(totalHours * 10) / 10,
            shiftsCount: userShifts.length,
            avgHours: userShifts.length > 0 ? Math.round((totalHours / userShifts.length) * 10) / 10 : 0
        };
    };

    const monthlyStats = getMonthlyHours();
    const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'long' });
    const isOvertime = monthlyStats.totalHours > 160; // 160 hours per month threshold

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

            {/* Monthly Working Hours Summary */}
            <Card className="h-full">
                <CardContent className="p-4">
                    <h2 className='text-base font-semibold mb-3 text-gray-900 flex items-center gap-2'>
                        <TrendingUp size={16} className="text-blue-600" />
                        My Working Hours ({currentMonthName})
                    </h2>
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 p-3 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <Clock size={14} className="text-blue-600" />
                                    <span className="text-xs text-blue-600 font-medium">Total Hours</span>
                                </div>
                                <p className={`text-lg font-bold ${
                                    isOvertime ? 'text-red-600' : 'text-blue-600'
                                }`}>
                                    {monthlyStats.totalHours}h
                                    {isOvertime && (
                                        <span className="ml-1 text-xs bg-red-100 text-red-600 px-1 rounded">OT</span>
                                    )}
                                </p>
                            </div>
                            
                            <div className="bg-green-50 p-3 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <Calendar size={14} className="text-green-600" />
                                    <span className="text-xs text-green-600 font-medium">Shifts</span>
                                </div>
                                <p className="text-lg font-bold text-green-600">{monthlyStats.shiftsCount}</p>
                            </div>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Average per shift</span>
                                <span className="font-medium text-gray-900">{monthlyStats.avgHours}h</span>
                            </div>
                        </div>
                        
                        {isOvertime && (
                            <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                                <p className="text-xs text-red-600 font-medium">⚠️ Overtime Alert</p>
                                <p className="text-xs text-red-500 mt-1">
                                    You have worked {monthlyStats.totalHours - 160}h overtime this month
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default ShiftInformation
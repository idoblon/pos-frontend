import { useSelector } from "react-redux";
import { Card, CardContent } from "@/components/ui/card";
import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

const STANDARD_SHIFT_HOURS = 9;

const ShiftInformation = () => {
  const shiftData = useSelector((state) => state.shiftReport?.currentShift);
  const [shiftMetrics, setShiftMetrics] = useState({
    regularHours: 0,
    overtimeHours: 0,
    totalHours: 0,
    expectedEndTime: null,
  });

  const calculateMetrics = () => {
    if (shiftData?.shiftStart) {
      // Fix: append 'Z' only if no timezone info present
      const rawStart = shiftData.shiftStart;
      const fixedStart =
        rawStart.includes("Z") || rawStart.includes("+")
          ? rawStart
          : rawStart + "Z";

      const startTime = new Date(fixedStart);
      const endTime = shiftData.shiftEnd
        ? new Date(
            shiftData.shiftEnd.includes("Z") || shiftData.shiftEnd.includes("+")
              ? shiftData.shiftEnd
              : shiftData.shiftEnd + "Z",
          )
        : new Date();

      const totalMillis = endTime - startTime;
      const totalHours = totalMillis / (1000 * 60 * 60);

      const expectedEnd = new Date(startTime);
      expectedEnd.setHours(expectedEnd.getHours() + STANDARD_SHIFT_HOURS);

      const regularHours = Math.min(totalHours, STANDARD_SHIFT_HOURS);
      const overtimeHours = Math.max(0, totalHours - STANDARD_SHIFT_HOURS);

      setShiftMetrics({
        regularHours: Math.round(regularHours * 10) / 10,
        overtimeHours: Math.round(overtimeHours * 10) / 10,
        totalHours: Math.round(totalHours * 10) / 10,
        expectedEndTime: expectedEnd,
      });
    }
  };

  // Recalculate every minute so duration stays live
  useEffect(() => {
    calculateMetrics();
    const interval = setInterval(calculateMetrics, 60000);
    return () => clearInterval(interval);
  }, [shiftData]);

  const formatDuration = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <div className="space-y-4">
      <Card className="h-full">
        <CardContent className="p-4">
          <h2 className="text-base font-semibold mb-3 text-gray-900">
            Current Shift Information
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center py-1.5 border-b">
              <span className="text-sm text-gray-600">Cashier</span>
              <span className="font-medium text-gray-900 text-sm">
                {shiftData?.cashier?.fullName || "N/A"}
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b">
              <span className="text-sm text-gray-600">Shift Start</span>
              <span className="font-medium text-gray-900 text-sm">
                {shiftData?.shiftStart
                  ? new Date(
                      shiftData.shiftStart.includes("Z") ||
                        shiftData.shiftStart.includes("+")
                        ? shiftData.shiftStart
                        : shiftData.shiftStart + "Z",
                    ).toLocaleString()
                  : "N/A"}
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b">
              <span className="text-sm text-gray-600">Expected Shift End</span>
              <span className="font-medium text-gray-900 text-sm">
                {shiftMetrics.expectedEndTime
                  ? shiftMetrics.expectedEndTime.toLocaleString()
                  : "N/A"}
                <span className="ml-2 text-xs text-gray-500">(9 hrs)</span>
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5">
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <Clock size={12} />
                Duration
              </span>
              <div className="text-right">
                {shiftMetrics.overtimeHours > 0 ? (
                  <div className="font-medium text-sm">
                    <span className="text-gray-900">9h</span>
                    <span className="mx-1 text-gray-500">+</span>
                    <span className="text-red-600 font-semibold">
                      {formatDuration(shiftMetrics.overtimeHours)} OT
                    </span>
                  </div>
                ) : (
                  <div className="font-medium text-sm text-gray-900">
                    {formatDuration(shiftMetrics.totalHours)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShiftInformation;

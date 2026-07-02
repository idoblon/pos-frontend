import { useSelector } from "react-redux";
import { Card, CardContent } from "@/components/ui/card";
import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

const STANDARD_SHIFT_HOURS = 9;

const parseShiftTime = (raw) => {
  if (!raw) return null;
  // Backend sends local time strings without timezone — parse as-is (local)
  return new Date(raw);
};

const formatTime = (date) =>
  date
    ? date.toLocaleString(undefined, {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "N/A";

const formatDurationFromHours = (hours) => {
  const totalMinutes = Math.max(0, Math.round((hours || 0) * 60));
  const totalHours = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  // If less than 24 hours, show hours and minutes normally
  if (totalHours < 24) {
    if (totalHours === 0) return `${m}m`;
    return m > 0 ? `${totalHours}h ${m}m` : `${totalHours}h`;
  }

  // If 24 hours or more, show days + extra hours
  const days = Math.floor(totalHours / 24);
  const h = totalHours % 24;

  if (h === 0) return `${days}d`;
  return `${days}d ${h}h`;
};

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
      const rawStart = parseShiftTime(shiftData.shiftStart);
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      // Use the later of shiftStart or today's midnight — so only today's duration counts
      const startTime = rawStart < todayStart ? todayStart : rawStart;
      const endTime = shiftData.shiftEnd ? parseShiftTime(shiftData.shiftEnd) : new Date();

      const totalHours = (endTime - startTime) / (1000 * 60 * 60);
      const expectedEnd = new Date(startTime.getTime() + STANDARD_SHIFT_HOURS * 60 * 60 * 1000);

      setShiftMetrics({
        regularHours: Math.round(Math.min(totalHours, STANDARD_SHIFT_HOURS) * 10) / 10,
        overtimeHours: Math.round(Math.max(0, totalHours - STANDARD_SHIFT_HOURS) * 10) / 10,
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

  return (
    <div className="space-y-4">
      <Card className="h-full">
        <CardContent className="p-4">
          <h2 className="text-base font-semibold mb-3 text-gray-900">
            Current Shift Information
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center py-1.5 border-b">
              <span className="text-sm text-gray-600">Staff</span>
              <span className="font-medium text-gray-900 text-sm">
                {shiftData?.cashier?.fullName || "N/A"}
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b">
              <span className="text-sm text-gray-600">Shift Start</span>
              <span className="font-medium text-gray-900 text-sm">
                {formatTime(parseShiftTime(shiftData?.shiftStart))}
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b">
              <span className="text-sm text-gray-600">Expected Shift End</span>
              <span className="font-medium text-gray-900 text-sm">
                {formatTime(shiftMetrics.expectedEndTime)}
                <span className="ml-2 text-xs text-gray-500">(9 hrs)</span>
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5">
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <Clock size={12} />
                Duration
              </span>
              <div className="text-right">
                <div className="font-medium text-sm text-gray-900">
                  {formatDurationFromHours(shiftMetrics.totalHours)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShiftInformation;

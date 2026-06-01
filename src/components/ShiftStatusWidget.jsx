import { useState, useEffect } from "react";
import { Clock, AlertTriangle, CheckCircle } from "lucide-react";
import shiftManager from "@/util/shiftManager";

const ShiftStatusWidget = ({ style = {} }) => {
  const [shiftStatus, setShiftStatus] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update shift status every minute
    const updateStatus = () => {
      const status = shiftManager.getCurrentShiftStatus();
      setShiftStatus(status);
      setCurrentTime(new Date());
    };

    // Initial update
    updateStatus();

    // Set up intervals
    const statusInterval = setInterval(updateStatus, 60000); // Every minute
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000); // Every second

    // Listen for overtime events
    const handleOvertime = (event) => {
      updateStatus();
    };

    window.addEventListener('shiftOvertime', handleOvertime);

    return () => {
      clearInterval(statusInterval);
      clearInterval(timeInterval);
      window.removeEventListener('shiftOvertime', handleOvertime);
    };
  }, []);

  if (!shiftStatus) {
    return null;
  }

  const startTime = new Date(shiftStatus.startTime);
  const hoursWorked = parseFloat(shiftStatus.hoursWorked);
  const isOvertime = shiftStatus.isOvertime;
  const remainingHours = parseFloat(shiftStatus.remainingHours);

  const getStatusColor = () => {
    if (isOvertime) return "#dc2626"; // Red for overtime
    if (hoursWorked >= 8) return "#f59e0b"; // Orange for approaching limit
    return "#059669"; // Green for normal
  };

  const getStatusIcon = () => {
    if (isOvertime) return AlertTriangle;
    if (hoursWorked >= 8) return Clock;
    return CheckCircle;
  };

  const StatusIcon = getStatusIcon();
  const statusColor = getStatusColor();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        background: `${statusColor}10`,
        border: `1px solid ${statusColor}30`,
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 600,
        color: statusColor,
        ...style
      }}
    >
      <StatusIcon size={14} />
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span>Shift: {hoursWorked}h worked</span>
          {isOvertime && (
            <span style={{ 
              background: "#dc2626", 
              color: "white", 
              padding: "2px 6px", 
              borderRadius: 4, 
              fontSize: 10 
            }}>
              OVERTIME
            </span>
          )}
        </div>
        <div style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>
          {isOvertime 
            ? `${(hoursWorked - 10).toFixed(1)}h overtime`
            : `${remainingHours}h remaining`
          }
        </div>
      </div>
    </div>
  );
};

export default ShiftStatusWidget;
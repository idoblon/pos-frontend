import { useState, useEffect } from "react";
import { Clock, AlertTriangle, CheckCircle } from "lucide-react";
import shiftManager from "@/util/shiftManager";

const ShiftStatusWidget = ({ style = {} }) => {
  const [shiftStatus, setShiftStatus] = useState(null);

  useEffect(() => {
    // Update shift status every minute
    const updateStatus = () => {
      const status = shiftManager.getCurrentShiftStatus();
      setShiftStatus(status);
    };

    // Initial update
    updateStatus();

    // Set up intervals
    const statusInterval = setInterval(updateStatus, 60000); // Every minute

    // Listen for overtime events
    const handleOvertime = () => {
      updateStatus();
    };

    window.addEventListener('shiftOvertime', handleOvertime);

    return () => {
      clearInterval(statusInterval);
      window.removeEventListener('shiftOvertime', handleOvertime);
    };
  }, []);

  if (!shiftStatus) {
    return null;
  }

  const hoursWorked = parseFloat(shiftStatus.hoursWorked);
  const isOvertime = shiftStatus.isOvertime;
  const remainingHours = parseFloat(shiftStatus.remainingHours);

  const getStatusColor = () => {
    if (isOvertime) return "#dc2626"; // Red for overtime
    if (hoursWorked >= 8) return "#f59e0b"; // Orange for approaching limit
    return "#059669"; // Green for normal
  };

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
      {isOvertime ? (
        <AlertTriangle size={14} />
      ) : hoursWorked >= 8 ? (
        <Clock size={14} />
      ) : (
        <CheckCircle size={14} />
      )}
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
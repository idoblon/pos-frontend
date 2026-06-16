import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BarChart2, TrendingUp, RotateCcw, ShoppingBag, User, Clock } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { getShiftsByBranch } from "@/Redux Toolkit/Features/shiftReport/shiftReportThunk";
import { getOrdersByBranch } from "@/Redux Toolkit/Features/order/orderThunk";
import { getRefundsByBranch } from "@/Redux Toolkit/Features/refund/refundThunk";
import { findBranchEmployee } from "@/Redux Toolkit/Features/Employee/employeeThunk";
import secureStorage from "@/util/secureStorage";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px", fontSize: 12 }}>
      <p style={{ margin: "0 0 4px", fontWeight: 600 }}>{label}</p>
      <p style={{ margin: 0, color: "#1a1d23", fontWeight: 700 }}>
        रु {payload[0].value?.toLocaleString("en-IN")}
      </p>
    </div>
  );
}

export default function BranchReports() {
  const dispatch = useDispatch();
  const userData = secureStorage.getUserData();
  const branchId = userData?.branchId;
  const [range, setRange] = useState("7");

  const { shiftsByBranch } = useSelector((s) => s.shiftReport);
  const { orders } = useSelector((s) => s.order);
  const { refunds } = useSelector((s) => s.refund);
  const { branch } = useSelector((s) => s.branch);
  const { employees } = useSelector((s) => s.employee);

  // Fixed black/grey/white color scheme
  const primaryColor = "#1a1d23";
  const textColor = "#1a1d23";
  const fontFamily = "'DM Sans','Inter',sans-serif";

  const card = {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: "20px",
  };

  useEffect(() => {
    if (!branchId) return;
    dispatch(getShiftsByBranch(branchId));
    dispatch(getOrdersByBranch({ branchId }));
    dispatch(getRefundsByBranch(branchId));
    dispatch(findBranchEmployee({ branchId }));
  }, [dispatch, branchId]);

  const days = Number(range);
  const trendData = Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    const dateStr = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const revenue =
      orders
        ?.filter(
          (o) => new Date(o.createdAt).toISOString().slice(0, 10) === dateStr,
        )
        .reduce((s, o) => s + (o.totalAmount ?? 0), 0) ?? 0;
    return { label, revenue };
  });

  // Use only API data - no mock data
  const displayShifts = shiftsByBranch || [];

  const totalRevenue =
    orders?.reduce((s, o) => s + (o.totalAmount ?? 0), 0) ?? 0;
  const totalRefunds = refunds?.reduce((s, r) => s + (r.amount ?? 0), 0) ?? 0;
  const totalShifts = displayShifts?.length ?? 0;
  const totalOrders = orders?.length ?? 0;

  // Helper function to get cashier name
  const getCashierName = (shift) => {
    // First try to get from shift data
    if (shift.cashierName) return shift.cashierName;
    
    // Try to find employee by cashierId
    if (shift.cashierId && employees) {
      const employee = employees.find(emp => emp.id === shift.cashierId || emp.userId === shift.cashierId);
      if (employee) {
        return employee.fullName || `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.username;
      }
    }
    
    // Fallback to cashierId or unknown
    return shift.cashierId ? `Cashier #${shift.cashierId}` : "Unknown Cashier";
  };

  // Helper function to format shift duration with 10-hour limit
  const getShiftDuration = (shift) => {
    console.log('🔍 DEBUG - Duration calculation for shift:', shift);
    
    // Try multiple possible start time fields
    const startTimeValue = shift.startTime || shift.createdAt || shift.loginTime || shift.shiftStart;
    
    if (!startTimeValue) {
      console.log('❌ DEBUG - No start time found for duration');
      return "No data";
    }
    
    const start = new Date(startTimeValue);
    const end = shift.endTime ? new Date(shift.endTime) : new Date();
    const totalMinutes = Math.floor((end - start) / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    // Check if shift exceeds 10 hours
    const maxHours = 10;
    const isOvertime = hours >= maxHours;
    
    console.log('✅ DEBUG - Duration calculated:', { hours, minutes, isOvertime });
    
    if (isOvertime && !shift.endTime) {
      return `${maxHours}h+ (Overtime!)`;
    }
    
    if (hours === 0) return `${minutes}m`;
    return `${hours}h ${minutes}m`;
  };

  // Helper function to get shift status with overtime check
  const getShiftStatus = (shift) => {
    if (shift.endTime) return { status: "Closed", color: "#6b7280", bg: "#f5f5f5" };
    const startTimeValue = shift.startTime || shift.createdAt || shift.loginTime || shift.shiftStart;
    if (!startTimeValue) return { status: "Unknown", color: "#6b7280", bg: "#f5f5f5" };
    const hours = Math.floor((new Date() - new Date(startTimeValue)) / (1000 * 60 * 60));
    if (hours >= 10) return { status: "Overtime", color: "#6b7280", bg: "#efefef" };
    return { status: "Active", color: "#1a1d23", bg: "#efefef" };
  };

  // Payment breakdown
  const paymentData = ["CASH", "CARD", "ESEWA", "KHALTI"].map((method) => ({
    method,
    total:
      orders
        ?.filter(
          (o) =>
            (o.paymentType ?? o.paymentMethod ?? "").toUpperCase() === method,
        )
        .reduce((s, o) => s + (o.totalAmount ?? 0), 0) ?? 0,
  }));

  return (
    <div
      style={{
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 24,
        background: "#f5f5f5",
        minHeight: "100%",
        fontFamily: fontFamily,
        color: textColor,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
            Analytics & Reports
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6b7280" }}>
            Historical performance analysis and insights
          </p>
        </div>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: "7px 12px",
            fontSize: 13,
            background: "white",
            outline: "none",
            fontFamily: "inherit",
            color: textColor,
          }}
        >
          <option value="7">Last 7 days</option>
          <option value="14">Last 14 days</option>
          <option value="30">Last 30 days</option>
        </select>
      </div>

      {/* Performance Metrics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 14,
        }}
      >
        {[
          {
            label: "Total Revenue",
            value: `रु ${totalRevenue.toLocaleString("en-IN")}`,
            sub: `Avg: रु ${Math.round(totalRevenue / Math.max(days, 1)).toLocaleString("en-IN")}/day`,
            icon: TrendingUp,
            color: "#1a1d23",
          },
          {
            label: "Total Orders",
            value: totalOrders,
            sub: `Avg: ${Math.round(totalOrders / Math.max(days, 1))} orders/day`,
            icon: ShoppingBag,
            color: "#1a1d23",
          },
          {
            label: "Refund Rate",
            value: `${totalOrders > 0 ? (((refunds?.length ?? 0) / totalOrders) * 100).toFixed(1) : 0}%`,
            sub: `रु ${totalRefunds.toLocaleString("en-IN")} refunded`,
            icon: RotateCcw,
            color: "#6b7280",
          },
          {
            label: "Active Shifts",
            value: totalShifts,
            sub: `${Math.round((totalShifts / Math.max(days, 1)) * 7)} shifts/week`,
            icon: BarChart2,
            color: "#6b7280",
          },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} style={{ ...card, padding: "16px 20px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <p style={{ margin: 0, fontSize: 12, color: "#8a909c" }}>
                  {label}
                </p>
                <p
                  style={{
                    margin: "6px 0 2px",
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#1a1d23",
                    letterSpacing: "-0.5px",
                  }}
                >
                  {value}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: "#8a909c" }}>
                  {sub}
                </p>
              </div>
                  <Icon size={18} color={color} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}
      >
        {/* Revenue Trend */}
        <div style={{ ...card, padding: "20px 20px 12px" }}>
          <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700 }}>
            Revenue Trend
          </p>
          <p style={{ margin: "0 0 16px", fontSize: 11, color: "#8a909c" }}>
            Daily revenue for selected period
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={trendData}
              margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="reportGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a1d23" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#1a1d23" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "#8a909c" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#8a909c" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip primaryColor="#1a1d23" />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#1a1d23"
                strokeWidth={2}
                fill="url(#reportGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "#1a1d23" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Breakdown */}
        <div style={card}>
          <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700 }}>
            Payment Breakdown
          </p>
          <p style={{ margin: "0 0 16px", fontSize: 11, color: "#8a909c" }}>
            Revenue by payment method
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={paymentData}
              margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
                vertical={false}
              />
              <XAxis
                dataKey="method"
                tick={{ fontSize: 11, fill: "#8a909c" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#8a909c" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip primaryColor="#1a1d23" />} />
              <Bar dataKey="total" fill="#1a1d23" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Shift Reports Table */}
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>
              Shift History
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "#8a909c" }}>
              Cashier shifts with login times and performance
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <User size={16} color="#6b7280" />
            <span style={{ fontSize: 12, color: "#8a909c" }}>
              {employees?.length || 0} Active Cashiers
            </span>
          </div>
        </div>
        
        {displayShifts?.length === 0 && (
          <div style={{ 
            padding: "12px 16px", 
            background: "#f8fafc", 
            border: "1px solid #e2e8f0", 
            borderRadius: 6, 
            marginBottom: 16,
            textAlign: "center"
          }}>
            <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>
              📊 No shift data available - Shifts will appear here when cashiers log in
            </p>
          </div>
        )}
        {displayShifts?.length === 0 ? (
          <p
            style={{
              color: "#8a909c",
              fontSize: 13,
              textAlign: "center",
              padding: "20px 0",
            }}
          >
            No shift records found
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {[
                    "Shift ID",
                    "Cashier Details",
                    "Login Time",
                    "Duration",
                    "Total Sales",
                    "Status",
                  ].map((h, i) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 16px",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#6b7280",
                        background: "#f5f5f5",
                        textAlign: i === 4 ? "right" : "left",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayShifts?.map((shift, i) => (
                  <tr
                    key={shift.id ?? i}
                    style={{ background: "white" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                  >
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 13,
                        borderBottom: "1px solid #e5e7eb",
                        fontWeight: 600,
                      }}
                    >
                      #{(shift.id ?? "").toString().slice(-6)}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 13,
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: "#f5f5f5",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#1a1d23"
                        }}>
                          {getCashierName(shift).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: textColor }}>
                            {getCashierName(shift)}
                          </p>
                          <p style={{ margin: 0, fontSize: 11, color: "#8a909c" }}>
                            ID: {shift.cashierId || "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 13,
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
                          <Clock size={12} color="#6b7280" />
                          <span style={{ fontSize: 12, fontWeight: 600, color: textColor }}>
                            {(() => {
                              console.log('🔍 DEBUG - Shift data:', shift);
                              console.log('🔍 DEBUG - Start time:', shift.startTime);
                              console.log('🔍 DEBUG - Created at:', shift.createdAt);
                              
                              // Try multiple possible time fields
                              const timeValue = shift.startTime || shift.createdAt || shift.loginTime || shift.shiftStart;
                              
                              if (timeValue) {
                                console.log('✅ DEBUG - Using time value:', timeValue);
                                return new Date(timeValue).toLocaleString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                });
                              } else {
                                console.log('❌ DEBUG - No time value found');
                                return "No login time";
                              }
                            })()
                            }
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: 11, color: "#8a909c" }}>
                          {(() => {
                            const timeValue = shift.startTime || shift.createdAt || shift.loginTime || shift.shiftStart;
                            if (timeValue) {
                              return new Date(timeValue).toLocaleDateString("en-US", {
                                weekday: "short",
                                year: "numeric"
                              });
                            }
                            return "Unknown date";
                          })()
                          }
                        </p>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 13,
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      <div>
                        <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: textColor }}>
                          {getShiftDuration(shift)}
                        </p>
                        <p style={{ margin: 0, fontSize: 11, color: "#8a909c" }}>
                          {(() => {
                            const startTimeValue = shift.startTime || shift.createdAt || shift.loginTime || shift.shiftStart;
                            if (!startTimeValue) return "Unknown";
                            
                            const start = new Date(startTimeValue);
                            const now = new Date();
                            const hours = Math.floor((now - start) / (1000 * 60 * 60));
                            
                            if (shift.endTime) return "Completed";
                            if (hours >= 10) return "Overtime Alert!";
                            return `${10 - hours}h remaining`;
                          })()
                          }
                        </p>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 13,
                        borderBottom: "1px solid #e5e7eb",
                        textAlign: "right",
                        fontWeight: 700,
                        color: "#1a1d23",
                      }}
                    >
                      रु{" "}
                      {(
                        shift.totalSales ??
                        shift.totalAmount ??
                        0
                      ).toLocaleString("en-IN")}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 13,
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "4px 10px",
                          borderRadius: 20,
                          background: getShiftStatus(shift).bg,
                          color: getShiftStatus(shift).color,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4
                        }}
                      >
                        <div style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: getShiftStatus(shift).color,
                          animation: shift.endTime ? "none" : "pulse 2s infinite"
                        }} />
                        {getShiftStatus(shift).status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { findStoreEmployee } from "@/Redux Toolkit/Features/Employee/employeeThunk";
import { getOrdersByStore } from "@/Redux Toolkit/Features/order/orderThunk";
import { getRefundsByStore } from "@/Redux Toolkit/Features/refund/refundThunk";
import { getShiftsByStore } from "@/Redux Toolkit/Features/shiftReport/shiftReportThunk";
import secureStorage from "@/util/secureStorage";

const TABS = ["Orders", "Refunds", "Shifts"];

const roleLabel = {
  0: "Super Admin", 1: "Store Admin", 2: "Branch Manager",
  3: "Cashier", 4: "Inventory Manager", 5: "Employee",
};

const badge = (text, bg, color) => (
  <span style={{ padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600, background: bg, color }}>{text}</span>
);

const paymentBadge = (type) => {
  const map = {
    CASH:   { bg: "#f3f4f6", color: "#374151" },
    CARD:   { bg: "#eff6ff", color: "#2563eb" },
    ESEWA:  { bg: "#f7fee7", color: "#65a30d" },
    KHALTI: { bg: "#f5f3ff", color: "#7c3aed" },
  };
  const s = map[String(type).toUpperCase()] || { bg: "#f3f4f6", color: "#6b7280" };
  return badge(type, s.bg, s.color);
};

const getCollection = (value) => Array.isArray(value) ? value : value?.content || value?.data || [];
const getId = (value) => value === undefined || value === null ? "" : String(value);
const getEmployeeId = (employee) => getId(employee?.id ?? employee?._id ?? employee?.userId);
const getActivityEmployeeId = (activity) => getId(
  activity?.cashierId ?? activity?.employeeId ?? activity?.userId ??
  activity?.cashier?.id ?? activity?.cashier?._id ??
  activity?.employee?.id ?? activity?.employee?._id ??
  activity?.user?.id ?? activity?.user?._id,
);

const fmt = (dt) => dt ? new Date(dt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
const fmtDate = (dt) => dt ? new Date(dt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
const money = (v) => `Rs ${Number(v || 0).toLocaleString("en-IN")}`;

const duration = (start, end) => {
  if (!start || !end) return "Active";
  const mins = Math.round((new Date(end) - new Date(start)) / 60000);
  const h = Math.floor(mins / 60), m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

export default function EmployeeActivityPage() {
  const dispatch = useDispatch();
  const { employees, loading: employeesLoading, error: employeesError } = useSelector((s) => s.employee);
  const { storeOrders, loading: ordersLoading, error: ordersError } = useSelector((s) => s.order);
  const { refundsByStore, loading: refundsLoading, error: refundsError } = useSelector((s) => s.refund);
  const { shiftsByStore, loading: shiftsLoading, error: shiftsError } = useSelector((s) => s.shiftReport);

  const [selectedId, setSelectedId] = useState(null);
  const [tab, setTab] = useState("Orders");
  const [search, setSearch] = useState("");

  const storeId = secureStorage.getUserData()?.storeId;

  useEffect(() => {
    if (!storeId) return;
    dispatch(findStoreEmployee({ storeId }));
    dispatch(getOrdersByStore(storeId));
    dispatch(getRefundsByStore(storeId));
    dispatch(getShiftsByStore(storeId));
  }, [dispatch, storeId]);

  const employeeList = getCollection(employees);
  const orderList = getCollection(storeOrders);
  const refundList = getCollection(refundsByStore);
  const shiftList = getCollection(shiftsByStore);
  const loading = employeesLoading || ordersLoading || refundsLoading || shiftsLoading;
  const error = employeesError || ordersError || refundsError || shiftsError;

  const filtered = employeeList.filter((e) =>
    !search ||
    (e.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
    (e.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const selected = employeeList.find((e) => getEmployeeId(e) === selectedId);

  const empOrders = orderList.filter((order) => getActivityEmployeeId(order) === selectedId);
  const empRefunds = refundList.filter((refund) => getActivityEmployeeId(refund) === selectedId);
  const empShifts = shiftList.filter((shift) => getActivityEmployeeId(shift) === selectedId);

  const totalSales   = empOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);

  return (
    <div style={{ display: "flex", height: "100%", fontFamily: "'DM Sans','Inter',sans-serif", color: "#1a1d23", overflow: "hidden" }}>

      {/* Left — Employee List */}
      <div style={{ width: 260, flexShrink: 0, borderRight: "1px solid #e5e7eb", background: "white", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "16px 14px 10px", borderBottom: "1px solid #f3f4f6" }}>
          <p style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700 }}>Employee Activity</p>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employees..."
            style={{ width: "100%", padding: "7px 10px", border: "1px solid #e2e5e9", borderRadius: 8, fontSize: 12, outline: "none", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {employeesLoading && employeeList.length === 0 ? (
            <p style={{ padding: 20, textAlign: "center", color: "#8a909c", fontSize: 12, margin: 0 }}>Loading employees...</p>
          ) : filtered.map((e) => {
            const employeeId = getEmployeeId(e);
            const isSelected = employeeId === selectedId;
            const initials = (e.fullName || "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
            return (
              <div
                key={employeeId}
                onClick={() => { setSelectedId(employeeId); setTab("Orders"); }}
                style={{
                  padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid #f9fafb",
                  background: isSelected ? "#f0f4ff" : "white",
                  borderLeft: isSelected ? "3px solid #1a1d23" : "3px solid transparent",
                }}
                onMouseEnter={(ev) => { if (!isSelected) ev.currentTarget.style.background = "#f9fafb"; }}
                onMouseLeave={(ev) => { if (!isSelected) ev.currentTarget.style.background = "white"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: isSelected ? "#1a1d23" : "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: isSelected ? "white" : "#6b7280" }}>{initials}</span>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.fullName}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#8a909c" }}>{roleLabel[e.role] || `Role ${e.role}`}</p>
                  </div>
                </div>
              </div>
            );
          })}
          {!employeesLoading && filtered.length === 0 && (
            <p style={{ padding: 20, textAlign: "center", color: "#8a909c", fontSize: 12, margin: 0 }}>No employees found</p>
          )}
        </div>
      </div>

      {/* Right — Activity Detail */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#f5f5f5" }}>
        {loading && !selected ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "#8a909c", fontSize: 13 }}>Loading employee activity...</p>
          </div>
        ) : !selected ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ color: "#8a909c", fontSize: 13, margin: 0 }}>{error || (storeId ? "Select an employee to view their activity" : "Your account is not linked to a store.")}</p>
            </div>
          </div>
        ) : (
          <>
            {/* Employee Header */}
            <div style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{selected.fullName}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280" }}>
                    {selected.email} · {roleLabel[selected.role]} ·{" "}
                    {selected.status === "active"
                      ? badge("Active", "#f0fdf4", "#16a34a")
                      : badge("Inactive", "#f3f4f6", "#6b7280")}
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: 11, color: "#9ca3af" }}>
                    Last login: {fmt(selected.lastLogin)}
                  </p>
                </div>
                {/* Summary stats */}
                <div style={{ display: "flex", gap: 12 }}>
                  {[
                    { label: "Orders", value: empOrders.length },
                    { label: "Sales", value: money(totalSales) },
                    { label: "Refunds", value: empRefunds.length },
                    { label: "Shifts", value: empShifts.length },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ textAlign: "center", padding: "6px 14px", background: "#f9fafb", borderRadius: 8, border: "1px solid #e5e7eb" }}>
                      <p style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{value}</p>
                      <p style={{ margin: 0, fontSize: 10, color: "#8a909c" }}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "0 20px", display: "flex", gap: 4 }}>
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    padding: "10px 16px", border: "none", background: "none", cursor: "pointer",
                    fontSize: 13, fontWeight: tab === t ? 700 : 500,
                    color: tab === t ? "#1a1d23" : "#6b7280",
                    borderBottom: tab === t ? "2px solid #1a1d23" : "2px solid transparent",
                  }}
                >
                  {t} {t === "Orders" ? `(${empOrders.length})` : t === "Refunds" ? `(${empRefunds.length})` : `(${empShifts.length})`}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>

              {/* Orders Tab */}
              {tab === "Orders" && (
                <div style={{ background: "white", border: "1px solid #e2e5e9", borderRadius: 10, overflow: "hidden" }}>
                  {empOrders.length === 0 ? (
                    <p style={{ padding: 24, textAlign: "center", color: "#8a909c", margin: 0, fontSize: 13 }}>No orders found</p>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <thead>
                          <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                            {["Order ID", "Branch", "Payment", "Amount", "Status", "Date"].map((h) => (
                              <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#6b7280", whiteSpace: "nowrap" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {empOrders.map((o, i) => (
                            <tr key={o.id} style={{ borderBottom: i < empOrders.length - 1 ? "1px solid #f3f4f6" : "none" }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                            >
                              <td style={{ padding: "10px 14px", fontWeight: 600 }}>#{o.id}</td>
                              <td style={{ padding: "10px 14px", color: "#4b5563" }}>{o.branchName || `Branch ${o.branchId}`}</td>
                              <td style={{ padding: "10px 14px" }}>{paymentBadge(o.paymentType)}</td>
                              <td style={{ padding: "10px 14px", fontWeight: 600 }}>{money(o.totalAmount)}</td>
                              <td style={{ padding: "10px 14px" }}>
                                {o.status === "COMPLETED"
                                  ? badge("Completed", "#f0fdf4", "#16a34a")
                                  : o.status === "REFUNDED"
                                  ? badge("Refunded", "#fef2f2", "#dc2626")
                                  : badge(o.status, "#f3f4f6", "#6b7280")}
                              </td>
                              <td style={{ padding: "10px 14px", color: "#6b7280", whiteSpace: "nowrap" }}>{fmtDate(o.createdAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Refunds Tab */}
              {tab === "Refunds" && (
                <div style={{ background: "white", border: "1px solid #e2e5e9", borderRadius: 10, overflow: "hidden" }}>
                  {empRefunds.length === 0 ? (
                    <p style={{ padding: 24, textAlign: "center", color: "#8a909c", margin: 0, fontSize: 13 }}>No refunds found</p>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <thead>
                          <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                            {["Refund ID", "Order ID", "Branch", "Amount", "Reason", "Date"].map((h) => (
                              <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#6b7280", whiteSpace: "nowrap" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {empRefunds.map((r, i) => (
                            <tr key={r.id} style={{ borderBottom: i < empRefunds.length - 1 ? "1px solid #f3f4f6" : "none" }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                            >
                              <td style={{ padding: "10px 14px", fontWeight: 600 }}>#{r.id}</td>
                              <td style={{ padding: "10px 14px", color: "#4b5563" }}>#{r.orderId}</td>
                              <td style={{ padding: "10px 14px", color: "#4b5563" }}>{r.branchName || `Branch ${r.branchId}`}</td>
                              <td style={{ padding: "10px 14px", fontWeight: 600, color: "#dc2626" }}>{money(r.amount)}</td>
                              <td style={{ padding: "10px 14px", color: "#4b5563", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.reason || "—"}</td>
                              <td style={{ padding: "10px 14px", color: "#6b7280", whiteSpace: "nowrap" }}>{fmtDate(r.createdAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Shifts Tab */}
              {tab === "Shifts" && (
                <div style={{ background: "white", border: "1px solid #e2e5e9", borderRadius: 10, overflow: "hidden" }}>
                  {empShifts.length === 0 ? (
                    <p style={{ padding: 24, textAlign: "center", color: "#8a909c", margin: 0, fontSize: 13 }}>No shifts found</p>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <thead>
                          <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                            {["Shift ID", "Branch", "Start", "End", "Duration", "Orders", "Sales", "Refunds", "Status"].map((h) => (
                              <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#6b7280", whiteSpace: "nowrap" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[...empShifts].sort((a, b) => new Date(b.shiftStart) - new Date(a.shiftStart)).map((s, i) => (
                            <tr key={s.id} style={{ borderBottom: i < empShifts.length - 1 ? "1px solid #f3f4f6" : "none" }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                            >
                              <td style={{ padding: "10px 14px", fontWeight: 600 }}>#{s.id}</td>
                              <td style={{ padding: "10px 14px", color: "#4b5563" }}>{s.branch?.name || `Branch ${s.branchId}`}</td>
                              <td style={{ padding: "10px 14px", color: "#4b5563", whiteSpace: "nowrap" }}>{fmt(s.shiftStart)}</td>
                              <td style={{ padding: "10px 14px", color: "#4b5563", whiteSpace: "nowrap" }}>{s.shiftEnd ? fmt(s.shiftEnd) : "—"}</td>
                              <td style={{ padding: "10px 14px", color: "#4b5563" }}>{duration(s.shiftStart, s.shiftEnd)}</td>
                              <td style={{ padding: "10px 14px" }}>{s.totalOrders ?? 0}</td>
                              <td style={{ padding: "10px 14px", fontWeight: 600 }}>{money(s.totalSales)}</td>
                              <td style={{ padding: "10px 14px", color: "#dc2626" }}>{money(s.totalRefunds)}</td>
                              <td style={{ padding: "10px 14px" }}>
                                {s.shiftEnd
                                  ? badge("Closed", "#f3f4f6", "#6b7280")
                                  : badge("Active", "#f0fdf4", "#16a34a")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

            </div>
          </>
        )}
      </div>
    </div>
  );
}

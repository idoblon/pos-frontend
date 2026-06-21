import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  AlertCircle,
  Clock,
  Eye,
  GitBranch,
  RefreshCw,
  RotateCcw,
  Search,
  ShoppingBag,
  TrendingUp,
  UserCircle,
} from "lucide-react";
import { getBranchesByStore } from "@/Redux Toolkit/Features/branch/branchThunk";
import { findStoreEmployee } from "@/Redux Toolkit/Features/Employee/employeeThunk";
import { getOrdersByBranch } from "@/Redux Toolkit/Features/order/orderThunk";
import { getRefundsByBranch } from "@/Redux Toolkit/Features/refund/refundThunk";
import { getShiftsByBranch, getShiftsByCashier } from "@/Redux Toolkit/Features/shiftReport/shiftReportThunk";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import secureStorage from "@/util/secureStorage";
import api from "@/util/api";

const OVERTIME_HOURS = 10;

const s = {
  page: { padding: 24, display: "flex", flexDirection: "column", gap: 18, fontFamily: "'DM Sans','Inter',sans-serif", color: "#1a1d23", background: "#f5f5f5", minHeight: "100%" },
  card: { background: "white", border: "1px solid #e5e7eb", borderRadius: 10 },
  stat: { background: "white", border: "1px solid #e5e7eb", borderRadius: 10, padding: "16px 18px" },
  input: { width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontFamily: "inherit", fontSize: 13, color: "#1a1d23", background: "white", outline: "none", boxSizing: "border-box" },
  th: { padding: "10px 14px", fontSize: 12, fontWeight: 600, color: "#6b7280", background: "#f5f5f5", textAlign: "left", borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap" },
  td: { padding: "12px 14px", fontSize: 13, borderBottom: "1px solid #e5e7eb", color: "#1a1d23", verticalAlign: "top" },
  iconBtn: { border: "1px solid #e5e7eb", background: "white", borderRadius: 7, padding: "6px 8px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "inherit", fontSize: 12, fontWeight: 600, color: "#1a1d23" },
};

const getId = (value) => (value == null ? "" : String(value));

const getCollection = (value) => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];
  return [value.data, value.items, value.results, value.content, value.shifts, value.orders, value.refunds].find(Array.isArray) || [];
};

const getShiftId = (shift) => getId(shift.id || shift._id || shift.shiftReportId);
const getBranchId = (item) => getId(item.branchId || item.branch?.id || item.branch?._id);
const getStaffId = (item) => getId(
  item.cashierId ||
  item.managerId ||
  item.branchManagerId ||
  item.staffId ||
  item.userId ||
  item.createdBy ||
  item.createdById ||
  item.openedBy ||
  item.openedById ||
  item.employeeId ||
  item.user?.id ||
  item.user?._id ||
  item.cashier?.id ||
  item.cashier?._id ||
  item.manager?.id ||
  item.manager?._id ||
  item.branchManager?.id ||
  item.branchManager?._id ||
  item.staff?.id ||
  item.staff?._id ||
  item.employee?.id ||
  item.employee?._id,
);
const getShiftStartValue = (shift) => shift.startTime || shift.shiftStart || shift.loginTime || shift.startedAt || shift.createdAt;
const getShiftEndValue = (shift) => shift.endTime || shift.shiftEnd || shift.logoutTime || shift.endedAt || shift.closedAt;

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getDateRange = (range) => {
  const end = new Date();
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  if (range === "yesterday") {
    start.setDate(start.getDate() - 1);
    end.setHours(0, 0, 0, 0);
    return { start, end };
  }

  if (range === "7") start.setDate(start.getDate() - 6);
  if (range === "30") start.setDate(start.getDate() - 29);

  return { start, end };
};

const formatMoney = (value) => `रु ${Math.round(value || 0).toLocaleString("en-IN")}`;

const formatDateTime = (value) => {
  const date = parseDate(value);
  if (!date) return "No data";
  return date.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
};

const formatDuration = (startValue, endValue) => {
  const start = parseDate(startValue);
  if (!start) return "No data";
  const end = parseDate(endValue) || new Date();
  const totalMinutes = Math.max(0, Math.floor((end - start) / (1000 * 60)));
  const totalHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  // If less than 24 hours, show hours and minutes
  if (totalHours < 24) {
    if (totalHours === 0) return `${minutes}m`;
    if (minutes === 0) return `${totalHours}h`;
    return `${totalHours}h ${minutes}m`;
  }
  
  // If 24 hours or more, show days and hours
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  
  if (hours === 0) return `${days}d`;
  return `${days}d ${hours}h`;
};

const getStatus = (shift) => {
  if (getShiftEndValue(shift)) return { label: "Closed", color: "#6b7280", bg: "#f5f5f5" };
  const start = parseDate(getShiftStartValue(shift));
  if (!start) return { label: "Unknown", color: "#6b7280", bg: "#f5f5f5" };
  const hours = (new Date() - start) / (1000 * 60 * 60);
  if (hours >= OVERTIME_HOURS) return { label: "Overtime", color: "#b91c1c", bg: "#fef2f2" };
  return { label: "Active", color: "#047857", bg: "#ecfdf5" };
};

const getOrderShiftId = (order) => getId(order.shiftReportId || order.shiftId || order.shift?.id || order.shiftReport?.id);
const getRefundShiftId = (refund) => getId(refund.shiftReportId || refund.shiftId || refund.shift?.id || refund.shiftReport?.id);

const belongsToShift = (item, shift) => {
  const shiftId = getShiftId(shift);
  const itemShiftId = getOrderShiftId(item) || getRefundShiftId(item);
  if (shiftId && itemShiftId) return shiftId === itemShiftId;

  const staffMatches = getStaffId(item) && getStaffId(item) === getStaffId(shift);
  const itemDate = parseDate(item.createdAt || item.orderDate || item.refundDate);
  const start = parseDate(getShiftStartValue(shift));
  const end = parseDate(getShiftEndValue(shift)) || new Date();
  return Boolean(staffMatches && itemDate && start && itemDate >= start && itemDate <= end);
};

const getBranchName = (branches, branchId) =>
  branches.find((branch) => getId(branch.id || branch._id) === getId(branchId))?.name || "Unknown Branch";

const getEmployeeBranchId = (employee) => getId(employee.branchId || employee.branch?.id || employee.branch?._id);
const isBranchManager = (employee) => employee?.role === "ROLE_BRANCH_MANAGER";

const getEmployeeIds = (employee) =>
  [employee.userId, employee.id, employee._id]
    .map(getId)
    .filter(Boolean)
    .filter((id, index, ids) => ids.indexOf(id) === index);

const uniqueStaffByIds = (staffList) => {
  const seen = new Set();
  return staffList.filter((staff) => {
    const ids = getEmployeeIds(staff);
    if (!ids.length || ids.some((id) => seen.has(id))) return false;
    ids.forEach((id) => seen.add(id));
    return true;
  });
};

const getBranchEmployees = async (branchId) => {
  try {
    const response = await api.get(`/api/employees/branch/${encodeURIComponent(branchId)}`);
    return getCollection(response.data);
  } catch {
    return [];
  }
};

const getStaffMember = (employees, staffId) =>
  employees.find((emp) => [emp.id, emp._id, emp.userId].map(getId).includes(getId(staffId)));

const formatRole = (role) => {
  if (role === "ROLE_BRANCH_MANAGER") return "Branch Manager";
  if (role === "ROLE_BRANCH_CASHIER") return "Cashier";
  return role?.replace("ROLE_", "").replace(/_/g, " ") || "Staff";
};

const getStaffName = (employees, staffId, fallback) => {
  const employee = getStaffMember(employees, staffId);
  return employee?.fullName || employee?.username || fallback || (staffId ? `Staff #${staffId}` : "Unknown Staff");
};

const getShiftStaffName = (shift) =>
  shift.cashierName ||
  shift.managerName ||
  shift.branchManagerName ||
  shift.staffName ||
  shift.userName ||
  shift.user?.fullName ||
  shift.cashier?.fullName ||
  shift.manager?.fullName ||
  shift.branchManager?.fullName ||
  shift.staff?.fullName ||
  shift.employee?.fullName;

function StatCard({ label, value, sub, icon: Icon, color = "#1a1d23" }) {
  return (
    <div style={s.stat}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <p style={{ margin: 0, fontSize: 12, color: "#8a909c" }}>{label}</p>
          <p style={{ margin: "6px 0 2px", fontSize: 23, fontWeight: 800, letterSpacing: "-0.3px" }}>{value}</p>
          <p style={{ margin: 0, fontSize: 11, color: "#8a909c" }}>{sub}</p>
        </div>
        {Icon && <Icon size={18} color={color} />}
      </div>
    </div>
  );
}

export default function StoreShiftSummary() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { userProfile } = useSelector((state) => state.user);
  const { branches } = useSelector((state) => state.branch);
  const { employees } = useSelector((state) => state.employee);
  const userData = secureStorage.getUserData();
  const storeId = user?.storeId || userData?.storeId || userProfile?.storeId || localStorage.getItem("storeId");

  const [range, setRange] = useState("today");
  const [branchFilter, setBranchFilter] = useState("all");
  const [staffFilter, setStaffFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [allShifts, setAllShifts] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [allRefunds, setAllRefunds] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);

  useEffect(() => {
    if (!storeId) return;
    dispatch(getBranchesByStore(storeId));
    dispatch(findStoreEmployee({ storeId }));
  }, [dispatch, storeId]);

  useEffect(() => {
    if (!branches?.length) return;
    let cancelled = false;

    const loadBranchOperations = async () => {
      setLoading(true);
      const results = await Promise.all(
        branches.map(async (branch) => {
          const branchId = branch.id || branch._id;
          if (!branchId) return { shifts: [], orders: [], refunds: [] };
          const branchIdText = getId(branchId);
          const branchEmployees = await getBranchEmployees(branchIdText);
          const branchManagers = uniqueStaffByIds([
            ...(employees || []).filter(
              (employee) => isBranchManager(employee) && getEmployeeBranchId(employee) === branchIdText,
            ),
            ...branchEmployees.filter(isBranchManager),
            ...(branch.manager ? [{ ...branch.manager, role: branch.manager.role || "ROLE_BRANCH_MANAGER", branchId: branchIdText }] : []),
          ]);

          const [shiftResult, orderResult, refundResult] = await Promise.all([
            dispatch(getShiftsByBranch(branchId)).unwrap().catch(() => []),
            dispatch(getOrdersByBranch({ branchId })).unwrap().catch(() => []),
            dispatch(getRefundsByBranch(branchId)).unwrap().catch(() => []),
          ]);
          const managerShiftResults = await Promise.all(
            branchManagers.flatMap((manager) =>
              getEmployeeIds(manager).map((managerId) =>
                dispatch(getShiftsByCashier(managerId)).unwrap()
                  .then((result) => ({ manager, managerId, result }))
                  .catch(() => ({ manager, managerId, result: [] })),
              ),
            ),
          );
          const managerShifts = managerShiftResults.flatMap(({ manager, managerId, result }) =>
            getCollection(result).map((shift) => ({
              ...shift,
              branchId: getBranchId(shift) || branchIdText,
              managerId: getStaffId(shift) || managerId,
              managerName: getShiftStaffName(shift) || manager.fullName || manager.username || manager.email,
              role: shift.role || "ROLE_BRANCH_MANAGER",
            })),
          );

          return {
            shifts: [
              ...getCollection(shiftResult).map((shift) => ({ ...shift, branchId: getBranchId(shift) || branchIdText })),
              ...managerShifts,
            ],
            orders: getCollection(orderResult).map((order) => ({ ...order, branchId: getBranchId(order) || branchIdText })),
            refunds: getCollection(refundResult).map((refund) => ({ ...refund, branchId: getBranchId(refund) || branchIdText })),
          };
        }),
      );

      if (cancelled) return;

      const dedupe = (items) => {
        const seen = new Set();
        return items.filter((item, index) => {
          const key = getId(item.id || item._id) || `${getBranchId(item)}-${getStaffId(item)}-${item.createdAt || index}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      };

      setAllShifts(dedupe(results.flatMap((result) => result.shifts)));
      setAllOrders(dedupe(results.flatMap((result) => result.orders)));
      setAllRefunds(dedupe(results.flatMap((result) => result.refunds)));
      setLoading(false);
    };

    loadBranchOperations();

    return () => {
      cancelled = true;
    };
  }, [branches, dispatch, employees]);

  const filteredShifts = useMemo(() => {
    const { start, end } = getDateRange(range);
    const query = search.trim().toLowerCase();

    return allShifts
      .filter((shift) => {
        const shiftStart = parseDate(getShiftStartValue(shift));
        const shiftEnd = parseDate(getShiftEndValue(shift)) || new Date();
        if (!shiftStart || shiftStart > end || shiftEnd < start) return false;
        if (branchFilter !== "all" && getBranchId(shift) !== branchFilter) return false;
        if (staffFilter !== "all" && getStaffId(shift) !== staffFilter) return false;
        if (statusFilter !== "all" && getStatus(shift).label.toLowerCase() !== statusFilter) return false;

        if (!query) return true;
        const branchName = getBranchName(branches, getBranchId(shift)).toLowerCase();
        const staffId = getStaffId(shift);
        const staffName = getStaffName(employees, staffId, getShiftStaffName(shift)).toLowerCase();
        const staffRole = formatRole(getStaffMember(employees, staffId)?.role).toLowerCase();
        return branchName.includes(query) || staffName.includes(query) || staffRole.includes(query) || getShiftId(shift).toLowerCase().includes(query);
      })
      .sort((a, b) => (parseDate(getShiftStartValue(b)) || 0) - (parseDate(getShiftStartValue(a)) || 0));
  }, [allShifts, branchFilter, branches, employees, range, search, staffFilter, statusFilter]);

  const shiftRows = useMemo(() => filteredShifts.map((shift) => {
    const shiftOrders = allOrders.filter((order) => belongsToShift(order, shift));
    const shiftRefunds = allRefunds.filter((refund) => belongsToShift(refund, shift));
    const totalSales = shiftOrders.reduce((sum, order) => sum + (order.totalAmount || order.grandTotal || 0), 0);
    const totalRefunds = shiftRefunds.reduce((sum, refund) => sum + (refund.amount || refund.refundAmount || 0), 0);
    const paymentTotals = shiftOrders.reduce((totals, order) => {
      const method = (order.paymentType || order.paymentMethod || "UNKNOWN").toUpperCase();
      totals[method] = (totals[method] || 0) + (order.totalAmount || order.grandTotal || 0);
      return totals;
    }, {});

    const staffId = getStaffId(shift);
    const staffMember = getStaffMember(employees, staffId);

    return {
      shift,
      status: getStatus(shift),
      branchName: getBranchName(branches, getBranchId(shift)),
      staffName: getStaffName(employees, staffId, getShiftStaffName(shift)),
      staffRole: formatRole(staffMember?.role || shift.role || shift.employee?.role || shift.cashier?.role || shift.manager?.role),
      orders: shiftOrders,
      refunds: shiftRefunds,
      totalSales,
      totalRefunds,
      netSales: totalSales - totalRefunds,
      paymentTotals,
    };
  }), [allOrders, allRefunds, branches, employees, filteredShifts]);

  const branchStaff = useMemo(() => {
    const staffFromEmployees = (employees || [])
      .filter((emp) => emp.role === "ROLE_BRANCH_CASHIER" || emp.role === "ROLE_BRANCH_MANAGER")
      .map((emp) => ({
        id: getId(emp.id || emp._id || emp.userId),
        name: emp.fullName || emp.username || "Unnamed Staff",
        role: formatRole(emp.role),
      }))
      .filter((staff) => staff.id);

    const staffFromBranchManagers = (branches || [])
      .map((branch) => branch.manager && {
        id: getId(branch.manager.id || branch.manager._id || branch.manager.userId),
        name: branch.manager.fullName || branch.manager.username || "Unnamed Staff",
        role: formatRole(branch.manager.role || "ROLE_BRANCH_MANAGER"),
      })
      .filter((staff) => staff?.id);

    const knownIds = new Set(staffFromEmployees.map((staff) => staff.id));
    const uniqueBranchManagers = staffFromBranchManagers.filter((staff) => {
      if (knownIds.has(staff.id)) return false;
      knownIds.add(staff.id);
      return true;
    });
    const staffFromShifts = allShifts
      .map(getStaffId)
      .filter((id) => id && !knownIds.has(id))
      .map((id) => ({ id, name: getStaffName(employees, id), role: "Staff" }));

    return [...staffFromEmployees, ...uniqueBranchManagers, ...staffFromShifts].sort((a, b) => a.name.localeCompare(b.name));
  }, [allShifts, branches, employees]);

  const selectedRow = selectedShift ? shiftRows.find((row) => getShiftId(row.shift) === getShiftId(selectedShift)) : null;

  const reload = () => {
    if (!storeId) return;
    dispatch(getBranchesByStore(storeId));
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Staff Shift Monitor</p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "#8a909c" }}>{shiftRows.length} shift{shiftRows.length === 1 ? "" : "s"} found</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {loading && <span style={{ fontSize: 12, color: "#6b7280" }}>Loading latest data...</span>}
            <button type="button" onClick={reload} style={s.iconBtn}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        <div style={{ padding: 14, borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10, alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <Search size={14} color="#8a909c" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
              <input style={{ ...s.input, paddingLeft: 32 }} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search staff, role, branch, or shift ID..." />
            </div>
            <select style={s.input} value={range} onChange={(event) => setRange(event.target.value)}>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
            </select>
            <select style={s.input} value={branchFilter} onChange={(event) => setBranchFilter(event.target.value)}>
              <option value="all">All branches</option>
              {branches?.map((branch) => (
                <option key={branch.id || branch._id} value={getId(branch.id || branch._id)}>{branch.name}</option>
              ))}
            </select>
            <select style={s.input} value={staffFilter} onChange={(event) => setStaffFilter(event.target.value)}>
              <option value="all">All staff</option>
              {branchStaff.map((staff) => (
                <option key={staff.id} value={staff.id}>{staff.name} - {staff.role}</option>
              ))}
            </select>
            <select style={s.input} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
              <option value="overtime">Overtime</option>
            </select>
          </div>
        </div>

        {shiftRows.length === 0 ? (
          <div style={{ padding: "50px 20px", textAlign: "center", color: "#6b7280" }}>
            <AlertCircle size={32} color="#d1d5db" style={{ margin: "0 auto 10px", display: "block" }} />
            <p style={{ margin: 0, fontWeight: 600, color: "#1a1d23" }}>No shift records found</p>
            <p style={{ margin: "4px 0 0", fontSize: 12 }}>Try another branch, staff member, date range, or status.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Staff", "Branch", "Login Time", "Duration", "Orders", "Net Sales", "Status", "Details"].map((heading, index) => (
                    <th key={heading} style={{ ...s.th, textAlign: index === 5 || index === 7 ? "right" : "left" }}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shiftRows.map((row) => (
                  <tr key={getShiftId(row.shift) || `${row.branchName}-${row.staffName}-${getShiftStartValue(row.shift)}`}>
                    <td style={s.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <UserCircle size={16} color="#6b7280" />
                        <div>
                          <p style={{ margin: 0, fontWeight: 700 }}>{row.staffName}</p>
                          <p style={{ margin: "2px 0 0", fontSize: 11, color: "#8a909c" }}>{row.staffRole} · {getShiftId(row.shift) || "No shift ID"}</p>
                        </div>
                      </div>
                    </td>
                    <td style={s.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <GitBranch size={14} color="#6b7280" />
                        {row.branchName}
                      </div>
                    </td>
                    <td style={s.td}>{formatDateTime(getShiftStartValue(row.shift))}</td>
                    <td style={s.td}>{formatDuration(getShiftStartValue(row.shift), getShiftEndValue(row.shift))}</td>
                    <td style={s.td}>{row.orders.length}</td>
                    <td style={{ ...s.td, textAlign: "right", fontWeight: 700 }}>{formatMoney(row.netSales)}</td>
                    <td style={s.td}>
                      <span style={{ display: "inline-flex", padding: "4px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, color: row.status.color, background: row.status.bg }}>
                        {row.status.label}
                      </span>
                    </td>
                    <td style={{ ...s.td, textAlign: "right" }}>
                      <button type="button" style={s.iconBtn} onClick={() => setSelectedShift(row.shift)}>
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={Boolean(selectedShift)} onOpenChange={(open) => !open && setSelectedShift(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Shift Details</DialogTitle>
            <DialogDescription>
              {selectedRow ? `${selectedRow.staffName} (${selectedRow.staffRole}) at ${selectedRow.branchName}` : "Selected staff shift"}
            </DialogDescription>
          </DialogHeader>
          {selectedRow && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
                <StatCard label="Gross Sales" value={formatMoney(selectedRow.totalSales)} sub={`${selectedRow.orders.length} orders`} icon={TrendingUp} />
                <StatCard label="Refunds" value={formatMoney(selectedRow.totalRefunds)} sub={`${selectedRow.refunds.length} refunds`} icon={RotateCcw} color="#6b7280" />
                <StatCard label="Net Sales" value={formatMoney(selectedRow.netSales)} sub={selectedRow.status.label} icon={ShoppingBag} />
                <StatCard label="Duration" value={formatDuration(getShiftStartValue(selectedRow.shift), getShiftEndValue(selectedRow.shift))} sub={formatDateTime(getShiftStartValue(selectedRow.shift))} icon={Clock} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
                <div style={s.card}>
                  <p style={{ margin: 0, padding: "12px 14px", borderBottom: "1px solid #e5e7eb", fontWeight: 700 }}>Payment Summary</p>
                  <div style={{ padding: 14, display: "grid", gap: 8 }}>
                    {Object.keys(selectedRow.paymentTotals).length === 0 ? (
                      <p style={{ margin: 0, fontSize: 12, color: "#8a909c" }}>No payments recorded for this shift.</p>
                    ) : Object.entries(selectedRow.paymentTotals).map(([method, total]) => (
                      <div key={method} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                        <span>{method}</span>
                        <strong>{formatMoney(total)}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={s.card}>
                  <p style={{ margin: 0, padding: "12px 14px", borderBottom: "1px solid #e5e7eb", fontWeight: 700 }}>Recent Orders</p>
                  <div style={{ padding: 14, display: "grid", gap: 8, maxHeight: 220, overflow: "auto" }}>
                    {selectedRow.orders.length === 0 ? (
                      <p style={{ margin: 0, fontSize: 12, color: "#8a909c" }}>No orders matched to this shift.</p>
                    ) : selectedRow.orders.slice(0, 8).map((order) => (
                      <div key={order.id || order._id} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 12 }}>
                        <span>{order.orderNumber || order.id || order._id}</span>
                        <strong>{formatMoney(order.totalAmount || order.grandTotal)}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

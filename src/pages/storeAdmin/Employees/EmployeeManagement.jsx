import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Search, Users, Pencil, Trash2, UserCircle, Clock } from "lucide-react";
import { findStoreEmployee, createStoreEmpoyee, updateEmpoyee, deleteEmployee } from "@/Redux Toolkit/Features/Employee/employeeThunk";
import { getBranchesByStore } from "@/Redux Toolkit/Features/branch/branchThunk";
import { getUserProfile } from "@/Redux Toolkit/Features/user/userThunk";
import { getShiftsByBranch } from "@/Redux Toolkit/Features/shiftReport/shiftReportThunk";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import secureStorage from "@/util/secureStorage";
import api from "@/util/api";

const EMPTY_FORM = { fullName: "", email: "", phone: "", role: "ROLE_BRANCH_CASHIER", branchId: "" };
const ROLES = ["ROLE_BRANCH_CASHIER", "ROLE_BRANCH_MANAGER"];
const STANDARD_DAILY_HOURS = 8;

const roleStyle = {
  ROLE_BRANCH_MANAGER: { background: "#f5f3ff", color: "#7c3aed" },
  ROLE_BRANCH_CASHIER: { background: "#eff6ff", color: "#3b82f6" },
};

const s = {
  page: { padding: 24, display: "flex", flexDirection: "column", gap: 20, fontFamily: "'DM Sans','Inter',sans-serif", color: "#1a1d23", background: "#f5f5f5", minHeight: "100%" },
  card: { background: "white", border: "1px solid #e5e7eb", borderRadius: 10 },
  cardHeader: { padding: "14px 18px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" },
  searchInput: { width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 12px 7px 34px", fontFamily: "inherit", fontSize: 13, color: "#1a1d23", background: "#f5f5f5", outline: "none", boxSizing: "border-box" },
  addBtn: { display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "linear-gradient(135deg,#1a1d23,#4a4d55)", color: "white", border: "none", borderRadius: 8, fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  th: { padding: "10px 16px", fontSize: 12, fontWeight: 600, color: "#6b7280", background: "#f5f5f5", textAlign: "left", borderBottom: "1px solid #e5e7eb" },
  td: { padding: "12px 16px", fontSize: 13, borderBottom: "1px solid #e5e7eb", color: "#1a1d23" },
  iconBtn: { border: "1px solid #e5e7eb", background: "white", borderRadius: 6, padding: "4px 6px", cursor: "pointer", display: "flex", alignItems: "center" },
  empty: { textAlign: "center", padding: "40px 0", color: "#6b7280", fontSize: 13 },
  select: { width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 10px", fontFamily: "inherit", fontSize: 13, background: "#f5f5f5", outline: "none" },
};

const getId = (value) => value == null ? "" : String(value);

const getCollection = (value) => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];
  return [value.data, value.items, value.results, value.content, value.shifts].find(Array.isArray) || [];
};

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getShiftStart = (shift) =>
  parseDate(shift.startTime || shift.shiftStart || shift.loginTime || shift.startedAt || shift.createdAt);

const getShiftEnd = (shift) =>
  parseDate(shift.endTime || shift.shiftEnd || shift.logoutTime || shift.endedAt || shift.closedAt);

const getEmployeeIdFromShift = (shift) =>
  getId(
    shift.cashierId ||
    shift.userId ||
    shift.employeeId ||
    shift.cashier?.id ||
    shift.cashier?._id ||
    shift.employee?.id ||
    shift.employee?._id,
  );

const getMonthRange = (monthYear) => {
  const [year, month] = monthYear.split("-").map(Number);
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 1, 0, 0, 0, 0);
  return { start, end };
};

const formatDuration = (hours) => {
  const totalMinutes = Math.round(Math.max(0, hours) * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

const getLocalDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getMonthValue = (date) => getLocalDateKey(date).slice(0, 7);

const addMinutesByDay = (dailyMinutes, start, end) => {
  let cursor = new Date(start);

  while (cursor < end) {
    const nextDay = new Date(cursor);
    nextDay.setHours(24, 0, 0, 0);

    const segmentEnd = new Date(Math.min(nextDay.getTime(), end.getTime()));
    const dayKey = getLocalDateKey(cursor);
    const minutes = (segmentEnd - cursor) / (1000 * 60);

    dailyMinutes[dayKey] = (dailyMinutes[dayKey] || 0) + minutes;
    cursor = segmentEnd;
  }
};

const calculateMonthlyWorkSummary = (employeeId, monthYear, shifts) => {
  const { start: monthStart, end: monthEnd } = getMonthRange(monthYear);
  const now = new Date();
  const dailyMinutes = {};
  let shiftCount = 0;
  let activeShiftCount = 0;

  shifts.forEach((shift) => {
    if (getEmployeeIdFromShift(shift) !== getId(employeeId)) return;

    const shiftStart = getShiftStart(shift);
    if (!shiftStart) return;

    const rawEnd = getShiftEnd(shift);
    const shiftEnd = rawEnd || now;
    if (shiftEnd <= monthStart || shiftStart >= monthEnd || shiftEnd <= shiftStart) return;

    const clippedStart = new Date(Math.max(shiftStart.getTime(), monthStart.getTime()));
    const clippedEnd = new Date(Math.min(shiftEnd.getTime(), monthEnd.getTime(), now.getTime()));
    if (clippedEnd <= clippedStart) return;

    addMinutesByDay(dailyMinutes, clippedStart, clippedEnd);
    shiftCount += 1;
    if (!rawEnd) activeShiftCount += 1;
  });

  const totalMinutes = Object.values(dailyMinutes).reduce((sum, minutes) => sum + minutes, 0);
  const overtimeMinutes = Object.values(dailyMinutes).reduce(
    (sum, minutes) => sum + Math.max(0, minutes - STANDARD_DAILY_HOURS * 60),
    0,
  );
  const daysWorked = Object.keys(dailyMinutes).length;

  return {
    totalHours: Math.round((totalMinutes / 60) * 10) / 10,
    overtimeHours: Math.round((overtimeMinutes / 60) * 10) / 10,
    regularHours: Math.round(((totalMinutes - overtimeMinutes) / 60) * 10) / 10,
    shifts: shiftCount,
    activeShiftCount,
    daysWorked,
    averageHoursPerDay: daysWorked ? Math.round((totalMinutes / 60 / daysWorked) * 10) / 10 : 0,
  };
};

export default function EmployeeManagement() {
  const dispatch = useDispatch();
  const { user } = useSelector((st) => st.auth);
  const { userProfile } = useSelector((st) => st.user);
  const userData = secureStorage.getUserData();
  
  const storeId = user?.storeId || userData?.storeId || userProfile?.storeId || localStorage.getItem("storeId");
  
  const { employees, loading } = useSelector((st) => st.employee);
  const { branches } = useSelector((st) => st.branch);

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [allShifts, setAllShifts] = useState([]);
  const [staffSearch, setStaffSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(() => getMonthValue(new Date()));
  const monthOptions = useMemo(() => {
    const months = [];

    for (let i = 0; i < 6; i += 1) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      months.push({
        value: getMonthValue(d),
        label: d.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      });
    }

    return months;
  }, []);

  useEffect(() => {
    if (!storeId) {
      toast.error("Store ID not found. Fetching user profile...");
      dispatch(getUserProfile()).then((result) => {
        if (result.payload?.storeId) {
          dispatch(findStoreEmployee({ storeId: result.payload.storeId }));
          dispatch(getBranchesByStore(result.payload.storeId));
        }
      });
      return;
    }
    dispatch(findStoreEmployee({ storeId }));
    dispatch(getBranchesByStore(storeId));
  }, [dispatch, storeId]);

  useEffect(() => {
    if (branches?.length > 0) {
      Promise.all(branches.map((b) => dispatch(getShiftsByBranch(b._id || b.id)).unwrap().catch(() => [])))
        .then((results) => {
          const seen = new Set();
          const shifts = results.flatMap(getCollection).filter((shift) => {
            const key = getId(shift.id || shift._id) || `${getEmployeeIdFromShift(shift)}-${getShiftStart(shift)?.toISOString() || ""}`;
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          setAllShifts(shifts);
        });
    }
  }, [branches, dispatch]);

  const visibleStaff = useMemo(() => employees?.filter((emp) => {
    if (!staffSearch.trim()) return false;
    return (emp.fullName || "").toLowerCase().includes(staffSearch.toLowerCase()) ||
      (emp.email || "").toLowerCase().includes(staffSearch.toLowerCase());
  }) || [], [employees, staffSearch]);

  const filtered = employees?.filter(
    (e) => {
      // Filter out store admin (ROLE_STORE_ADMIN)
      if (e.role === "ROLE_STORE_ADMIN") return false;
      
      return (
        e.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        e.email?.toLowerCase().includes(search.toLowerCase())
      );
    }
  );

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setDialogOpen(true); };
  const openEdit = (e) => { 
    setEditing(e); 
    setForm({ 
      fullName: e.fullName ?? "", 
      email: e.email ?? "", 
      phone: e.phone ?? "", 
      role: e.role ?? "ROLE_BRANCH_CASHIER", 
      branchId: e.branchId ?? "" 
    }); 
    setDialogOpen(true); 
  };
  const openDelete = (e) => { setSelected(e); setDeleteDialogOpen(true); };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    
    if (!storeId) {
      toast.error("Store ID not found. Please log in again.");
      return;
    }
    
    // Validate branchId for branch-level roles
    if ((form.role === "ROLE_BRANCH_MANAGER" || form.role === "ROLE_BRANCH_CASHIER") && !form.branchId) {
      toast.error("Please select a branch for this role");
      return;
    }
    
    if (editing) {
      const employeeId = editing.id || editing._id;
      if (!employeeId) {
        toast.error("Employee ID not found");
        return;
      }
      
      // Clean up form data - remove empty branchId
      const cleanedForm = { ...form };
      if (!cleanedForm.branchId || cleanedForm.branchId === "") {
        delete cleanedForm.branchId;
      }
      
      dispatch(updateEmpoyee({ employeeId, employeeDetails: cleanedForm }))
        .then((result) => {
          if (result.type.includes('fulfilled')) {
            toast.success("Employee updated successfully");
            dispatch(findStoreEmployee({ storeId }));
          } else {
            toast.error(result.payload || "Failed to update employee");
          }
        });
    } else {
      // Clean up form data - remove empty branchId for store manager
      const cleanedForm = { ...form };
      if (!cleanedForm.branchId || cleanedForm.branchId === "") {
        delete cleanedForm.branchId;
      }
      
      // Generate a default password for new employees
      const employeeData = {
        ...cleanedForm,
        password: "Employee@123"
      };
      
      dispatch(createStoreEmpoyee({ employee: employeeData, storeId }))
        .then((result) => {
          if (result.type.includes('fulfilled')) {
            const branchName = branches?.find(b => String(b.id || b._id) === String(cleanedForm.branchId))?.name || "";
            api.post("/api/email/store-credentials", {
              to: cleanedForm.email,
              fullName: cleanedForm.fullName,
              email: cleanedForm.email,
              tempPassword: "Employee@123",
              role: cleanedForm.role?.replace("ROLE_", "").replace(/_/g, " "),
              branchName,
              status: "ACTIVE",
            }).then(() => {
              toast.success(`Employee created! Login credentials sent to ${cleanedForm.email}`);
            }).catch(() => {
              toast.success(`Employee created! (Email delivery failed — password: Employee@123)`);
            });
            dispatch(findStoreEmployee({ storeId }));
          } else {
            toast.error(result.payload || "Failed to create employee");
          }
        });
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    const employeeId = selected.id || selected._id;
    if (!employeeId) {
      toast.error("Employee ID not found");
      return;
    }
    
    dispatch(deleteEmployee({ employeeId }))
      .then((result) => {
        if (result.type.includes('fulfilled')) {
          toast.success("Employee removed successfully");
          dispatch(findStoreEmployee({ storeId }));
        } else {
          toast.error(result.payload || "Failed to remove employee");
        }
      });
    setDeleteDialogOpen(false); 
  };

  return (
    <div style={s.page}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: "-0.3px" }}>Employee Management</h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#8a909c" }}>Manage your store staff and roles</p>
        </div>
        <button style={s.addBtn} onClick={openAdd}><Plus size={14} /> Add Employee</button>
      </div>

      {/* Total Working Hours (TWH) Section */}
      <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 10, padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ padding: 8, background: "#f0fdf4", borderRadius: 8 }}>
            <Clock size={18} color="#059669" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#1a1d23" }}>Total Working Hours (TWH)</h3>
            <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>Search and view employee monthly working hours</p>
          </div>
        </div>
        <div style={{ position: "relative", maxWidth: 350, marginBottom: 12 }}>
          <Search size={14} color="#8a909c" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
          <input
            style={{ ...s.searchInput, paddingLeft: 34 }}
            placeholder="Search staff by name to view monthly hours..."
            value={staffSearch}
            onChange={(e) => setStaffSearch(e.target.value)}
          />
        </div>
        <div style={{ maxWidth: 220, marginBottom: 12 }}>
          <select style={s.select} value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
            {monthOptions.map((month) => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>
        </div>
        {staffSearch && visibleStaff.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {visibleStaff.map((emp) => {
              const summary = calculateMonthlyWorkSummary(emp._id || emp.id, selectedMonth, allShifts);

              return (
              <div key={emp._id || emp.id} style={{ padding: 16, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{ padding: 6, background: "#eef1f5", borderRadius: "50%" }}>
                    <UserCircle size={16} color="#6b7280" />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{emp.fullName || "No Name"}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>{emp.email}</p>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8 }}>
                  <div style={{ padding: 10, background: "white", borderRadius: 6, border: "1px solid #e5e7eb" }}>
                    <p style={{ margin: 0, fontSize: 10, color: "#6b7280", fontWeight: 500 }}>Total Hours</p>
                    <p style={{ margin: "2px 0 0", fontSize: 16, fontWeight: 700, color: "#1a1d23" }}>{formatDuration(summary.totalHours)}</p>
                  </div>
                  <div style={{ padding: 10, background: "white", borderRadius: 6, border: "1px solid #e5e7eb" }}>
                    <p style={{ margin: 0, fontSize: 10, color: "#6b7280", fontWeight: 500 }}>Regular</p>
                    <p style={{ margin: "2px 0 0", fontSize: 16, fontWeight: 700, color: "#1a1d23" }}>{formatDuration(summary.regularHours)}</p>
                  </div>
                  <div style={{ padding: 10, background: "white", borderRadius: 6, border: "1px solid #e5e7eb" }}>
                    <p style={{ margin: 0, fontSize: 10, color: "#6b7280", fontWeight: 500 }}>Overtime</p>
                    <p style={{ margin: "2px 0 0", fontSize: 16, fontWeight: 700, color: summary.overtimeHours > 0 ? "#e53e3e" : "#1a1d23" }}>{formatDuration(summary.overtimeHours)}</p>
                  </div>
                  <div style={{ padding: 10, background: "white", borderRadius: 6, border: "1px solid #e5e7eb" }}>
                    <p style={{ margin: 0, fontSize: 10, color: "#6b7280", fontWeight: 500 }}>Days / Shifts</p>
                    <p style={{ margin: "2px 0 0", fontSize: 16, fontWeight: 700, color: "#1a1d23" }}>{summary.daysWorked} / {summary.shifts}</p>
                  </div>
                </div>
                {summary.activeShiftCount > 0 && (
                  <p style={{ margin: "8px 0 0", fontSize: 11, color: "#059669" }}>
                    Includes {summary.activeShiftCount} active shift{summary.activeShiftCount === 1 ? "" : "s"} up to now
                  </p>
                )}
              </div>
              );
            })}
          </div>
        )}
        {staffSearch && visibleStaff.length === 0 && (
          <div style={{ padding: 20, textAlign: "center", color: "#6b7280", fontSize: 13, background: "#f9fafb", borderRadius: 6, border: "1px dashed #d1d5db" }}>
            <Users size={24} color="#d1d5db" style={{ margin: "0 auto 8px", display: "block" }} />
            <p style={{ margin: 0, fontWeight: 500 }}>No employee found matching "{staffSearch}"</p>
          </div>
        )}
        {!staffSearch && (
          <div style={{ padding: 20, textAlign: "center", color: "#6b7280", fontSize: 13, background: "#f9fafb", borderRadius: 6 }}>
            <Search size={24} color="#d1d5db" style={{ margin: "0 auto 8px", display: "block" }} />
            <p style={{ margin: 0 }}>Start typing an employee name to view their monthly working hours</p>
          </div>
        )}
      </div>

      <div style={s.card}>
        <div style={s.cardHeader}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Employees ({filtered?.length ?? 0})</span>
          <div style={{ position: "relative", width: 240 }}>
            <Search size={14} color="#8a909c" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
            <input style={s.searchInput} placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {!loading && filtered?.length === 0 && (
          <div style={s.empty}>
            <Users size={36} color="#e2e5e9" style={{ margin: "0 auto 10px", display: "block" }} />
            <p style={{ margin: 0, fontWeight: 600 }}>No employees found</p>
          </div>
        )}

        {filtered?.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Employee", "Email", "Role", "Branch", "Actions"].map((h, i) => (
                    <th key={h} style={{ ...s.th, textAlign: i === 4 ? "right" : "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp) => {
                  const empId = emp.id || emp._id;
                  return (
                  <tr key={empId} style={{ background: "white" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f5f5f5"}
                    onMouseLeave={e => e.currentTarget.style.background = "white"}
                  >
                    <td style={s.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ padding: 5, background: "#eef1f5", borderRadius: "50%" }}>
                          <UserCircle size={16} color="#6b7280" />
                        </div>
                        <span style={{ fontWeight: 600 }}>{emp.fullName}</span>
                      </div>
                    </td>
                    <td style={{ ...s.td, color: "#8a909c" }}>{emp.email}</td>
                    <td style={s.td}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20, textTransform: "capitalize", ...(roleStyle[emp.role] ?? { background: "#eef1f5", color: "#6b7280" }) }}>
                        {emp.role?.replace('ROLE_', '').replace('_', ' ') ?? "CASHIER"}
                      </span>
                    </td>
                    <td style={{ ...s.td, color: "#8a909c" }}>{branches?.find((b) => (b._id || b.id) === emp.branchId)?.name ?? "—"}</td>
                    <td style={{ ...s.td, textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                        <button style={s.iconBtn} onClick={() => openEdit(emp)}><Pencil size={13} color="#6b7280" /></button>
                        <button style={{ ...s.iconBtn, borderColor: "#fecaca" }} onClick={() => openDelete(emp)}><Trash2 size={13} color="#e53e3e" /></button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Employee" : "Add New Employee"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update employee information" : "Fill in the details to add a new employee"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <select style={s.select} value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
                {ROLES.map((r) => <option key={r} value={r}>{r.replace('ROLE_', '').replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Branch {(form.role === "ROLE_BRANCH_MANAGER" || form.role === "ROLE_BRANCH_CASHIER") && <span className="text-red-500">*</span>}</Label>
              <select 
                style={s.select} 
                value={form.branchId} 
                onChange={(e) => setForm((f) => ({ ...f, branchId: e.target.value }))}
                required={form.role === "ROLE_BRANCH_MANAGER" || form.role === "ROLE_BRANCH_CASHIER"}
              >
                <option value="">Select branch</option>
                {branches?.map((b) => <option key={b._id || b.id} value={b._id || b.id}>{b.name}</option>)}
              </select>
              {(form.role === "ROLE_BRANCH_MANAGER" || form.role === "ROLE_BRANCH_CASHIER") && (
                <p className="text-xs text-gray-500">Branch is required for this role</p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading} style={{ background: "linear-gradient(135deg,#1a1d23,#4a4d55)", color: "white", border: "none" }}>{editing ? "Update" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove Employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{selected?.fullName}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Remove</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

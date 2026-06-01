import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Search, Users, Pencil, Trash2, UserCircle, Clock } from "lucide-react";
import { findBranchEmployee, createBranchEmpoyee, updateEmpoyee, deleteEmployee } from "@/Redux Toolkit/Features/Employee/employeeThunk";
import { getShiftsByBranch } from "@/Redux Toolkit/Features/shiftReport/shiftReportThunk";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import secureStorage from "@/util/secureStorage";

const EMPTY_FORM = { fullName: "", email: "", phone: "", role: "ROLE_BRANCH_CASHIER" };
const ROLES = ["ROLE_BRANCH_CASHIER", "ROLE_BRANCH_MANAGER"];

const roleStyle = {
  ROLE_BRANCH_MANAGER: { background: "#f5f3ff", color: "#7c3aed" },
  ROLE_BRANCH_CASHIER: { background: "#eff6ff", color: "#3b82f6" },
};

const s = {
  page:        { padding: 24, display: "flex", flexDirection: "column", gap: 20, fontFamily: "'DM Sans','Inter',sans-serif", color: "#1a1d23", background: "#f5f5f5", minHeight: "100%" },
  card:        { background: "white", border: "1px solid #e5e7eb", borderRadius: 10 },
  cardHeader:  { padding: "14px 18px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" },
  searchInput: { width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 12px 7px 34px", fontFamily: "inherit", fontSize: 13, outline: "none", background: "#f5f5f5", boxSizing: "border-box" },
  addBtn:      { display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "linear-gradient(135deg,#1a1d23,#4a4d55)", color: "white", border: "none", borderRadius: 8, fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  th:          { padding: "10px 16px", fontSize: 12, fontWeight: 600, color: "#6b7280", background: "#f5f5f5", textAlign: "left", borderBottom: "1px solid #e5e7eb" },
  td:          { padding: "12px 16px", fontSize: 13, borderBottom: "1px solid #e5e7eb" },
  iconBtn:     { border: "1px solid #e5e7eb", background: "white", borderRadius: 6, padding: "4px 6px", cursor: "pointer", display: "flex", alignItems: "center" },
  select:      { width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 10px", fontFamily: "inherit", fontSize: 13, background: "#f5f5f5", outline: "none" },
};

export default function BranchEmployees() {
  const dispatch = useDispatch();
  const userData = secureStorage.getUserData();
  const branchId = userData?.branchId;
  const { employees, loading } = useSelector((s) => s.employee);
  const { shiftsByBranch } = useSelector((s) => s.shiftReport);

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [staffSearch, setStaffSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM format

  useEffect(() => {
    if (branchId) {
      dispatch(findBranchEmployee({ branchId }));
      dispatch(getShiftsByBranch(branchId));
    }
  }, [dispatch, branchId]);

  const filtered = employees?.filter((e) =>
    `${e.fullName} ${e.email}`.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate work hours for date range
  const getWorkHours = (employeeId, fromDate, toDate) => {
    if (!shiftsByBranch) return 0;
    
    const from = new Date(fromDate);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999); // Include full end date
    
    const employeeShifts = shiftsByBranch.filter(shift => {
      const matchesEmployee = shift.cashierId === employeeId || 
                             shift.userId === employeeId ||
                             shift.employeeId === employeeId;
      
      if (!matchesEmployee || !shift.startTime) return false;
      
      const shiftDate = new Date(shift.startTime);
      return shiftDate >= from && shiftDate <= to;
    });
    
    let totalHours = 0;
    employeeShifts.forEach(shift => {
      if (shift.startTime) {
        const start = new Date(shift.startTime);
        const end = shift.endTime ? new Date(shift.endTime) : new Date();
        const hours = (end - start) / (1000 * 60 * 60);
        totalHours += Math.max(0, hours);
      }
    });
    
    return Math.round(totalHours * 10) / 10;
  };

  // Find searched staff members for TWH section
  const searchedEmployees = employees?.filter(emp => {
    if (!staffSearch.trim()) return false;
    const fullName = (emp.fullName || '').toLowerCase();
    const email = (emp.email || '').toLowerCase();
    const searchTerm = staffSearch.toLowerCase();
    
    return fullName.includes(searchTerm) || email.includes(searchTerm);
  }) || [];

  // Calculate work hours for specific month
  const getMonthlyWorkHours = (employeeId, monthYear) => {
    if (!shiftsByBranch) return { totalHours: 0, regularHours: 0, overtimeHours: 0, daysWorked: 0, avgHours: 0 };
    
    const [year, month] = monthYear.split('-');
    const targetMonth = parseInt(month) - 1; // JS months are 0-indexed
    const targetYear = parseInt(year);
    
    const employeeShifts = shiftsByBranch.filter(shift => {
      const matchesEmployee = shift.cashierId === employeeId || 
                             shift.userId === employeeId ||
                             shift.employeeId === employeeId;
      
      if (!matchesEmployee || !shift.startTime) return false;
      
      const shiftDate = new Date(shift.startTime);
      return shiftDate.getMonth() === targetMonth && shiftDate.getFullYear() === targetYear;
    });
    
    let totalHours = 0;
    const dailyHours = {};
    
    employeeShifts.forEach(shift => {
      if (shift.startTime) {
        const start = new Date(shift.startTime);
        const end = shift.endTime ? new Date(shift.endTime) : new Date();
        const hours = Math.max(0, (end - start) / (1000 * 60 * 60));
        totalHours += hours;
        
        const day = start.toDateString();
        dailyHours[day] = (dailyHours[day] || 0) + hours;
      }
    });
    
    const daysWorked = Object.keys(dailyHours).length;
    const regularHours = Math.min(totalHours, 160); // Assuming 160h/month regular
    const overtimeHours = Math.max(0, totalHours - 160);
    
    return {
      totalHours: Math.round(totalHours * 10) / 10,
      regularHours: Math.round(regularHours * 10) / 10,
      overtimeHours: Math.round(overtimeHours * 10) / 10,
      daysWorked,
      avgHours: daysWorked > 0 ? Math.round((totalHours / daysWorked) * 10) / 10 : 0,
      shifts: employeeShifts.length
    };
  };

  // Get current user's data
  const currentUser = employees?.find(emp => emp.email === userData?.email);
  const isStaff = userData?.role === 'ROLE_BRANCH_CASHIER';
  
  // Generate last 6 months for dropdown
  const getLastSixMonths = () => {
    const months = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push({
        value: date.toISOString().slice(0, 7),
        label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      });
    }
    return months;
  };
  const openAdd    = () => { setEditing(null); setForm(EMPTY_FORM); setDialogOpen(true); };
  const openEdit   = (e) => { setEditing(e); setForm({ fullName: e.fullName ?? "", email: e.email ?? "", phone: e.phone ?? "", role: e.role ?? "ROLE_BRANCH_CASHIER" }); setDialogOpen(true); };
  const openDelete = (e) => { setSelected(e); setDeleteDialogOpen(true); };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (editing) dispatch(updateEmpoyee({ employeeId: editing._id, employeeDetails: form }));
    else dispatch(createBranchEmpoyee({ employee: { ...form, branchId }, branchId }));
    setDialogOpen(false);
  };

  const handleDelete = () => {
    dispatch(deleteEmployee({ employeeId: selected._id }));
    setDeleteDialogOpen(false);
  };

  return (
    <div style={s.page}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Employees</h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#8a909c" }}>Manage branch staff</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {!isStaff && (
            <button style={s.addBtn} onClick={openAdd}><Plus size={14} /> Add Employee</button>
          )}
        </div>
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
        
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 350 }}>
            <Search size={14} color="#8a909c" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
            <input 
              style={{ ...s.searchInput, paddingLeft: 34 }}
              placeholder="Search staff by name to view monthly hours..."
              value={staffSearch}
              onChange={(e) => setStaffSearch(e.target.value)}
            />
          </div>
        </div>
        
        {staffSearch && (
          <div style={{ marginBottom: 12, padding: 8, background: "#f0f9ff", borderRadius: 6, fontSize: 12, color: "#0369a1" }}>
            Searching for: "{staffSearch}" - Found {searchedEmployees.length} employee(s)
          </div>
        )}
        
        {staffSearch && searchedEmployees.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {searchedEmployees.map((emp) => {
              const monthlyData = getLastSixMonths().map(month => ({
                month: month.label,
                hours: getMonthlyWorkHours(emp._id || emp.id, month.value)
              }));
              
              return (
                <div key={emp._id || emp.id} style={{ padding: 16, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div style={{ padding: 6, background: "#eef1f5", borderRadius: "50%" }}>
                      <UserCircle size={16} color="#6b7280" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
                        {emp.fullName || 'No Name'}
                      </p>
                      <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>{emp.email}</p>
                    </div>
                  </div>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8 }}>
                    {monthlyData.map(({ month, hours }) => (
                      <div key={month} style={{ padding: 8, background: "white", borderRadius: 6, border: "1px solid #e5e7eb" }}>
                        <p style={{ margin: 0, fontSize: 10, color: "#6b7280", fontWeight: 500 }}>{month.split(' ')[0]}</p>
                        <p style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 600, color: hours.overtimeHours > 0 ? "#e53e3e" : "#1a1d23" }}>
                          {hours.totalHours}h
                        </p>
                        {hours.overtimeHours > 0 && (
                          <p style={{ margin: 0, fontSize: 9, color: "#e53e3e" }}>+{hours.overtimeHours}h OT</p>
                        )}
                        <p style={{ margin: 0, fontSize: 9, color: "#8a909c" }}>{hours.shifts} shifts</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {staffSearch && searchedEmployees.length === 0 && staffSearch.trim() && (
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
          <span style={{ fontSize: 13, fontWeight: 600 }}>
            {isStaff ? "My Profile" : `All Staff (${filtered?.length ?? 0})`}
          </span>
          {!isStaff && (
            <div style={{ position: "relative", width: 240 }}>
              <Search size={14} color="#8a909c" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
              <input style={s.searchInput} placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          )}
        </div>

        {loading && <p style={{ textAlign: "center", padding: 40, color: "#8a909c" }}>Loading...</p>}

        {!loading && (isStaff ? !currentUser : filtered?.length === 0) && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#6b7280" }}>
            <Users size={36} color="#e2e5e9" style={{ margin: "0 auto 10px", display: "block" }} />
            <p style={{ margin: 0, fontWeight: 600 }}>
              {isStaff ? "Profile not found" : "No employees found"}
            </p>
          </div>
        )}

        {(isStaff ? currentUser : filtered?.length > 0) && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {(isStaff ? 
                    ["Employee", "Email", "Role"] : 
                    ["Employee", "Email", "Phone", "Role", "Actions"]
                  ).map((h, i) => (
                    <th key={h} style={{ ...s.th, textAlign: (isStaff ? false : i === 4) ? "right" : "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(isStaff ? [currentUser] : filtered).map((emp) => {
                  const monthlyHours = getMonthlyWorkHours(emp._id || emp.id, selectedMonth);
                  return (
                    <tr key={emp._id} style={{ background: "white" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f5f5f5"}
                      onMouseLeave={e => e.currentTarget.style.background = "white"}
                    >
                      <td style={s.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ padding: 5, background: "#eef1f5", borderRadius: "50%" }}>
                            <UserCircle size={16} color="#6b7280" />
                          </div>
                          <span style={{ fontWeight: 600 }}>
                            {emp.fullName || 'No Name'}
                          </span>
                          {isStaff && <span style={{ fontSize: 11, color: "#059669", background: "#f0fdf4", padding: "2px 6px", borderRadius: 4 }}>(You)</span>}
                        </div>
                      </td>
                      <td style={{ ...s.td, color: "#8a909c" }}>{emp.email}</td>
                      {!isStaff && <td style={{ ...s.td, color: "#8a909c" }}>{emp.phone ?? "—"}</td>}
                      <td style={s.td}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20, textTransform: "capitalize", ...(roleStyle[emp.role] ?? { background: "#eef1f5", color: "#6b7280" }) }}>
                          {emp.role?.replace("ROLE_", "").replace("_", " ") ?? "CASHIER"}
                        </span>
                      </td>
                      {!isStaff && (
                        <td style={{ ...s.td, textAlign: "right" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                            <button style={s.iconBtn} onClick={() => openEdit(emp)}><Pencil size={13} color="#6b7280" /></button>
                            <button style={{ ...s.iconBtn, borderColor: "#fecaca" }} onClick={() => openDelete(emp)}><Trash2 size={13} color="#e53e3e" /></button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* My Hours Modal for Staff */}
      {/* Removed for now */}

      {!isStaff && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{editing ? "Edit Employee" : "Add Employee"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <Label>Full Name</Label>
                  <Input value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Phone</Label>
                    <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Role</Label>
                    <select style={s.select} value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
                      {ROLES.map((r) => <option key={r} value={r}>{r.replace("ROLE_", "").replace("_", " ")}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={loading} style={{ background: "linear-gradient(135deg,#1a1d23,#4a4d55)", color: "white", border: "none" }}>
                  {editing ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {!isStaff && (
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Remove Employee</DialogTitle></DialogHeader>
            <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>Remove <strong>{selected?.fullName}</strong>?</p>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete}>Remove</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
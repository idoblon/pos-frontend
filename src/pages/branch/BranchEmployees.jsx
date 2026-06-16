import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Search, Users, Pencil, Trash2, UserCircle } from "lucide-react";
import { findBranchEmployee, createBranchEmpoyee, updateEmpoyee, deleteEmployee } from "@/Redux Toolkit/Features/Employee/employeeThunk";
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

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (branchId) {
      dispatch(findBranchEmployee({ branchId }));
    }
  }, [dispatch, branchId]);

  const filtered = employees?.filter((e) =>
    `${e.fullName} ${e.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const currentUser = employees?.find(emp => emp.email === userData?.email);
  const isStaff = userData?.role === 'ROLE_BRANCH_CASHIER';
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


      {/* Employee Table */}
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
                {(isStaff ? [currentUser] : filtered).map((emp) => (
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
                  ))}
                
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
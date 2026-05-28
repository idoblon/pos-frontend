import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Search, GitBranch, MapPin, Pencil, Mail, Clock, Phone, Calendar } from "lucide-react";
import { getBranchesByStore, createBranch, updateBranch } from "@/Redux Toolkit/Features/branch/branchThunk";
import { getUserProfile } from "@/Redux Toolkit/Features/user/userThunk";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import secureStorage from "@/util/secureStorage";

const EMPTY_FORM = { 
  name: "", 
  address: "", 
  phone: "", 
  email: "", 
  openTime: "", 
  openPeriod: "AM",
  closeTime: "",
  closePeriod: "PM",
  workingDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]
};

const DAYS_OF_WEEK = [
  { value: "MONDAY", label: "Monday" },
  { value: "TUESDAY", label: "Tuesday" },
  { value: "WEDNESDAY", label: "Wednesday" },
  { value: "THURSDAY", label: "Thursday" },
  { value: "FRIDAY", label: "Friday" },
  { value: "SATURDAY", label: "Saturday" },
  { value: "SUNDAY", label: "Sunday" },
];

const s = {
  page: { padding: 24, display: "flex", flexDirection: "column", gap: 20, fontFamily: "'DM Sans','Inter',sans-serif", color: "#1a1d23", background: "#f5f5f5", minHeight: "100%" },
  card: { background: "white", border: "1px solid #e5e7eb", borderRadius: 10 },
  cardHeader: { padding: "14px 18px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" },
  cardBody: { padding: 18 },
  searchWrap: { position: "relative" },
  searchInput: { width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 12px 7px 34px", fontFamily: "inherit", fontSize: 13, color: "#1a1d23", background: "#f5f5f5", outline: "none", boxSizing: "border-box" },
  addBtn: { display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "linear-gradient(135deg,#1a1d23,#4a4d55)", color: "white", border: "none", borderRadius: 8, fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  branchCard: { border: "1px solid #e5e7eb", borderRadius: 10, padding: "14px 16px", background: "white", transition: "box-shadow 0.15s" },
  editBtn: { border: "1px solid #e5e7eb", background: "white", borderRadius: 6, padding: "4px 6px", cursor: "pointer", display: "flex", alignItems: "center", color: "#6b7280" },
  empty: { textAlign: "center", padding: "40px 0", color: "#6b7280", fontSize: 13 },
};

export default function BranchManagement() {
  const dispatch = useDispatch();
  const { user } = useSelector((st) => st.auth);
  const { userProfile } = useSelector((st) => st.user);
  const userData = secureStorage.getUserData();
  
  // Try multiple sources for storeId
  const storeId = user?.storeId || userData?.storeId || userProfile?.storeId || localStorage.getItem("storeId");
  
  const { branches, loading } = useSelector((st) => st.branch);

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const toggleWorkingDay = (day) => {
    setForm((f) => ({
      ...f,
      workingDays: f.workingDays.includes(day)
        ? f.workingDays.filter((d) => d !== day)
        : [...f.workingDays, day],
    }));
  };

  useEffect(() => {
    console.log("=== STOREID DEBUG ===");
    console.log("Auth user:", user);
    console.log("User profile:", userProfile);
    console.log("SecureStorage userData:", userData);
    console.log("LocalStorage storeId:", localStorage.getItem("storeId"));
    console.log("Resolved storeId:", storeId);
    console.log("====================");
    
    if (!storeId) {
      console.error("❌ No storeId found in any source!");
      toast.error("Store ID not found. Fetching user profile...");
      
      dispatch(getUserProfile()).then((result) => {
        console.log("User profile fetch result:", result);
        if (result.payload?.storeId) {
          console.log("✅ Got storeId from profile:", result.payload.storeId);
          dispatch(getBranchesByStore(result.payload.storeId));
        }
      });
      return;
    }
    
    console.log("✅ Fetching branches for store:", storeId);
    dispatch(getBranchesByStore(storeId));
  }, [dispatch, storeId]);

  const filtered = branches?.filter(
    (b) =>
      b.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.address?.toLowerCase().includes(search.toLowerCase()) ||
      b.phone?.toLowerCase().includes(search.toLowerCase()) ||
      b.email?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setDialogOpen(true); };
  const openEdit = (b) => { 
    setEditing(b);
    
    // Parse 24-hour time to 12-hour with AM/PM
    let openTime = "", openPeriod = "AM";
    let closeTime = "", closePeriod = "PM";
    
    if (b.openTime) {
      const [hours, minutes] = b.openTime.split(":");
      const h = parseInt(hours);
      if (h >= 12) {
        openPeriod = "PM";
        openTime = `${h === 12 ? 12 : h - 12}:${minutes}`;
      } else {
        openTime = `${h === 0 ? 12 : h}:${minutes}`;
      }
    }
    
    if (b.closeTime) {
      const [hours, minutes] = b.closeTime.split(":");
      const h = parseInt(hours);
      if (h >= 12) {
        closePeriod = "PM";
        closeTime = `${h === 12 ? 12 : h - 12}:${minutes}`;
      } else {
        closeTime = `${h === 0 ? 12 : h}:${minutes}`;
      }
    }
    
    setForm({ 
      name: b.name ?? "", 
      address: b.address ?? "", 
      phone: b.phone ?? "",
      email: b.email ?? "",
      openTime,
      openPeriod,
      closeTime,
      closePeriod,
      workingDays: b.workingDays ?? []
    }); 
    setDialogOpen(true); 
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!storeId) {
      toast.error("Store ID not found. Please log in again.");
      console.error("No storeId found in localStorage");
      return;
    }
    
    // Convert 12-hour time to 24-hour format
    const convert12to24 = (time, period) => {
      if (!time) return "";
      const [hours, minutes] = time.split(":");
      let h = parseInt(hours);
      if (period === "PM" && h !== 12) h += 12;
      if (period === "AM" && h === 12) h = 0;
      return `${String(h).padStart(2, "0")}:${minutes}:00`;
    };
    
    const formattedData = {
      name: form.name,
      address: form.address,
      phone: form.phone,
      email: form.email,
      openTime: convert12to24(form.openTime, form.openPeriod),
      closeTime: convert12to24(form.closeTime, form.closePeriod),
      workingDays: form.workingDays
    };
    
    const payload = {
      ...formattedData,
      storeId: storeId ? parseInt(storeId) : null,
      store: storeId ? { id: parseInt(storeId) } : null
    };
    
    console.log("Form submitted:", formattedData);
    console.log("Payload to send:", payload);
    
    if (editing) {
      const branchId = editing.id || editing._id;
      dispatch(updateBranch({ id: branchId, dto: payload }))
        .then((result) => {
          if (result.type === 'branch/update/fulfilled') {
            toast.success("Branch updated successfully");
            dispatch(getBranchesByStore(storeId));
          } else {
            toast.error(result.payload || "Failed to update branch");
          }
        });
    } else {
      dispatch(createBranch(payload))
        .then((result) => {
          if (result.type === 'branch/create/fulfilled') {
            toast.success("Branch created successfully");
            dispatch(getBranchesByStore(storeId));
          } else {
            toast.error(result.payload || "Failed to create branch");
          }
        });
    }
    setDialogOpen(false);
  };

  return (
    <div style={s.page}>
      {/* Top */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: "-0.3px" }}>Branch Management</h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#8a909c" }}>Manage all branches of your store</p>
        </div>
        <button style={s.addBtn} onClick={openAdd}>
          <Plus size={14} /> Add Branch
        </button>
      </div>

      {/* Card */}
      <div style={s.card}>
        <div style={s.cardHeader}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Branches ({filtered?.length ?? 0})</span>
          <div style={{ ...s.searchWrap, width: 240 }}>
            <Search size={14} color="#8a909c" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
            <input
              style={s.searchInput}
              placeholder="Search branches..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div style={s.cardBody}>
          {loading && <p style={s.empty}>Loading...</p>}
          {!loading && filtered?.length === 0 && (
            <div style={s.empty}>
              <GitBranch size={36} color="#e2e5e9" style={{ margin: "0 auto 10px", display: "block" }} />
              <p style={{ margin: 0, fontWeight: 600 }}>No branches found</p>
              <p style={{ margin: "4px 0 0", fontSize: 12 }}>Add your first branch to get started</p>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
            {filtered?.map((b) => (
              <div key={b.id || b._id} style={s.branchCard}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ padding: 7, borderRadius: 8, background: "#e5e7eb" }}>
                      <GitBranch size={15} color="#1a1d23" />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{b.name}</p>
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 20,
                        background: b.status === "inactive" ? "#eef1f5" : "#f5f5f5",
                        color: b.status === "inactive" ? "#6b7280" : "#1a6b3c",
                      }}>
                        {b.status ?? "active"}
                      </span>
                    </div>
                  </div>
                  <button style={s.editBtn} onClick={() => openEdit(b)}>
                    <Pencil size={13} />
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {b.address && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#8a909c" }}>
                      <MapPin size={12} /> {b.address}
                    </div>
                  )}
                  {b.phone && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#8a909c" }}>
                      <Phone size={12} /> {b.phone}
                    </div>
                  )}
                  {b.email && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#8a909c" }}>
                      <Mail size={12} /> {b.email}
                    </div>
                  )}
                  {(b.openTime || b.closeTime) && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#8a909c" }}>
                      <Clock size={12} /> {b.openTime || "--"} - {b.closeTime || "--"}
                    </div>
                  )}
                  {b.workingDays && b.workingDays.length > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#8a909c" }}>
                      <Calendar size={12} /> {b.workingDays.join(", ")}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Branch" : "Add New Branch"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update the branch information below" : "Fill in the details to create a new branch"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {[
              { id: "name", label: "Branch Name", required: true },
              { id: "address", label: "Address", required: true },
              { id: "phone", label: "Phone", type: "tel", required: false },
              { id: "email", label: "Email", type: "email", required: false },
            ].map(({ id, label, type = "text", required = false }) => (
              <div key={id} className="space-y-1.5">
                <Label htmlFor={id}>{label}</Label>
                <Input 
                  id={id} 
                  type={type}
                  value={form[id]} 
                  onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))} 
                  required={required} 
                />
              </div>
            ))}
            
            <div className="space-y-1.5">
              <Label>Opening Time</Label>
              <div className="flex gap-2">
                <Input 
                  type="text"
                  placeholder="HH:MM"
                  value={form.openTime}
                  onChange={(e) => setForm((f) => ({ ...f, openTime: e.target.value }))}
                  className="flex-1"
                />
                <select
                  value={form.openPeriod}
                  onChange={(e) => setForm((f) => ({ ...f, openPeriod: e.target.value }))}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <Label>Closing Time</Label>
              <div className="flex gap-2">
                <Input 
                  type="text"
                  placeholder="HH:MM"
                  value={form.closeTime}
                  onChange={(e) => setForm((f) => ({ ...f, closeTime: e.target.value }))}
                  className="flex-1"
                />
                <select
                  value={form.closePeriod}
                  onChange={(e) => setForm((f) => ({ ...f, closePeriod: e.target.value }))}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Working Days</Label>
              <div className="grid grid-cols-2 gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={day.value}
                      checked={form.workingDays.includes(day.value)}
                      onCheckedChange={() => toggleWorkingDay(day.value)}
                    />
                    <label
                      htmlFor={day.value}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {day.label}
                    </label>
                  </div>
                ))}
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
    </div>
  );
}

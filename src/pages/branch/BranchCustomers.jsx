import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Search, UserCircle, Pencil, Trash2 } from "lucide-react";
import { getAllCustomers, createCustomer, updateCustomer, deleteCustomer } from "@/Redux Toolkit/Features/customer/customerThunk";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const EMPTY_FORM = { name: "", email: "", phone: "", address: "" };

const s = {
  page:        { padding: 24, display: "flex", flexDirection: "column", gap: 20, fontFamily: "'DM Sans','Inter',sans-serif", color: "#1a1d23", background: "#f5f5f5", minHeight: "100%" },
  card:        { background: "white", border: "1px solid #e5e7eb", borderRadius: 10 },
  cardHeader:  { padding: "14px 18px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" },
  searchInput: { width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 12px 7px 34px", fontFamily: "inherit", fontSize: 13, outline: "none", background: "#f5f5f5", boxSizing: "border-box" },
  addBtn:      { display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "linear-gradient(135deg,#1a1d23,#4a4d55)", color: "white", border: "none", borderRadius: 8, fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  th:          { padding: "10px 16px", fontSize: 12, fontWeight: 600, color: "#6b7280", background: "#f5f5f5", textAlign: "left", borderBottom: "1px solid #e5e7eb" },
  td:          { padding: "12px 16px", fontSize: 13, borderBottom: "1px solid #e5e7eb" },
  iconBtn:     { border: "1px solid #e5e7eb", background: "white", borderRadius: 6, padding: "4px 6px", cursor: "pointer", display: "flex", alignItems: "center" },
};

export default function BranchCustomers() {
  const dispatch = useDispatch();
  const { customers, loading } = useSelector((s) => s.customer);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => { dispatch(getAllCustomers()); }, [dispatch]);

  const filtered = customers?.filter((c) =>
    `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd    = () => { setEditing(null); setForm(EMPTY_FORM); setDialogOpen(true); };
  const openEdit   = (c) => { setEditing(c); setForm({ name: c.name ?? "", email: c.email ?? "", phone: c.phone ?? "", address: c.address ?? "" }); setDialogOpen(true); };
  const openDelete = (c) => { setSelected(c); setDeleteDialogOpen(true); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editing) dispatch(updateCustomer({ id: editing.id ?? editing._id, customer: form }));
    else dispatch(createCustomer(form));
    setDialogOpen(false);
  };

  const handleDelete = () => {
    dispatch(deleteCustomer(selected.id ?? selected._id));
    setDeleteDialogOpen(false);
  };

  return (
    <div style={s.page}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Customers</h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#8a909c" }}>Manage customer records</p>
        </div>
        <button style={s.addBtn} onClick={openAdd}><Plus size={14} /> Add Customer</button>
      </div>

      <div style={s.card}>
        <div style={s.cardHeader}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Customers ({filtered?.length ?? 0})</span>
          <div style={{ position: "relative", width: 240 }}>
            <Search size={14} color="#8a909c" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
            <input style={s.searchInput} placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {loading && <p style={{ textAlign: "center", padding: 40, color: "#8a909c" }}>Loading...</p>}

        {!loading && filtered?.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#6b7280" }}>
            <UserCircle size={36} color="#e2e5e9" style={{ margin: "0 auto 10px", display: "block" }} />
            <p style={{ margin: 0, fontWeight: 600 }}>No customers found</p>
          </div>
        )}

        {filtered?.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Name", "Email", "Phone", "Address", "Actions"].map((h, i) => (
                    <th key={h} style={{ ...s.th, textAlign: i === 4 ? "right" : "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id ?? c._id} style={{ background: "white" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f5f5f5"}
                    onMouseLeave={e => e.currentTarget.style.background = "white"}
                  >
                    <td style={s.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ padding: 5, background: "#eef1f5", borderRadius: "50%" }}>
                          <UserCircle size={16} color="#6b7280" />
                        </div>
                        <span style={{ fontWeight: 600 }}>{c.name}</span>
                      </div>
                    </td>
                    <td style={{ ...s.td, color: "#8a909c" }}>{c.email ?? "—"}</td>
                    <td style={{ ...s.td, color: "#8a909c" }}>{c.phone ?? "—"}</td>
                    <td style={{ ...s.td, color: "#8a909c" }}>{c.address ?? "—"}</td>
                    <td style={{ ...s.td, textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                        <button style={s.iconBtn} onClick={() => openEdit(c)}><Pencil size={13} color="#6b7280" /></button>
                        <button style={{ ...s.iconBtn, borderColor: "#fecaca" }} onClick={() => openDelete(c)}><Trash2 size={13} color="#e53e3e" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Customer" : "Add Customer"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {[{ id: "name", label: "Name", required: true }, { id: "email", label: "Email", type: "email" }, { id: "phone", label: "Phone" }, { id: "address", label: "Address" }].map(({ id, label, type, required }) => (
              <div key={id} className="space-y-1.5">
                <Label>{label}</Label>
                <Input type={type ?? "text"} value={form[id]} onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))} required={required} />
              </div>
            ))}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading} style={{ background: "linear-gradient(135deg,#1a1d23,#4a4d55)", color: "white", border: "none" }}>
                {editing ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Customer</DialogTitle></DialogHeader>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>Delete <strong>{selected?.name}</strong>?</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
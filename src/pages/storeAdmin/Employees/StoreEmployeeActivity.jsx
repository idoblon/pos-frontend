import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { findStoreEmployee } from "@/Redux Toolkit/Features/Employee/employeeThunk";
import secureStorage from "@/util/secureStorage";

const roleLabel = { 0: "Super Admin", 1: "Store Admin", 2: "Branch Manager", 3: "Cashier", 4: "Inventory Manager", 5: "Employee" };

const statusBadge = (status) => {
  const active = String(status || "").toLowerCase() === "active";
  return (
    <span style={{ padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600, background: active ? "#f0fdf4" : "#f3f4f6", color: active ? "#16a34a" : "#6b7280" }}>
      {active ? "Active" : "Inactive"}
    </span>
  );
};

export default function StoreEmployeeActivity() {
  const dispatch = useDispatch();
  const { employees, loading } = useSelector((s) => s.employee);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const storeId = secureStorage.getUserData()?.storeId;

  useEffect(() => {
    if (storeId) dispatch(findStoreEmployee({ storeId }));
  }, [dispatch, storeId]);

  const roles = ["ALL", ...new Set((employees || []).map((e) => String(e.role ?? "")))];

  const filtered = (employees || []).filter((e) => {
    const matchRole = roleFilter === "ALL" || String(e.role) === roleFilter;
    const matchSearch =
      !search ||
      (e.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
      (e.email || "").toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const neverLoggedIn = filtered.filter((e) => !e.lastLogin).length;
  const loggedInToday = filtered.filter((e) => {
    if (!e.lastLogin) return false;
    return new Date(e.lastLogin).toDateString() === new Date().toDateString();
  }).length;

  return (
    <div style={{ padding: 24, fontFamily: "'DM Sans','Inter',sans-serif", color: "#1a1d23" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Employee Activity</h1>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6b7280" }}>Login activity for all employees in your store</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Employees", value: employees?.length ?? 0 },
          { label: "Logged In Today", value: loggedInToday },
          { label: "Never Logged In", value: neverLoggedIn },
          { label: "Filtered Results", value: filtered.length },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: "white", border: "1px solid #e2e5e9", borderRadius: 10, padding: "14px 16px" }}>
            <p style={{ margin: 0, fontSize: 11, color: "#8a909c" }}>{label}</p>
            <p style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 800 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          style={{ flex: 1, minWidth: 200, padding: "8px 12px", border: "1px solid #e2e5e9", borderRadius: 8, fontSize: 13, outline: "none" }}
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{ padding: "8px 12px", border: "1px solid #e2e5e9", borderRadius: 8, fontSize: 13, outline: "none", background: "white" }}
        >
          {roles.map((r) => (
            <option key={r} value={r}>{r === "ALL" ? "All Roles" : (roleLabel[r] || `Role ${r}`)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: "white", border: "1px solid #e2e5e9", borderRadius: 10, overflow: "hidden" }}>
        {loading ? (
          <p style={{ padding: 24, textAlign: "center", color: "#6b7280", margin: 0 }}>Loading employees...</p>
        ) : filtered.length === 0 ? (
          <p style={{ padding: 24, textAlign: "center", color: "#6b7280", margin: 0 }}>No employees found</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  {["Name", "Email", "Phone", "Role", "Status", "Last Login"].map((h) => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, color: "#6b7280", fontSize: 11, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, i) => (
                  <tr key={e.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f6" : "none" }}
                    onMouseEnter={(ev) => (ev.currentTarget.style.background = "#f9fafb")}
                    onMouseLeave={(ev) => (ev.currentTarget.style.background = "white")}
                  >
                    <td style={{ padding: "10px 14px", fontWeight: 600 }}>{e.fullName || "—"}</td>
                    <td style={{ padding: "10px 14px", color: "#4b5563" }}>{e.email || "—"}</td>
                    <td style={{ padding: "10px 14px", color: "#4b5563" }}>{e.phone || "—"}</td>
                    <td style={{ padding: "10px 14px", color: "#4b5563" }}>{roleLabel[e.role] || `Role ${e.role}`}</td>
                    <td style={{ padding: "10px 14px" }}>{statusBadge(e.status)}</td>
                    <td style={{ padding: "10px 14px", color: e.lastLogin ? "#1a1d23" : "#9ca3af", whiteSpace: "nowrap" }}>
                      {e.lastLogin
                        ? new Date(e.lastLogin).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
                        : "Never"}
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

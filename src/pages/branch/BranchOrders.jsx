import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, ShoppingBag } from "lucide-react";
import { getOrdersByBranch } from "@/Redux Toolkit/Features/order/orderThunk";
import secureStorage from "@/util/secureStorage";

const statusStyle = {
  COMPLETED: { background: "#f0fdf4", color: "#059669" },
  PENDING:   { background: "#fffbeb", color: "#d97706" },
  CANCELLED: { background: "#fef2f2", color: "#e53e3e" },
};

const s = {
  page: { padding: 24, display: "flex", flexDirection: "column", gap: 20, fontFamily: "'DM Sans','Inter',sans-serif", color: "#1a1d23", background: "#f0fdf4", minHeight: "100%" },
  card: { background: "white", border: "1px solid #d1fae5", borderRadius: 10 },
  cardHeader: { padding: "14px 18px", borderBottom: "1px solid #d1fae5", display: "flex", alignItems: "center", justifyContent: "space-between" },
  searchInput: { width: "100%", border: "1px solid #d1fae5", borderRadius: 8, padding: "7px 12px 7px 34px", fontFamily: "inherit", fontSize: 13, outline: "none", background: "#f0fdf4", boxSizing: "border-box" },
  th: { padding: "10px 16px", fontSize: 12, fontWeight: 600, color: "#6b7280", background: "#f0fdf4", textAlign: "left", borderBottom: "1px solid #d1fae5" },
  td: { padding: "12px 16px", fontSize: 13, borderBottom: "1px solid #d1fae5" },
};

export default function BranchOrders() {
  const dispatch = useDispatch();
  const userData = secureStorage.getUserData();
  const branchId = userData?.branchId;
  const { orders, loading } = useSelector((s) => s.order);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    if (branchId) dispatch(getOrdersByBranch({ branchId }));
  }, [dispatch, branchId]);

  const filtered = orders?.filter((o) => {
    const matchSearch = (o.id ?? o._id ?? "").toString().includes(search) ||
      (o.customerName ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div style={s.page}>
      <div>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Orders & Transactions</h1>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#8a909c" }}>All branch orders and payment details</p>
      </div>

      <div style={s.card}>
        <div style={s.cardHeader}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Orders ({filtered?.length ?? 0})</span>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ border: "1px solid #d1fae5", borderRadius: 8, padding: "7px 10px", fontSize: 13, background: "#f0fdf4", outline: "none", fontFamily: "inherit" }}
            >
              {["ALL", "COMPLETED", "PENDING", "CANCELLED"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <div style={{ position: "relative", width: 240 }}>
              <Search size={14} color="#8a909c" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
              <input style={s.searchInput} placeholder="Search by order ID..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>

        {loading && <p style={{ textAlign: "center", padding: 40, color: "#8a909c" }}>Loading...</p>}

        {!loading && filtered?.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#6b7280" }}>
            <ShoppingBag size={36} color="#e2e5e9" style={{ margin: "0 auto 10px", display: "block" }} />
            <p style={{ margin: 0, fontWeight: 600 }}>No orders found</p>
          </div>
        )}

        {filtered?.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Order ID", "Date", "Items", "Payment", "Status", "Total"].map((h, i) => (
                    <th key={h} style={{ ...s.th, textAlign: i === 5 ? "right" : "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((o, i) => (
                  <tr key={o.id ?? o._id ?? i} style={{ background: "white" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f0fdf4"}
                    onMouseLeave={e => e.currentTarget.style.background = "white"}
                  >
                    <td style={{ ...s.td, fontWeight: 600 }}>#{(o.id ?? o._id ?? "").toString().slice(-8)}</td>
                    <td style={{ ...s.td, color: "#8a909c" }}>
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                    </td>
                    <td style={{ ...s.td, color: "#8a909c" }}>{o.items?.length ?? o.orderItems?.length ?? "—"}</td>
                    <td style={{ ...s.td, color: "#8a909c" }}>{o.paymentType ?? o.paymentMethod ?? "—"}</td>
                    <td style={s.td}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20, ...(statusStyle[o.status] ?? { background: "#eef1f5", color: "#6b7280" }) }}>
                        {o.status ?? "PENDING"}
                      </span>
                    </td>
                    <td style={{ ...s.td, textAlign: "right", fontWeight: 700, color: "#059669" }}>
                      रु {(o.totalAmount ?? 0).toLocaleString("en-IN")}
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

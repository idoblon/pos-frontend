import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, RotateCcw, TrendingDown, DollarSign, Calendar, Users } from "lucide-react";
import { getRefundsByBranch } from "@/Redux Toolkit/Features/refund/refundThunk";
import secureStorage from "@/util/secureStorage";

const s = {
  page: {
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 20,
    fontFamily: "'DM Sans','Inter',sans-serif",
    color: "#1a1d23",
    background: "#f5f5f5",
    minHeight: "100%",
  },
  card: { background: "white", border: "1px solid #e5e7eb", borderRadius: 10 },
  cardHeader: {
    padding: "14px 18px",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchInput: {
    width: "100%",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: "7px 12px 7px 34px",
    fontFamily: "inherit",
    fontSize: 13,
    outline: "none",
    background: "#f5f5f5",
    boxSizing: "border-box",
  },
  th: {
    padding: "10px 16px",
    fontSize: 12,
    fontWeight: 600,
    color: "#6b7280",
    background: "#f5f5f5",
    textAlign: "left",
    borderBottom: "1px solid #e5e7eb",
  },
  td: { padding: "12px 16px", fontSize: 13, borderBottom: "1px solid #e5e7eb" },
};

export default function BranchRefunds() {
  const dispatch = useDispatch();
  const userData = secureStorage.getUserData();
  const branchId = userData?.branchId;
  const { refundsByBranch: refunds, loading, error } = useSelector((s) => s.refund);
  const [search, setSearch] = useState("");


  useEffect(() => {
    if (branchId) {
      dispatch(getRefundsByBranch(branchId));
    }
  }, [dispatch, branchId]);

  // Use only API data
  const allRefunds = refunds || [];

  const filtered = allRefunds?.filter(
    (r) =>
      (r.id ?? r._id ?? "").toString().includes(search) ||
      (r.orderId ?? "").toString().includes(search) ||
      (r.customerName ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  // Calculate refund statistics
  const totalRefunds = allRefunds?.length || 0;
  const totalAmount = allRefunds?.reduce((sum, refund) => sum + (refund.amount || 0), 0) || 0;
  const todayRefunds = allRefunds?.filter(r => {
    if (!r.createdAt) return false;
    const refundDate = new Date(r.createdAt).toDateString();
    const today = new Date().toDateString();
    return refundDate === today;
  }).length || 0;
  const avgRefundAmount = totalRefunds > 0 ? totalAmount / totalRefunds : 0;

  return (
    <div style={s.page}>
      <div>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Refunds</h1>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#8a909c" }}>
          All branch refunds and returns
        </p>
      </div>

      {/* Refund Statistics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        {[
          { label: "Total Refunds", value: totalRefunds, icon: TrendingDown, color: "#e53e3e", bg: "#fef2f2" },
          { label: "Total Amount", value: `रु ${totalAmount.toLocaleString("en-IN")}`, icon: DollarSign, color: "#dc2626", bg: "#fef2f2" },
          { label: "Today's Refunds", value: todayRefunds, icon: Calendar, color: "#f59e0b", bg: "#fffbeb" },
          { label: "Avg. Refund", value: `रु ${Math.round(avgRefundAmount).toLocaleString("en-IN")}`, icon: Users, color: "#6b7280", bg: "#f9fafb" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 10, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ padding: 6, background: bg, borderRadius: 6 }}>
                <Icon size={16} color={color} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 11, color: "#8a909c" }}>{label}</p>
                <p style={{ margin: "2px 0 0", fontSize: 16, fontWeight: 700, color }}>{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={s.card}>
        <div style={s.cardHeader}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>
            Refunds ({filtered?.length ?? 0})
          </span>
          <div style={{ position: "relative", width: 240 }}>
            <Search
              size={14}
              color="#8a909c"
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
            <input
              style={s.searchInput}
              placeholder="Search by refund ID, order ID, or customer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading && (
          <p style={{ textAlign: "center", padding: 40, color: "#8a909c" }}>
            Loading...
          </p>
        )}

        {!loading && filtered?.length === 0 && allRefunds?.length === 0 && (
          <div
            style={{ textAlign: "center", padding: "40px 0", color: "#6b7280" }}
          >
            <RotateCcw
              size={36}
              color="#e2e5e9"
              style={{ margin: "0 auto 10px", display: "block" }}
            />
            <p style={{ margin: 0, fontWeight: 600 }}>No refunds found</p>
            <p style={{ margin: "4px 0 0", fontSize: 12 }}>Refunds will appear here when processed</p>
          </div>
        )}

        {!loading && filtered?.length === 0 && allRefunds?.length > 0 && (
          <div
            style={{ textAlign: "center", padding: "40px 0", color: "#6b7280" }}
          >
            <RotateCcw
              size={36}
              color="#e2e5e9"
              style={{ margin: "0 auto 10px", display: "block" }}
            />
            <p style={{ margin: 0, fontWeight: 600 }}>No matching refunds found</p>
            <p style={{ margin: "4px 0 0", fontSize: 12 }}>Try adjusting your search terms</p>
          </div>
        )}

        {filtered?.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Refund ID", "Order ID", "Customer", "Reason", "Date", "Amount"].map(
                    (h, i) => (
                      <th
                        key={h}
                        style={{
                          ...s.th,
                          textAlign: i === 5 ? "right" : "left",
                        }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr
                    key={r.id ?? r._id ?? i}
                    style={{ background: "white" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f5f5f5")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "white")
                    }
                  >
                    <td style={{ ...s.td, fontWeight: 600 }}>
                      #{(r.id ?? r._id ?? "").toString().slice(-8)}
                    </td>
                    <td style={{ ...s.td, color: "#8a909c" }}>
                      #{(r.orderId ?? "").toString().slice(-8)}
                    </td>
                    <td style={{ ...s.td, color: "#1a1d23", fontWeight: 500 }}>
                      {r.customerName ?? "—"}
                    </td>
                    <td style={{ ...s.td, color: "#8a909c", maxWidth: 200 }}>
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.reason}>
                        {r.reason ?? "—"}
                      </div>
                    </td>
                    <td style={{ ...s.td, color: "#8a909c" }}>
                      {r.createdAt
                        ? new Date(r.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td
                      style={{
                        ...s.td,
                        textAlign: "right",
                        fontWeight: 700,
                        color: "#e53e3e",
                      }}
                    >
                      रु {(r.amount ?? 0).toLocaleString("en-IN")}
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

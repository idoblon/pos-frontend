import React, { useState, useEffect, useCallback } from "react";
import { Clock, RefreshCw, Search, ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import api from "@/util/api";

const ENTITY_FILTERS = ["", "registration", "subscriptionChange", "subscriptionPayment", "store", "user", "subscription"];

export default function AuditLog() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entity, setEntity] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [demo, setDemo] = useState(false);

  const load = useCallback(async (pageArg = page, entityArg = entity) => {
    setLoading(true);
    try {
      const params = { page: pageArg, size: 20 };
      if (entityArg) params.entity = entityArg;
      const res = await api.get("/api/admin/audit", { params });
      setRows(Array.isArray(res.data?.content) ? res.data.content : []);
      setTotalPages(res.data?.totalPages ?? 1);
      setDemo(false);
    } catch {
      // Showcase fallback: no audit table yet (live pending) — show empty state.
      setRows([]);
      setTotalPages(1);
      setDemo(true);
    } finally {
      setLoading(false);
    }
  }, [page, entity]);

  useEffect(() => { load(); }, [load]);

  const changeEntity = (value) => { setEntity(value); setPage(0); load(0, value); };
  const changePage = (next) => {
    const clamped = Math.max(0, Math.min(next, Math.max(totalPages - 1, 0)));
    setPage(clamped);
    load(clamped, entity);
  };

  const filtered = rows.filter((r) => {
    if (!search.trim()) return true;
    const hay = `${r.action || ""} ${r.entityType || ""} ${r.entityId || ""} ${r.detail || ""} ${r.adminId || ""}`.toLowerCase();
    return hay.includes(search.toLowerCase());
  });

  return (
    <div style={{ padding: 24, fontFamily: "'DM Sans','Inter',sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 700, color: "#1a1d23", display: "flex", alignItems: "center", gap: 8 }}>
            <ShieldCheck size={20} /> Admin Audit Log
          </h1>
          <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>
            Who approved, rejected, or overrode what — and when
            {demo && " — demo mode (backend audit endpoint unreachable)"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <select value={entity} onChange={(e) => changeEntity(e.target.value)} style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12 }}>
            {ENTITY_FILTERS.map((f) => (
              <option key={f} value={f}>{f === "" ? "All entities" : f}</option>
            ))}
          </select>
          <div style={{ position: "relative" }}>
            <Search size={14} color="#6b7280" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter actions…" style={{ padding: "8px 12px 8px 32px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, width: 180 }} />
          </div>
          <button onClick={() => load(page, entity)} style={{ padding: "8px 12px", background: "white", border: "1px solid #e5e7eb", borderRadius: 6, cursor: "pointer", fontSize: 12, color: "#6b7280", display: "flex", alignItems: "center", gap: 4 }}>
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#6b7280" }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 10, padding: 40, textAlign: "center" }}>
          <Clock size={40} color="#e5e7eb" style={{ margin: "0 auto 12px", display: "block" }} />
          <p style={{ margin: 0, fontSize: 14, color: "#6b7280" }}>
            {demo ? "No audit records yet — actions you take as admin will appear here once the backend is connected." : "No audit records match this filter."}
          </p>
        </div>
      ) : (
        <>
          <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
            {filtered.map((r, i) => (
              <div key={r.id ?? i} style={{ padding: "12px 16px", borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f6" : "none", display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ padding: 6, background: "#f3f4f6", borderRadius: 6, flexShrink: 0 }}>
                  <ShieldCheck size={14} color="#1a1d23" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1a1d23" }}>
                    {r.action}
                    <span style={{ fontWeight: 400, color: "#6b7280" }}> — {r.entityType} #{r.entityId} by admin #{r.adminId}</span>
                  </p>
                  {r.detail && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6b7280" }}>{r.detail}</p>}
                  <p style={{ margin: "4px 0 0", fontSize: 11, color: "#9ca3af" }}>
                    {r.createdAt ? new Date(r.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, padding: 12 }}>
              <button onClick={() => changePage(page - 1)} disabled={page === 0} style={{ border: "1px solid #e5e7eb", background: "white", borderRadius: 6, padding: "6px 10px", cursor: page === 0 ? "not-allowed" : "pointer" }}>
                <ChevronLeft size={14} />
              </button>
              <span style={{ fontSize: 12, color: "#6b7280" }}>Page {page + 1} of {totalPages}</span>
              <button onClick={() => changePage(page + 1)} disabled={page + 1 >= totalPages} style={{ border: "1px solid #e5e7eb", background: "white", borderRadius: 6, padding: "6px 10px", cursor: page + 1 >= totalPages ? "not-allowed" : "pointer" }}>
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

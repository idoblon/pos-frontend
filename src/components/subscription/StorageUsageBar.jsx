import React, { useEffect, useState } from 'react';
import { HardDrive } from 'lucide-react';
import { getStoreStorageUsage, formatGB } from '@/services/storageService';

/**
 * Storage consumption bar: "2.1 / 5 GB (42%)".
 * Shows live backend usage when available, otherwise a clearly-labelled
 * demo estimate until GET /api/stores/{id}/storage-usage exists.
 * Props: storeId, plan (BASIC/PROFESSIONAL/ENTERPRISE), compact?, usage? {usedGB, quotaGB, source}
 */
export default function StorageUsageBar({ storeId, plan, compact = false, usage: usageProp }) {
  const [fetched, setFetched] = useState(null);
  const usage = usageProp || fetched;

  useEffect(() => {
    if (usageProp) return;
    let cancelled = false;
    getStoreStorageUsage(storeId, plan).then((u) => { if (!cancelled) setFetched(u); });
    return () => { cancelled = true; };
  }, [storeId, plan, usageProp]);

  if (!usage) {
    return (
      <div style={{ fontSize: 11, color: '#9ca3af' }}>
        Loading storage…
      </div>
    );
  }

  const pct = usage.quotaGB > 0 ? Math.min(100, Math.round((usage.usedGB / usage.quotaGB) * 100)) : 0;
  const barColor = pct >= 90 ? '#dc2626' : pct >= 70 ? '#f59e0b' : '#059669';

  if (compact) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#4b5563', marginBottom: 4 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
            <HardDrive size={12} color="#6b7280" /> Storage
          </span>
          <span>{formatGB(usage.usedGB)} / {formatGB(usage.quotaGB)} ({pct}%)</span>
        </div>
        <div style={{ height: 6, borderRadius: 999, background: '#e5e7eb', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: 999 }} />
        </div>
        {usage.source === 'demo' && (
          <div style={{ fontSize: 10, color: '#b45309', marginTop: 3 }}>demo estimate — live tracking pending backend</div>
        )}
      </div>
    );
  }

  return (
    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <HardDrive size={16} color="#1a1d23" />
        <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>STORAGE USED</span>
        {usage.source === 'demo' && (
          <span style={{ fontSize: 10, fontWeight: 700, color: '#b45309', background: '#fef3c7', padding: '2px 6px', borderRadius: 999 }}>
            DEMO ESTIMATE
          </span>
        )}
      </div>
      <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1a1d23' }}>
        {formatGB(usage.usedGB)} <span style={{ fontWeight: 500, color: '#6b7280' }}>/ {formatGB(usage.quotaGB)}</span>
      </p>
      <div style={{ height: 8, borderRadius: 999, background: '#e5e7eb', overflow: 'hidden', marginTop: 8 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: 999 }} />
      </div>
      <p style={{ margin: '6px 0 0', fontSize: 12, color: '#6b7280', fontWeight: 600 }}>
        {pct}% used · {formatGB(Math.max(usage.quotaGB - usage.usedGB, 0))} free
      </p>
      {usage.source === 'demo' && (
        <p style={{ margin: '4px 0 0', fontSize: 11, color: '#b45309' }}>
          Live tracking pending backend (GET /api/stores/{'{id}'}/storage-usage).
        </p>
      )}
    </div>
  );
}

import api from '@/util/api';
import { PLAN_LIMITS } from '@/util/subscriptionPlans';

const DEMO_CACHE_PREFIX = 'storageUsageDemo:';

export const getQuotaGB = (plan) => {
  const upper = String(plan || 'BASIC').toUpperCase();
  return Number(PLAN_LIMITS[upper]?.storageGB) || 5;
};

export const formatGB = (gb) => {
  const n = Number(gb) || 0;
  return n >= 100 ? `${Math.round(n)} GB` : `${(Math.round(n * 10) / 10)} GB`;
};

/** Deterministic demo usage (35–75% of quota) so lists stay stable offline. */
const demoUsageGB = (storeId, quotaGB) => {
  const key = `${DEMO_CACHE_PREFIX}${storeId || 'default'}`;
  try {
    const cached = JSON.parse(localStorage.getItem(key) || 'null');
    if (cached && typeof cached.usedGB === 'number') return cached;
  } catch { /* ignore */ }
  let hash = 0;
  const s = String(storeId || 'default');
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  const ratio = 0.35 + (hash % 41) / 100; // 0.35–0.75
  const value = { usedGB: Math.round(quotaGB * ratio * 10) / 10, quotaGB, source: 'demo' };
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* best-effort */ }
  return value;
};

const pickUsage = (data, quotaGB) => {
  if (!data || typeof data !== 'object') return null;
  const d = data.data || data.usage || data.storage || data;
  const usedBytes = d.usedBytes ?? d.bytesUsed ?? d.bytes;
  const usedGB = d.usedGB ?? d.usedGb ?? d.gbUsed ?? (usedBytes != null ? Number(usedBytes) / 1024 ** 3 : null);
  const quota = d.quotaGB ?? d.quotaGb ?? d.totalGB ?? quotaGB;
  if (usedGB == null || isNaN(Number(usedGB))) return null;
  return {
    usedGB: Math.round(Number(usedGB) * 10) / 10,
    quotaGB: Number(quota) || quotaGB,
    source: 'live',
  };
};

/**
 * Storage usage for one store. Tries live endpoints, falls back to a stable
 * demo estimate (clearly labelled) until the backend exposes usage.
 * Backend contract (any one is enough):
 * - GET /api/stores/{id}/storage-usage        -> { usedGB | usedBytes, quotaGB? }
 * - GET /api/store/storage/usage              -> same (current store)
 */
export const getStoreStorageUsage = async (storeId, plan) => {
  const quotaGB = getQuotaGB(plan);
  const id = storeId != null ? String(storeId) : '';
  if (id) {
    try {
      const res = await api.get(`/api/stores/${id}/storage-usage`);
      const live = pickUsage(res.data, quotaGB);
      if (live) return live;
    } catch { /* try next */ }
  }
  try {
    const res = await api.get('/api/store/storage/usage', id ? { params: { storeId: id } } : undefined);
    const live = pickUsage(res.data, quotaGB);
    if (live) return live;
  } catch { /* demo fallback */ }
  return demoUsageGB(id, quotaGB);
};

/**
 * Batch usage for POS admin lists. Tries GET /api/admin/stores/storage-usage
 * (map of storeId -> usage), else per-store demo estimates. Never throws.
 */
export const getAllStoresStorageUsage = async (stores = []) => {
  try {
    const res = await api.get('/api/admin/stores/storage-usage');
    const map = res.data?.usage || res.data?.data || res.data;
    if (map && typeof map === 'object' && !Array.isArray(map)) {
      const out = {};
      for (const s of stores) {
        const id = String(s.id ?? s._id ?? s.storeId ?? '');
        const quotaGB = getQuotaGB(s.subscriptionPlan || s.plan);
        out[id] = pickUsage(map[id] ?? map[id?.toLowerCase?.()], quotaGB) || demoUsageGB(id, quotaGB);
      }
      if (Object.keys(out).length) return { usageByStore: out, source: 'live' };
    }
  } catch { /* demo fallback below */ }
  const usageByStore = {};
  for (const s of stores) {
    const id = String(s.id ?? s._id ?? s.storeId ?? '');
    usageByStore[id] = demoUsageGB(id, getQuotaGB(s.subscriptionPlan || s.plan));
  }
  return { usageByStore, source: 'demo' };
};

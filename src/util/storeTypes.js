/**
 * Central store-type registry.
 * Single source of truth for every supported vertical.
 * Backend stores `storeType` as a plain string; frontend uses this
 * module to decide which vertical-specific fields and flows to show.
 * All extra product/order fields are OPTIONAL so old backends ignore them safely.
 */

export const STORE_TYPES = [
  { value: "RETAIL", label: "Retail", description: "General / fashion retail — variants, warranty optional" },
  { value: "WHOLESALE", label: "Wholesale", description: "Bulk tiers + units" },
  { value: "RESTAURANT", label: "Restaurant", description: "Dine-in / takeaway / delivery + tables + KOT notes" },
  { value: "PHARMACY", label: "Pharmacy", description: "Batch + expiry + prescription control" },
  { value: "GROCERY", label: "Grocery", description: "Batch + expiry + weight / units" },
  { value: "ELECTRONICS", label: "Electronics", description: "Serial / IMEI + warranty + variants" },
  { value: "PLANT", label: "Plant", description: "Care instructions + units" },
];

export const STORE_TYPE_VALUES = STORE_TYPES.map((t) => t.value);

export const PRODUCT_UNITS = ["pcs", "kg", "g", "L", "mL", "box", "pack", "set", "pot", "carton", "pallet"];

export const WEIGHTED_UNITS = ["kg", "g", "L", "mL"];

export const RESTAURANT_ORDER_TYPES = ["DINE_IN", "TAKEAWAY", "DELIVERY"];

export const TABLE_STATUS = { FREE: "FREE", OCCUPIED: "OCCUPIED" };

// Which vertical capabilities each store type gets.
const CAPABILITIES = {
  RETAIL: ["variants", "warranty", "bulk", "moq"],
  WHOLESALE: ["bulk", "unit", "weight", "moq", "credit"],
  RESTAURANT: ["orderType", "table", "kot", "prepTime", "modifiers"],
  PHARMACY: ["expiry", "batch", "prescription", "dosage", "controlled", "fefo"],
  GROCERY: ["expiry", "batch", "unit", "weight", "bulk", "moq", "fefo", "wastage"],
  ELECTRONICS: ["serial", "warranty", "variants", "bulk", "emi"],
  PLANT: ["unit", "care", "variants", "guarantee"],
};

export const normalizeStoreType = (t) => {
  if (!t) return "";
  const v = String(t).trim().toUpperCase();
  return STORE_TYPE_VALUES.includes(v) ? v : v; // allow forward-compat custom types
};

export const isValidStoreType = (t) => STORE_TYPE_VALUES.includes(normalizeStoreType(t));

export const getStoreTypeConfig = (t) => {
  const v = normalizeStoreType(t);
  return STORE_TYPES.find((s) => s.value === v) || null;
};

export const supportsFeature = (storeType, feature) => {
  const v = normalizeStoreType(storeType);
  if (!v) return false;
  return (CAPABILITIES[v] || []).includes(feature);
};

export const getCapabilities = (storeType) => [...(CAPABILITIES[normalizeStoreType(storeType)] || [])];

// Resolve storeType from the various shapes used across redux / storage.
export const resolveStoreType = (store, fallback = "") => {
  const v =
    store?.storeType ||
    store?.type ||
    store?.store?.storeType ||
    store?.store?.type ||
    fallback ||
    "";
  return normalizeStoreType(v);
};

// --- Product helpers (all null-safe, backend-agnostic) ---

export const isExpired = (product) => {
  const d = product?.expiryDate || product?.expiry;
  if (!d) return false;
  const t = new Date(d).getTime();
  return Number.isFinite(t) && t < Date.now();
};

export const isNearExpiry = (product, days = 30) => {
  const d = product?.expiryDate || product?.expiry;
  if (!d || isExpired(product)) return false;
  const t = new Date(d).getTime();
  if (!Number.isFinite(t)) return false;
  return t - Date.now() <= days * 24 * 60 * 60 * 1000;
};

export const requiresPrescription = (product) =>
  product?.prescriptionRequired === true || product?.requiresPrescription === true;

export const isControlled = (product) =>
  product?.isControlled === true || product?.controlledSubstance === true;

export const isWeightedProduct = (product) => WEIGHTED_UNITS.includes(product?.unit);

export const getMoq = (product) => {
  const v = Number(product?.moq ?? product?.minOrderQty ?? 0);
  return Number.isFinite(v) && v > 1 ? v : 0;
};

// Multi-tier bulk: supports new `bulkTiers: [{minQty, price}]` plus legacy
// single `bulkMinQty`/`bulkPrice` pair for backward compatibility.
export const getBulkTiers = (product) => {
  const tiers = [];
  if (Array.isArray(product?.bulkTiers)) {
    for (const t of product.bulkTiers) {
      const minQty = Number(t?.minQty);
      const price = Number(t?.price);
      if (Number.isFinite(minQty) && Number.isFinite(price) && minQty > 1 && price > 0) {
        tiers.push({ minQty, price });
      }
    }
  }
  const legacy = getBulkRule(product);
  if (legacy && !tiers.some((t) => t.minQty === legacy.minQty)) tiers.push(legacy);
  return tiers.sort((a, b) => a.minQty - b.minQty);
};

export const getBulkRule = (product) => {
  const minQty = Number(product?.bulkMinQty ?? product?.bulk_min_qty ?? 0);
  const price = Number(product?.bulkPrice ?? product?.bulk_price ?? 0);
  if (Number.isFinite(minQty) && Number.isFinite(price) && minQty > 1 && price > 0) {
    return { minQty, price };
  }
  return null;
};

// Effective unit price for a given quantity (best matching tier wins).
export const getEffectivePrice = (product, quantity = 1) => {
  const base = Number(product?.price ?? product?.sellingPrice ?? 0);
  const tiers = getBulkTiers(product);
  let best = base;
  for (const t of tiers) {
    if (Number(quantity) >= t.minQty) best = t.price;
  }
  return best;
};

export const getBulkSavings = (product, quantity = 1) => {
  const base = Number(product?.price ?? product?.sellingPrice ?? 0);
  const eff = getEffectivePrice(product, quantity);
  return eff < base ? (base - eff) * Number(quantity || 1) : 0;
};

export const getVariantLabel = (product) => {
  const size = product?.sizeVariant || product?.size || "";
  const color = product?.colorVariant || product?.color || "";
  return [size, color].filter(Boolean).join(" / ");
};

/**
 * Best-guess store type from catalog signals, for stores registered before
 * `storeType` existed (NULL in DB). Returns a STORE_TYPES value or "" when
 * the catalog gives no usable signal. Never throws; purely advisory — the
 * owner confirms before anything is saved.
 */
export const inferStoreType = (products = []) => {
  const scores = {};
  const add = (type, pts) => {
    scores[type] = (scores[type] || 0) + pts;
  };
  for (const p of products || []) {
    if (!p) continue;
    if (requiresPrescription(p)) add("PHARMACY", 3);
    if (isControlled(p)) add("PHARMACY", 3);
    if (p.dosage) add("PHARMACY", 2);
    if (p.requiresSerial || p.serialRequired) add("ELECTRONICS", 3);
    if (p.warrantyMonths || p.warranty) add("ELECTRONICS", 2);
    if (p.preparationTime) add("RESTAURANT", 3);
    if (p.kitchenStation) add("RESTAURANT", 2);
    if (getModifierOptions(p).length > 0) add("RESTAURANT", 2);
    if (p.careInstructions) add("PLANT", 3);
    if (p.guaranteeDays) add("PLANT", 2);
    if (isWeightedProduct(p) || p.weight) add("GROCERY", 2);
    if (p.expiryDate || p.expiry) {
      // Expiry alone is grocery; with Rx signals pharmacy already leads.
      add("GROCERY", 2);
      add("PHARMACY", 1);
    }
    if (p.batchNumber || p.batch) add("GROCERY", 1);
    if (getBulkTiers(p).length > 0) add("WHOLESALE", 2);
    if (p.moq || p.minOrderQty) add("WHOLESALE", 2);
    if (getProductVariants(p).length > 0 || p.sizeVariant || p.colorVariant) add("RETAIL", 1);
  }
  const priority = ["RESTAURANT", "PHARMACY", "ELECTRONICS", "PLANT", "GROCERY", "WHOLESALE", "RETAIL"];
  let best = "";
  let bestScore = 1; // need at least 2 points of evidence
  for (const type of priority) {
    if ((scores[type] || 0) > bestScore) {
      best = type;
      bestScore = scores[type];
    }
  }
  return best;
};

// Variant matrix entries: [{sku, size, color, price, stock}]
export const getProductVariants = (product) => {
  if (Array.isArray(product?.variants)) return product.variants;
  return [];
};

// "Extra cheese, No onion" style modifier options stored as CSV or array.
export const getModifierOptions = (product) => {
  const raw = product?.modifiers ?? product?.modifierOptions ?? "";
  if (Array.isArray(raw)) return raw.map(String).map((s) => s.trim()).filter(Boolean);
  return String(raw || "").split(",").map((s) => s.trim()).filter(Boolean);
};

export const getSerials = (item) => (Array.isArray(item?.serials) ? item.serials : []);

export const serialsRequiredCount = (item) => {
  if (!(item?.requiresSerial || item?.serialRequired)) return 0;
  // Weighted/decimal quantities don't make sense for serialized units — count integer units.
  return Math.max(0, Math.floor(Number(item?.quantity || 1)));
};

export const serialsValid = (item) => {
  const need = serialsRequiredCount(item);
  if (!need) return true;
  const serials = getSerials(item).map((s) => String(s || "").trim()).filter(Boolean);
  if (serials.length !== need) return false;
  return new Set(serials).size === serials.length; // unique, one per unit
};

// FEFO: earliest-expiry first for perishables with the same SKU.
export const sortFefo = (products = []) =>
  [...products].sort((a, b) => {
    const ta = a?.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
    const tb = b?.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
    return ta - tb;
  });

// Scale / weighted barcode: "2{5-digit SKU}{5-digit grams}" (e.g. 20012305000 = SKU 00123, 500g).
// Also accepts "21..." prefix used by some scales. Returns {sku, weightKg} or null.
export const parseScaleBarcode = (code) => {
  const s = String(code || "").trim();
  if (!/^(2|21)\d{10,12}$/.test(s)) return null;
  const digits = s.replace(/^21/, "2");
  if (!digits.startsWith("2") || digits.length < 12) return null;
  const skuPart = digits.slice(1, 6);
  const weightPart = digits.slice(6, 11);
  const grams = Number(weightPart);
  if (!Number.isFinite(grams) || grams <= 0) return null;
  return { sku: skuPart.replace(/^0+/, "") || skuPart, weightKg: grams / 1000, raw: s };
};

// --- Restaurant tables (local-first; backend sync is optional) ---

const TABLES_KEY = (branchId) => `pos_tables_${branchId || "default"}`;

export const getTables = (branchId, fallbackCount = 12) => {
  try {
    const raw = localStorage.getItem(TABLES_KEY(branchId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch { /* ignore */ }
  return Array.from({ length: fallbackCount }, (_, i) => ({
    id: `T${i + 1}`,
    seats: 4,
    status: TABLE_STATUS.FREE,
  }));
};

export const saveTables = (branchId, tables) => {
  try {
    localStorage.setItem(TABLES_KEY(branchId), JSON.stringify(tables));
  } catch { /* ignore */ }
};

export const occupyTable = (branchId, tableId) => {
  const tables = getTables(branchId).map((t) =>
    t.id === tableId ? { ...t, status: TABLE_STATUS.OCCUPIED } : t,
  );
  saveTables(branchId, tables);
  return tables;
};

export const freeTable = (branchId, tableId) => {
  const tables = getTables(branchId).map((t) =>
    t.id === tableId ? { ...t, status: TABLE_STATUS.FREE } : t,
  );
  saveTables(branchId, tables);
  return tables;
};

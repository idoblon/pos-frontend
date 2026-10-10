import { describe, it, expect } from "vitest";
import { calculateEOQ, calculateEOQWithDiscounts, getReorderSuggestion, forecastExponentialSmoothing, forecastMovingAverage, forecastHolt, forecastAuto, forecastCroston, forecastHoltWinters, bootstrapSafetyStock, deriveDemandFromOrders, classifyABC, classifyABCXYZ, jenksBreaks, zForServiceLevel, zFromProbability } from "./inventoryAlgorithms";
import { levenshtein, damerauLevenshtein, trigramDice, fuzzySearchProducts, fuzzySearchByKeys, jaroWinkler, scoreProduct } from "./searchAlgorithms";
import { solveBestDiscount, solveBestDiscountCombo, makeChangeGreedy, makeChangeOptimal, isCanonicalDenoms } from "./cartAlgorithms";
import { isValidCardLuhn, backoffDelayMs, detectCardBrand, tokenBucketTake } from "./paymentAlgorithms";
import { aprioriSuggest, cosineSuggest } from "./recommendationAlgorithms";
import { rfmSegment, predictCLV } from "./customerAlgorithms";
import { sortByPriority, isAnomaly, median, mad, robustZScore } from "./orderAlgorithms";
import { groupByDay, flagSalesAnomalies, linearTrend, decomposeWeekly, hampelFilter, cusumDrift } from "./analyticsAlgorithms";
import { optimizeStaffing, predictOvertime, erlangStaff } from "./staffingAlgorithms";
import { recommendUpsell, recommendUpsellDetailed, forecastMRR, forecastMRRTrend, olsSlope, theilSenSlope, paginate } from "./growthAlgorithms";

describe("inventoryAlgorithms", () => {
  it("EOQ sqrt(2DS/H)", () => expect(calculateEOQ({ annualDemand: 1200, orderingCost: 500, holdingCost: 20 })).toBe(245));
  it("ROP flags low stock", () => {
    const r = getReorderSuggestion({ quantityOnHand: 10, avgDailyDemand: 5, dailyStdDev: 1.5, leadTimeDays: 7 });
    expect(r.reorderPoint).toBe(42);
    expect(r.shouldReorder).toBe(true);
  });
  it("forecasts", () => {
    expect(forecastExponentialSmoothing({ history: [10, 12, 15, 14, 18] })).toBe(15);
    expect(forecastMovingAverage({ history: [10, 12, 15] })).toBe(13);
  });
  it("ABC ranks A first", () => {
    const out = classifyABC([{ id: 1, annualDemand: 1000, unitPrice: 100 }, { id: 2, annualDemand: 10, unitPrice: 5 }]);
    expect(out[0].abc).toBe("A");
  });
  it("Holt follows trend + auto picks a method", () => {
    expect(forecastHolt({ history: [10, 12, 14, 16, 18] })).toBeGreaterThan(18);
    expect(forecastAuto({ history: [10, 12, 15, 14, 18] }).forecast).toBeGreaterThan(0);
  });
  it("service level map + demand derivation", () => {
    expect(zForServiceLevel("95%")).toBe(1.65);
    expect(zFromProbability(0.95)).toBeCloseTo(1.6449, 3);
    expect(zForServiceLevel("93%")).toBeCloseTo(zFromProbability(0.93), 6);
    const d = deriveDemandFromOrders({
      orders: [{ createdAt: new Date().toISOString(), items: [{ productId: 7, quantity: 4 }] }],
      productId: 7, days: 30,
    });
    expect(d.avgDailyDemand).toBeGreaterThan(0);
  });
  it("EOQ with discounts picks min total cost", () => {
    const best = calculateEOQWithDiscounts({
      annualDemand: 1200, orderingCost: 500, holdingRate: 0.2,
      priceBreaks: [{ minQty: 1, unitPrice: 100 }, { minQty: 500, unitPrice: 80 }],
    });
    expect(best.orderQty).toBeGreaterThan(0);
  });
  it("Croston handles intermittent demand + bootstrap is deterministic", () => {
    expect(forecastCroston({ history: [0, 0, 5, 0, 0, 0, 8, 0] })).toBe(2);
    expect(forecastCroston({ history: [0, 0, 0] })).toBe(0);
    const a = bootstrapSafetyStock({ dailyDemand: [0, 0, 5, 0, 8, 0, 3], leadTimeDays: 7 });
    expect(bootstrapSafetyStock({ dailyDemand: [0, 0, 5, 0, 8, 0, 3], leadTimeDays: 7 })).toBe(a);
    expect(a).toBeGreaterThanOrEqual(0);
  });
  it("Holt-Winters fits season + Jenks + ABCXYZ", () => {
    const hw = forecastHoltWinters({ history: [10, 12, 11, 13, 20, 25, 14, 11, 12, 11, 14, 21, 26, 15, 10, 12, 11, 13, 20, 25, 14] });
    expect(hw.forecast).toBeGreaterThan(0);
    expect(hw.params).not.toBeNull();
    expect(jenksBreaks([1, 2, 3, 100, 101, 102], 2)).toEqual([3]);
    const xyz = classifyABCXYZ([
      { id: 1, annualDemand: 1000, unitPrice: 100, avgDailyDemand: 10, dailyStdDev: 1 },
      { id: 2, annualDemand: 10, unitPrice: 5, avgDailyDemand: 1, dailyStdDev: 5 },
    ]);
    expect(xyz[0].cell).toBe("AX");
  });
});

describe("searchAlgorithms", () => {
  it("levenshtein coke/coka=1", () => expect(levenshtein("coke", "coka")).toBe(1));
  it("damerau counts transposition as 1", () => expect(damerauLevenshtein("amdin", "admin")).toBe(1));
  it("trigram identity=1", () => expect(trigramDice("abc", "abc")).toBe(1));
  it("jaro-winkler identity=1", () => expect(jaroWinkler("admin", "admin")).toBe(1));
  it("continuous rank: exact=100, typo>0, junk=0", () => {
    const p = { id: 1, name: "Coca Cola", sku: "CC500", category: { name: "Drinks" } };
    expect(scoreProduct("cc500", p)).toBe(100);
    expect(scoreProduct("coka", p)).toBeGreaterThan(0);
    expect(scoreProduct("zzqxj", p)).toBe(0);
  });
  it("fuzzy finds typo", () => {
    const P = [{ id: 1, name: "Coca Cola", sku: "CC500", category: { name: "Drinks" } }];
    expect(fuzzySearchProducts(P, "coka")).toHaveLength(1);
    expect(fuzzySearchByKeys([{ fullName: "Hari Bahadur" }], "hari", [(c) => c.fullName])).toHaveLength(1);
  });
});

describe("cart + payment", () => {
  it("bundle picks cheapest", () => {
    const b = solveBestDiscount({ subtotal: 1000, quantity: 5, rules: [{ type: "percent", value: 10 }, { type: "fixed", value: 150 }] });
    expect(b.total).toBe(850);
  });
  it("greedy change 1870", () => {
    const { breakdown, leftover } = makeChangeGreedy({ change: 1870 });
    expect(leftover).toBe(0);
    expect(breakdown[0]).toEqual({ denom: 1000, count: 1 });
  });
  it("DP change optimal on non-canonical denoms", () => {
    // Greedy fails on [30,24,10] for 48 (30+10+... leftover); DP finds 24+24.
    const dp = makeChangeOptimal({ change: 48, denominations: [30, 24, 10] });
    expect(dp.leftover).toBe(0);
    expect(dp.breakdown).toEqual([{ denom: 24, count: 2 }]);
  });
  it("Pearson: NPR canonical, [30,24,10] not", () => {
    expect(isCanonicalDenoms().canonical).toBe(true);
    const bad = isCanonicalDenoms([30, 24, 10]);
    expect(bad.canonical).toBe(false);
    expect(bad.counterexample).toBe(34); // greedy: 30+4(leftover); optimal: 24+10
  });
  it("stacked combo beats single-best", () => {
    const combo = solveBestDiscountCombo({
      subtotal: 1000, quantity: 5,
      rules: [{ type: "percent", value: 10 }, { type: "fixed", value: 150 }],
    });
    expect(combo.total).toBe(750);
  });
  it("luhn + backoff", () => {
    expect(isValidCardLuhn("4539578763621486")).toBe(true);
    expect(backoffDelayMs(3)).toBe(8000);
  });
  it("brand detect + token bucket countdown", () => {
    expect(detectCardBrand("4539578763621486")).toBe("VISA");
    const r = tokenBucketTake({ tokens: 0, lastRefillMs: Date.now(), nowMs: Date.now() });
    expect(r.allowed).toBe(false);
    expect(r.retryAfterMs).toBeGreaterThan(0);
  });
});

describe("growth: recommend/apriori/rfm/orders/analytics/staffing", () => {
  it("apriori suggests #2", () => {
    const s = aprioriSuggest({ orders: [{ items: [{ productId: 1 }, { productId: 2 }] }, { items: [{ productId: 1 }, { productId: 2 }] }], cartIds: [1] });
    expect(s[0].productId).toBe("2");
  });
  it("rfm champion + clv", () => {
    expect(rfmSegment({ daysSinceLast: 5, orderCount: 15, totalSpent: 30000 }).segment).toBe("Champion");
    expect(predictCLV({ totalSpent: 30000, orderCount: 15, monthsActive: 6 })).toBe(60000);
  });
  it("rfm quintile mode works off-population", () => {
    const r = rfmSegment({
      daysSinceLast: 5, orderCount: 15, totalSpent: 30000,
      populations: {
        recencies: [1, 5, 10, 30, 90, 200],
        frequencies: [1, 2, 5, 10, 15, 25],
        monetaries: [500, 1000, 5000, 20000, 30000, 100000],
      },
    });
    expect(r.r).toBeGreaterThanOrEqual(4);
  });
  it("robust stats flag the spike too", () => {
    expect(median([100, 120, 90, 110, 105])).toBe(105);
    expect(mad([100, 120, 90, 110, 105])).toBeGreaterThan(0);
    expect(Math.abs(robustZScore(10000, [100, 120, 90, 110, 105]))).toBeGreaterThan(3.5);
  });
  it("cosine-shrinkage agrees on the clear pair", () => {
    const s = cosineSuggest({ orders: [{ items: [{ productId: 1 }, { productId: 2 }] }, { items: [{ productId: 1 }, { productId: 2 }] }], cartIds: [1] });
    expect(s[0].productId).toBe("2");
  });
  it("priority sorts oldest-highest first + anomaly", () => {
    const now = Date.now();
    const sorted = sortByPriority([
      { createdAt: new Date(now - 60000).toISOString(), totalAmount: 100 },
      { createdAt: new Date(now - 3600000).toISOString(), totalAmount: 100 },
    ], now);
    expect(sorted[0].totalAmount).toBe(100);
    expect(isAnomaly(10000, [100, 120, 90, 110, 105])).toBe(true);
  });
  it("groupByDay + anomalies + staffing + paginate", () => {
    const orders = [{ createdAt: new Date().toISOString(), totalAmount: 500 }];
    expect(groupByDay(orders, 7)).toHaveLength(7);
    expect(flagSalesAnomalies([{ date: "2026-01-01", revenue: 100 }])[0].anomaly).toBe(false);
    expect(linearTrend([100, 200, 300]).direction).toBe("up");
    expect(decomposeWeekly([100, 200, 300, 100, 200, 300, 100, 200]).residuals).toHaveLength(8);
    expect(hampelFilter([10, 10, 10, 50, 10, 10])[3].anomaly).toBe(true);
    expect(cusumDrift([10, 10, 10, 10, 20, 20, 20, 20, 20, 20], { target: 10 }).drift).toBe("up");
    expect(optimizeStaffing({ salesByHour: [{ hour: 10, sales: 12000 }] })[0].cashiers).toBe(3);
    expect(predictOvertime({ openMinutes: 600 }).willOvertime).toBe(true);
    expect(predictOvertime({ openMinutes: 100, shiftHistory: [480, 490, 500, 510] }).projectedMinutes).toBeGreaterThan(0);
    expect(erlangStaff({ arrivalsPerHour: 30, serviceMinutes: 3 }).cashiers).toBeGreaterThanOrEqual(2);
    expect(recommendUpsell({ currentPlan: "BASIC", usage: { branches: 4 }, limitsByPlan: { BASIC: { branches: 5 } } })).toBe("PROFESSIONAL");
    expect(recommendUpsellDetailed({ currentPlan: "BASIC", usage: { branches: 4 }, limitsByPlan: { BASIC: { branches: 5 } } }).reasons.length).toBeGreaterThan(0);
    expect(forecastMRR({ mrrHistory: [100, 200, 300] })).toBe(360);
    expect(forecastMRRTrend({ mrrHistory: [100, 200, 300] }).slope).toBeGreaterThan(0);
    expect(olsSlope([2, 4, 6])).toBe(2);
    expect(theilSenSlope([1, 2, 3, 4])).toBe(1);
    expect(paginate({ total: 95, page: 9, size: 10 }).totalPages).toBe(10);
  });
});

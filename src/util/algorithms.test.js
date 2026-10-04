import { describe, it, expect } from "vitest";
import { calculateEOQ, getReorderSuggestion, forecastExponentialSmoothing, forecastMovingAverage, classifyABC } from "./inventoryAlgorithms";
import { levenshtein, fuzzySearchProducts, fuzzySearchByKeys } from "./searchAlgorithms";
import { solveBestDiscount, makeChangeGreedy } from "./cartAlgorithms";
import { isValidCardLuhn, backoffDelayMs } from "./paymentAlgorithms";
import { aprioriSuggest } from "./recommendationAlgorithms";
import { rfmSegment, predictCLV } from "./customerAlgorithms";
import { sortByPriority, isAnomaly } from "./orderAlgorithms";
import { groupByDay, flagSalesAnomalies } from "./analyticsAlgorithms";
import { optimizeStaffing, predictOvertime } from "./staffingAlgorithms";
import { recommendUpsell, forecastMRR, paginate } from "./growthAlgorithms";

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
});

describe("searchAlgorithms", () => {
  it("levenshtein coke/coka=1", () => expect(levenshtein("coke", "coka")).toBe(1));
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
  it("luhn + backoff", () => {
    expect(isValidCardLuhn("4539578763621486")).toBe(true);
    expect(backoffDelayMs(3)).toBe(8000);
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
    expect(optimizeStaffing({ salesByHour: [{ hour: 10, sales: 12000 }] })[0].cashiers).toBe(3);
    expect(predictOvertime({ openMinutes: 600 }).willOvertime).toBe(true);
    expect(recommendUpsell({ currentPlan: "BASIC", usage: { branches: 4 }, limitsByPlan: { BASIC: { branches: 5 } } })).toBe("PROFESSIONAL");
    expect(forecastMRR({ mrrHistory: [100, 200, 300] })).toBe(200);
    expect(paginate({ total: 95, page: 9, size: 10 }).totalPages).toBe(10);
  });
});

# POS Frontend (Vite + React + Redux Toolkit)

Multi-tenant POS: `SuperAdmin > StoreAdmin > Branch (Manager/Cashier) > Customer`.

## Setup
```bash
cp .env.example .env   # set VITE_API_BASE_URL, VITE_STRIPE_PUBLISHABLE_KEY
npm install
npm run dev      # local
npm run build    # prod -> dist/
npm test         # vitest run (algorithms + cart + roleMapper)
```

## Roles & routes
- `src/routes/{AdminRoutes,StoreAdminRoutes,BranchRoutes,CashierRoutes}.jsx`
- Cashier: `src/pages/cashier/` (ProductSection, PaymentDialog, HeldOrders, Refund)
- Branch: `src/pages/branch/Branch{Dashboard,Inventory,Orders,Refunds,RestockRequests,Reports}.jsx`
- StoreAdmin: `src/pages/storeAdmin/` (Inventory, Restock, Reports, Operations, Employees)
- SuperAdmin: `src/pages/admin/` (Stores, Subscriptions, SystemReports, Audit)

## Algorithm suite (`src/util/*Algorithms.js`, search `ALGORITHM NAME:`)
| File | Algorithms |
|---|---|
| `searchAlgorithms.js` | Normalization, Levenshtein DP, Ranked Fuzzy, Top-K, Generic `fuzzySearchByKeys` |
| `inventoryAlgorithms.js` | EOQ, Safety Stock, ROP, Exp.Smoothing, Moving Avg, ABC/Pareto |
| `cartAlgorithms.js` | Bundle Solver (brute-force min), Greedy Change |
| `orderAlgorithms.js` | Priority Score, mean/std, Z-Score anomaly |
| `customerAlgorithms.js` | RFM, CLV |
| `recommendationAlgorithms.js` | Apriori Lite |
| `analyticsAlgorithms.js` | Group-By Day, Sales Anomaly Flag |
| `staffingAlgorithms.js` | Greedy Peak Cover, Overtime Predictor |
| `paymentAlgorithms.js` | Luhn Mod-10, Exp.Backoff, Token Bucket |
| `growthAlgorithms.js` | Upsell 80% rule, MRR Forecast, Paginate+Clamp |
Tests: `src/util/algorithms.test.js` (13 tests).

## Wired UI
- `ProductSection` fuzzy rank, `CustomerManagement` fuzzy, `BranchOrders` fuzzy+priority sort
- `InventoryManagement` ROP column, `BranchInventory` ROP count
- `PaymentDialog` greedy change breakdown, `HeldOrders` priority order
- `ViewCustomerDialog` RFM+CLV header, `BranchRefunds` Z-score REVIEW badge

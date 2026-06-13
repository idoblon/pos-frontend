# Subscription Upgrade - Frontend Implementation

## Quick Fix Summary

### Problem
Indoor Plant World was upgraded to Enterprise plan by POS admin, but store-admin subscription page still showed "Basic" plan.

### Root Cause
- POS admin approval only updated localStorage override
- Backend database was NOT being updated with new subscription plan
- Store-admin fetched data from backend which still had old plan
- Missing API endpoint to update store's subscriptionPlan field

### Solution
1. ✅ Added backend endpoint: `PUT /api/admin/stores/{storeId}/subscription`
2. ✅ Modified admin approval flow to call this endpoint
3. ✅ Store-admin refresh now fetches updated plan from database

## Files Changed

### 1. src/pages/admin/Subscriptions/SubscriptionManagement.jsx
```javascript
// Before: Only updated localStorage
setPlanOverrides(...)

// After: Updates database + localStorage
await api.put(`/api/admin/stores/${request.storeId}/subscription`, 
  { subscriptionPlan: request.requestedPlan },
  { headers }
);
await dispatch(getAllStores());
setPlanOverrides(...)
```

### 2. src/pages/storeAdmin/Subscription/SubscriptionRequest.jsx
```javascript
// Made refresh async and await store data fetch
const refresh = async () => {
  await dispatch(getStoreByAdmin());  // Now properly waits
  // Auto-hide form if approved
}
```

## How It Works Now

### POS Admin Approval Flow
```
1. Admin clicks "Approve Upgrade"
2. POST /api/admin/subscription-upgrade-requests/{id}/approve
3. PUT /api/admin/stores/{storeId}/subscription { subscriptionPlan: "ENTERPRISE" }
4. Update localStorage override (for immediate UI)
5. Refresh store list
6. Toast: "Subscription upgraded successfully"
```

### Store Admin View Flow
```
1. Store-admin clicks "Refresh"
2. GET /api/stores/admin (returns store with subscriptionPlan)
3. resolveSubscriptionPlan(store) → checks store.subscriptionPlan first
4. Display: "Active Plan: Enterprise"
```

## Testing

### As POS Admin
1. Go to **Admin > Subscription Plans**
2. Find "Indoor Plant World"
3. Should show: **Current Plan: Enterprise** ✅

### As Store Admin (Indoor Plant World)
1. Go to **Subscription** page
2. Click **"Refresh"** button
3. Should show: **Active Plan: Enterprise** ✅

## Plan Resolution Logic

```javascript
// src/util/registrationDataMerger.js
export const resolveSubscriptionPlan = (store) => {
  // Priority 1: Direct subscriptionPlan field from database
  const directPlan = normalizePlan(store?.subscriptionPlan);
  if (directPlan) return directPlan;  // ← Returns "ENTERPRISE"
  
  // Priority 2: Fallback heuristic based on branches/users
  const branches = store?.estimatedBranches ?? store?.branches?.length ?? 1;
  const users = store?.estimatedUsers ?? store?.employees?.length ?? 1;
  
  if (branches > 10 || users > 50) return "ENTERPRISE";
  if (branches > 3 || users > 15) return "PROFESSIONAL";
  return "BASIC";
};
```

## Subscription Plans

| Plan         | Price      | Branches  | Users      |
|--------------|------------|-----------|------------|
| Basic        | NPR 3,500  | 3         | 10         |
| Professional | NPR 7,000  | 10        | 50         |
| Enterprise   | NPR 10,000 | Unlimited | Unlimited  |

## Backend API Endpoints Used

| Method | Endpoint                                          | Description                    |
|--------|---------------------------------------------------|--------------------------------|
| GET    | `/api/stores/admin`                               | Get current store (with plan)  |
| GET    | `/api/admin/subscription-upgrade-requests`        | List all upgrade requests      |
| POST   | `/api/subscription-upgrade-requests`              | Submit new upgrade request     |
| POST   | `/api/admin/subscription-upgrade-requests/{id}/mark-paid` | Mark request as paid |
| POST   | `/api/admin/subscription-upgrade-requests/{id}/approve` | Approve upgrade request |
| PUT    | `/api/admin/stores/{storeId}/subscription` ✨ NEW | Update store subscription plan |

## State Management

### POS Admin (Uses Redux + localStorage)
```javascript
// Redux store
const { stores } = useSelector((s) => s.store);

// localStorage for overrides (immediate UI feedback)
const [planOverrides, setPlanOverrides] = useState(() => 
  readJson('subscriptionPlanOverrides', {})
);

// Display plan
const plan = planOverrides[storeId] || resolveSubscriptionPlan(store);
```

### Store Admin (Uses Redux only)
```javascript
// Redux store
const { store } = useSelector((s) => s.store);

// Resolve plan from store data
const currentPlan = resolveSubscriptionPlan(store);
```

## UI Components

### Store Admin Subscription Card
```jsx
<div>
  <p>Active Plan</p>
  <p>{SUBSCRIPTION_PLANS[currentPlan]?.name}</p>  {/* "Enterprise" */}
  <p>NPR {SUBSCRIPTION_PLANS[currentPlan]?.price.toLocaleString()}/year</p>
</div>

{availablePlans.length > 0 && !activeRequest && (
  <button onClick={() => setShowPaymentForm(true)}>
    Upgrade Plan
  </button>
)}
```

### POS Admin Store Card
```jsx
<div>
  <p>Current Plan</p>
  <p>{planDetails.name}</p>  {/* Resolves to "Enterprise" */}
  <p>{planDetails.price}</p>
</div>

{pendingRequest && (
  <div>
    <button onClick={() => onMarkPaid(request)}>Mark Paid</button>
    <button onClick={() => onApprove(request)}>Approve Upgrade</button>
  </div>
)}
```

## Common Issues & Solutions

### Issue: Store-admin still sees old plan after approval
**Solution**: Click "Refresh" button to fetch updated data from backend

### Issue: POS admin approval fails silently
**Solution**: Check browser console for API errors. Verify backend endpoint exists.

### Issue: Plan shows "undefined" or wrong value
**Solution**: Check that store.subscriptionPlan is uppercase ("ENTERPRISE" not "enterprise")

### Issue: Upgrade button doesn't appear
**Solution**: Verify store is not already on highest plan or has no active request

## Next Steps

1. ✅ Backend endpoint implemented
2. ✅ Frontend approval flow updated
3. ✅ Store-admin refresh logic fixed
4. 🔄 Test with real data
5. 🔄 Deploy to production

## Notes

- localStorage overrides are only used by POS admin for immediate UI feedback
- Store-admin always fetches fresh data from backend
- All subscription changes are now persisted in database
- No manual database updates required

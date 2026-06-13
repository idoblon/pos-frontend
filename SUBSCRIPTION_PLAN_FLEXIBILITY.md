# Subscription Plan Flexibility - Allow All Plan Changes

## Changes Made

### Overview
Store admins can now change their subscription plan to ANY available plan (upgrade OR downgrade), including stores that are already on the highest plan (Enterprise).

### Previous Behavior
- ❌ Only allowed upgrades (Basic → Professional → Enterprise)
- ❌ Stores on Enterprise plan couldn't change plans
- ❌ No downgrade option

### New Behavior
- ✅ Allow upgrades (Basic → Professional, Basic → Enterprise, Professional → Enterprise)
- ✅ Allow downgrades (Enterprise → Professional, Enterprise → Basic, Professional → Basic)
- ✅ All stores can change plans regardless of current tier
- ✅ Clear UI indicators showing upgrade vs downgrade

## Code Changes

### File: `src/pages/storeAdmin/Subscription/SubscriptionRequest.jsx`

#### 1. Updated Helper Functions
```javascript
// Before: Only calculated upgrade cost
const getUpgradeAmount = (currentPlan, requestedPlan) => {
  const current = SUBSCRIPTION_PLANS[currentPlan]?.price || 0;
  const requested = SUBSCRIPTION_PLANS[requestedPlan]?.price || current;
  return Math.max(requested - current, requested);
};

// After: Calculate absolute difference for any plan change
const getPlanChangeAmount = (currentPlan, requestedPlan) => {
  const current = SUBSCRIPTION_PLANS[currentPlan]?.price || 0;
  const requested = SUBSCRIPTION_PLANS[requestedPlan]?.price || current;
  return Math.abs(requested - current);
};

const getPlanChangeType = (currentPlan, requestedPlan) => {
  const currentIndex = PLAN_ORDER.indexOf(currentPlan);
  const requestedIndex = PLAN_ORDER.indexOf(requestedPlan);
  
  if (requestedIndex > currentIndex) return "UPGRADE";
  if (requestedIndex < currentIndex) return "DOWNGRADE";
  return "SAME";
};
```

#### 2. Available Plans Filter
```javascript
// Before: Only plans higher than current
const availablePlans = useMemo(
  () => PLAN_ORDER.filter((plan) => PLAN_ORDER.indexOf(plan) > PLAN_ORDER.indexOf(currentPlan)),
  [currentPlan],
);

// After: All plans except current
const availablePlans = useMemo(
  () => PLAN_ORDER.filter((plan) => plan !== currentPlan),
  [currentPlan],
);
```

#### 3. UI Changes

**Button Text**
- Before: "Upgrade Plan"
- After: "Change Plan"

**Empty State Message**
- Before: "You are already on the highest plan."
- After: Always shows "Change Plan" button

**Form Labels**
- Before: "Select Plan to Upgrade"
- After: "Select New Plan"

**Amount Display**
- Upgrade: "⬆️ Upgrading from X to Y" (green text)
- Downgrade: "⬇️ Downgrading from X to Y" (red text)

**Submit Button**
- Dynamic text: "Send Upgrade Request" or "Send Downgrade Request"

#### 4. Validation
```javascript
// Added check for same plan
if (requestedPlan === currentPlan) {
  toast.error("You are already on this plan");
  return;
}
```

## User Experience

### For Store Admin (Any Plan)

#### Current: Basic Plan
**Can change to:**
- Professional (Upgrade ⬆️ - NPR 3,500 difference)
- Enterprise (Upgrade ⬆️ - NPR 6,500 difference)

#### Current: Professional Plan
**Can change to:**
- Basic (Downgrade ⬇️ - NPR 3,500 difference)
- Enterprise (Upgrade ⬆️ - NPR 3,000 difference)

#### Current: Enterprise Plan
**Can change to:**
- Basic (Downgrade ⬇️ - NPR 6,500 difference)
- Professional (Downgrade ⬇️ - NPR 3,000 difference)

### UI Flow

1. **Store Admin Dashboard**
   - Click "Subscription" in sidebar

2. **Subscription Page**
   - Shows current active plan
   - Shows "Change Plan" button (always visible)
   - Click "Change Plan"

3. **Payment Form**
   - Select dropdown shows all other plans
   - UI shows if upgrade ⬆️ or downgrade ⬇️
   - Shows price difference
   - Shows features of selected plan
   - Enter payment reference
   - Submit request

4. **Waiting for Approval**
   - Shows "Waiting for POS admin approval" status
   - Cannot submit another request until current is processed

5. **After Approval**
   - POS admin approves
   - Plan updates in database
   - Store admin refreshes to see new plan

## POS Admin Experience

### Subscription Management Page

No changes needed for POS admin - they still:
1. See all plan change requests (upgrades and downgrades)
2. Mark as paid (if needed)
3. Approve request
4. Backend updates store's subscription_plan field

### UI Display
The request card shows:
- Current plan → Requested plan
- Whether it's an upgrade or downgrade is visible from plan names

## Backend Compatibility

✅ **No backend changes required**

The existing endpoints handle both upgrades and downgrades:
- `POST /api/subscription-upgrade-requests` - Creates request (works for any plan change)
- `PUT /api/admin/stores/{storeId}/subscription` - Updates plan (works for any plan)

The backend doesn't distinguish between upgrade/downgrade - it simply updates the `subscription_plan` field to the new value.

## Examples

### Example 1: Enterprise → Basic (Downgrade)
```javascript
Request:
{
  storeId: "1",
  storeName: "Indoor Plant World",
  currentPlan: "ENTERPRISE",
  requestedPlan: "BASIC",
  changeType: "DOWNGRADE",
  amount: 6500,
  paymentMethod: "ESEWA",
  paymentReference: "ESW_DOWN_123"
}
```

### Example 2: Basic → Professional (Upgrade)
```javascript
Request:
{
  storeId: "2",
  storeName: "Mitra Pustak",
  currentPlan: "BASIC",
  requestedPlan: "PROFESSIONAL",
  changeType: "UPGRADE",
  amount: 3500,
  paymentMethod: "KHALTI",
  paymentReference: "KHT_UP_456"
}
```

### Example 3: Enterprise → Professional (Downgrade)
```javascript
Request:
{
  storeId: "1",
  storeName: "Indoor Plant World",
  currentPlan: "ENTERPRISE",
  requestedPlan: "PROFESSIONAL",
  changeType: "DOWNGRADE",
  amount: 3000,
  paymentMethod: "ESEWA",
  paymentReference: "ESW_DOWN_789"
}
```

## Testing Checklist

### As Store Admin (Enterprise Plan)
- [ ] Can see "Change Plan" button
- [ ] Dropdown shows Basic and Professional options
- [ ] Selecting Basic shows "⬇️ Downgrading" message
- [ ] Selecting Professional shows "⬇️ Downgrading" message
- [ ] Amount shows correct difference
- [ ] Can submit downgrade request
- [ ] Request appears in "Waiting for approval" status

### As Store Admin (Basic Plan)
- [ ] Can see "Change Plan" button
- [ ] Dropdown shows Professional and Enterprise options
- [ ] Selecting Professional shows "⬆️ Upgrading" message
- [ ] Selecting Enterprise shows "⬆️ Upgrading" message
- [ ] Amount shows correct difference
- [ ] Can submit upgrade request

### As Store Admin (Professional Plan)
- [ ] Can see "Change Plan" button
- [ ] Dropdown shows Basic and Enterprise options
- [ ] Shows correct upgrade/downgrade indicators
- [ ] Can submit either type of request

### As POS Admin
- [ ] Receives downgrade requests
- [ ] Can approve downgrades same as upgrades
- [ ] Store plan updates correctly after approval
- [ ] No errors in console

## Benefits

1. **Flexibility**: Stores can adjust plans based on changing needs
2. **Cost Savings**: Stores can downgrade if they over-subscribed
3. **Better UX**: Clear indicators show what type of change is being made
4. **No Restrictions**: Even highest-tier stores can change plans
5. **Simple Process**: Same approval workflow for all plan changes

## Notes

- Payment reference still required for all plan changes (upgrades and downgrades)
- POS admin approval required for all changes
- Only one active request allowed at a time
- Cannot change to the same plan (validation prevents this)
- Amount displayed is always the absolute difference in price

## Files Modified

1. ✅ `src/pages/storeAdmin/Subscription/SubscriptionRequest.jsx`
   - Updated available plans filter
   - Added change type detection
   - Updated UI text and labels
   - Added upgrade/downgrade indicators
   - Changed button text from "Upgrade" to "Change"

## No Changes Needed

- ✅ Backend endpoints (already support any plan change)
- ✅ Database schema (stores any valid plan name)
- ✅ POS Admin UI (already handles all requests)
- ✅ Request approval flow (works for any plan change)

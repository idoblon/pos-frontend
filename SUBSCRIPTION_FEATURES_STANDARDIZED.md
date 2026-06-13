# Subscription Plan Features - Standardized

## Overview
All subscription plan features have been standardized across the codebase to match the official plan specifications in `subscriptionLogic.js`.

## Official Subscription Plans

### BASIC Plan
- **Price**: NPR 3,500/year
- **Included Features**:
  - 1 Store
  - 3 Branches
  - 10 Users
  - 5GB Storage
  - Email Support

### PROFESSIONAL Plan
- **Price**: NPR 7,000/year
- **Included Features**:
  - 1 Store
  - 10 Branches
  - 50 Users
  - 25GB Storage
  - Priority Support
  - API Access

### ENTERPRISE Plan
- **Price**: NPR 10,000/year
- **Included Features**:
  - Unlimited Stores
  - 25 Branches
  - 200 Users
  - 100GB Storage
  - 24/7 Dedicated Support
  - Custom Integrations

## Add-Ons (Pay Per Use)

### BASIC Plan Add-Ons
- Extra Branch: NPR 500/branch/year (beyond 3)
- Extra User: NPR 100/user/year (beyond 10)
- Extra Storage: NPR 200/GB/year (beyond 5GB)

### PROFESSIONAL Plan Add-Ons
- Extra Branch: NPR 400/branch/year (beyond 10)
- Extra User: NPR 80/user/year (beyond 50)
- Extra Storage: NPR 150/GB/year (beyond 25GB)

### ENTERPRISE Plan Add-Ons
- Extra Branch: NPR 300/branch/year (beyond 25)
- Extra User: NPR 50/user/year (beyond 200)
- Extra Storage: NPR 100/GB/year (beyond 100GB)

## Files Updated

### ✅ Source of Truth
**File**: `src/util/subscriptionLogic.js`
- Contains complete plan details with add-ons
- Includes calculation logic
- Used as reference for all other files

### ✅ Store Admin Subscription Page
**File**: `src/pages/storeAdmin/Subscription/SubscriptionRequest.jsx`
- **UPDATED**: Simplified features for modal display
- Shows key plan differentiators in payment form

**Before**:
```javascript
BASIC: ["3 branches", "10 users", "Basic support"]
PROFESSIONAL: ["10 branches", "50 users", "Priority support", "Advanced reports"]
ENTERPRISE: ["Unlimited branches", "Unlimited users", "24/7 support", "Custom features"]
```

**After**:
```javascript
BASIC: ["3 branches", "10 users", "5GB storage", "Email support"]
PROFESSIONAL: ["10 branches", "50 users", "25GB storage", "Priority support", "API access"]
ENTERPRISE: ["25 branches", "200 users", "100GB storage", "24/7 dedicated support", "Custom integrations"]
```

### ✅ POS Admin Subscription Management
**File**: `src/pages/admin/Subscriptions/SubscriptionManagement.jsx`
- **UPDATED**: Features now match official specs
- Shows complete plan details in store cards

**Before**:
```javascript
BASIC: ["1 Store", "3 Branches", "10 Users", "Basic Support"]
PROFESSIONAL: ["1 Store", "10 Branches", "50 Users", "Priority Support", "Advanced Reports"]
ENTERPRISE: ["Unlimited Stores", "Unlimited Branches", "Unlimited Users", "24/7 Support", "Custom Features"]
```

**After**:
```javascript
BASIC: ["1 Store", "3 Branches", "10 Users", "5GB Storage", "Email Support"]
PROFESSIONAL: ["1 Store", "10 Branches", "50 Users", "25GB Storage", "Priority Support", "API Access"]
ENTERPRISE: ["Unlimited Stores", "25 Branches", "200 Users", "100GB Storage", "24/7 Dedicated Support", "Custom Integrations"]
```

## Key Changes Made

### 1. Enterprise Plan Clarification
- **Changed**: "Unlimited branches" → "25 branches"
- **Changed**: "Unlimited users" → "200 users"
- **Reason**: Enterprise has base limits, with add-ons available beyond these

### 2. Storage Information Added
- All plans now show storage limits
- Helps stores understand capacity included

### 3. Support Level Clarity
- BASIC: "Email Support"
- PROFESSIONAL: "Priority Support"
- ENTERPRISE: "24/7 Dedicated Support"

### 4. Feature Naming Consistency
- "API Access" instead of "Advanced Reports"
- "Custom Integrations" instead of "Custom Features"
- Matches actual technical capabilities

## Benefits

### For Store Admins
- Clear understanding of what each plan includes
- No confusion about "unlimited" vs actual limits
- Transparent add-on pricing

### For POS Admin
- Consistent information across all interfaces
- Easier to explain plan differences
- Accurate feature sets for validation

## Validation

All features now match the authoritative source in `subscriptionLogic.js`:
- ✅ Branch limits correct
- ✅ User limits correct
- ✅ Storage amounts correct
- ✅ Support levels accurate
- ✅ Additional features listed

## Testing Checklist

- [ ] Store admin can see correct features when selecting plan
- [ ] POS admin sees matching features in subscription management
- [ ] Plan change requests show accurate feature differences
- [ ] Add-on pricing calculations use correct base limits
- [ ] Subscription calculator uses correct plan data

## Migration Notes

No database changes required. This is purely a frontend display update to ensure accuracy and consistency across all subscription-related UI components.

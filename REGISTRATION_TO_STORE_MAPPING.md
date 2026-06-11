# Registration Request to Store Data Mapping Specification

## 🎯 Issue
When a store registration request is approved by the admin, the original registration data (email, phone, address, subscription plan, etc.) is not being properly transferred to the created store record. This causes the subscription management system to display incomplete information.

## 📋 Required Backend Changes

### 1. Store Registration Request Approval Endpoint
**Endpoint:** `POST /api/admin/registration-requests/{requestId}/approve-final`

When this endpoint is called, the backend must:

#### A. Fetch the complete registration request data
```javascript
const registrationRequest = await RegistrationRequest.findById(requestId);
```

#### B. Create store record with ALL registration data mapped properly
```javascript
const storeData = {
  // Basic store information
  storeName: registrationRequest.storeName,
  storeDescription: registrationRequest.storeDescription,
  storeType: registrationRequest.storeType,
  storeAddress: registrationRequest.storeAddress,
  
  // Owner/Admin information  
  ownerName: registrationRequest.ownerName,
  email: registrationRequest.email,
  phone: registrationRequest.phone,
  
  // Subscription information (CRITICAL - this is missing!)
  subscriptionPlan: registrationRequest.subscriptionPlan,
  estimatedBranches: registrationRequest.estimatedBranches,
  estimatedUsers: registrationRequest.estimatedUsers,
  
  // Status and timestamps
  status: 'ACTIVE',
  createdAt: new Date(),
  approvedAt: new Date(),
  
  // Link back to original registration request
  registrationRequestId: registrationRequest.id,
  
  // Keep original registration data for reference
  registrationRequest: {
    ownerName: registrationRequest.ownerName,
    email: registrationRequest.email,
    phone: registrationRequest.phone,
    storeAddress: registrationRequest.storeAddress,
    subscriptionPlan: registrationRequest.subscriptionPlan,
    estimatedBranches: registrationRequest.estimatedBranches,
    estimatedUsers: registrationRequest.estimatedUsers,
    submittedAt: registrationRequest.createdAt
  }
};

const store = await Store.create(storeData);
```

### 2. Store Model Schema Updates
Ensure the Store model includes these fields:

```javascript
const StoreSchema = {
  // Basic store info
  storeName: String,
  storeDescription: String,
  storeType: String,
  storeAddress: String,
  
  // Owner info (from registration)
  ownerName: String,
  email: String,
  phone: String,
  
  // Subscription info (CRITICAL!)
  subscriptionPlan: {
    type: String,
    enum: ['BASIC', 'PROFESSIONAL', 'ENTERPRISE'],
    required: true
  },
  estimatedBranches: Number,
  estimatedUsers: Number,
  
  // Store the original registration request data
  registrationRequest: {
    ownerName: String,
    email: String,
    phone: String,
    storeAddress: String,
    subscriptionPlan: String,
    estimatedBranches: Number,
    estimatedUsers: Number,
    submittedAt: Date
  },
  
  // Status and audit
  status: String,
  createdAt: Date,
  approvedAt: Date,
  registrationRequestId: String
};
```

## 🔍 Current Data Mapping Issues

### What's Missing in Store Records:
1. **subscriptionPlan** - The chosen plan (Basic/Professional/Enterprise)
2. **email** - Owner's email address
3. **phone** - Owner's phone number  
4. **storeAddress** - Complete store address
5. **ownerName** - Owner's full name

### Expected Data Flow:
```
Registration Request → Backend Approval → Store Creation
{                     {                  {
  ownerName            ownerName          ownerName ✓
  email        →       email      →       email ✓
  phone                phone              phone ✓
  subscriptionPlan     subscriptionPlan   subscriptionPlan ✓
  storeAddress         storeAddress       storeAddress ✓
}                     }                  }
```

## 🧪 Test Case

### Registration Request Data (from frontend):
```json
{
  "storeName": "Mitra Pustak",
  "ownerName": "Puskar Gharti",
  "email": "puskar@mitrapustak.com",
  "phone": "9841234567",
  "storeAddress": "Kathmandu, Nepal",
  "subscriptionPlan": "PROFESSIONAL",
  "estimatedBranches": 3,
  "estimatedUsers": 15
}
```

### Expected Store Record (after approval):
```json
{
  "id": "store_123",
  "storeName": "Mitra Pustak",
  "ownerName": "Puskar Gharti", 
  "email": "puskar@mitrapustak.com",
  "phone": "9841234567",
  "storeAddress": "Kathmandu, Nepal",
  "subscriptionPlan": "PROFESSIONAL",
  "estimatedBranches": 3,
  "estimatedUsers": 15,
  "status": "ACTIVE",
  "registrationRequest": {
    "ownerName": "Puskar Gharti",
    "email": "puskar@mitrapustak.com", 
    "phone": "9841234567",
    "storeAddress": "Kathmandu, Nepal",
    "subscriptionPlan": "PROFESSIONAL"
  }
}
```

## 🚨 Current Problem

When fetching stores via `GET /api/stores`, the store records are missing:
- `subscriptionPlan` field
- `email` field  
- `phone` field
- `storeAddress` field
- `ownerName` field

This causes the subscription management to show:
- Plan: "Basic" (wrong - should be "Professional")
- Email: "Email not provided" 
- Phone: "Phone not provided"
- Address: "Address not provided"
- Revenue: Random number (should be 0 for new stores)

## ✅ Fix Checklist

### Backend Changes:
- [ ] Update Store model schema to include registration fields
- [ ] Modify approval endpoint to map all registration data
- [ ] Ensure GET /api/stores returns complete store data
- [ ] Test that approved stores contain all original registration info

### Verification:
- [ ] Create test registration request with complete data
- [ ] Approve the request via admin panel
- [ ] Verify created store has all registration fields
- [ ] Check subscription management shows correct data

## 📞 Quick Backend Test

After implementing the fixes, test with:

```bash
# 1. Create registration request
curl -X POST http://localhost:8080/api/public/store-registration-request \
  -H "Content-Type: application/json" \
  -d '{
    "storeName": "Test Store",
    "ownerName": "Test Owner", 
    "email": "test@store.com",
    "phone": "1234567890",
    "subscriptionPlan": "PROFESSIONAL",
    "storeAddress": "Test Address"
  }'

# 2. Approve request (replace {id} with actual request ID)
curl -X POST http://localhost:8080/api/admin/registration-requests/{id}/approve-final \
  -H "Authorization: Bearer {admin-jwt}"

# 3. Verify store data includes registration info
curl -X GET http://localhost:8080/api/stores \
  -H "Authorization: Bearer {admin-jwt}"
```

Expected result: Store record should contain all registration data fields.

---

**Priority: High** - This fix is critical for subscription management to work correctly.
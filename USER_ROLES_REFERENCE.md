# User Roles Reference

## 🎭 Valid User Roles (Backend Enum)

The backend accepts the following roles as defined in the `UserRole` enum:

1. **ROLE_USER** - Basic user role
2. **ROLE_ADMIN** - System administrator
3. **ROLE_STORE_ADMIN** - Store administrator (can manage entire store)
4. **ROLE_BRANCH_MANAGER** - Branch manager (can manage specific branch with full authority)
5. **ROLE_BRANCH_CASHIER** - Cashier (can process orders at branch)

**Note:** ROLE_STORE_MANAGER has been removed from the system. Branch Manager now handles all branch operations including financial management, inventory, and staff management.

---

## 🔧 Fixed Issues

### Issue: Signup Role Mismatch
**Problem:** Signup was sending `"store_admin"` but backend expects `"ROLE_STORE_ADMIN"`

**Error Message:**
```
JSON parse error: Cannot deserialize value of type `com.springboot.POS.domain.UserRole` 
from String "store_admin": not one of the values accepted for Enum class: 
[ROLE_USER, ROLE_ADMIN, ROLE_STORE_ADMIN, ROLE_BRANCH_MANAGER, ROLE_BRANCH_CASHIER]
```

**Solution:** Updated `Signup.jsx` to use `"ROLE_STORE_ADMIN"` instead of `"store_admin"`

---

## 📋 Role Mapping

### Frontend → Backend

| Frontend Display | Backend Value | Description |
|-----------------|---------------|-------------|
| Store Admin | `ROLE_STORE_ADMIN` | Full store management access |
| Branch Manager | `ROLE_BRANCH_MANAGER` | Complete branch management (financial, operational, staff) |
| Cashier | `ROLE_BRANCH_CASHIER` | POS terminal access |
| Admin | `ROLE_ADMIN` | System administrator |
| User | `ROLE_USER` | Basic user |

---

## 🔐 Role Permissions

### ROLE_STORE_ADMIN
- ✅ Create and manage stores
- ✅ Create and manage branches
- ✅ Manage products and categories
- ✅ Manage employees across stores
- ✅ View all reports
- ✅ Manage inventory across stores

### ROLE_BRANCH_MANAGER (Enhanced)
- ✅ Complete branch operations management
- ✅ Financial control and analytics
- ✅ Profit/loss tracking and business insights
- ✅ Full employee management (hire/fire/salary)
- ✅ Inventory management and procurement
- ✅ Branch settings and system configuration
- ✅ Advanced reporting and analytics
- ✅ Customer management and loyalty programs
- ❌ Cannot create stores or manage other branches

### ROLE_BRANCH_CASHIER
- ✅ Process orders (POS terminal)
- ✅ Handle refunds
- ✅ View order history
- ✅ Manage customers
- ✅ View shift reports and working hours
- ❌ Cannot manage products
- ❌ Cannot manage employees
- ❌ Cannot access financial analytics

---

## 🚨 Important Notes

1. **Always use ROLE_ prefix** when sending roles to backend
2. **Case sensitive** - Must be uppercase (e.g., `ROLE_STORE_ADMIN` not `role_store_admin`)
3. **Exact match required** - Backend will reject any role not in the enum
4. **Default signup role** - Currently set to `ROLE_STORE_ADMIN` for new store registrations
5. **ROLE_STORE_MANAGER removed** - All store manager functionality moved to Branch Manager

---

## 🧪 Testing Signup

### Test Case: Store Admin Signup
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "ROLE_STORE_ADMIN",
  "storeName": "My Store"
}
```

**Expected Response:**
```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "ROLE_STORE_ADMIN",
  "storeId": 1,
  "branchId": null,
  "storeName": "My Store"
}
```

---

## 🔍 Troubleshooting

### Error: "not one of the values accepted for Enum class"
**Cause:** Role value doesn't match backend enum
**Solution:** Use exact role values with `ROLE_` prefix (excluding ROLE_STORE_MANAGER)

### Error: 500 Internal Server Error on signup
**Possible Causes:**
1. Invalid role value
2. Duplicate email
3. Missing required fields
4. Database connection issue

**Check:**
- Role is one of the valid enum values
- Email is unique
- All required fields are provided
- Backend is running and database is accessible

---

## 📝 Code Examples

### Correct Role Usage
```javascript
// ✅ Correct
const formData = {
  role: "ROLE_STORE_ADMIN"
};

// ✅ Correct
const formData = {
  role: "ROLE_BRANCH_MANAGER"
};

// ❌ Wrong - Role removed
const formData = {
  role: "ROLE_STORE_MANAGER"  // This role no longer exists
};

// ❌ Wrong
const formData = {
  role: "store_admin"  // Missing ROLE_ prefix
};
```

---

## 🔄 Role Updates

If you need to add or modify roles:

1. Update backend `UserRole` enum
2. Update frontend role constants
3. Update this documentation
4. Test all role-related functionality
5. Update role-based routing/permissions

---

## ✅ Checklist for Role Implementation

- [x] Use `ROLE_` prefix
- [x] Uppercase values
- [x] Match backend enum exactly
- [x] Remove ROLE_STORE_MANAGER references
- [x] Update Signup.jsx
- [x] Update BranchEmployees.jsx
- [x] Update roleMapper.js
- [x] Update BranchDashboard.jsx
- [ ] Update Login.jsx (if needed)
- [ ] Update role-based routing
- [ ] Update permission checks
- [ ] Test all roles
- [ ] Update backend enum (remove ROLE_STORE_MANAGER)

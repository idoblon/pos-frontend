# User Roles Reference

## 🎭 Valid User Roles (Backend Enum)

The backend accepts the following roles as defined in the `UserRole` enum:

1. **ROLE_USER** - Basic user role
2. **ROLE_ADMIN** - System administrator
3. **ROLE_STORE_ADMIN** - Store administrator (can manage entire store)
4. **ROLE_BRANCH_MANAGER** - Branch manager (can manage specific branch)
5. **ROLE_BRANCH_CASHIER** - Cashier (can process orders at branch)
6. **ROLE_STORE_MANAGER** - Store manager

---

## 🔧 Fixed Issues

### Issue: Signup Role Mismatch
**Problem:** Signup was sending `"store_admin"` but backend expects `"ROLE_STORE_ADMIN"`

**Error Message:**
```
JSON parse error: Cannot deserialize value of type `com.springboot.POS.domain.UserRole` 
from String "store_admin": not one of the values accepted for Enum class: 
[ROLE_USER, ROLE_ADMIN, ROLE_STORE_ADMIN, ROLE_BRANCH_MANAGER, ROLE_BRANCH_CASHIER, ROLE_STORE_MANAGER]
```

**Solution:** Updated `Signup.jsx` to use `"ROLE_STORE_ADMIN"` instead of `"store_admin"`

---

## 📋 Role Mapping

### Frontend → Backend

| Frontend Display | Backend Value | Description |
|-----------------|---------------|-------------|
| Store Admin | `ROLE_STORE_ADMIN` | Full store management access |
| Branch Manager | `ROLE_BRANCH_MANAGER` | Branch-level management |
| Cashier | `ROLE_BRANCH_CASHIER` | POS terminal access |
| Store Manager | `ROLE_STORE_MANAGER` | Store operations management |
| Admin | `ROLE_ADMIN` | System administrator |
| User | `ROLE_USER` | Basic user |

---

## 🔐 Role Permissions

### ROLE_STORE_ADMIN
- ✅ Create and manage stores
- ✅ Create and manage branches
- ✅ Manage products and categories
- ✅ Manage employees
- ✅ View all reports
- ✅ Manage inventory

### ROLE_BRANCH_MANAGER
- ✅ Manage branch operations
- ✅ Manage branch employees
- ✅ View branch reports
- ✅ Manage branch inventory
- ❌ Cannot create stores

### ROLE_BRANCH_CASHIER
- ✅ Process orders (POS terminal)
- ✅ Handle refunds
- ✅ View order history
- ✅ Manage customers
- ✅ View shift reports
- ❌ Cannot manage products
- ❌ Cannot manage employees

### ROLE_STORE_MANAGER
- ✅ Manage store operations
- ✅ View store reports
- ✅ Manage inventory
- ❌ Cannot create stores

---

## 🚨 Important Notes

1. **Always use ROLE_ prefix** when sending roles to backend
2. **Case sensitive** - Must be uppercase (e.g., `ROLE_STORE_ADMIN` not `role_store_admin`)
3. **Exact match required** - Backend will reject any role not in the enum
4. **Default signup role** - Currently set to `ROLE_STORE_ADMIN` for new store registrations

---

## 🧪 Testing Signup

### Test Case: Store Admin Signup
```json
{
  "firstName": "John",
  "lastName": "Doe",
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
**Solution:** Use exact role values with `ROLE_` prefix

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

// ❌ Wrong
const formData = {
  role: "store_admin"  // Missing ROLE_ prefix
};

// ❌ Wrong
const formData = {
  role: "role_store_admin"  // Lowercase
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
- [x] Update Signup.jsx
- [ ] Update Login.jsx (if needed)
- [ ] Update role-based routing
- [ ] Update permission checks
- [ ] Test all roles

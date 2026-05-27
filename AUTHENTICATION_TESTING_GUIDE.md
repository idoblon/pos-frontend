# Authentication Testing Guide

## 🔐 Signup & Login Flow

---

## ✅ Fixed Issues

### Issue 1: Role Mismatch
**Problem:** Frontend was sending `"store_admin"` but backend expects `"ROLE_STORE_ADMIN"`
**Status:** ✅ FIXED

### Issue 2: Full Name Required
**Problem:** Backend expects `fullName` field but frontend was sending `firstName` and `lastName` separately
**Status:** ✅ FIXED - Now combines firstName + lastName into fullName

---

## 📋 Signup API

### Endpoint
```
POST http://localhost:8080/auth/signup
```

### Request Body (Frontend sends)
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "ROLE_STORE_ADMIN",
  "storeName": "My Store"
}
```

### Response (Backend returns)
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

## 🧪 Signup Test Cases

### Test Case 1: Valid Signup
**Steps:**
1. Navigate to `/signup`
2. Fill in:
   - First Name: "John"
   - Last Name: "Doe"
   - Email: "john@example.com"
   - Store Name: "My Store"
   - Password: "password123"
   - Confirm Password: "password123"
3. Click "Create Account"

**Expected Result:**
- ✅ Account created successfully
- ✅ Redirected to `/login`
- ✅ Backend receives: `fullName: "John Doe"`
- ✅ Backend receives: `role: "ROLE_STORE_ADMIN"`

### Test Case 2: Password Mismatch
**Steps:**
1. Fill form with different passwords
2. Click "Create Account"

**Expected Result:**
- ❌ Error: "Passwords do not match"
- ❌ Form not submitted

### Test Case 3: Duplicate Email
**Steps:**
1. Try to signup with existing email
2. Click "Create Account"

**Expected Result:**
- ❌ Error from backend: "Email already exists"

### Test Case 4: Invalid Email Format
**Steps:**
1. Enter invalid email (e.g., "notanemail")
2. Try to submit

**Expected Result:**
- ❌ HTML5 validation error
- ❌ Form not submitted

### Test Case 5: Short Password
**Steps:**
1. Enter password less than 8 characters
2. Try to submit

**Expected Result:**
- ❌ HTML5 validation error: "Min. 8 characters"
- ❌ Form not submitted

---

## 📋 Login API

### Endpoint
```
POST http://localhost:8080/auth/login
```

### Request Body
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Response
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

## 🧪 Login Test Cases

### Test Case 1: Valid Login (Store Admin)
**Steps:**
1. Navigate to `/login`
2. Enter valid credentials
3. Click "Login"

**Expected Result:**
- ✅ Login successful
- ✅ JWT token stored securely
- ✅ User data stored
- ✅ Redirected to `/store-admin`

### Test Case 2: Valid Login (Cashier)
**Steps:**
1. Login with cashier credentials
2. Click "Login"

**Expected Result:**
- ✅ Login successful
- ✅ Shift started automatically
- ✅ Redirected to `/cashier`

### Test Case 3: Invalid Credentials
**Steps:**
1. Enter wrong password
2. Click "Login"

**Expected Result:**
- ❌ Error: "Invalid credentials"
- ❌ Not logged in

### Test Case 4: Empty Fields
**Steps:**
1. Leave email or password empty
2. Try to submit

**Expected Result:**
- ❌ Validation error
- ❌ Form not submitted

---

## 🔄 Role-Based Routing

After successful login, users are redirected based on their role:

| Role | Redirect Path |
|------|--------------|
| `ROLE_ADMIN` | `/admin` |
| `ROLE_STORE_ADMIN` | `/store-admin` |
| `ROLE_STORE_MANAGER` | `/store-admin` |
| `ROLE_BRANCH_MANAGER` | `/branch` |
| `ROLE_BRANCH_CASHIER` | `/cashier` |
| Default | `/dashboard` |

---

## 🔒 Security Features

### 1. Secure Token Storage
- JWT stored in secure storage (not localStorage)
- Token validation on each request
- Auto-logout on token expiry (401)

### 2. Input Sanitization
- All inputs sanitized before sending to backend
- Email validation
- Password strength requirements

### 3. CSRF Protection
- Token-based authentication
- Secure headers

---

## 🐛 Common Errors & Solutions

### Error: "Full name is required"
**Cause:** Backend expects `fullName` field
**Solution:** ✅ Fixed - Frontend now combines firstName + lastName

### Error: "not one of the values accepted for Enum class"
**Cause:** Invalid role value
**Solution:** ✅ Fixed - Using `ROLE_STORE_ADMIN` instead of `store_admin`

### Error: 401 Unauthorized
**Cause:** Token expired or invalid
**Solution:** User automatically redirected to login

### Error: 500 Internal Server Error
**Possible Causes:**
1. Database connection issue
2. Duplicate email
3. Missing required fields
4. Backend validation error

**Check:**
- Backend logs
- Database connectivity
- Request payload format

---

## 📝 Data Flow

### Signup Flow
```
User fills form
  ↓
Frontend combines firstName + lastName → fullName
  ↓
Frontend sends: { fullName, email, password, role: "ROLE_STORE_ADMIN", storeName }
  ↓
Backend validates and creates user
  ↓
Backend returns: { jwt, role, storeId, branchId, storeName }
  ↓
Frontend stores token and user data
  ↓
Redirect to /login
```

### Login Flow
```
User enters credentials
  ↓
Frontend validates input
  ↓
Frontend sends: { email, password }
  ↓
Backend validates credentials
  ↓
Backend returns: { jwt, role, storeId, branchId, storeName }
  ↓
Frontend stores token and user data
  ↓
Frontend fetches user profile
  ↓
If cashier: Start shift automatically
  ↓
Redirect based on role
```

---

## ✅ Testing Checklist

### Signup
- [ ] Valid signup with all fields
- [ ] Password mismatch error
- [ ] Duplicate email error
- [ ] Invalid email format
- [ ] Short password validation
- [ ] fullName sent correctly
- [ ] role sent as ROLE_STORE_ADMIN
- [ ] Redirect to login after success

### Login
- [ ] Valid login (Store Admin)
- [ ] Valid login (Cashier)
- [ ] Invalid credentials error
- [ ] Empty fields validation
- [ ] Token stored securely
- [ ] User data stored
- [ ] Correct role-based redirect
- [ ] Shift auto-start for cashier
- [ ] Remember me functionality

### Security
- [ ] Token in secure storage
- [ ] Auto-logout on 401
- [ ] Input sanitization
- [ ] Email validation
- [ ] Password requirements enforced

---

## 🔍 Debug Tips

1. **Check Network Tab:** Verify request payload matches expected format
2. **Check Console:** Look for validation errors or API errors
3. **Check Backend Logs:** See what backend is receiving
4. **Verify Role Format:** Must be `ROLE_*` with underscore
5. **Check Token:** Verify JWT is stored after login
6. **Test with Postman:** Isolate frontend vs backend issues

---

## 📊 Expected Signup Payload

```javascript
// What frontend sends
{
  fullName: "John Doe",        // ✅ Combined from firstName + lastName
  email: "john@example.com",
  password: "password123",
  role: "ROLE_STORE_ADMIN",    // ✅ With ROLE_ prefix
  storeName: "My Store"
}

// ❌ WRONG - Don't send these
{
  firstName: "John",           // ❌ Backend doesn't accept this
  lastName: "Doe",             // ❌ Backend doesn't accept this
  role: "store_admin"          // ❌ Missing ROLE_ prefix
}
```

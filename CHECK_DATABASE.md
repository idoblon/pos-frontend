# Database Setup Checklist

Run these SQL queries to check if you have the required data:

## 1. Check if Store Admin exists
```sql
SELECT id, email, role, full_name 
FROM users 
WHERE role = 'ROLE_STORE_ADMIN' 
LIMIT 5;
```

**Expected Result:** At least 1 Store Admin user

---

## 2. Check if Stores exist
```sql
SELECT id, name, created_at 
FROM stores 
LIMIT 5;
```

**Expected Result:** At least 1 store

---

## 3. Check if Branches exist
```sql
SELECT id, name, store_id, address 
FROM branches 
LIMIT 5;
```

**Expected Result:** At least 1 branch

---

## 4. Check the problematic cashier
```sql
SELECT id, email, role, full_name, branch_id, store_id 
FROM users 
WHERE email = 'leeheruko11@gmail.com';
```

**Current Result:** branch_id and store_id are NULL
**Expected Result:** Should have valid branch_id and store_id

---

## 5. Check all cashiers
```sql
SELECT id, email, full_name, role, branch_id, store_id 
FROM users 
WHERE role = 'ROLE_BRANCH_CASHIER';
```

**Check:** Do any cashiers have branch_id and store_id?

---

## What You Need:

### ✅ If you HAVE Store Admin + Branches:
1. Login as Store Admin
2. Go to: http://localhost:5173/store-admin/employees
3. Create cashier "heruko lee" with branch assignment
4. Delete old user or update database:
   ```sql
   -- Option 1: Delete old user
   DELETE FROM users WHERE id = 252;
   
   -- Option 2: Update old user (replace IDs with actual values)
   UPDATE users 
   SET branch_id = <actual_branch_id>, 
       store_id = <actual_store_id> 
   WHERE id = 252;
   ```

### ❌ If you DON'T HAVE Store Admin:
1. Go to: http://localhost:5173/signup
2. Create Store Admin account with store name
3. Login as Store Admin
4. Create branches at: /store-admin/branches
5. Create cashiers at: /store-admin/employees

---

## Quick Fix for Current User:

If you have branches in database, run this:

```sql
-- Get first available branch
SELECT id as branch_id, store_id FROM branches LIMIT 1;

-- Update user with those IDs (replace <branch_id> and <store_id>)
UPDATE users 
SET branch_id = <branch_id>, 
    store_id = <store_id> 
WHERE email = 'leeheruko11@gmail.com';

-- Verify
SELECT id, email, full_name, branch_id, store_id 
FROM users 
WHERE email = 'leeheruko11@gmail.com';
```

After this, logout and login again as the cashier.

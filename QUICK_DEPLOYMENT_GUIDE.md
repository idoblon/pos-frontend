# 🚀 Warehouse Inventory - Quick Start Guide

## ⚡ Deploy in 5 Minutes

### Step 1: Database (2 minutes)
```bash
# Connect to MySQL
mysql -u root -p

# Select your database
USE your_pos_database;

# Run migration (copy-paste from WAREHOUSE_INVENTORY_MIGRATION.sql)
ALTER TABLE inventory ADD COLUMN unit_price DOUBLE;
ALTER TABLE inventory ADD COLUMN store_id BIGINT;
ALTER TABLE inventory ADD CONSTRAINT fk_inventory_store FOREIGN KEY (store_id) REFERENCES store(id);

# Verify
DESCRIBE inventory;
```

**Expected Output:**
```
+-------------+--------------+------+-----+---------+-------+
| Field       | Type         | Null | Key | Default | Extra |
+-------------+--------------+------+-----+---------+-------+
| id          | bigint       | NO   | PRI | NULL    |       |
| branch_id   | bigint       | YES  | MUL | NULL    |       |
| product_id  | bigint       | NO   | MUL | NULL    |       |
| quantity    | int          | NO   |     | NULL    |       |
| last_update | datetime     | YES  |     | NULL    |       |
| unit_price  | double       | YES  |     | NULL    |       | ← NEW
| store_id    | bigint       | YES  | MUL | NULL    |       | ← NEW
+-------------+--------------+------+-----+---------+-------+
```

---

### Step 2: Backend (2 minutes)
```bash
# Navigate to backend
cd c:\Users\hp\IdeaProjects\POS

# Build
mvn clean install

# Start
mvn spring-boot:run

# Or if using JAR
java -jar target/POS-0.0.1-SNAPSHOT.jar
```

**Expected Output:**
```
Started PosApplication in X.XXX seconds
```

---

### Step 3: Test API (1 minute)
```bash
# Test warehouse inventory creation
curl -X POST http://localhost:8080/api/inventories \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"branchId\":null,\"storeId\":1,\"productId\":1,\"quantity\":100,\"unitPrice\":500}"

# Expected: 200 OK
```

---

### Step 4: Frontend (Already Done!)
```bash
# Frontend is already updated, just start it
cd c:\Users\hp\IdeaProjects\pos-frontend
npm run dev

# Open: http://localhost:5173
```

---

### Step 5: Verify (1 minute)
1. Login as Store Admin
2. Go to `/store-admin/products`
3. Click "Add Product"
4. Fill details + set "Initial Warehouse Stock" = 50
5. Click "Create"
6. Go to `/store-admin/inventory`
7. Check "Warehouse Inventory" tab
8. ✅ Product should appear with 50 units

---

## 🎯 Quick Test Workflow

### Test 1: Create Product with Stock
```
1. Create "Test Mouse" 
2. Initial Stock: 100
3. Check warehouse tab → Should show 100 units
```

### Test 2: Distribute to Branch
```
1. In warehouse tab, find "Test Mouse"
2. Click 📤 (Send icon)
3. Select any branch
4. Enter quantity: 30
5. Click "Distribute"
6. Warehouse: 100 → 70 ✅
7. Branch tab: Shows 30 ✅
```

### Test 3: View Statistics
```
1. Check warehouse tab stats
2. Total Items: 1
3. Total Value: रु 8,000 (if price is 800)
4. All should update in real-time
```

---

## ❌ Troubleshooting

### Issue: "Column 'unit_price' not found"
**Solution:** Run database migration again

### Issue: Backend won't start
**Solution:** Check if port 8080 is free
```bash
netstat -ano | findstr :8080
```

### Issue: Frontend shows errors
**Solution:** Clear browser cache, refresh page

### Issue: Can't create warehouse inventory
**Solution:** 
1. Check JWT token is valid
2. Ensure you're logged in as Store Admin
3. Verify storeId is correct

---

## 📋 Deployment Checklist

- [ ] Database migration complete
- [ ] Backend builds without errors
- [ ] Backend starts successfully
- [ ] Frontend runs without errors
- [ ] Can login as Store Admin
- [ ] Can create product with initial stock
- [ ] Warehouse inventory appears
- [ ] Can distribute to branch
- [ ] Statistics update correctly

---

## 🎉 Success Criteria

✅ **Warehouse Tab Visible:** Store Admin sees two tabs  
✅ **Initial Stock Works:** Product creation adds to warehouse  
✅ **Distribution Works:** Can send from warehouse to branch  
✅ **Statistics Accurate:** All numbers calculate correctly  

---

## 📞 Need Help?

**Check These First:**
1. Browser Console (F12) for frontend errors
2. Backend logs for API errors
3. Database connection

**Documentation:**
- `COMPLETE_IMPLEMENTATION_SUMMARY.md` - Full overview
- `BACKEND_WAREHOUSE_INVENTORY.md` - API docs
- `WAREHOUSE_INVENTORY_GUIDE.md` - User guide

---

**⏱️ Total Time: 5-10 minutes**  
**Status:** Ready for immediate deployment  
**Risk:** Low (only adds features, doesn't break existing)

---

🚀 **Let's Go!** Start with Step 1 above.

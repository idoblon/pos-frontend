# ✅ Store Admin Inventory - Testing Checklist

## Pre-Testing Setup

### Requirements
- [ ] Backend server running on `http://localhost:8080`
- [ ] Frontend running on `http://localhost:5173` (or configured port)
- [ ] Logged in as **Store Admin** user
- [ ] At least 2-3 branches created
- [ ] At least 1 category created
- [ ] Fresh browser with no cache issues

---

## Test Suite 1: Product Creation with Initial Stock

### Test 1.1: Create Product WITHOUT Initial Stock
**Steps:**
1. Go to `/store-admin/products`
2. Click "Add Product"
3. Fill in product details:
   - Name: "Test Product A"
   - SKU: "TEST-A-001"
   - Selling Price: 500
   - MRP: 600
   - Category: Select any
4. Leave "Initial Warehouse Stock" empty
5. Click "Create"

**Expected Results:**
- [ ] ✅ Success message: "Product created successfully"
- [ ] ✅ Product appears in product list
- [ ] ✅ Go to `/store-admin/inventory` → Warehouse tab
- [ ] ✅ Product NOT in warehouse inventory (because no initial stock)

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 1.2: Create Product WITH Initial Stock
**Steps:**
1. Go to `/store-admin/products`
2. Click "Add Product"
3. Fill in product details:
   - Name: "Test Product B"
   - SKU: "TEST-B-001"
   - Selling Price: 800
   - MRP: 1000
   - Category: Select any
4. Enter "Initial Warehouse Stock": **100**
5. Click "Create"

**Expected Results:**
- [ ] ✅ Success message: "Product created with 100 units added to warehouse!"
- [ ] ✅ Product appears in product list
- [ ] ✅ Go to `/store-admin/inventory` → Warehouse tab
- [ ] ✅ "Test Product B" appears with 100 units
- [ ] ✅ Total Value increases by (100 × 800 = रु 80,000)

**Status:** ⬜ Pass / ⬜ Fail

---

## Test Suite 2: Warehouse Inventory Management

### Test 2.1: Add Product to Warehouse Manually
**Steps:**
1. Go to `/store-admin/inventory`
2. Click on "Warehouse Inventory" tab
3. Click "Add to Warehouse" button
4. Select "Test Product A" (created without initial stock)
5. Enter Quantity: **50**
6. Click "Add to Warehouse"

**Expected Results:**
- [ ] ✅ Success message: "Product added to warehouse inventory successfully"
- [ ] ✅ "Test Product A" now appears in warehouse with 50 units
- [ ] ✅ Total Items count increases by 1
- [ ] ✅ Total Value increases by (50 × 500 = रु 25,000)

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 2.2: Update Warehouse Stock
**Steps:**
1. In Warehouse Inventory tab
2. Find "Test Product B" (should have 100 units)
3. Click Edit (✏️) icon
4. Change quantity to **150**
5. Click "Update"

**Expected Results:**
- [ ] ✅ Success message: "Stock updated successfully"
- [ ] ✅ Quantity changes from 100 to 150
- [ ] ✅ Total Value recalculates correctly
- [ ] ✅ Stock level color updated if needed

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 2.3: Search Warehouse Inventory
**Steps:**
1. In Warehouse Inventory tab
2. In search box, type "Test Product B"

**Expected Results:**
- [ ] ✅ Only "Test Product B" appears
- [ ] ✅ Other products filtered out
- [ ] ✅ Clear search → all products return

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 2.4: Delete Warehouse Inventory
**Steps:**
1. In Warehouse Inventory tab
2. Find "Test Product A"
3. Click Delete (🗑️) icon
4. Confirm deletion

**Expected Results:**
- [ ] ✅ Confirmation dialog appears
- [ ] ✅ Success message: "Inventory item removed successfully"
- [ ] ✅ Product removed from warehouse inventory
- [ ] ✅ Total Items count decreases
- [ ] ✅ Product still exists in product list (only inventory removed)

**Status:** ⬜ Pass / ⬜ Fail

---

## Test Suite 3: Stock Distribution

### Test 3.1: Distribute to NEW Branch (Product not in branch yet)
**Setup:** Ensure "Test Product B" has at least 100 units in warehouse

**Steps:**
1. In Warehouse Inventory tab
2. Find "Test Product B" (should have 150 units)
3. Click Distribute (📤) icon
4. Select Branch: "Branch A" (or any branch)
5. Enter Quantity: **30**
6. Click "Distribute"

**Expected Results:**
- [ ] ✅ Success message: "Distributed 30 units to branch successfully"
- [ ] ✅ Warehouse stock reduces: 150 → 120
- [ ] ✅ Switch to "Branch Inventories" tab
- [ ] ✅ "Test Product B" appears under "Branch A" with 30 units

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 3.2: Distribute to EXISTING Branch (Product already in branch)
**Setup:** Product B already distributed to Branch A (30 units)

**Steps:**
1. In Warehouse Inventory tab
2. Find "Test Product B" (should have 120 units now)
3. Click Distribute (📤) icon
4. Select Branch: "Branch A" (same branch as before)
5. Enter Quantity: **20**
6. Click "Distribute"

**Expected Results:**
- [ ] ✅ Success message: "Distributed 20 units to branch successfully"
- [ ] ✅ Warehouse stock reduces: 120 → 100
- [ ] ✅ Switch to "Branch Inventories" tab
- [ ] ✅ Branch A inventory increases: 30 → 50 units

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 3.3: Validation - Cannot Distribute More Than Available
**Setup:** Product B has 100 units in warehouse

**Steps:**
1. In Warehouse Inventory tab
2. Find "Test Product B"
3. Click Distribute (📤) icon
4. Select any Branch
5. Enter Quantity: **150** (more than 100 available)
6. Try to submit

**Expected Results:**
- [ ] ✅ Error message: "Cannot distribute 150 units. Only 100 available in warehouse."
- [ ] ✅ Distribution NOT processed
- [ ] ✅ Warehouse stock unchanged
- [ ] ✅ Branch stock unchanged

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 3.4: Distribute to Multiple Branches
**Setup:** Product B has 100 units in warehouse

**Steps:**
1. Distribute 30 units to Branch A
2. Distribute 25 units to Branch B
3. Distribute 20 units to Branch C

**Expected Results:**
- [ ] ✅ All distributions successful
- [ ] ✅ Warehouse stock: 100 → 70 → 45 → 25
- [ ] ✅ Branch A: 30 units
- [ ] ✅ Branch B: 25 units
- [ ] ✅ Branch C: 20 units
- [ ] ✅ Total distributed: 75 units
- [ ] ✅ Remaining in warehouse: 25 units (buffer)

**Status:** ⬜ Pass / ⬜ Fail

---

## Test Suite 4: Branch Inventories View

### Test 4.1: View All Branch Inventories
**Steps:**
1. Go to `/store-admin/inventory`
2. Click "Branch Inventories" tab

**Expected Results:**
- [ ] ✅ See all products distributed to branches
- [ ] ✅ Branch column shows branch names correctly
- [ ] ✅ Quantities match what was distributed
- [ ] ✅ Can see multiple entries for same product (different branches)

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 4.2: Filter by Specific Branch
**Steps:**
1. In Branch Inventories tab
2. Use branch filter dropdown
3. Select "Branch A"

**Expected Results:**
- [ ] ✅ Only Branch A inventory shown
- [ ] ✅ Other branches filtered out
- [ ] ✅ Select "All Branches" → all inventories return

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 4.3: Update Branch Stock Directly
**Steps:**
1. In Branch Inventories tab
2. Find product in Branch A
3. Click Edit (✏️) icon
4. Change quantity from 30 to 40
5. Click "Update"

**Expected Results:**
- [ ] ✅ Success message: "Stock updated successfully"
- [ ] ✅ Branch A stock updated to 40
- [ ] ✅ Warehouse stock unchanged
- [ ] ✅ Other branches unchanged

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 4.4: Delete Branch Inventory
**Steps:**
1. In Branch Inventories tab
2. Find product in Branch C
3. Click Delete (🗑️) icon
4. Confirm deletion

**Expected Results:**
- [ ] ✅ Success message: "Inventory item removed successfully"
- [ ] ✅ Product removed from Branch C inventory
- [ ] ✅ Warehouse stock unchanged
- [ ] ✅ Other branches unchanged
- [ ] ⚠️ Note: Deleted stock is LOST (not returned to warehouse)

**Status:** ⬜ Pass / ⬜ Fail

---

## Test Suite 5: Dashboard Statistics

### Test 5.1: Warehouse Statistics
**Steps:**
1. Go to Warehouse Inventory tab
2. Check dashboard cards

**Expected Results:**
- [ ] ✅ Total Items = count of warehouse products
- [ ] ✅ Low Stock = products with quantity ≤ 10
- [ ] ✅ Out of Stock = products with quantity = 0
- [ ] ✅ Total Value = Σ(quantity × unitPrice)
- [ ] ✅ Numbers update when inventory changes

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 5.2: Branch Statistics
**Steps:**
1. Go to Branch Inventories tab
2. Check dashboard cards

**Expected Results:**
- [ ] ✅ Total Items = count of ALL branch products
- [ ] ✅ Low Stock = branch products with quantity ≤ 10
- [ ] ✅ Out of Stock = branch products with quantity = 0
- [ ] ✅ Statistics cover all branches combined

**Status:** ⬜ Pass / ⬜ Fail

---

## Test Suite 6: Stock Level Colors

### Test 6.1: Green (In Stock)
**Steps:**
1. Find product with quantity > 10 (e.g., 100)

**Expected Results:**
- [ ] ✅ Badge shows green background
- [ ] ✅ Text color green
- [ ] ✅ Indicates healthy stock

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 6.2: Orange (Low Stock)
**Steps:**
1. Update product to quantity = 10 or less (e.g., 8)

**Expected Results:**
- [ ] ✅ Badge shows orange/amber background
- [ ] ✅ Text color orange
- [ ] ✅ Indicates needs reorder soon

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 6.3: Red (Out of Stock)
**Steps:**
1. Update product to quantity = 0

**Expected Results:**
- [ ] ✅ Badge shows red background
- [ ] ✅ Text color red
- [ ] ✅ Indicates urgent action needed

**Status:** ⬜ Pass / ⬜ Fail

---

## Test Suite 7: Edge Cases & Error Handling

### Test 7.1: Create Product Without Required Fields
**Steps:**
1. Try to create product without name
2. Try without SKU
3. Try without price

**Expected Results:**
- [ ] ✅ Form validation prevents submission
- [ ] ✅ Error messages shown
- [ ] ✅ Required fields highlighted

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 7.2: Add Invalid Stock Quantity
**Steps:**
1. Try to add negative quantity: -10
2. Try to add non-numeric value: "abc"

**Expected Results:**
- [ ] ✅ Validation prevents invalid input
- [ ] ✅ Error message shown
- [ ] ✅ Stock not updated

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 7.3: Distribute Without Selecting Branch
**Steps:**
1. Click distribute
2. Don't select branch
3. Enter quantity
4. Try to submit

**Expected Results:**
- [ ] ✅ Error: "Please select branch and enter quantity"
- [ ] ✅ Distribution not processed

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 7.4: Network Error Handling
**Steps:**
1. Stop backend server
2. Try to add inventory
3. Try to distribute

**Expected Results:**
- [ ] ✅ Error message shown
- [ ] ✅ No crash
- [ ] ✅ User can retry after backend restart

**Status:** ⬜ Pass / ⬜ Fail

---

## Test Suite 8: Integration with Other Features

### Test 8.1: Restock Request Workflow
**Steps:**
1. As Branch Manager, create restock request
2. As Store Admin, check `/store-admin/restock-requests`
3. Approve request
4. Distribute stock from warehouse

**Expected Results:**
- [ ] ✅ Restock request appears
- [ ] ✅ Can distribute from warehouse inventory
- [ ] ✅ Branch receives stock
- [ ] ✅ Request marked as fulfilled

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 8.2: Product Edit Doesn't Affect Inventory
**Steps:**
1. Edit product name or price
2. Check warehouse inventory
3. Check branch inventory

**Expected Results:**
- [ ] ✅ Product details updated
- [ ] ✅ Inventory quantities unchanged
- [ ] ✅ Unit price in inventory may update (if logic exists)

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 8.3: Product Delete Behavior
**Steps:**
1. Try to delete product that has inventory

**Expected Results:**
- [ ] ✅ Backend should prevent deletion (or cascade delete inventory)
- [ ] ✅ Error message shown if prevention
- [ ] ✅ No orphaned inventory records

**Status:** ⬜ Pass / ⬜ Fail

---

## Test Suite 9: Performance & UI/UX

### Test 9.1: Large Inventory Performance
**Steps:**
1. Create 50+ products with warehouse stock
2. Navigate between tabs
3. Search and filter

**Expected Results:**
- [ ] ✅ UI remains responsive
- [ ] ✅ No lag when switching tabs
- [ ] ✅ Search works quickly

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 9.2: Responsive Design
**Steps:**
1. Test on desktop (1920px)
2. Test on tablet (768px)
3. Test on mobile (375px)

**Expected Results:**
- [ ] ✅ Layout adjusts properly
- [ ] ✅ All features accessible
- [ ] ✅ Tables scroll horizontally if needed

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 9.3: Dialogs & Modals
**Steps:**
1. Open various dialogs
2. Check close functionality
3. Check overlay behavior

**Expected Results:**
- [ ] ✅ Dialogs center properly
- [ ] ✅ ESC key closes dialog
- [ ] ✅ Click outside closes dialog
- [ ] ✅ Form data resets on close

**Status:** ⬜ Pass / ⬜ Fail

---

## Test Suite 10: Data Persistence

### Test 10.1: Page Refresh
**Steps:**
1. Add products to warehouse
2. Refresh page
3. Check inventory

**Expected Results:**
- [ ] ✅ All data persists
- [ ] ✅ Quantities unchanged
- [ ] ✅ Statistics recalculated correctly

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 10.2: Logout & Login
**Steps:**
1. Add warehouse inventory
2. Logout
3. Login again
4. Check inventory

**Expected Results:**
- [ ] ✅ All inventory data preserved
- [ ] ✅ Can continue working normally

**Status:** ⬜ Pass / ⬜ Fail

---

## Summary Scorecard

| Test Suite | Total Tests | Passed | Failed |
|------------|-------------|--------|--------|
| 1. Product Creation | 2 | __ | __ |
| 2. Warehouse Management | 4 | __ | __ |
| 3. Stock Distribution | 4 | __ | __ |
| 4. Branch Inventories | 4 | __ | __ |
| 5. Dashboard Stats | 2 | __ | __ |
| 6. Stock Colors | 3 | __ | __ |
| 7. Edge Cases | 4 | __ | __ |
| 8. Integration | 3 | __ | __ |
| 9. Performance | 3 | __ | __ |
| 10. Persistence | 2 | __ | __ |
| **TOTAL** | **31** | **__** | **__** |

---

## Critical Bugs Found

| Bug # | Description | Severity | Status |
|-------|-------------|----------|--------|
| 1 | | 🔴 Critical / 🟡 Medium / 🟢 Low | ⬜ Open / ✅ Fixed |
| 2 | | | |
| 3 | | | |

---

## Testing Sign-Off

- [ ] All critical tests passed
- [ ] No critical bugs remaining
- [ ] Documentation reviewed
- [ ] Ready for production

**Tested By:** ______________________  
**Date:** ______________________  
**Approved By:** ______________________  
**Date:** ______________________

---

## Notes

```
Additional observations, comments, or suggestions:






```

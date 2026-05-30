# Branch Inventory System - How It Works

## 🏢 Overview

**Yes, each branch has its own separate inventory!**

The POS system uses a **multi-branch inventory model** where:
- Each branch maintains its own stock levels
- Products are added to specific branches by Store Admin
- Branch Managers can manage their branch's inventory
- Cashiers can only sell products available in their branch's inventory

---

## 📊 Inventory Hierarchy

```
Store
  ├── Products Catalog (Store-wide)
  │   ├── Product A
  │   ├── Product B
  │   └── Product C
  │
  ├── Branch 1 Inventory
  │   ├── Product A (50 units)
  │   └── Product B (30 units)
  │
  └── Branch 2 Inventory
      ├── Product A (100 units)
      └── Product C (20 units)
```

**Key Points:**
- Products exist in the **store catalog** (created by Store Admin)
- Each branch has its **own inventory** with specific quantities
- Same product can have different stock levels in different branches
- Branches are independent - selling in Branch 1 doesn't affect Branch 2

---

## 👥 User Roles & Permissions

### **Store Admin**
**Access:** `/store-admin/inventory`

**Can:**
- ✅ View inventory across ALL branches
- ✅ Add products to any branch's inventory
- ✅ Update stock quantities for any branch
- ✅ Remove products from branch inventory
- ✅ Filter by branch
- ✅ See store-wide inventory stats

**Workflow:**
1. Create products in catalog
2. Add products to specific branches
3. Set initial stock quantities
4. Monitor inventory across all branches

---

### **Branch Manager**
**Access:** `/branch/inventory`

**Can:**
- ✅ View their branch's inventory only
- ✅ Update stock quantities for their branch
- ✅ Request restock from Store Admin
- ✅ See low stock alerts
- ✅ Monitor branch inventory stats

**Cannot:**
- ❌ Add new products (must request from Store Admin)
- ❌ View other branches' inventory
- ❌ Delete products from inventory

**Workflow:**
1. Monitor branch inventory
2. Update quantities when receiving stock
3. Request restock when running low
4. Manage stock levels

---

### **Cashier**
**Access:** `/cashier` (POS Terminal)

**Can:**
- ✅ View products available in their branch
- ✅ Sell products from branch inventory
- ✅ See real-time stock levels

**Cannot:**
- ❌ Modify inventory
- ❌ Add products
- ❌ View other branches

**Workflow:**
1. Browse products in branch inventory
2. Add to cart
3. Process sale
4. Inventory automatically decreases

---

## 🔄 Complete Inventory Workflow

### **1. Store Admin Sets Up Inventory**

```
Step 1: Create Product
  → Go to /store-admin/products
  → Click "Add Product"
  → Fill details (name, SKU, price, category)
  → Save

Step 2: Add to Branch Inventory
  → Go to /store-admin/inventory
  → Click "Add to Inventory"
  → Select Branch: "Downtown Branch"
  → Select Product: "Product A"
  → Set Quantity: 100
  → Set Unit Price: रु 50
  → Save

Result: Product A is now available in Downtown Branch with 100 units
```

---

### **2. Branch Manager Manages Inventory**

```
Monitor Stock:
  → Go to /branch/inventory
  → View current stock levels
  → See low stock alerts (yellow badge)
  → See out of stock items (red badge)

Update Stock:
  → Click Edit icon on product
  → Enter new quantity
  → Save
  → Use when receiving new stock

Request Restock:
  → Click Restock icon on product
  → Enter requested quantity
  → Add notes (optional)
  → Submit request
  → Store Admin receives notification
```

---

### **3. Cashier Sells Products**

```
Process Sale:
  → Go to /cashier
  → Browse products (only shows branch inventory)
  → Add to cart
  → Select customer
  → Process payment
  → Inventory automatically decreases

Example:
  Before Sale: Product A = 100 units
  Sell: 5 units
  After Sale: Product A = 95 units
```

---

## 🎯 Key Features

### **Branch Inventory Page** (`/branch/inventory`)

**Stats Cards:**
- 📦 Total Items - Count of products in inventory
- ⚠️ Low Stock - Items with ≤10 units (yellow)
- 🚫 Out of Stock - Items with 0 units (red)

**Actions:**
- 🔍 Search products by name or SKU
- ✏️ Update stock quantities
- 🔄 Request restock from Store Admin

**Stock Level Indicators:**
- 🟢 Green: > 10 units (Good stock)
- 🟡 Yellow: 1-10 units (Low stock)
- 🔴 Red: 0 units (Out of stock)

---

### **Store Admin Inventory Page** (`/store-admin/inventory`)

**Features:**
- View ALL branches' inventory
- Filter by specific branch
- Add products to any branch
- Update stock for any branch
- Remove products from branches
- Store-wide statistics

---

## 🔐 Data Isolation

Each branch's inventory is **completely isolated**:

```
Branch 1:
  Product A: 50 units
  Product B: 30 units

Branch 2:
  Product A: 100 units
  Product C: 20 units

Selling 10 units of Product A in Branch 1:
  Branch 1: Product A = 40 units ✅
  Branch 2: Product A = 100 units (unchanged) ✅
```

---

## 📡 API Endpoints

### **Get Branch Inventory**
```
GET /api/inventory/branch/{branchId}
Returns: Array of inventory items for specific branch
```

### **Get Store Inventory**
```
GET /api/inventory/store/{storeId}
Returns: Array of inventory items for all branches
```

### **Add to Inventory**
```
POST /api/inventory
Body: { branchId, productId, quantity, unitPrice }
Returns: Created inventory item
```

### **Update Stock**
```
PATCH /api/inventory/{inventoryId}/stock
Body: { quantity }
Returns: Updated inventory item
```

---

## 🚀 Benefits of Branch-Specific Inventory

1. **Accurate Stock Tracking**
   - Each branch knows exactly what they have
   - No confusion between branches

2. **Independent Operations**
   - Branches operate independently
   - One branch's sales don't affect others

3. **Better Management**
   - Branch Managers control their stock
   - Store Admin has overview of all branches

4. **Prevents Overselling**
   - Cashiers can only sell what's in their branch
   - Real-time stock validation

5. **Flexible Distribution**
   - Store Admin can allocate stock strategically
   - High-demand branches get more stock

---

## 💡 Best Practices

### **For Store Admins:**
1. Add products to branches based on demand
2. Monitor low stock across all branches
3. Approve restock requests promptly
4. Balance inventory distribution

### **For Branch Managers:**
1. Check inventory daily
2. Request restock before running out
3. Update quantities when receiving stock
4. Monitor low stock alerts

### **For Cashiers:**
1. Check stock before promising to customers
2. Notify manager when items are low
3. Don't try to sell out-of-stock items

---

## 🔧 Troubleshooting

### **"Product not found in branch inventory"**
**Cause:** Product exists in catalog but not added to branch
**Solution:** Store Admin must add product to branch inventory

### **"Cannot see any products in POS"**
**Cause:** Branch has no inventory
**Solution:** Store Admin must add products to branch

### **"Stock shows wrong quantity"**
**Cause:** Not updated after receiving stock
**Solution:** Branch Manager updates stock quantity

---

## ✅ Summary

**Yes, branches have their own inventory!**

- ✅ Each branch = separate inventory
- ✅ Store Admin adds products to branches
- ✅ Branch Managers manage their inventory
- ✅ Cashiers sell from branch inventory
- ✅ Stock levels are branch-specific
- ✅ Complete isolation between branches

This ensures accurate tracking, prevents overselling, and allows independent branch operations!

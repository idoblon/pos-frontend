# 📦 Store Admin Warehouse Inventory System

## Overview

The Store Admin now has a **centralized warehouse inventory** separate from branch inventories. This allows proper stock management and distribution control.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    STORE ADMIN                          │
│                                                         │
│  ┌───────────────────────────────────────────────┐     │
│  │         CENTRAL WAREHOUSE INVENTORY            │     │
│  │  • Store Admin's own stock                     │     │
│  │  • Receives products from suppliers            │     │
│  │  • Distributes to branches                     │     │
│  └───────────────────────────────────────────────┘     │
│                        │                                │
│                        ▼                                │
│       ┌────────────────┴────────────────┐              │
│       │                                 │              │
│       ▼                                 ▼              │
│  ┌─────────┐                      ┌─────────┐         │
│  │ Branch 1│                      │ Branch 2│         │
│  │ Stock   │                      │ Stock   │         │
│  └─────────┘                      └─────────┘         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Complete Workflow

### 1. **Product Creation with Initial Stock** ✨

**Location:** `/store-admin/products`

**Steps:**
1. Click "Add Product"
2. Fill in product details (Name, SKU, Price, etc.)
3. **NEW:** Enter "Initial Warehouse Stock" (optional)
4. Click "Create"

**Result:**
- Product is created in the catalog
- If initial stock is provided, it's automatically added to warehouse inventory
- Stock is ready for distribution to branches

**Example:**
```
Product: "Wireless Mouse"
SKU: "WM-001"
Selling Price: रु 800
Initial Warehouse Stock: 100 units

✅ Product created + 100 units added to warehouse
```

---

### 2. **Managing Warehouse Inventory**

**Location:** `/store-admin/inventory` → "Warehouse Inventory" tab

**Features:**
- ✅ View all warehouse stock
- ✅ Add products to warehouse
- ✅ Update stock quantities
- ✅ Distribute to branches
- ✅ Track stock value

**Key Metrics:**
- Total Items
- Low Stock Alerts
- Out of Stock Items
- Total Inventory Value

---

### 3. **Distributing Stock to Branches** 📤

**From:** Warehouse Inventory Tab

**Steps:**
1. Find the product in warehouse inventory
2. Click the **Send** icon (📤)
3. Select target branch
4. Enter quantity to distribute
5. Confirm distribution

**What Happens:**
```
Before Distribution:
- Warehouse: 100 units
- Branch A: 0 units

Distribute 30 units to Branch A:

After Distribution:
- Warehouse: 70 units ↓
- Branch A: 30 units ↑
```

**Validations:**
- ✅ Cannot distribute more than available
- ✅ Automatically creates branch inventory if doesn't exist
- ✅ Updates existing branch inventory if already exists

---

### 4. **Viewing Branch Inventories**

**Location:** `/store-admin/inventory` → "Branch Inventories" tab

**Features:**
- View all distributed stock across branches
- Filter by specific branch
- See which branch has which products
- Monitor branch stock levels

---

### 5. **Branch Restock Requests**

**Location:** `/store-admin/restock-requests`

**When Branch Manager Requests Restock:**
1. Branch Manager creates restock request
2. Store Admin receives notification
3. Store Admin reviews request
4. Store Admin approves and distributes from warehouse
5. Branch receives stock

---

## 📊 Inventory Data Structure

### Warehouse Inventory
```javascript
{
  id: 1,
  productId: 101,
  productName: "Wireless Mouse",
  productSku: "WM-001",
  branchId: null,  // ← NULL indicates warehouse stock
  quantity: 100,
  unitPrice: 800,
  storeId: 5
}
```

### Branch Inventory
```javascript
{
  id: 2,
  productId: 101,
  productName: "Wireless Mouse",
  productSku: "WM-001",
  branchId: 3,  // ← Branch ID indicates branch stock
  quantity: 30,
  unitPrice: 800,
  storeId: 5
}
```

---

## 🎯 Key Benefits

### For Store Admins:
1. ✅ **Central Control** - Manage all stock from one place
2. ✅ **Better Tracking** - Know exactly how much stock you have
3. ✅ **Controlled Distribution** - Decide which branch gets what
4. ✅ **Inventory Visibility** - See both warehouse and branch stock
5. ✅ **Value Tracking** - Monitor total inventory value

### For Branch Managers:
1. ✅ **Clear Stock Levels** - Know what's available in branch
2. ✅ **Easy Restock** - Request more stock when needed
3. ✅ **No Confusion** - Separate branch stock from warehouse

---

## 🔐 Access Control

| Role | Warehouse Inventory | Branch Inventory | Distribute |
|------|-------------------|-----------------|------------|
| **Store Admin** | ✅ Full Access | ✅ View All | ✅ Yes |
| **Branch Manager** | ❌ No Access | ✅ Own Branch Only | ❌ No |
| **Cashier** | ❌ No Access | ✅ View Own Branch | ❌ No |

---

## 📝 Common Operations

### Adding Warehouse Stock
```
Method 1: During Product Creation
- Create product with initial stock
- Stock automatically added

Method 2: Direct Add
- Go to Inventory → Warehouse tab
- Click "Add to Warehouse"
- Select product and quantity
```

### Distributing to Multiple Branches
```
For each branch:
1. Select product in warehouse
2. Click distribute
3. Choose branch
4. Enter quantity
5. Repeat for other branches
```

### Handling Restock Requests
```
1. Receive notification from branch
2. Check warehouse stock availability
3. Approve request
4. Distribute from warehouse to branch
5. Branch inventory updated
```

---

## 🚨 Stock Level Alerts

### Low Stock (Orange) ⚠️
- Triggered when quantity ≤ configured threshold
- Default threshold: 10 units
- Action: Reorder from suppliers

### Out of Stock (Red) ❌
- Triggered when quantity = 0
- Urgent action required
- Cannot distribute to branches

### In Stock (Green) ✅
- Healthy stock levels
- Ready for distribution

---

## 📈 Stock Value Calculation

```javascript
Total Value = Σ (quantity × unitPrice)

Example:
Product A: 50 units × रु 100 = रु 5,000
Product B: 30 units × रु 200 = रु 6,000
Product C: 20 units × रु 150 = रु 3,000
----------------------------------------
Total Warehouse Value:        रु 14,000
```

---

## 🔄 Stock Movement Flow

```
1. Supplier → Warehouse
   [Add to Warehouse Inventory]

2. Warehouse → Branch
   [Distribute Stock]

3. Branch → Customer
   [Sales / Orders]

4. Branch → Warehouse (if needed)
   [Stock Return - Future Feature]
```

---

## 🛠️ Technical Implementation

### API Endpoints Used
```
GET  /api/inventories/store/{storeId}
POST /api/inventories
PATCH /api/inventories/{inventoryId}/stock
DELETE /api/inventories/{inventoryId}
```

### Key Logic
```javascript
// Warehouse inventory has branchId = null
warehouseInventory = inventory.filter(item => item.branchId === null)

// Branch inventory has branchId = specific branch
branchInventory = inventory.filter(item => item.branchId !== null)
```

---

## 🎨 UI Features

### Tabs
- **📦 Warehouse Inventory** - Store Admin's stock
- **🏪 Branch Inventories** - All distributed stock

### Actions
- **➕ Add to Warehouse** - Add new stock
- **📤 Distribute** - Send to branch
- **✏️ Edit** - Update quantity
- **🗑️ Delete** - Remove item

### Filters
- Search by product name/SKU
- Filter by branch (branch inventory tab)
- Sort by stock level

---

## 🎓 Best Practices

1. **Always maintain warehouse stock** before distributing
2. **Set appropriate low stock thresholds** for alerts
3. **Review branch requests promptly** to avoid stockouts
4. **Track inventory value regularly** for accounting
5. **Use initial stock feature** when creating products to save time
6. **Monitor slow-moving products** to optimize inventory

---

## ⚠️ Important Notes

1. **Warehouse stock is separate from branch stock**
   - They are two different inventory records
   - Distribution transfers between them

2. **Cannot distribute without warehouse stock**
   - Must have stock in warehouse first
   - Add to warehouse before distributing

3. **Distribution is immediate**
   - No approval required from branch
   - Stock is transferred instantly

4. **No automatic reordering**
   - Store Admin must manually add warehouse stock
   - Set up alerts to know when to reorder

---

## 🚀 Future Enhancements

- [ ] Bulk distribution to multiple branches
- [ ] CSV import for warehouse stock
- [ ] Automatic reorder points
- [ ] Stock transfer history/audit log
- [ ] Branch-to-branch transfers
- [ ] Stock return from branch to warehouse
- [ ] Barcode scanning for stock updates
- [ ] Predictive stock alerts based on sales trends

---

## 📞 Support

For questions or issues with the inventory system, contact your system administrator or refer to the main POS documentation.

---

**Last Updated:** $(date)
**Version:** 2.0

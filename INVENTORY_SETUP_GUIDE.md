# Branch Inventory Setup Guide

## ⚠️ Common Issue: "Product not found in branch inventory"

When a cashier tries to process an order and gets this error, it means the product exists in the store's catalog but hasn't been added to the branch's inventory yet.

---

## 🔄 Complete Workflow

### **Step 1: Store Admin Creates Products**
1. Login as Store Admin
2. Go to `/store-admin/products`
3. Click "Add Product"
4. Fill in product details (name, SKU, price, category)
5. Click "Create"

✅ **Product is now in the store catalog**

---

### **Step 2: Add Products to Branch Inventory**

#### **Option A: Store Admin Adds to Branch Inventory**
1. Login as Store Admin
2. Navigate to branch inventory management
3. Select the branch
4. Add products from store catalog to branch inventory
5. Set initial stock quantity

#### **Option B: Branch Manager Adds to Branch Inventory**
1. Login as Branch Manager
2. Go to `/branch/inventory`
3. Add products from store catalog
4. Set initial stock quantity

✅ **Product is now available in branch inventory**

---

### **Step 3: Cashier Can Now Sell**
1. Login as Cashier
2. Go to `/cashier` (POS Terminal)
3. Browse products (only shows products in branch inventory)
4. Add to cart and process order

✅ **Order can be completed successfully**

---

## 🛠️ How to Fix "Product not found in branch inventory" Error

### **For Store Admin:**

1. **Check which products are missing:**
   - Ask the cashier which product they're trying to sell
   - Note the product name/SKU

2. **Add product to branch inventory:**
   ```
   Method 1: Via Backend API
   POST /api/inventory
   {
     "branchId": "<branch_id>",
     "productId": "<product_id>",
     "quantity": 100,
     "unitPrice": 50.00
   }
   ```

   ```
   Method 2: Via Frontend (if inventory management UI exists)
   - Go to branch inventory page
   - Click "Add Product"
   - Select product from catalog
   - Enter quantity and price
   - Save
   ```

### **For Branch Manager:**

1. Go to `/branch/inventory`
2. Click "Add Product" (if button exists)
3. Select product from store catalog
4. Enter initial stock quantity
5. Save

---

## 📋 Backend Requirements

The backend needs these endpoints for inventory management:

### **1. Add Product to Branch Inventory**
```
POST /api/inventory
Authorization: Bearer <jwt>

Request Body:
{
  "branchId": "string",
  "productId": "string",
  "quantity": number,
  "unitPrice": number
}

Response:
{
  "id": "string",
  "branchId": "string",
  "productId": "string",
  "productName": "string",
  "quantity": number,
  "unitPrice": number
}
```

### **2. Get Branch Inventory**
```
GET /api/inventory/branch/{branchId}
Authorization: Bearer <jwt>

Response:
[
  {
    "id": "string",
    "productId": "string",
    "productName": "string",
    "sku": "string",
    "quantity": number,
    "unitPrice": number,
    "categoryName": "string"
  }
]
```

### **3. Update Inventory Quantity**
```
PUT /api/inventory/{inventoryId}
Authorization: Bearer <jwt>

Request Body:
{
  "quantity": number,
  "unitPrice": number
}
```

---

## 🎯 Quick Fix for Testing

If you need to test the cashier functionality immediately:

### **Option 1: Add via Backend API (Postman/cURL)**

```bash
curl -X POST http://localhost:8080/api/inventory \
  -H "Authorization: Bearer <store_admin_jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "branchId": "<branch_id>",
    "productId": "<product_id>",
    "quantity": 100,
    "unitPrice": 50.00
  }'
```

### **Option 2: Add via Database (MySQL)**

```sql
INSERT INTO inventory (branch_id, product_id, quantity, unit_price, created_at, updated_at)
VALUES ('<branch_id>', '<product_id>', 100, 50.00, NOW(), NOW());
```

---

## 🔍 Debugging Steps

### **1. Check if product exists in store catalog**
```bash
GET /api/products/store/{storeId}
```

### **2. Check if product exists in branch inventory**
```bash
GET /api/inventory/branch/{branchId}
```

### **3. Check branch ID of logged-in cashier**
```bash
GET /api/users/profile
# Look for "branchId" field
```

### **4. Verify product ID in cart**
```javascript
// In browser console
console.log(cartItems);
// Check if productId is valid (not starting with 'p' for placeholder)
```

---

## ✅ Checklist for Store Setup

- [ ] Store Admin creates store
- [ ] Store Admin creates branches
- [ ] Store Admin creates product categories
- [ ] Store Admin creates products
- [ ] **Store Admin adds products to branch inventory** ⚠️ (Often missed!)
- [ ] Store Admin creates employees (cashiers, managers)
- [ ] Store Admin assigns employees to branches
- [ ] Cashier logs in and can see products
- [ ] Cashier can process orders

---

## 🚨 Common Mistakes

1. **Creating products but not adding to branch inventory**
   - Products exist in catalog but not available for sale
   - Solution: Add products to branch inventory

2. **Wrong branch ID**
   - Cashier assigned to Branch A but products added to Branch B
   - Solution: Verify cashier's branchId matches inventory branchId

3. **Using placeholder/demo products**
   - Cart contains products with IDs like "p1", "p2"
   - Solution: Use real products from backend

4. **Missing inventory management UI**
   - No way to add products to branch inventory from frontend
   - Solution: Add inventory management page or use API directly

---

## 📝 Recommended Frontend Improvements

### **Add Inventory Management Page for Store Admin**

Create: `/store-admin/inventory`

Features:
- View all branches
- Select branch
- Add products from catalog to branch inventory
- Set initial stock quantity
- Bulk import inventory

### **Add Inventory Management for Branch Manager**

Enhance: `/branch/inventory`

Features:
- View current inventory
- Add products from store catalog
- Update stock quantities
- Set reorder levels
- Request stock from store admin

---

## 🎓 Training for Users

### **For Store Admins:**
1. After creating products, always add them to branch inventory
2. Set realistic initial stock quantities
3. Assign products to all branches that need them

### **For Branch Managers:**
1. Regularly check inventory levels
2. Request new products from store admin
3. Update stock quantities after receiving shipments

### **For Cashiers:**
1. If product not found, notify branch manager
2. Don't try to sell products not in inventory
3. Check inventory levels before promising products to customers

---

## 📞 Support

If you continue to face issues:

1. Check backend logs for detailed error messages
2. Verify database has inventory records
3. Confirm JWT token has correct permissions
4. Test API endpoints directly with Postman
5. Check browser console for frontend errors

---

**Remember: Products must be in BRANCH INVENTORY, not just the store catalog!**

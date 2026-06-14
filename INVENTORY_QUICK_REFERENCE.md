# 🚀 Store Admin Inventory - Quick Reference

## What Changed?

### ❌ OLD WAY
```
1. Create Product
2. Go to Inventory
3. Add product to Branch A manually
4. Add same product to Branch B manually
5. Add same product to Branch C manually
... (tedious and error-prone)
```

### ✅ NEW WAY
```
1. Create Product + Add to Warehouse (optional initial stock)
2. Distribute from Warehouse to branches as needed
3. Done! ✨
```

---

## Quick Actions

### ➕ Add Product with Stock
```
/store-admin/products → Add Product
├─ Enter product details
├─ Set "Initial Warehouse Stock" (e.g., 100)
└─ Click Create

Result: Product created + 100 units in warehouse
```

### 📦 Add Stock to Existing Product
```
/store-admin/inventory → Warehouse Inventory tab
├─ Click "Add to Warehouse"
├─ Select product
├─ Enter quantity
└─ Submit

Result: Stock added to warehouse
```

### 📤 Distribute to Branch
```
/store-admin/inventory → Warehouse Inventory tab
├─ Find product
├─ Click Send (📤) icon
├─ Select branch
├─ Enter quantity (max = available)
└─ Click Distribute

Result: Stock transferred to branch
```

### 👀 View Branch Stock
```
/store-admin/inventory → Branch Inventories tab
├─ Filter by branch (optional)
└─ View all distributed stock
```

---

## Stock Level Colors

| Color | Status | Quantity | Action |
|-------|--------|----------|--------|
| 🟢 Green | In Stock | > 10 units | Normal |
| 🟡 Orange | Low Stock | ≤ 10 units | Reorder Soon |
| 🔴 Red | Out of Stock | 0 units | Reorder Now |

---

## Common Scenarios

### Scenario 1: New Product Launch
```
1. Create product with initial stock: 500 units
2. Distribute:
   - Branch A: 100 units
   - Branch B: 150 units
   - Branch C: 100 units
3. Remaining in warehouse: 150 units (for future distribution)
```

### Scenario 2: Branch Running Low
```
Branch Manager:
1. Checks branch inventory (running low)
2. Creates restock request

Store Admin:
1. Receives notification
2. Goes to /store-admin/inventory
3. Distributes stock from warehouse
4. Branch inventory updated
```

### Scenario 3: Warehouse Stock Low
```
Store Admin:
1. Checks warehouse inventory
2. Sees low stock alert
3. Orders from supplier
4. Adds received stock to warehouse
5. Ready to distribute to branches
```

---

## Dashboard Stats

### Warehouse Tab
- **Total Items**: Products in warehouse
- **Low Stock**: Products ≤ threshold
- **Out of Stock**: Zero quantity products
- **Total Value**: रु (quantity × price)

### Branch Inventories Tab
- **Total Items**: Products across all branches
- **Low Stock**: Branch products ≤ threshold
- **Out of Stock**: Zero quantity in branches

---

## Keyboard Shortcuts

- `Ctrl + F`: Focus search
- `Tab`: Switch between tabs
- `Esc`: Close dialogs

---

## Tips & Tricks

💡 **Tip 1**: Add initial stock when creating products to save time

💡 **Tip 2**: Keep 20-30% buffer stock in warehouse for emergencies

💡 **Tip 3**: Review low stock alerts weekly to avoid stockouts

💡 **Tip 4**: Monitor slow-moving products in warehouse

💡 **Tip 5**: Distribute strategically - give more to high-traffic branches

---

## Troubleshooting

### ❓ Can't distribute stock
**Check:**
- Do you have stock in warehouse?
- Is quantity > available stock?
- Is branch selected?

### ❓ Product not showing in warehouse
**Check:**
- Was initial stock added during creation?
- Try adding manually via "Add to Warehouse"

### ❓ Branch inventory not updating
**Check:**
- Did you click "Distribute"?
- Refresh the page
- Check Branch Inventories tab

---

## Need Help?

📚 Full Guide: `WAREHOUSE_INVENTORY_GUIDE.md`
🐛 Issues: Contact system administrator
💬 Questions: Ask your team lead

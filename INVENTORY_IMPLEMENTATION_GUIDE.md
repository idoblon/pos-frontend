# Inventory Management System - Implementation Guide

## ✅ Completed

### 1. Redux State Management
- ✅ Enhanced `inventoryThunk.js` with new endpoints:
  - `getInventoryByStore` - Get all inventory for a store
  - `getLowStockItems` - Get items below threshold
  - `addInventoryItem` - Add product to branch inventory
  - `updateInventoryStock` - Update stock quantity
  - `deleteInventoryItem` - Remove from inventory

- ✅ Enhanced `inventorySlice.js` with:
  - Loading states
  - Error handling
  - Low stock items state
  - Actions for all CRUD operations

- ✅ Created `restockThunk.js` with endpoints:
  - `createRestockRequest` - Branch creates restock request
  - `getRestockRequestsByBranch` - Get branch requests
  - `getRestockRequestsByStore` - Get all store requests
  - `approveRestockRequest` - Approve single request
  - `rejectRestockRequest` - Reject with reason
  - `fulfillRestockRequest` - Mark as fulfilled
  - `batchApproveRequests` - Batch approve
  - `batchFulfillRequests` - Batch fulfill

- ✅ Created `restockSlice.js` with full state management

- ✅ Added restock reducer to global store

### 2. Pages Created
- ✅ `InventoryManagement.jsx` - Full-featured inventory management for Store Admin
  - View all inventory across branches
  - Filter by branch
  - Search products
  - Add products to branch inventory
  - Update stock quantities
  - Delete inventory items
  - Stats cards (Total, Low Stock, Out of Stock)
  - Color-coded stock levels

## 📋 Next Steps

### Phase 1: Restock Request Pages (Priority)

#### A. For Branch Manager/Cashier
Create: `src/pages/branch/RestockRequests.jsx`
```jsx
Features:
- View branch's restock requests
- Create new restock request
- Filter by status (PENDING, APPROVED, FULFILLED, REJECTED)
- View request details
- Cancel pending requests
```

#### B. For Store Admin
Create: `src/pages/storeAdmin/Restock/RestockRequestManagement.jsx`
```jsx
Features:
- View all restock requests from all branches
- Filter by branch, status, date
- Batch selection with checkboxes
- Batch approve selected requests
- Batch fulfill selected requests
- Individual approve/reject/fulfill actions
- Add rejection reason
- View request history
```

### Phase 2: Low Stock Alerts

Create: `src/components/LowStockAlert.jsx`
```jsx
Features:
- Display alert banner when low stock detected
- Show count of low stock items
- Link to inventory page
- Auto-refresh every 5 minutes
```

Add to:
- Store Admin Dashboard
- Branch Manager Dashboard

### Phase 3: Routing Updates

Update `src/routes/StoreAdminRoutes.jsx`:
```jsx
import InventoryManagement from "@/pages/storeAdmin/Inventory/InventoryManagement";
import RestockRequestManagement from "@/pages/storeAdmin/Restock/RestockRequestManagement";

<Route path="inventory" element={<InventoryManagement />} />
<Route path="restock-requests" element={<RestockRequestManagement />} />
```

Update `src/routes/BranchRoutes.jsx`:
```jsx
import RestockRequests from "@/pages/branch/RestockRequests";

<Route path="restock-requests" element={<RestockRequests />} />
```

### Phase 4: Navigation Updates

Update `src/pages/storeAdmin/StoreAdminLayout.jsx`:
```jsx
const navItems = [
  { path: "/store-admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/store-admin/branches", label: "Branches", icon: GitBranch },
  { path: "/store-admin/products", label: "Products", icon: Package },
  { path: "/store-admin/inventory", label: "Inventory", icon: Warehouse }, // NEW
  { path: "/store-admin/restock-requests", label: "Restock Requests", icon: RefreshCw }, // NEW
  { path: "/store-admin/employees", label: "Employees", icon: Users },
  { path: "/store-admin/categories", label: "Categories", icon: Tag },
  { path: "/store-admin/reports", label: "Reports", icon: BarChart2 },
];
```

Update `src/pages/branch/BranchLayout.jsx`:
```jsx
const navItems = [
  { path: "/branch", label: "Dashboard", icon: LayoutDashboard },
  { path: "/branch/inventory", label: "Inventory", icon: Package },
  { path: "/branch/restock-requests", label: "Restock Requests", icon: RefreshCw }, // NEW
  { path: "/branch/employees", label: "Employees", icon: Users },
  { path: "/branch/orders", label: "Orders", icon: ShoppingCart },
  { path: "/branch/reports", label: "Reports", icon: BarChart2 },
];
```

### Phase 5: Backend API Requirements

Ensure these endpoints exist:

#### Inventory Endpoints
```
GET    /api/inventory/store/{storeId}
GET    /api/inventory/branch/{branchId}
GET    /api/inventory/branch/{branchId}/low-stock?threshold={number}
POST   /api/inventory
PATCH  /api/inventory/{id}/stock
DELETE /api/inventory/{id}
```

#### Restock Request Endpoints
```
POST   /api/restock-requests
GET    /api/restock-requests/branch/{branchId}
GET    /api/restock-requests/store/{storeId}?status={status}
PATCH  /api/restock-requests/{id}/approve
PATCH  /api/restock-requests/{id}/reject
PATCH  /api/restock-requests/{id}/fulfill
POST   /api/restock-requests/batch/approve
POST   /api/restock-requests/batch/fulfill
```

## 🎯 Quick Implementation Order

### Week 1: Core Inventory (DONE ✅)
- ✅ Redux slices and thunks
- ✅ Inventory Management page
- ✅ Add/Edit/Delete inventory

### Week 2: Restock Requests
1. Create `RestockRequestManagement.jsx` for Store Admin
2. Create `RestockRequests.jsx` for Branch Manager
3. Add routing
4. Add navigation items
5. Test create/approve/fulfill flow

### Week 3: Enhancements
1. Add Low Stock Alert component
2. Add to dashboards
3. Add notifications
4. Improve UI/UX

### Week 4: Polish
1. Add loading skeletons
2. Add error boundaries
3. Add export features
4. Add print functionality
5. Performance optimization

## 🔧 Testing Checklist

### Inventory Management
- [ ] Store Admin can view all inventory
- [ ] Can filter by branch
- [ ] Can search products
- [ ] Can add product to branch inventory
- [ ] Can update stock quantity
- [ ] Can delete inventory item
- [ ] Stats cards show correct counts
- [ ] Stock levels color-coded correctly

### Restock Requests
- [ ] Branch Manager can create request
- [ ] Store Admin can view all requests
- [ ] Can filter by status
- [ ] Can approve single request
- [ ] Can reject with reason
- [ ] Can fulfill request
- [ ] Can batch approve
- [ ] Can batch fulfill
- [ ] Inventory updates after fulfillment

### Integration
- [ ] Cashier can only see products in branch inventory
- [ ] Order creation checks inventory
- [ ] Inventory decreases after sale
- [ ] Low stock alerts appear
- [ ] Notifications work

## 📦 Dependencies

Already installed:
- react-router-dom
- @reduxjs/toolkit
- axios
- lucide-react
- sonner (toast)
- shadcn/ui components

May need:
- recharts (for analytics charts)
- date-fns (for date formatting)

Install if needed:
```bash
npm install recharts date-fns
```

## 🚀 Quick Start

1. **Test Inventory Management:**
   - Login as Store Admin
   - Navigate to `/store-admin/inventory`
   - Add a product to a branch
   - Update stock
   - Test filters and search

2. **Next: Create Restock Pages:**
   - Copy the structure from InventoryManagement.jsx
   - Adapt for restock requests
   - Add batch operations
   - Test workflow

3. **Add to Navigation:**
   - Update StoreAdminLayout.jsx
   - Update BranchLayout.jsx
   - Test navigation

## 💡 Tips

1. **Reuse Components:**
   - Use same styling from InventoryManagement
   - Reuse dialog components
   - Keep consistent UI patterns

2. **Error Handling:**
   - Always show toast notifications
   - Handle loading states
   - Validate form inputs

3. **Performance:**
   - Use pagination for large lists
   - Debounce search inputs
   - Cache API responses

4. **User Experience:**
   - Show loading skeletons
   - Confirm destructive actions
   - Provide helpful error messages
   - Auto-refresh data after actions

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify backend endpoints are working
3. Check Redux DevTools for state
4. Ensure JWT token is valid
5. Test API calls with Postman

---

**Status: Phase 1 Complete ✅**
**Next: Implement Restock Request Pages**

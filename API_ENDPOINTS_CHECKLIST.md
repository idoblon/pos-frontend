# API Endpoints Checklist

## Base URL: http://localhost:8080

---

## 🔐 Authentication APIs
- [ ] POST `/auth/signup` - User registration
- [ ] POST `/auth/login` - User login

---

## 👤 User APIs
- [ ] GET `/api/users/profile` - Get current user profile
- [ ] PUT `/api/users/profile` - Update user profile
- [ ] PUT `/api/users/change-password` - Change password
- [ ] GET `/api/users/customers` - Get all customers
- [ ] GET `/api/users/cashiers` - Get all cashiers
- [ ] GET `/api/users/:userId` - Get user by ID
- [ ] GET `/api/users/store/:storeId` - Get users by store
- [ ] GET `/api/users/branch/:branchId` - Get users by branch

---

## 🏪 Store APIs
- [ ] POST `/api/stores` - Create store
- [ ] GET `/api/stores/:id` - Get store by ID
- [ ] GET `/api/stores` - Get all stores
- [ ] PUT `/api/stores/:id` - Update store
- [ ] DELETE `/api/stores/:id` - Delete store
- [ ] GET `/api/stores/admin` - Get stores for admin
- [ ] GET `/api/stores/employee` - Get stores for employee

---

## 🏢 Branch APIs
- [ ] POST `/api/branches` - Create branch
- [ ] GET `/api/branches/:id` - Get branch by ID
- [ ] GET `/api/branches/stores/:id` - Get branches by store ID
- [ ] PUT `/api/branches/:id` - Update branch
- [ ] DELETE `/api/branches/:id` - Delete branch

---

## 📦 Product APIs
- [ ] POST `/api/products` - Create product
- [ ] GET `/api/products/:id` - Get product by ID
- [ ] PATCH `/api/products/:id` - Update product
- [ ] DELETE `/api/products/:id` - Delete product
- [ ] GET `/api/products/store/:storeId` - Get products by store
- [ ] GET `/api/products/branch/:branchId` - Get products by branch

---

## 📂 Category APIs
- [ ] POST `/api/categories` - Create category
- [ ] GET `/api/categories/store/:storeId` - Get categories by store
- [ ] PUT `/api/categories/:id` - Update category
- [ ] DELETE `/api/categories/:id` - Delete category

---

## 👥 Customer APIs
- [ ] POST `/api/customers` - Create customer
- [ ] GET `/api/customers` - Get all customers
- [ ] GET `/api/customers/:id` - Get customer by ID
- [ ] PUT `/api/customers/:id` - Update customer
- [ ] DELETE `/api/customers/:id` - Delete customer
- [ ] GET `/api/customers/search?q=` - Search customers

---

## 👨‍💼 Employee APIs
- [ ] POST `/api/employees/store/:storeId` - Create employee for store
- [ ] POST `/api/employees/branch/:branchId` - Create employee for branch
- [ ] GET `/api/employees/:employeeId` - Get employee by ID
- [ ] GET `/api/employees/store/:storeId` - Get employees by store
- [ ] GET `/api/employees/branch/:branchId` - Get employees by branch
- [ ] PUT `/api/employees/:employeeId` - Update employee
- [ ] DELETE `/api/employees/:employeeId` - Delete employee

---

## 📋 Order APIs
- [ ] POST `/api/orders` - Create order
- [ ] GET `/api/orders/:id` - Get order by ID
- [ ] GET `/api/orders/branch/:branchId` - Get orders by branch
- [ ] GET `/api/orders/cashier/:id` - Get orders by cashier
- [ ] GET `/api/orders/customer/:id` - Get orders by customer
- [ ] GET `/api/orders/today/branch/:id` - Get today's orders by branch
- [ ] GET `/api/orders/recent/:id` - Get recent orders
- [ ] DELETE `/api/orders/:id` - Delete order

---

## 🔄 Refund APIs
- [ ] POST `/api/refunds` - Create refund
- [ ] GET `/api/refunds` - Get all refunds
- [ ] GET `/api/refunds/:refundId` - Get refund by ID
- [ ] GET `/api/refunds/cashier/:cashierId` - Get refunds by cashier
- [ ] GET `/api/refunds/branch/:branchId` - Get refunds by branch
- [ ] GET `/api/refunds/shift/:shiftReportId` - Get refunds by shift
- [ ] PUT `/api/refunds/:id` - Update refund
- [ ] DELETE `/api/refunds/:id` - Delete refund

---

## 📊 Shift Report APIs
- [ ] POST `/api/shift-report/start` - Start shift
- [ ] PATCH `/api/shift-report/end` - End shift
- [ ] GET `/api/shift-report/current` - Get current shift
- [ ] GET `/api/shift-report/:id` - Get shift by ID
- [ ] GET `/api/shift-report/cashier/:cashierId` - Get shifts by cashier
- [ ] GET `/api/shift-report/branch/:branchId` - Get shifts by branch
- [ ] PUT `/api/shift-report/:id` - Update shift

---

## 📦 Inventory APIs
- [ ] GET `/inventory/branch/:branchId` - Get inventory by branch

---

## 🛒 Cart APIs
- [ ] POST `/api/cart/save` - Save cart
- [ ] GET `/api/cart/load` - Load cart
- [ ] POST `/api/cart/apply-coupon` - Apply coupon

---

## 🏥 Health Check APIs
- [ ] GET `/` - Root endpoint
- [ ] GET `/api/health` - Health check

---

## 🔍 API Endpoint Issues Found:

### Inconsistent Endpoints:
1. **Customers**: 
   - Some use `/api/customers` 
   - Some use `/customers` (without /api prefix)
   
2. **Orders**: 
   - Some use `/api/orders`
   - Some use `/orders` (without /api prefix)
   
3. **Inventory**: 
   - Uses `/inventory/branch/:branchId` (no /api prefix)

### Recommendations:
1. Standardize all endpoints to use `/api/` prefix
2. Update the following files:
   - `CustomersLookup.jsx` - Change `/customers` to `/api/customers`
   - `DeleteCustomerDialog.jsx` - Change `/customers/:id` to `/api/customers/:id`
   - `EditCustomerDialog.jsx` - Change `/customers/:id` to `/api/customers/:id`
   - `ViewCustomerDialog.jsx` - Change `/orders/customer/:id` to `/api/orders/customer/:id`
   - `PaymentDialogOld.jsx` - Change `/orders` to `/api/orders`
   - `inventoryThunk.js` - Change `/inventory/branch/:branchId` to `/api/inventory/branch/:branchId`

---

## Testing Instructions:

1. **Start Backend Server**: Ensure backend is running on `http://localhost:8080`
2. **Login First**: Get authentication token
3. **Test Each Endpoint**: Use the checklist above
4. **Check Response**: Verify status codes and data structure
5. **Handle Errors**: Check 401, 404, 500 error responses

---

## Common Issues:

1. ❌ **401 Unauthorized** - Token expired or invalid
2. ❌ **404 Not Found** - Endpoint doesn't exist or wrong URL
3. ❌ **500 Internal Server Error** - Backend issue (check logs)
4. ❌ **CORS Error** - Backend CORS configuration issue
5. ❌ **Timeout** - Request took longer than 10 seconds

---

## Next Steps:

1. Fix inconsistent API endpoints
2. Test all endpoints with Postman/Thunder Client
3. Add error handling for all API calls
4. Implement retry logic for failed requests
5. Add loading states for all API operations

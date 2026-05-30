# Backend API Verification - Inventory System

## 🔍 Required Backend Endpoints

### 1. **Inventory Endpoints**

#### A. Get Inventory by Store
```http
GET /api/inventory/store/{storeId}
Authorization: Bearer {jwt}

Response: 200 OK
[
  {
    "id": "string",
    "branchId": "string",
    "branchName": "string",
    "productId": "string",
    "productName": "string",
    "productSku": "string",
    "categoryName": "string",
    "quantity": number,
    "unitPrice": number,
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
]
```

#### B. Get Inventory by Branch
```http
GET /api/inventory/branch/{branchId}
Authorization: Bearer {jwt}

Response: 200 OK
[
  {
    "id": "string",
    "branchId": "string",
    "productId": "string",
    "productName": "string",
    "productSku": "string",
    "categoryName": "string",
    "quantity": number,
    "unitPrice": number
  }
]
```

#### C. Add Product to Inventory
```http
POST /api/inventory
Authorization: Bearer {jwt}
Content-Type: application/json

Request Body:
{
  "branchId": "string",
  "productId": "string",
  "quantity": number,
  "unitPrice": number
}

Response: 201 Created
{
  "id": "string",
  "branchId": "string",
  "productId": "string",
  "productName": "string",
  "quantity": number,
  "unitPrice": number,
  "createdAt": "timestamp"
}
```

#### D. Update Stock Quantity
```http
PATCH /api/inventory/{inventoryId}/stock
Authorization: Bearer {jwt}
Content-Type: application/json

Request Body:
{
  "quantity": number
}

Response: 200 OK
{
  "id": "string",
  "quantity": number,
  "updatedAt": "timestamp"
}
```

#### E. Delete Inventory Item
```http
DELETE /api/inventory/{inventoryId}
Authorization: Bearer {jwt}

Response: 204 No Content
```

#### F. Get Low Stock Items
```http
GET /api/inventory/branch/{branchId}/low-stock?threshold=10
Authorization: Bearer {jwt}

Response: 200 OK
[
  {
    "id": "string",
    "productName": "string",
    "quantity": number,
    "threshold": number
  }
]
```

---

### 2. **Product Endpoints** (Already Exist)

#### A. Get Products by Store
```http
GET /api/products/store/{storeId}
Authorization: Bearer {jwt}

Response: 200 OK
[
  {
    "id": "string",
    "name": "string",
    "sku": "string",
    "sellingPrice": number,
    "mrp": number,
    "categoryId": "string",
    "categoryName": "string"
  }
]
```

---

### 3. **Branch Endpoints** (Already Exist)

#### A. Get Branches by Store
```http
GET /api/branches/store/{storeId}
Authorization: Bearer {jwt}

Response: 200 OK
[
  {
    "id": "string",
    "name": "string",
    "address": "string",
    "storeId": "string"
  }
]
```

---

### 4. **Restock Request Endpoints** (New)

#### A. Create Restock Request
```http
POST /api/restock-requests
Authorization: Bearer {jwt}
Content-Type: application/json

Request Body:
{
  "branchId": "string",
  "productId": "string",
  "requestedQuantity": number,
  "notes": "string" (optional)
}

Response: 201 Created
{
  "id": "string",
  "branchId": "string",
  "branchName": "string",
  "productId": "string",
  "productName": "string",
  "currentStock": number,
  "requestedQuantity": number,
  "status": "PENDING",
  "notes": "string",
  "requestedBy": "string",
  "requestedByName": "string",
  "createdAt": "timestamp"
}
```

#### B. Get Restock Requests by Branch
```http
GET /api/restock-requests/branch/{branchId}
Authorization: Bearer {jwt}

Response: 200 OK
[
  {
    "id": "string",
    "productName": "string",
    "requestedQuantity": number,
    "status": "PENDING|APPROVED|FULFILLED|REJECTED",
    "createdAt": "timestamp"
  }
]
```

#### C. Get Restock Requests by Store
```http
GET /api/restock-requests/store/{storeId}?status=PENDING
Authorization: Bearer {jwt}

Response: 200 OK
[
  {
    "id": "string",
    "branchId": "string",
    "branchName": "string",
    "productId": "string",
    "productName": "string",
    "currentStock": number,
    "requestedQuantity": number,
    "status": "string",
    "requestedBy": "string",
    "requestedByName": "string",
    "createdAt": "timestamp"
  }
]
```

#### D. Approve Restock Request
```http
PATCH /api/restock-requests/{requestId}/approve
Authorization: Bearer {jwt}

Response: 200 OK
{
  "id": "string",
  "status": "APPROVED",
  "approvedBy": "string",
  "approvedAt": "timestamp"
}
```

#### E. Reject Restock Request
```http
PATCH /api/restock-requests/{requestId}/reject
Authorization: Bearer {jwt}
Content-Type: application/json

Request Body:
{
  "reason": "string"
}

Response: 200 OK
{
  "id": "string",
  "status": "REJECTED",
  "rejectionReason": "string",
  "rejectedBy": "string",
  "rejectedAt": "timestamp"
}
```

#### F. Fulfill Restock Request
```http
PATCH /api/restock-requests/{requestId}/fulfill
Authorization: Bearer {jwt}

Response: 200 OK
{
  "id": "string",
  "status": "FULFILLED",
  "fulfilledBy": "string",
  "fulfilledAt": "timestamp"
}

Note: This should also update the inventory quantity
```

#### G. Batch Approve Requests
```http
POST /api/restock-requests/batch/approve
Authorization: Bearer {jwt}
Content-Type: application/json

Request Body:
["requestId1", "requestId2", "requestId3"]

Response: 200 OK
[
  {
    "id": "string",
    "status": "APPROVED"
  }
]
```

#### H. Batch Fulfill Requests
```http
POST /api/restock-requests/batch/fulfill
Authorization: Bearer {jwt}
Content-Type: application/json

Request Body:
["requestId1", "requestId2", "requestId3"]

Response: 200 OK
[
  {
    "id": "string",
    "status": "FULFILLED"
  }
]
```

---

## 🧪 Testing with Postman/cURL

### Test 1: Add Product to Branch Inventory

```bash
curl -X POST http://localhost:8080/api/inventory \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "branchId": "BRANCH_ID",
    "productId": "PRODUCT_ID",
    "quantity": 100,
    "unitPrice": 50.00
  }'
```

**Expected Response:**
```json
{
  "id": "inv_123",
  "branchId": "branch_1",
  "productId": "prod_1",
  "productName": "Product A",
  "quantity": 100,
  "unitPrice": 50.00,
  "createdAt": "2024-01-01T10:00:00Z"
}
```

---

### Test 2: Get Branch Inventory

```bash
curl -X GET http://localhost:8080/api/inventory/branch/BRANCH_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
[
  {
    "id": "inv_123",
    "branchId": "branch_1",
    "productId": "prod_1",
    "productName": "Product A",
    "productSku": "SKU-001",
    "quantity": 100,
    "unitPrice": 50.00
  }
]
```

---

### Test 3: Update Stock

```bash
curl -X PATCH http://localhost:8080/api/inventory/inv_123/stock \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 150
  }'
```

---

### Test 4: Create Restock Request

```bash
curl -X POST http://localhost:8080/api/restock-requests \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "branchId": "BRANCH_ID",
    "productId": "PRODUCT_ID",
    "requestedQuantity": 50,
    "notes": "Running low on stock"
  }'
```

---

## 🔧 Backend Implementation Checklist

### Database Tables

#### `inventory` Table
```sql
CREATE TABLE inventory (
  id VARCHAR(255) PRIMARY KEY,
  branch_id VARCHAR(255) NOT NULL,
  product_id VARCHAR(255) NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  unit_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  UNIQUE KEY unique_branch_product (branch_id, product_id)
);
```

#### `restock_requests` Table
```sql
CREATE TABLE restock_requests (
  id VARCHAR(255) PRIMARY KEY,
  branch_id VARCHAR(255) NOT NULL,
  product_id VARCHAR(255) NOT NULL,
  requested_quantity INT NOT NULL,
  current_stock INT,
  status ENUM('PENDING', 'APPROVED', 'FULFILLED', 'REJECTED') DEFAULT 'PENDING',
  notes TEXT,
  requested_by VARCHAR(255) NOT NULL,
  approved_by VARCHAR(255),
  fulfilled_by VARCHAR(255),
  rejected_by VARCHAR(255),
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP NULL,
  fulfilled_at TIMESTAMP NULL,
  rejected_at TIMESTAMP NULL,
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (requested_by) REFERENCES users(id)
);
```

---

## 🎯 Business Logic

### When Adding to Inventory:
1. Check if product exists in store catalog
2. Check if branch exists
3. Check if product already in branch inventory (prevent duplicates)
4. Create inventory record
5. Return inventory with product details

### When Updating Stock:
1. Validate inventory exists
2. Update quantity
3. Check if below threshold (trigger low stock alert)
4. Return updated inventory

### When Creating Order:
1. Check product exists in branch inventory
2. Check sufficient quantity
3. Decrease inventory quantity
4. Create order
5. If quantity becomes low, trigger alert

### When Fulfilling Restock Request:
1. Update request status to FULFILLED
2. **Increase inventory quantity** by requested amount
3. Record who fulfilled and when
4. Send notification to requester

---

## 🚨 Error Handling

### Common Errors:

#### 1. Product Not in Inventory
```json
{
  "status": 404,
  "message": "Product not found in branch inventory",
  "timestamp": "2024-01-01T10:00:00Z"
}
```

#### 2. Duplicate Inventory Entry
```json
{
  "status": 409,
  "message": "Product already exists in branch inventory",
  "timestamp": "2024-01-01T10:00:00Z"
}
```

#### 3. Insufficient Stock
```json
{
  "status": 400,
  "message": "Insufficient stock. Available: 5, Requested: 10",
  "timestamp": "2024-01-01T10:00:00Z"
}
```

---

## ✅ Verification Steps

### Step 1: Test Inventory Endpoints
- [ ] POST /api/inventory - Add product to branch
- [ ] GET /api/inventory/branch/{id} - Get branch inventory
- [ ] GET /api/inventory/store/{id} - Get store inventory
- [ ] PATCH /api/inventory/{id}/stock - Update stock
- [ ] DELETE /api/inventory/{id} - Remove from inventory

### Step 2: Test Integration
- [ ] Add product to branch inventory
- [ ] Cashier can see product in POS
- [ ] Process order decreases inventory
- [ ] Check inventory updated correctly

### Step 3: Test Restock Flow
- [ ] Branch Manager creates request
- [ ] Store Admin sees request
- [ ] Store Admin approves request
- [ ] Store Admin fulfills request
- [ ] Inventory quantity increases

---

## 📊 Expected Data Flow

```
1. Store Admin Creates Product
   → Product in catalog (products table)

2. Store Admin Adds to Branch Inventory
   → POST /api/inventory
   → Record in inventory table
   → branchId + productId + quantity

3. Cashier Sells Product
   → POST /api/orders
   → Check inventory exists
   → Check sufficient quantity
   → Decrease inventory.quantity
   → Create order

4. Branch Manager Requests Restock
   → POST /api/restock-requests
   → Record in restock_requests table
   → status = PENDING

5. Store Admin Fulfills Request
   → PATCH /api/restock-requests/{id}/fulfill
   → Update status = FULFILLED
   → Increase inventory.quantity
```

---

## 🔍 Debug Checklist

If inventory not working:

1. **Check Database:**
   - [ ] inventory table exists
   - [ ] Foreign keys set up correctly
   - [ ] Unique constraint on (branch_id, product_id)

2. **Check API:**
   - [ ] Endpoints return correct status codes
   - [ ] Response includes all required fields
   - [ ] JWT authentication working

3. **Check Frontend:**
   - [ ] Products loading (check Redux state)
   - [ ] Branches loading (check Redux state)
   - [ ] Form submitting correctly
   - [ ] No CORS errors

4. **Check Integration:**
   - [ ] Product exists in catalog
   - [ ] Branch exists
   - [ ] User has correct permissions
   - [ ] JWT token valid

---

## 📞 Quick Test Commands

```bash
# Get JWT Token
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@store.com","password":"admin123"}'

# Test Add to Inventory
curl -X POST http://localhost:8080/api/inventory \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"branchId":"1","productId":"1","quantity":100,"unitPrice":50}'

# Test Get Inventory
curl -X GET http://localhost:8080/api/inventory/branch/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

**Status: Ready for Backend Implementation**

All frontend code is complete and waiting for backend endpoints!

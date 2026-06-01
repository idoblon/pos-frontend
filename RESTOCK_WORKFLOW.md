# Restock Request Workflow Implementation

## Real-World Workflow
This system implements a realistic restock workflow that matches actual business operations:

### 1. PENDING → Branch Manager Submits Request
- Branch manager notices low stock
- Submits restock request with justification
- Request appears in Store Admin notifications

### 2. APPROVED → Store Admin Approves & Orders Products  
- Store Admin reviews and approves request
- **NO INVENTORY UPDATE YET** - approval just means "we'll send products"
- Branch gets notification: "Products Coming Soon"
- Store Admin orders products from supplier (external process)

### 3. FULFILLED → Branch Receives & Counts Products
- Physical products arrive at branch (1-7 days later)
- Branch manager clicks "Mark as Received" 
- Enters actual quantity received (may differ from requested)
- **INVENTORY UPDATED NOW** - only when products physically arrive
- Status changes to FULFILLED
- System tracks both requested vs received quantities

### 4. REJECTED → Store Admin Denies Request
- Store Admin provides reason for rejection
- Branch gets notification with rejection reason

## Key Benefits
- **Accurate Inventory**: Stock numbers only update when products physically arrive
- **Clear Tracking**: Separation between approval (authorization) and fulfillment (receipt)
- **Real Logistics**: Accounts for delivery time and potential quantity differences
- **Audit Trail**: Complete history of request → approval → delivery → receipt
- **Flexible Quantities**: Handles cases where delivered quantity differs from requested

## Frontend Implementation
- **Store Admin**: Approve requests (no inventory update)
- **Branch Manager**: Mark products as received with actual quantity (triggers inventory update)
- **Notifications**: Clear status messages for each workflow step
- **Fallback**: localStorage mock system when backend API unavailable

## Backend Implementation
- **RestockRequest Entity**: Added `receivedQuantity` field to track actual received amounts
- **Controller**: `/api/restock-requests/{id}/fulfill` accepts optional `receivedQuantity` parameter
- **Service**: `fulfillRequest()` uses received quantity if provided, falls back to requested quantity
- **Inventory Update**: Only happens in fulfill endpoint, not approve endpoint
- **Stock Movement**: Records detailed movement with actual quantities received
- **Email Notifications**: Sent at each workflow step (approval, rejection, fulfillment)

## Database Schema Changes
```sql
ALTER TABLE restock_request ADD COLUMN received_quantity INTEGER;
```

## API Endpoints
- `POST /api/restock-requests` - Create new request
- `GET /api/restock-requests/store/{storeId}` - Get requests by store
- `GET /api/restock-requests/branch/{branchId}` - Get requests by branch
- `PATCH /api/restock-requests/{id}/approve` - Approve request (no inventory change)
- `PATCH /api/restock-requests/{id}/reject` - Reject request with reason
- `PATCH /api/restock-requests/{id}/fulfill` - Fulfill request + update inventory
  - Optional body: `{"receivedQuantity": 50}` for different received amount
- `POST /api/restock-requests/batch/approve` - Batch approve multiple requests
- `POST /api/restock-requests/batch/fulfill` - Batch fulfill multiple requests
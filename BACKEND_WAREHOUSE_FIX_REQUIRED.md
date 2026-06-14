# 🔧 Backend Fix Required: Warehouse Inventory Not Showing

## Problem
Warehouse inventory is being added successfully but not displayed when fetching. The API returns an empty array `[]` even after adding items.

## Root Cause
The backend endpoint `GET /api/inventories/store/{storeId}` is not correctly filtering warehouse inventory items (where `branchId IS NULL`).

---

## What Needs to be Fixed

### 1. **Inventory Repository - Query Method**

**File Location:** `src/main/java/com/your-package/repository/InventoryRepository.java`

**Current Issue:** The query likely only returns items with a specific branchId, not warehouse stock.

**Fix Required:**

```java
// Add or update this method:
public List<Inventory> findByStoreId(Long storeId) {
    // This should return ALL inventory for the store (both warehouse and branch)
    // Warehouse items will have branchId = NULL
    return inventoryRepository.findByStoreId(storeId);
}

// Also ensure this exists:
public List<Inventory> findByStoreIdAndBranchIdIsNull(Long storeId) {
    // This specifically returns WAREHOUSE inventory only
    return inventoryRepository.findByStoreIdAndBranchIdIsNull(storeId);
}
```

**In InventoryRepository interface:**
```java
@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    
    // Returns all inventory for a store (warehouse + all branches)
    List<Inventory> findByStoreId(Long storeId);
    
    // Returns only warehouse inventory (branchId IS NULL)
    @Query("SELECT i FROM Inventory i WHERE i.storeId = :storeId AND i.branchId IS NULL")
    List<Inventory> findByStoreIdAndBranchIdIsNull(@Param("storeId") Long storeId);
    
    // Returns only branch inventory for a specific branch
    List<Inventory> findByBranchId(Long branchId);
    
    // Returns inventory for specific branch in a store
    @Query("SELECT i FROM Inventory i WHERE i.storeId = :storeId AND i.branchId = :branchId")
    List<Inventory> findByStoreIdAndBranchId(@Param("storeId") Long storeId, @Param("branchId") Long branchId);
}
```

---

### 2. **Inventory Service - Method Implementation**

**File Location:** `src/main/java/com/your-package/service/InventoryService.java` (or InventoryServiceImpl.java)

**Current Issue:** Service might not be correctly calling the repository method or filtering the results.

**Fix Required:**

```java
public List<InventoryDTO> getInventoryByStore(Long storeId) {
    try {
        System.out.println("🔍 SERVICE: Getting inventory for store: " + storeId);
        
        // Get ALL inventory for the store (warehouse + branches)
        List<Inventory> inventories = inventoryRepository.findByStoreId(storeId);
        
        System.out.println("📊 SERVICE: Found " + inventories.size() + " inventory items");
        inventories.forEach(inv -> {
            System.out.println("  - Product: " + inv.getProductName() + 
                             ", Branch ID: " + inv.getBranchId() + 
                             ", Quantity: " + inv.getQuantity());
        });
        
        // Convert to DTOs
        List<InventoryDTO> dtos = inventories.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
        
        System.out.println("✅ SERVICE: Returning " + dtos.size() + " inventory DTOs");
        return dtos;
        
    } catch (Exception e) {
        System.err.println("❌ SERVICE ERROR: " + e.getMessage());
        e.printStackTrace();
        throw new RuntimeException("Failed to fetch inventory for store: " + e.getMessage());
    }
}
```

---

### 3. **Inventory Controller - GET Endpoint**

**File Location:** `src/main/java/com/your-package/controller/InventoryController.java`

**Current Issue:** Controller endpoint might not be passing storeId correctly to service.

**Fix Required:**

```java
@GetMapping("/api/inventories/store/{storeId}")
public ResponseEntity<List<InventoryDTO>> getInventoryByStore(
        @PathVariable Long storeId,
        HttpServletRequest request) {
    try {
        System.out.println("🔍 CONTROLLER: GET /api/inventories/store/" + storeId);
        
        // Validate store access
        User user = (User) request.getAttribute("user");
        if (!user.getStoreId().equals(storeId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        List<InventoryDTO> inventories = inventoryService.getInventoryByStore(storeId);
        System.out.println("✅ CONTROLLER: Returning " + inventories.size() + " items");
        
        return ResponseEntity.ok(inventories);
        
    } catch (Exception e) {
        System.err.println("❌ CONTROLLER ERROR: " + e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
}
```

---

### 4. **Inventory Entity - Ensure branchId can be NULL**

**File Location:** `src/main/java/com/your-package/entity/Inventory.java`

**Verify this exists:**

```java
@Entity
@Table(name = "inventory")
public class Inventory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "product_id")
    private Long productId;
    
    @Column(name = "product_name")
    private String productName;
    
    @Column(name = "product_sku")
    private String productSku;
    
    @Column(name = "store_id")
    private Long storeId;
    
    @Column(name = "branch_id", nullable = true)  // ← IMPORTANT: nullable = true
    private Long branchId;
    
    @Column(name = "quantity")
    private Integer quantity;
    
    @Column(name = "unit_price")
    private BigDecimal unitPrice;
    
    // Getters and Setters
}
```

**Key Point:** `branchId` must have `nullable = true` annotation.

---

### 5. **Database Schema Verification**

**SQL to check:**

```sql
-- Check if branch_id allows NULL
DESCRIBE inventory;
-- or for MySQL:
SHOW COLUMNS FROM inventory;

-- Should show:
-- branch_id | bigint | YES | (NULL allowed)

-- Check existing warehouse inventory
SELECT * FROM inventory WHERE branch_id IS NULL LIMIT 10;

-- Check if your inventory record was saved
SELECT * FROM inventory WHERE store_id = 6 ORDER BY created_at DESC LIMIT 5;
```

---

## Testing the Fix

After implementing the backend changes:

1. **Add a product to warehouse via frontend** → Add to Warehouse dialog
2. **Check database directly:**
   ```sql
   SELECT * FROM inventory WHERE store_id = 6 AND branch_id IS NULL;
   ```
3. **Check API directly in Postman:**
   ```
   GET http://localhost:8080/api/inventories/store/6
   ```
4. **Verify response has items:**
   ```json
   [
     {
       "id": 1,
       "productId": 207,
       "productName": "Palpasa Café – Narayan Wagle",
       "productSku": "CAFE-WAGLE",
       "storeId": 6,
       "branchId": null,
       "quantity": 50,
       "unitPrice": 300
     }
   ]
   ```

---

## Expected Behavior After Fix

1. ✅ Add product to warehouse → Dialog closes
2. ✅ Success toast shows: "Product added to warehouse inventory successfully"
3. ✅ `getInventoryByStore` API called
4. ✅ API returns array with warehouse inventory items
5. ✅ Warehouse inventory table displays items
6. ✅ Stats cards show: Total Items, Low Stock, Out of Stock counts

---

## Debug Logging to Add

Add these console logs in backend to track the issue:

```java
// In InventoryService.getInventoryByStore()
System.out.println("📡 GETTING INVENTORY FOR STORE: " + storeId);
System.out.println("📡 QUERY: findByStoreId(" + storeId + ")");
System.out.println("📡 RESULTS COUNT: " + inventories.size());

inventories.forEach(inv -> {
    System.out.println("  Item ID: " + inv.getId() + 
                     ", Product: " + inv.getProductName() +
                     ", BranchId: " + inv.getBranchId() +
                     ", Qty: " + inv.getQuantity());
});

System.out.println("📡 CONVERTED TO " + dtos.size() + " DTOS");
```

---

## Common Issues Checklist

- [ ] Repository query returns all items for store (not filtered by branchId)
- [ ] branchId column allows NULL values in database
- [ ] Entity class has `nullable = true` for branchId field
- [ ] Service method calls correct repository method
- [ ] Controller endpoint correctly passes storeId to service
- [ ] Database has the inserted inventory record

---

## Quick Fix Command

If using Spring Data JPA, ensure `InventoryRepository` has:

```java
List<Inventory> findByStoreId(Long storeId);
```

This should automatically work since it returns ALL inventory items for the store regardless of branchId value.

---

**Once backend is fixed, frontend will automatically display warehouse inventory! ✅**

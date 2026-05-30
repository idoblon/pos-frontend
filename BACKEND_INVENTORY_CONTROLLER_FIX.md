# Backend Fix - Inventory Controller

## 🔴 Issue: 404 on /api/inventory/store/{storeId}

The frontend is calling `GET /api/inventory/store/{storeId}` but the backend endpoint is missing or not mapped correctly.

---

## ✅ Solution: Add/Fix InventoryController.java

### Complete InventoryController.java

```java
package com.springboot.POS.controller;

import com.springboot.POS.dto.InventoryDTO;
import com.springboot.POS.model.Inventory;
import com.springboot.POS.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "*")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    /**
     * Get all inventory for a store (across all branches)
     * Used by Store Admin to view all inventory
     */
    @GetMapping("/store/{storeId}")
    @PreAuthorize("hasAnyRole('ROLE_STORE_ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<List<Inventory>> getInventoryByStore(@PathVariable Long storeId) {
        List<Inventory> inventory = inventoryService.getInventoryByStore(storeId);
        return ResponseEntity.ok(inventory);
    }

    /**
     * Get inventory for a specific branch
     * Used by Branch Manager and Cashier
     */
    @GetMapping("/branch/{branchId}")
    @PreAuthorize("hasAnyRole('ROLE_STORE_ADMIN', 'ROLE_BRANCH_MANAGER', 'ROLE_BRANCH_CASHIER', 'ROLE_ADMIN')")
    public ResponseEntity<List<Inventory>> getInventoryByBranch(@PathVariable Long branchId) {
        List<Inventory> inventory = inventoryService.getInventoryByBranch(branchId);
        return ResponseEntity.ok(inventory);
    }

    /**
     * Get low stock items for a branch
     */
    @GetMapping("/branch/{branchId}/low-stock")
    @PreAuthorize("hasAnyRole('ROLE_STORE_ADMIN', 'ROLE_BRANCH_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<List<Inventory>> getLowStockItems(
            @PathVariable Long branchId,
            @RequestParam(defaultValue = "10") int threshold) {
        List<Inventory> lowStockItems = inventoryService.getLowStockItems(branchId, threshold);
        return ResponseEntity.ok(lowStockItems);
    }

    /**
     * Add product to branch inventory
     * Used by Store Admin to add products to branches
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_STORE_ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<Inventory> addInventoryItem(@RequestBody InventoryDTO inventoryDTO) {
        Inventory inventory = inventoryService.addInventoryItem(inventoryDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(inventory);
    }

    /**
     * Update stock quantity
     * Used by Store Admin and Branch Manager
     */
    @PatchMapping("/{inventoryId}/stock")
    @PreAuthorize("hasAnyRole('ROLE_STORE_ADMIN', 'ROLE_BRANCH_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<Inventory> updateStock(
            @PathVariable Long inventoryId,
            @RequestBody UpdateStockDTO updateStockDTO) {
        Inventory inventory = inventoryService.updateStock(inventoryId, updateStockDTO.getQuantity());
        return ResponseEntity.ok(inventory);
    }

    /**
     * Delete inventory item
     * Used by Store Admin
     */
    @DeleteMapping("/{inventoryId}")
    @PreAuthorize("hasAnyRole('ROLE_STORE_ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<Void> deleteInventoryItem(@PathVariable Long inventoryId) {
        inventoryService.deleteInventoryItem(inventoryId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get single inventory item by ID
     */
    @GetMapping("/{inventoryId}")
    @PreAuthorize("hasAnyRole('ROLE_STORE_ADMIN', 'ROLE_BRANCH_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<Inventory> getInventoryById(@PathVariable Long inventoryId) {
        Inventory inventory = inventoryService.getInventoryById(inventoryId);
        return ResponseEntity.ok(inventory);
    }
}

// DTO for updating stock
class UpdateStockDTO {
    private int quantity;

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
}
```

---

## 📦 Inventory Model

```java
package com.springboot.POS.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventory", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"branch_id", "product_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    @JsonIgnore
    private Branch branch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnore
    private Product product;

    @Column(nullable = false)
    private int quantity = 0;

    @Column(name = "unit_price", nullable = false)
    private double unitPrice;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Transient fields for JSON response
    @Transient
    private Long branchId;

    @Transient
    private String branchName;

    @Transient
    private Long productId;

    @Transient
    private String productName;

    @Transient
    private String productSku;

    @Transient
    private String categoryName;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @PostLoad
    private void populateTransientFields() {
        if (branch != null) {
            this.branchId = branch.getId();
            this.branchName = branch.getName();
        }
        if (product != null) {
            this.productId = product.getId();
            this.productName = product.getName();
            this.productSku = product.getSku();
            if (product.getCategory() != null) {
                this.categoryName = product.getCategory().getName();
            }
        }
    }
}
```

---

## 📝 InventoryDTO

```java
package com.springboot.POS.dto;

import lombok.Data;

@Data
public class InventoryDTO {
    private Long branchId;
    private Long productId;
    private int quantity;
    private double unitPrice;
}
```

---

## 🔧 InventoryService

```java
package com.springboot.POS.service;

import com.springboot.POS.dto.InventoryDTO;
import com.springboot.POS.exception.ResourceNotFoundException;
import com.springboot.POS.model.Branch;
import com.springboot.POS.model.Inventory;
import com.springboot.POS.model.Product;
import com.springboot.POS.repository.BranchRepository;
import com.springboot.POS.repository.InventoryRepository;
import com.springboot.POS.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class InventoryService {

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private ProductRepository productRepository;

    /**
     * Get all inventory for a store (across all branches)
     */
    public List<Inventory> getInventoryByStore(Long storeId) {
        return inventoryRepository.findByBranchStoreId(storeId);
    }

    /**
     * Get inventory for a specific branch
     */
    public List<Inventory> getInventoryByBranch(Long branchId) {
        return inventoryRepository.findByBranchId(branchId);
    }

    /**
     * Get low stock items for a branch
     */
    public List<Inventory> getLowStockItems(Long branchId, int threshold) {
        return inventoryRepository.findByBranchIdAndQuantityLessThanEqual(branchId, threshold);
    }

    /**
     * Add product to branch inventory
     */
    @Transactional
    public Inventory addInventoryItem(InventoryDTO dto) {
        // Validate branch exists
        Branch branch = branchRepository.findById(dto.getBranchId())
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found"));

        // Validate product exists
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        // Check if product already in branch inventory
        if (inventoryRepository.existsByBranchIdAndProductId(dto.getBranchId(), dto.getProductId())) {
            throw new IllegalStateException("Product already exists in branch inventory");
        }

        // Create inventory
        Inventory inventory = new Inventory();
        inventory.setBranch(branch);
        inventory.setProduct(product);
        inventory.setQuantity(dto.getQuantity());
        inventory.setUnitPrice(dto.getUnitPrice());

        return inventoryRepository.save(inventory);
    }

    /**
     * Update stock quantity
     */
    @Transactional
    public Inventory updateStock(Long inventoryId, int quantity) {
        Inventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found"));

        inventory.setQuantity(quantity);
        return inventoryRepository.save(inventory);
    }

    /**
     * Delete inventory item
     */
    @Transactional
    public void deleteInventoryItem(Long inventoryId) {
        if (!inventoryRepository.existsById(inventoryId)) {
            throw new ResourceNotFoundException("Inventory item not found");
        }
        inventoryRepository.deleteById(inventoryId);
    }

    /**
     * Get inventory by ID
     */
    public Inventory getInventoryById(Long inventoryId) {
        return inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found"));
    }

    /**
     * Check if product exists in branch inventory
     */
    public boolean productExistsInBranch(Long branchId, Long productId) {
        return inventoryRepository.existsByBranchIdAndProductId(branchId, productId);
    }

    /**
     * Get inventory item by branch and product
     */
    public Inventory getInventoryByBranchAndProduct(Long branchId, Long productId) {
        return inventoryRepository.findByBranchIdAndProductId(branchId, productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found in branch inventory"));
    }

    /**
     * Decrease stock (used when order is placed)
     */
    @Transactional
    public void decreaseStock(Long branchId, Long productId, int quantity) {
        Inventory inventory = getInventoryByBranchAndProduct(branchId, productId);
        
        if (inventory.getQuantity() < quantity) {
            throw new IllegalStateException("Insufficient stock. Available: " + inventory.getQuantity() + ", Requested: " + quantity);
        }

        inventory.setQuantity(inventory.getQuantity() - quantity);
        inventoryRepository.save(inventory);
    }

    /**
     * Increase stock (used when restock is fulfilled)
     */
    @Transactional
    public void increaseStock(Long branchId, Long productId, int quantity) {
        Inventory inventory = getInventoryByBranchAndProduct(branchId, productId);
        inventory.setQuantity(inventory.getQuantity() + quantity);
        inventoryRepository.save(inventory);
    }
}
```

---

## 🗄️ InventoryRepository

```java
package com.springboot.POS.repository;

import com.springboot.POS.model.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    // Find all inventory for a store (across all branches)
    List<Inventory> findByBranchStoreId(Long storeId);

    // Find inventory for a specific branch
    List<Inventory> findByBranchId(Long branchId);

    // Find low stock items
    List<Inventory> findByBranchIdAndQuantityLessThanEqual(Long branchId, int threshold);

    // Check if product exists in branch
    boolean existsByBranchIdAndProductId(Long branchId, Long productId);

    // Find specific inventory item
    Optional<Inventory> findByBranchIdAndProductId(Long branchId, Long productId);

    // Find out of stock items
    List<Inventory> findByBranchIdAndQuantity(Long branchId, int quantity);
}
```

---

## 🔧 Database Migration (SQL)

```sql
-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    branch_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    unit_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_branch_product (branch_id, product_id)
);

-- Create indexes for better performance
CREATE INDEX idx_inventory_branch ON inventory(branch_id);
CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_quantity ON inventory(quantity);
CREATE INDEX idx_inventory_branch_store ON inventory(branch_id);
```

---

## ✅ Testing the Endpoints

### 1. Add Product to Inventory
```bash
curl -X POST http://localhost:8080/api/inventory \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "branchId": 1,
    "productId": 1,
    "quantity": 100,
    "unitPrice": 50.00
  }'
```

### 2. Get Store Inventory
```bash
curl -X GET http://localhost:8080/api/inventory/store/1 \
  -H "Authorization: Bearer YOUR_JWT"
```

### 3. Get Branch Inventory
```bash
curl -X GET http://localhost:8080/api/inventory/branch/1 \
  -H "Authorization: Bearer YOUR_JWT"
```

### 4. Update Stock
```bash
curl -X PATCH http://localhost:8080/api/inventory/1/stock \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"quantity": 150}'
```

### 5. Delete Inventory Item
```bash
curl -X DELETE http://localhost:8080/api/inventory/1 \
  -H "Authorization: Bearer YOUR_JWT"
```

---

## 🚨 Common Issues & Fixes

### Issue 1: 404 Not Found
**Cause:** Endpoint not mapped correctly
**Fix:** Ensure `@GetMapping("/store/{storeId}")` exists in controller

### Issue 2: 403 Forbidden
**Cause:** User doesn't have required role
**Fix:** Check `@PreAuthorize` annotations match user's role

### Issue 3: Duplicate Entry Error
**Cause:** Product already in branch inventory
**Fix:** Check before adding with `existsByBranchIdAndProductId`

### Issue 4: Foreign Key Constraint
**Cause:** Branch or Product doesn't exist
**Fix:** Validate branch and product exist before creating inventory

---

## 📋 Implementation Checklist

- [ ] Create `Inventory.java` model
- [ ] Create `InventoryDTO.java`
- [ ] Create `InventoryRepository.java`
- [ ] Create `InventoryService.java`
- [ ] Create `InventoryController.java`
- [ ] Add database migration
- [ ] Test all endpoints with Postman
- [ ] Verify frontend can fetch data
- [ ] Test add/update/delete operations
- [ ] Test with different user roles

---

## 🎯 Key Points

1. **Unique Constraint:** One product per branch (no duplicates)
2. **Cascade Delete:** If branch/product deleted, inventory deleted
3. **Transient Fields:** Populate product/branch details for JSON response
4. **Role-Based Access:** Store Admin can manage all, Branch Manager only their branch
5. **Stock Validation:** Check sufficient stock before decreasing

---

**Status: Ready for Backend Implementation**

Copy these files to your backend and test!

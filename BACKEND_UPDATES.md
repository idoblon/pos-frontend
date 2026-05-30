# Backend Updates Required

## 1. Update InventoryDTO.java

Add category fields after the product fields:

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryDTO {

    private Long id;

    @NotNull(message = "Branch is required")
    private Long branchId;
    
    private String branchName;

    @NotNull(message = "Product is required")
    private Long productId;
    
    private String productName;
    private String productSku;
    private String productImage;
    
    // ADD THESE TWO LINES:
    private Long categoryId;
    private String categoryName;

    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity cannot be negative")
    private Integer quantity;

    private LocalDateTime lastUpdate;
    
    // Helper fields for UI
    private Boolean isLowStock;
    private Integer lowStockThreshold;
}
```

## 2. Update InventoryMapper.java

Update the toDTO method to include category mapping:

```java
public class InventoryMapper {

    private static final Integer DEFAULT_LOW_STOCK_THRESHOLD = 10;

    public static InventoryDTO toDTO(Inventory inventory) {
        if (inventory == null) return null;

        InventoryDTO dto = InventoryDTO.builder()
                .id(inventory.getId())
                .branchId(inventory.getBranch() != null ? inventory.getBranch().getId() : null)
                .branchName(inventory.getBranch() != null ? inventory.getBranch().getName() : null)
                .productId(inventory.getProduct() != null ? inventory.getProduct().getId() : null)
                .productName(inventory.getProduct() != null ? inventory.getProduct().getName() : null)
                .productSku(inventory.getProduct() != null ? inventory.getProduct().getSku() : null)
                .productImage(inventory.getProduct() != null ? inventory.getProduct().getImage() : null)
                // ADD THESE TWO LINES:
                .categoryId(inventory.getProduct() != null && inventory.getProduct().getCategory() != null 
                    ? inventory.getProduct().getCategory().getId() : null)
                .categoryName(inventory.getProduct() != null && inventory.getProduct().getCategory() != null 
                    ? inventory.getProduct().getCategory().getName() : null)
                .quantity(inventory.getQuantity())
                .lastUpdate(inventory.getLastUpdate())
                .lowStockThreshold(DEFAULT_LOW_STOCK_THRESHOLD)
                .build();

        // Calculate if low stock
        dto.setIsLowStock(inventory.getQuantity() <= DEFAULT_LOW_STOCK_THRESHOLD);

        return dto;
    }
}
```

## Summary

These changes will:
- ✅ Add `categoryId` and `categoryName` fields to InventoryDTO
- ✅ Map category information from Product entity to InventoryDTO
- ✅ Display category in both Store Admin and Branch inventory tables

After making these backend changes, restart your backend server and the category will appear in the inventory tables.

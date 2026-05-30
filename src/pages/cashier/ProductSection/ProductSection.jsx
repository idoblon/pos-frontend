import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search } from "lucide-react";
import { getInventoryByBranch } from "@/Redux Toolkit/Features/inventory/inventoryThunk";
import { getProductsByStore } from "@/Redux Toolkit/Features/product/productThunk";
import ProductCard from "@/components/ProductCard";
import secureStorage from "@/util/secureStorage";

export default function ProductSection({ onAddToCart }) {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const { inventory, loading: inventoryLoading } = useSelector((state) => state.inventory);
  const { products, loading: productsLoading } = useSelector((state) => state.product);
  const userData = secureStorage.getUserData();
  const branchId = (userData?.branchId && userData.branchId !== 'null') ? userData.branchId : null;
  const storeId = (userData?.storeId && userData.storeId !== 'null') ? userData.storeId : null;

  useEffect(() => {
    if (branchId) {
      dispatch(getInventoryByBranch({ branchId }));
    }
    if (storeId) {
      dispatch(getProductsByStore(storeId));
    }
  }, [dispatch, branchId, storeId]);

  // Create a map of productId to product details for quick lookup
  const productMap = {};
  const productList = products?.content || products || [];
  productList.forEach(product => {
    const id = product.id || product._id;
    productMap[id] = product;
  });

  // Convert inventory items to product format, enriching with product details
  const productsFromInventory = (inventory || []).map(inv => {
    const productDetails = productMap[inv.productId] || {};
    return {
      id: inv.productId,
      _id: inv.productId,
      name: inv.productName || productDetails.name,
      sku: inv.productSku || productDetails.sku,
      price: productDetails.sellingPrice || productDetails.price || 0,
      sellingPrice: productDetails.sellingPrice || productDetails.price || 0,
      category: { name: inv.categoryName || productDetails.category?.name },
      image: inv.productImage || productDetails.image || productDetails.imageUrl,
      imageUrl: inv.productImage || productDetails.imageUrl || productDetails.image,
      description: productDetails.description || productDetails.desciption,
      stock: inv.quantity || 0,
    };
  });
  
  const filtered = productsFromInventory.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const loading = inventoryLoading || productsLoading;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="search-wrap">
        <div style={{ position: "relative" }}>
          <Search size={14} color="#9ca3af" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
          <input
            className="search-input"
            style={{ paddingLeft: 32 }}
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="prod-bar">
        <span className="prod-count">{filtered?.length ?? 0} products available in branch</span>
      </div>
      <div className="prod-grid">
        {loading && (
        <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px 0", color: "#6b7280" }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Loading products...</p>
        </div>
      )}
      {!loading && filtered?.length > 0 ? filtered.map((p) => {
          return (
            <ProductCard
              key={p.id}
              product={p}
              stock={p.stock}
              onAddToCart={onAddToCart}
            />
          );
        }) : !loading && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px 0", color: "#6b7280" }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>No products available</p>
            <p style={{ margin: "4px 0 0", fontSize: 12 }}>Contact your Branch Manager to add products to this branch's inventory</p>
          </div>
        )}
      </div>
    </div>
  );
}

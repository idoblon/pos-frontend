import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search } from "lucide-react";
import { getProductsByBranch, getProductsByStore } from "@/Redux Toolkit/Features/product/productThunk";
import { getInventoryByBranch } from "@/Redux Toolkit/Features/inventory/inventoryThunk";
import ProductCard from "@/components/ProductCard";
import secureStorage from "@/util/secureStorage";

export default function ProductSection({ onAddToCart }) {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const { products } = useSelector((state) => state.product);
  const { inventory } = useSelector((state) => state.inventory);
  const userData = secureStorage.getUserData();
  // Handle string 'null' values from backend
  const branchId = (userData?.branchId && userData.branchId !== 'null') ? userData.branchId : null;
  const storeId = (userData?.storeId && userData.storeId !== 'null') ? userData.storeId : null;

  useEffect(() => {
    if (storeId) {
      dispatch(getProductsByStore(storeId));
    }
    
    if (branchId) {
      dispatch(getInventoryByBranch({ branchId }));
    }
  }, [dispatch, branchId, storeId]);

  const getStock = (productId) => {
    const item = inventory?.find((inv) => inv.productId === productId || inv.productId === productId?._id);
    return item?.quantity ?? 99;
  };

  const filtered = products?.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <span className="prod-count">{filtered?.length ?? 0} products found</span>
      </div>
      <div className="prod-grid">
        {filtered?.length > 0 ? filtered.map((p) => {
          const id = p.id || p._id;
          const stock = getStock(id);
          return (
            <ProductCard
              key={id}
              product={p}
              stock={stock}
              onAddToCart={onAddToCart}
            />
          );
        }) : (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px 0", color: "#6b7280" }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>No products available</p>
            <p style={{ margin: "4px 0 0", fontSize: 12 }}>Products will appear here once added to your store</p>
          </div>
        )}
      </div>
    </div>
  );
}

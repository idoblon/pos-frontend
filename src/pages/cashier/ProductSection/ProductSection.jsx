import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search } from "lucide-react";
import { getProductsByBranch, getProductsByStore } from "@/Redux Toolkit/Features/product/productThunk";
import { getInventoryByBranch } from "@/Redux Toolkit/Features/inventory/inventoryThunk";
import ProductCard from "@/components/ProductCard";
import secureStorage from "@/util/secureStorage";

const DEMO_PRODUCTS = [
  { id: "p1", _id: "p1", name: "Aloe Vera",          sku: "PLT-001", price: 450,  category: "Succulents" },
  { id: "p2", _id: "p2", name: "Monstera Deliciosa", sku: "PLT-002", price: 1200, category: "Tropical" },
  { id: "p3", _id: "p3", name: "Peace Lily",         sku: "PLT-003", price: 650,  category: "Flowering" },
  { id: "p4", _id: "p4", name: "Snake Plant",        sku: "PLT-004", price: 550,  category: "Succulents" },
  { id: "p5", _id: "p5", name: "Fiddle Leaf Fig",    sku: "PLT-005", price: 2200, category: "Tropical" },
  { id: "p6", _id: "p6", name: "Ceramic Pot 6in",    sku: "ACC-001", price: 320,  category: "Accessories" },
  { id: "p7", _id: "p7", name: "Potting Mix 5kg",    sku: "ACC-002", price: 280,  category: "Accessories" },
  { id: "p8", _id: "p8", name: "Orchid Plant",       sku: "PLT-006", price: 980,  category: "Flowering" },
];

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
    console.log("🔍 ProductSection - Checking API call conditions:");
    console.log("- Raw StoreId from userData:", userData?.storeId);
    console.log("- Raw BranchId from userData:", userData?.branchId);
    console.log("- Processed StoreId:", storeId);
    console.log("- Processed BranchId:", branchId);
    console.log("- UserData:", userData);
    
    // Only make API calls if we have valid IDs
    if (storeId) {
      console.log("📡 API CALL: Fetching products for store:", storeId);
      dispatch(getProductsByStore(storeId));
    } else {
      console.log("⚠️ SKIPPED: No valid storeId - using demo products");
    }
    
    if (branchId) {
      console.log("📡 API CALL: Fetching inventory for branch:", branchId);
      dispatch(getInventoryByBranch({ branchId }));
    } else {
      console.log("⚠️ SKIPPED: No valid branchId - using demo inventory");
    }
  }, [dispatch, branchId, storeId]);

  const displayProducts = products?.length ? products : DEMO_PRODUCTS;

  const getStock = (productId) => {
    const item = inventory?.find((inv) => inv.productId === productId || inv.productId === productId?._id);
    return item?.quantity ?? 99;
  };

  const filtered = displayProducts?.filter((p) =>
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
        {filtered?.map((p) => {
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
        })}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search } from "lucide-react";
import { getProductsByBranch } from "@/Redux Toolkit/Features/product/productThunk";
import { getInventoryByBranch } from "@/Redux Toolkit/Features/inventory/inventoryThunk";

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
  const branchId = localStorage.getItem("branchId");

  useEffect(() => {
    if (branchId) {
      dispatch(getProductsByBranch({ branchId }));
      dispatch(getInventoryByBranch({ branchId }));
    }
  }, [dispatch, branchId]);

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
          const outOfStock = stock === 0;
          return (
            <div
              key={id}
              className="prod-card"
              onClick={() => !outOfStock && onAddToCart({ ...p, id })}
              style={{ opacity: outOfStock ? 0.5 : 1, cursor: outOfStock ? "not-allowed" : "pointer" }}
            >
              <div className="prod-img">🌿</div>
              <div className="prod-info">
                <div className="prod-name">{p.name}</div>
                <div className="prod-sku">{p.sku}</div>
                <div className="prod-meta">
                  <span className="prod-price">रु {p.price}</span>
                  <span className="prod-tag">{p.category ?? "—"}</span>
                </div>
                <div style={{ fontSize: 10, marginTop: 3, color: outOfStock ? "#e53e3e" : stock <= 10 ? "#d97706" : "#059669", fontWeight: 600 }}>
                  {outOfStock ? "Out of Stock" : `Stock: ${stock}`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

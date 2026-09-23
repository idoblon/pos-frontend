import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search } from "lucide-react";
import { getInventoryByBranch, getPosCatalog } from "@/Redux Toolkit/Features/inventory/inventoryThunk";
import { getProductsByStore } from "@/Redux Toolkit/Features/product/productThunk";
import ProductCard from "@/components/ProductCard";
import useBranchContext from "@/hooks/useBranchContext";

const toCatalogProduct = (row) => ({
  id: row.id ?? row.productId,
  _id: row.id ?? row.productId,
  name: row.name ?? row.productName,
  sku: row.sku ?? row.productSku,
  price: row.sellingPrice ?? row.price ?? row.unitPrice ?? 0,
  sellingPrice: row.sellingPrice ?? row.price ?? row.unitPrice ?? 0,
  category: { name: row.categoryName ?? row.category?.name },
  image: row.image ?? row.productImage ?? null,
  imageUrl: row.image ?? row.productImage ?? null,
  description: row.description,
  stock: row.stock ?? row.quantity ?? 0,
});

export default function ProductSection({ onAddToCart }) {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchInputRef = useRef(null);
  const { inventory, loading: inventoryLoading } = useSelector((state) => state.inventory);
  const { products, loading: productsLoading } = useSelector((state) => state.product);
  const { branchId, storeId } = useBranchContext();
  const [catalog, setCatalog] = useState(null); // null = server catalog unavailable → legacy join

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 250);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Server-joined catalog first (single query, server search); legacy
  // two-fetch client join as fallback for older backends (404).
  useEffect(() => {
    if (!branchId) return;
    let cancelled = false;
    dispatch(getPosCatalog({ branchId, q: debouncedSearch, size: 200 }))
      .unwrap()
      .then((data) => {
        if (!cancelled) setCatalog(Array.isArray(data?.content) ? data.content : data);
      })
      .catch((err) => {
        if (!cancelled && err?.status !== 404) setCatalog(null);
        else if (!cancelled) setCatalog(null);
      });
    return () => { cancelled = true; };
  }, [dispatch, branchId, debouncedSearch]);

  // Legacy fallback path only when the server catalog is unavailable.
  useEffect(() => {
    if (catalog !== null) return;
    if (branchId) {
      dispatch(getInventoryByBranch({ branchId }));
    }
    if (storeId) {
      dispatch(getProductsByStore(storeId));
    }
  }, [dispatch, branchId, storeId, catalog]);

  useEffect(() => {
    const focusSearch = (event) => {
      if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

  // Create a map of productId to product details for quick lookup (legacy path)
  const productMap = {};
  const productList = products?.content || products || [];
  productList.forEach(product => {
    const id = product.id || product._id;
    if (id != null) productMap[String(id)] = product;
  });

  // Convert inventory items to product format, enriching with product details (legacy path)
  const inventoryByProductId = new Map();
  (inventory || []).forEach((item) => {
    const key = String(item.productId);
    const current = inventoryByProductId.get(key);
    if (!current || Number(item.quantity || 0) > Number(current.quantity || 0)) {
      inventoryByProductId.set(key, item);
    }
  });

  const legacyProducts = [...inventoryByProductId.values()].map(inv => {
    const productDetails = productMap[String(inv.productId)] || {};
    const image =
      inv.productImage ||
      inv.image ||
      inv.imageUrl ||
      productDetails.image ||
      productDetails.imageUrl ||
      productDetails.productImage ||
      null;
    return {
      id: inv.productId,
      _id: inv.productId,
      name: inv.productName || productDetails.name,
      sku: inv.productSku || inv.sku || productDetails.sku,
      price: productDetails.sellingPrice || productDetails.price || inv.unitPrice || 0,
      sellingPrice: productDetails.sellingPrice || productDetails.price || inv.unitPrice || 0,
      category: { name: inv.categoryName || productDetails.category?.name },
      image,
      imageUrl: image,
      description: productDetails.description || productDetails.desciption,
      stock: inv.quantity || 0,
    };
  });

  const serverProducts = (catalog || []).map(toCatalogProduct);
  const source = catalog !== null ? serverProducts : legacyProducts;

  // Server already filters on q; filter client-side too for the legacy path
  // (and as a fast echo while the debounced server query is in flight).
  const query = searchTerm.trim().toLowerCase();
  const filtered = catalog !== null && debouncedSearch === searchTerm.trim()
    ? source
    : source.filter((p) =>
        p.name?.toLowerCase().includes(query) ||
        p.sku?.toLowerCase().includes(query) ||
        p.category?.name?.toLowerCase().includes(query)
      );

  const loading = inventoryLoading || productsLoading;

  const handleSearchKeyDown = (event) => {
    // Barcode-scanner / SKU fast path: exact match adds to cart on Enter.
    if (event.key !== "Enter" || !searchTerm.trim()) return;
    const q = searchTerm.trim().toLowerCase();
    const exactProduct = filtered.find((product) =>
      product.sku?.toLowerCase() === q || String(product.id) === q,
    ) ?? source.find((product) =>
      product.sku?.toLowerCase() === q || String(product.id) === q,
    );
    if (exactProduct) {
      onAddToCart(exactProduct);
      setSearchTerm("");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="search-wrap">
        <div style={{ position: "relative" }}>
          <Search size={14} color="#9ca3af" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
          <input
            ref={searchInputRef}
            className="search-input"
            style={{ paddingLeft: 32 }}
            placeholder="Search by name, SKU, or category... ( / )"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
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

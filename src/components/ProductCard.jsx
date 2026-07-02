import { Package, ShoppingCart } from "lucide-react";
import { getLowStockThreshold } from "@/util/adminSystemSettings";

export default function ProductCard({ product, stock, onAddToCart }) {
  const id = product.id || product._id;
  const outOfStock = stock === 0 || stock === undefined || stock === null;
  const image = product.image || product.imageUrl;
  const categoryName = product.category?.name || "—";
  const price = product.sellingPrice || product.price || 0;
  const lowStockThreshold = getLowStockThreshold();

  const stockColor = outOfStock ? "#e53e3e" : stock <= lowStockThreshold ? "#d97706" : "#059669";
  const stockBg = outOfStock ? "#fff5f5" : stock <= lowStockThreshold ? "#fffbeb" : "#f0fdf4";
  const stockLabel = outOfStock ? "Out of Stock" : `${stock} in stock`;

  const handleAddProductToCart = () => {
    if (outOfStock) return;
    onAddToCart({ ...product, id, stock });
  };

  return (
    <div
      className="prod-card"
      style={{ opacity: outOfStock ? 0.55 : 1, cursor: outOfStock ? "not-allowed" : "pointer" }}
      onClick={handleAddProductToCart}
    >
      {/* Image */}
      <div className="prod-img">
        {image ? (
          <img src={image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f0f0" }}>
            <Package size={28} color="#c4c9d4" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="prod-info">
        {/* Category */}
        <span className="prod-tag" style={{ alignSelf: "flex-start" }}>{categoryName}</span>

        {/* Name */}
        <div className="prod-name">{product.name}</div>

        {/* SKU */}
        {product.sku && <div className="prod-sku">SKU: {product.sku}</div>}

        {/* Inventory */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 1 }}>
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            padding: "2px 7px",
            borderRadius: 20,
            color: stockColor,
            background: stockBg,
          }}>
            {stockLabel}
          </span>
        </div>

        {/* Price + Add */}
        <div className="prod-footer">
          <span className="prod-price">रु {price.toLocaleString()}</span>
          <button
            className="prod-add-btn"
            disabled={outOfStock}
            onClick={(e) => { e.stopPropagation(); handleAddProductToCart(); }}
            style={{ opacity: outOfStock ? 0.4 : 1, cursor: outOfStock ? "not-allowed" : "pointer" }}
          >
            <ShoppingCart size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

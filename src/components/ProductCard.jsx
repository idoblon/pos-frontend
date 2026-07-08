import { Package, ShoppingCart } from "lucide-react";
import { getLowStockThreshold } from "@/util/adminSystemSettings";

export default function ProductCard({ product, stock, onAddToCart }) {
  const id = product.id || product._id;
  const outOfStock = stock === 0 || stock === undefined || stock === null;
  const image = product.image || product.imageUrl;
  const price = product.sellingPrice || product.price || 0;
  const lowStockThreshold = getLowStockThreshold();
  const productName = product.name || "Unnamed product";
  const sku = product.sku || "No SKU";

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
          <img className="prod-img-el" src={image} alt={productName} />
        ) : (
          <div className="prod-img-empty">
            <Package size={28} color="#c4c9d4" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="prod-info">
        {/* Name */}
        <div className="prod-name" title={productName}>{productName}</div>

        {/* SKU */}
        <div className="prod-sku" title={`SKU: ${sku}`}>SKU: {sku}</div>

        {/* Inventory */}
        <div className="prod-stock-row">
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

import { Package, ShoppingCart } from "lucide-react";
import { getLowStockThreshold } from "@/util/adminSystemSettings";
import { formatMoney } from "@/util/currency";
import {
  getBulkRule,
  getBulkTiers,
  getVariantLabel,
  isControlled,
  isExpired,
  isNearExpiry,
  requiresPrescription,
} from "@/util/storeTypes";

export default function ProductCard({ product, stock, onAddToCart }) {
  const id = product.id || product._id;
  const image = product.image || product.imageUrl;
  const price = product.sellingPrice || product.price || 0;
  const lowStockThreshold = getLowStockThreshold();
  const productName = product.name || "Unnamed product";
  const sku = product.sku || "No SKU";
  const expired = isExpired(product);
  const nearExpiry = !expired && isNearExpiry(product);
  const outOfStock = expired || stock === 0 || stock === undefined || stock === null;
  const bulk = getBulkRule(product);
  const tiers = getBulkTiers(product);
  const variantLabel = getVariantLabel(product);
  const needsRx = requiresPrescription(product);
  const controlled = isControlled(product);
  const moq = Number(product.moq ?? product.minOrderQty ?? 0) || 0;
  const warranty = product.warrantyMonths ?? product.warranty;
  const unit = product.unit;
  const batch = product.batchNumber || product.batch;

  const stockColor = outOfStock ? "#e53e3e" : stock <= lowStockThreshold ? "#d97706" : "#059669";
  const stockBg = outOfStock ? "#fff5f5" : stock <= lowStockThreshold ? "#fffbeb" : "#f0fdf4";
  const stockLabel = expired ? "Expired" : outOfStock ? "Out of Stock" : `${stock} in stock`;

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

        {/* Vertical badges */}
        {(needsRx || controlled || nearExpiry || expired || variantLabel || unit || warranty || bulk || batch || moq > 1) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
            {needsRx && (
              <span style={{ fontSize: 9, fontWeight: 800, padding: "1px 6px", borderRadius: 20, background: "#fef3c7", color: "#92400e" }}>Rx</span>
            )}
            {controlled && (
              <span style={{ fontSize: 9, fontWeight: 800, padding: "1px 6px", borderRadius: 20, background: "#fee2e2", color: "#991b1b" }}>Controlled</span>
            )}
            {moq > 1 && (
              <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 20, background: "#fef3c7", color: "#92400e" }}>MOQ {moq}</span>
            )}
            {expired && (
              <span style={{ fontSize: 9, fontWeight: 800, padding: "1px 6px", borderRadius: 20, background: "#fee2e2", color: "#991b1b" }}>Expired</span>
            )}
            {!expired && nearExpiry && (
              <span style={{ fontSize: 9, fontWeight: 800, padding: "1px 6px", borderRadius: 20, background: "#ffedd5", color: "#9a3412" }}>Expiring</span>
            )}
            {variantLabel && (
              <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 20, background: "#f1f5f9", color: "#475569" }}>{variantLabel}</span>
            )}
            {unit && unit !== "pcs" && (
              <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 20, background: "#f1f5f9", color: "#475569" }}>/{unit}</span>
            )}
            {warranty ? (
              <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 20, background: "#ede9fe", color: "#5b21b6" }}>{warranty}mo warranty</span>
            ) : null}
            {bulk && (
              <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 20, background: "#ecfdf5", color: "#065f46" }}>
                Bulk {tiers.length > 1 ? `${tiers.length} tiers` : `${bulk.minQty}+`}
              </span>
            )}
            {batch && (
              <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 20, background: "#f1f5f9", color: "#475569" }}>B:{batch}</span>
            )}
          </div>
        )}

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
          <span className="prod-price">{formatMoney(price)}</span>
          <button
            className="prod-add-btn"
            aria-label={`Add ${productName} to cart`}
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

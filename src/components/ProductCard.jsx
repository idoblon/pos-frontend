import { addToCart } from "@/Redux Toolkit/Features/Cart/cartSlice";
import { useDispatch } from "react-redux";
import { Package } from "lucide-react";

export default function ProductCard({ product, stock, onAddToCart }) {
  const id = product.id || product._id;
  const outOfStock = stock === 0;
  const dispatch = useDispatch();
  const image = product.image || product.imageUrl;
  const description = product.description || product.desciption;
  const categoryName = product.category?.name || "—";
  const price = product.sellingPrice || product.price || 0;

  const handleAddProductToCart = () => {
    dispatch(addToCart(product));
  };

  return (
    <div
      className="prod-card"
      onClick={() => !outOfStock && onAddToCart({ ...product, id })}
      style={{ opacity: outOfStock ? 0.5 : 1, cursor: outOfStock ? "not-allowed" : "pointer" }}
      title={description || product.name}
    >
      <div className="prod-img">
        {image ? (
          <img src={image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5", borderRadius: 8 }}>
            <Package size={32} color="#d1d5db" />
          </div>
        )}
      </div>
      <div className="prod-info">
        <div className="prod-name">{product.name}</div>
        <div className="prod-sku">{product.sku}</div>
        {description && (
          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {description}
          </div>
        )}
        <div className="prod-meta">
          <span className="prod-price">रु {price}</span>
          <span className="prod-tag">{categoryName}</span>
        </div>
        <div style={{ fontSize: 10, marginTop: 3, color: outOfStock ? "#e53e3e" : stock <= 10 ? "#d97706" : "#1a1d23", fontWeight: 600 }}>
          {outOfStock ? "Out of Stock" : `Stock: ${stock}`}
        </div>
      </div>
    </div>
  );
}
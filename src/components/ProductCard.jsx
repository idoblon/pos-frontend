import { addToCart } from "@/Redux Toolkit/Features/Cart/cartSlice";
import { useDispatch } from "react-redux";

export default function ProductCard({ product, stock, onAddToCart }) {
  const id = product.id || product._id;
  const outOfStock = stock === 0;
  const dispatch=useDispatch();

  const handleAddProductToCart=()=>{
    dispatch(addToCart(product))
  }

  return (
    <div
      className="prod-card"
      onClick={() => !outOfStock && onAddToCart({ ...product, id })}
      style={{ opacity: outOfStock ? 0.5 : 1, cursor: outOfStock ? "not-allowed" : "pointer" }}
    >
      <div className="prod-img">🌿</div>
      <div className="prod-info">
        <div className="prod-name">{product.name}</div>
        <div className="prod-sku">{product.sku}</div>
        <div className="prod-meta">
          <span className="prod-price">रु {product.price}</span>
          <span className="prod-tag">{product.category ?? "—"}</span>
        </div>
        <div style={{ fontSize: 10, marginTop: 3, color: outOfStock ? "#e53e3e" : stock <= 10 ? "#d97706" : "#1a1d23", fontWeight: 600 }}>
          {outOfStock ? "Out of Stock" : `Stock: ${stock}`}
        </div>
      </div>
    </div>
  );
}
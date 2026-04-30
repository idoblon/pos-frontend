import { useState } from "react";
import ProductSection from "./ProductSection/ProductSection";
import CartSection from "./CartSection/CartSection";
import CustomerPaymentSection from "./CustomerPaymentSection/CustomerPaymentSection";

export default function CreateOrder() {
  const [cart, setCart] = useState([]);

  const handleAddToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      setCart(cart.filter((item) => item.id !== productId));
    } else {
      setCart(
        cart.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const handleRemoveItem = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const handleOrderComplete = () => {
    setCart([]);
  };

  return (
    <div className="h-full flex gap-4 p-4">
      {/* Left: Product Search & Display */}
      <div className="flex-1">
        <ProductSection onAddToCart={handleAddToCart} />
      </div>

      {/* Middle: Cart */}
      <div className="w-96">
        <CartSection
          cart={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
        />
      </div>

      {/* Right: Customer & Payment */}
      <div className="w-80">
        <CustomerPaymentSection cart={cart} onOrderComplete={handleOrderComplete} />
      </div>
    </div>
  );
}

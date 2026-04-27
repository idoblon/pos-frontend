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
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Create Order</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProductSection onAddToCart={handleAddToCart} />
        </div>
        <div className="space-y-6">
          <CartSection
            cart={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
          />
          <CustomerPaymentSection cart={cart} onOrderComplete={handleOrderComplete} />
        </div>
      </div>
    </div>
  );
}

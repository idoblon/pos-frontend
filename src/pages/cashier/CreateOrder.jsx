import React from 'react';
import { useDispatch } from 'react-redux';
import ProductSection from './ProductSection/ProductSection';
import CartSection from './CartSection/CartSection';
import CustomerPaymentSection from './CustomerPaymentSection/CustomerPaymentSection';
import { addToCart, clearCart } from '@/Redux Toolkit/Features/Cart/cartSlice';

export default function CreateOrder() {
  const dispatch = useDispatch();

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
  };

  const handleOrderComplete = () => {
    dispatch(clearCart());
  };

  return (
    <div className="h-full flex gap-4 p-4">
      {/* Left: Product Search & Display */}
      <div className="flex-1">
        <ProductSection onAddToCart={handleAddToCart} />
      </div>

      {/* Middle: Cart */}
      <div className="w-96">
        <CartSection />
      </div>

      {/* Right: Customer & Payment */}
      <div className="w-80">
        <CustomerPaymentSection onOrderComplete={handleOrderComplete} />
      </div>
    </div>
  );
}

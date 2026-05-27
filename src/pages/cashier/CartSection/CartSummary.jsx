import React from 'react';
import { useSelector } from 'react-redux';
import { Separator } from '@/components/ui/separator';
import {
  selectSubtotal,
  selectTax,
  selectDiscountAmount,
  selectTotal,
  selectDiscount,
  selectCartItemsCount
} from '@/Redux Toolkit/Features/Cart/cartSlice';

const CartSummary = () => {
  const itemsCount = useSelector(selectCartItemsCount);
  const subtotal = useSelector(selectSubtotal);
  const tax = useSelector(selectTax);
  const discountAmount = useSelector(selectDiscountAmount);
  const total = useSelector(selectTotal);
  const discount = useSelector(selectDiscount);

  if (itemsCount === 0) {
    return null;
  }

  return (
    <div className="animate-in slide-in-from-bottom-2 duration-300 bg-gray-50 p-4 rounded-lg border">
      <div className="space-y-3">
        <div className="flex justify-between text-sm transition-all duration-200">
          <span>Items ({itemsCount})</span>
          <span className="font-medium transition-all duration-200">रु{subtotal.toFixed(2)}</span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between text-sm text-gray-600 animate-in slide-in-from-right-2 duration-200">
            <span>
              Discount ({discount.type === 'percentage' ? `${discount.value}%` : 'Fixed'})
            </span>
            <span className="font-medium">-रु{discountAmount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm transition-all duration-200">
          <span>Tax (13%)</span>
          <span className="font-medium transition-all duration-200">रु{tax.toFixed(2)}</span>
        </div>

        <Separator className="transition-opacity duration-200" />

        <div className="flex justify-between text-lg font-bold transition-all duration-300">
          <span>Total</span>
          <span className="text-gray-900 transition-all duration-300 transform hover:scale-105">
            रु{total.toFixed(2)}
          </span>
        </div>

        <div className="text-xs text-gray-500 mt-2 transition-opacity duration-200">
          * All prices are inclusive of applicable taxes
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
import React from 'react';
import { useDispatch } from 'react-redux';
import { Trash2, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { updateCartItemQuantity, removeFromCart } from '@/Redux Toolkit/Features/Cart/cartSlice';

const CartItem = ({ item }) => {
  const dispatch = useDispatch();

  const handleUpdateQuantity = (newQuantity) => {
    if (newQuantity <= 0) {
      dispatch(removeFromCart(item.id));
    } else {
      dispatch(updateCartItemQuantity({ id: item.id, quantity: newQuantity }));
    }
  };

  const handleRemove = () => {
    dispatch(removeFromCart(item.id));
  };

  const price = item.price || item.sellingPrice || 0;
  const itemTotal = price * item.quantity;

  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate" title={item.name}>
          {item.name}
        </p>
        <p className="text-sm text-gray-500">
          रु{price.toFixed(2)} each
        </p>
        <p className="text-xs text-gray-400">
          SKU: {item.sku || 'N/A'}
        </p>
      </div>
      
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="outline"
            className="h-7 w-7"
            onClick={() => handleUpdateQuantity(item.quantity - 1)}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-8 text-center font-medium text-sm">
            {item.quantity}
          </span>
          <Button
            size="icon"
            variant="outline"
            className="h-7 w-7"
            onClick={() => handleUpdateQuantity(item.quantity + 1)}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="destructive"
            className="h-7 w-7 ml-2"
            onClick={handleRemove}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
        <p className="text-sm font-semibold text-gray-900">
          रु{itemTotal.toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export default CartItem;
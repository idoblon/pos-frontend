import React from 'react';
import { useSelector } from 'react-redux';
import { ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { selectCartItems, selectCartItemsCount } from '@/Redux Toolkit/Features/Cart/cartSlice';
import CartItem from './cartItem';
import CartSummary from './CartSummary';
import CartActions from './CartActions';

export default function CartSection() {
  const cartItems = useSelector(selectCartItems);
  const itemsCount = useSelector(selectCartItemsCount);

  return (
    <div className="flex flex-col">
      {itemsCount > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Cart ({itemsCount} items)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {cartItems.map((item, index) => (
              <div
                key={item.id}
                className="animate-in slide-in-from-top-2 duration-200"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CartItem item={item} />
              </div>
            ))}
            <CartSummary />
          </CardContent>
        </Card>
      )}

      {itemsCount > 0 && (
        <div className="mt-2">
          <CartActions />
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Percent, DollarSign, FileText, Trash2 } from 'lucide-react';
import {
  selectDiscount,
  selectCartNote,
  setDiscount,
  setNote,
  clearCart,
  selectCartItemsCount
} from '@/Redux Toolkit/Features/Cart/cartSlice';

const CartActions = () => {
  const dispatch = useDispatch();
  const discount = useSelector(selectDiscount);
  const note = useSelector(selectCartNote);
  const itemsCount = useSelector(selectCartItemsCount);
  
  const [discountValue, setDiscountValue] = useState(discount.value);
  const [discountType, setDiscountType] = useState(discount.type);
  const [noteText, setNoteText] = useState(note);

  const handleApplyDiscount = () => {
    dispatch(setDiscount({
      type: discountType,
      value: parseFloat(discountValue) || 0
    }));
  };

  const handleSaveNote = () => {
    dispatch(setNote(noteText));
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear the cart?')) {
      dispatch(clearCart());
    }
  };

  if (itemsCount === 0) {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Cart Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Discount Section */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Discount</Label>
          <div className="flex gap-2">
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (रु)</option>
            </select>
            <Input
              type="number"
              placeholder="0"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleApplyDiscount} size="sm">
              Apply
            </Button>
          </div>
          {discount.value > 0 && (
            <p className="text-xs text-gray-600">
              {discount.type === 'percentage' ? `${discount.value}% discount applied` : `रु${discount.value} discount applied`}
            </p>
          )}
        </div>

        {/* Note Section */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Order Note</Label>
          <Textarea
            placeholder="Add a note for this order..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={2}
          />
          <Button onClick={handleSaveNote} size="sm" variant="outline">
            Save Note
          </Button>
          {note && (
            <p className="text-xs text-gray-600">Note saved: {note}</p>
          )}
        </div>

        {/* Clear Cart */}
        <Button 
          onClick={handleClearCart} 
          variant="destructive" 
          size="sm" 
          className="w-full"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear Cart
        </Button>
      </CardContent>
    </Card>
  );
};

export default CartActions;
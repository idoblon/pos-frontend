# Payment Methods Testing Guide

## 💳 Payment Methods Available

1. **CASH** - Cash payment with change calculation
2. **CARD** - Credit/Debit card payment
3. **ESEWA** - Digital wallet payment

---

## 🧪 Test Cases

### 1. CASH Payment

#### Test Case 1.1: Valid Cash Payment (Exact Amount)
- **Steps:**
  1. Add items to cart (Total: रु 1000)
  2. Click "Process Payment"
  3. Select "Cash" payment method
  4. Enter amount received: रु 1000
  5. Click "Complete Payment"
- **Expected Result:** 
  - ✅ Order created successfully
  - ✅ Change: रु 0.00
  - ✅ Cart cleared

#### Test Case 1.2: Valid Cash Payment (More than Total)
- **Steps:**
  1. Add items to cart (Total: रु 1000)
  2. Click "Process Payment"
  3. Select "Cash" payment method
  4. Enter amount received: रु 1500
  5. Click "Complete Payment"
- **Expected Result:** 
  - ✅ Order created successfully
  - ✅ Change displayed: रु 500.00
  - ✅ Cart cleared

#### Test Case 1.3: Invalid Cash Payment (Less than Total)
- **Steps:**
  1. Add items to cart (Total: रु 1000)
  2. Click "Process Payment"
  3. Select "Cash" payment method
  4. Enter amount received: रु 500
  5. Click "Complete Payment"
- **Expected Result:** 
  - ❌ Error: "Amount received must be at least रु 1000.00"
  - ❌ Order NOT created

#### Test Case 1.4: Empty Cash Amount
- **Steps:**
  1. Add items to cart (Total: रु 1000)
  2. Click "Process Payment"
  3. Select "Cash" payment method
  4. Leave amount received empty
  5. Click "Complete Payment"
- **Expected Result:** 
  - ❌ Error: "Amount received must be at least रु 1000.00"
  - ❌ Order NOT created

---

### 2. CARD Payment

#### Test Case 2.1: Valid Card Payment
- **Steps:**
  1. Add items to cart (Total: रु 1000)
  2. Click "Process Payment"
  3. Select "Card" payment method
  4. Click "Complete Payment"
- **Expected Result:** 
  - ✅ Shows message: "💳 Please process the card payment of रु 1000.00"
  - ✅ Order created successfully
  - ✅ Amount received = Total (रु 1000)
  - ✅ Cart cleared

#### Test Case 2.2: Card Payment with Discount
- **Steps:**
  1. Add items to cart (Subtotal: रु 1000)
  2. Apply 10% discount
  3. Click "Process Payment"
  4. Select "Card" payment method
  5. Click "Complete Payment"
- **Expected Result:** 
  - ✅ Total calculated with discount
  - ✅ Order created with correct total
  - ✅ Cart cleared

---

### 3. ESEWA Payment

#### Test Case 3.1: Valid eSewa Payment
- **Steps:**
  1. Add items to cart (Total: रु 1000)
  2. Click "Process Payment"
  3. Select "eSewa" payment method
  4. Click "Complete Payment"
- **Expected Result:** 
  - ✅ Shows message: "📱 Please confirm eSewa payment of रु 1000.00"
  - ✅ Order created successfully
  - ✅ Amount received = Total (रु 1000)
  - ✅ Cart cleared

---

### 4. Edge Cases

#### Test Case 4.1: Empty Cart
- **Steps:**
  1. Open payment dialog with empty cart
  2. Click "Complete Payment"
- **Expected Result:** 
  - ❌ Error: "Please add items to the cart first."

#### Test Case 4.2: Demo Products
- **Steps:**
  1. Add demo products (IDs starting with 'p')
  2. Click "Process Payment"
  3. Select any payment method
  4. Click "Complete Payment"
- **Expected Result:** 
  - ❌ Error: "Cannot process order with invalid products. Please use real products from your inventory."

#### Test Case 4.3: Switch Payment Methods
- **Steps:**
  1. Add items to cart
  2. Select "Cash" and enter amount
  3. Switch to "Card"
  4. Switch back to "Cash"
- **Expected Result:** 
  - ✅ Amount input field appears/disappears correctly
  - ✅ Previous amount value retained

#### Test Case 4.4: Payment with Customer
- **Steps:**
  1. Add items to cart
  2. Select a customer
  3. Process payment with any method
- **Expected Result:** 
  - ✅ Customer name displayed in payment dialog
  - ✅ Order linked to customer

#### Test Case 4.5: Payment with Discount
- **Steps:**
  1. Add items to cart (Subtotal: रु 1000)
  2. Apply discount (10% or रु 100)
  3. Process payment
- **Expected Result:** 
  - ✅ Total reflects discount
  - ✅ Order created with correct discount

---

## 📊 Order Data Structure

```json
{
  "customerId": 123 or null,
  "items": [
    {
      "productId": 456,
      "quantity": 2,
      "price": 500
    }
  ],
  "discount": 10,
  "discountType": "percentage",
  "note": "Optional note",
  "paymentMethod": "CASH" | "CARD" | "ESEWA",
  "amountReceived": 1500,
  "total": 1000
}
```

---

## 🔍 Backend Validation Required

The backend should validate:
1. ✅ All product IDs exist
2. ✅ Product prices match
3. ✅ Total calculation is correct
4. ✅ Payment method is valid
5. ✅ For CASH: amountReceived >= total
6. ✅ Customer ID exists (if provided)
7. ✅ Discount is valid

---

## 🐛 Known Issues

1. **Demo Products**: Cannot process orders with demo products (IDs: p1, p2, etc.)
   - **Solution**: Use real products from inventory

2. **Token Expiry**: If token expires during payment
   - **Solution**: User redirected to login automatically

3. **Network Timeout**: Request timeout after 10 seconds
   - **Solution**: Check backend connectivity

---

## ✅ Payment Flow Summary

### CASH Payment Flow:
1. Select CASH → Enter amount → Validate (amount >= total) → Create order → Show success

### CARD Payment Flow:
1. Select CARD → Show confirmation message → Create order → Show success

### ESEWA Payment Flow:
1. Select ESEWA → Show confirmation message → Create order → Show success

---

## 🎯 Testing Checklist

- [ ] Cash payment with exact amount
- [ ] Cash payment with more than total (change calculation)
- [ ] Cash payment with less than total (error)
- [ ] Cash payment with empty amount (error)
- [ ] Card payment (no amount input required)
- [ ] eSewa payment (no amount input required)
- [ ] Payment with customer selected
- [ ] Payment without customer
- [ ] Payment with percentage discount
- [ ] Payment with fixed discount
- [ ] Payment with order note
- [ ] Empty cart error
- [ ] Demo products error
- [ ] Switch between payment methods
- [ ] Cancel payment dialog
- [ ] Success message and cart clearing

---

## 📝 Notes

- **CASH**: Requires amount input and validation
- **CARD/ESEWA**: No amount input needed, uses total directly
- **Change Calculation**: Only for CASH payments
- **Amount Received**: 
  - CASH: User input value
  - CARD/ESEWA: Automatically set to total

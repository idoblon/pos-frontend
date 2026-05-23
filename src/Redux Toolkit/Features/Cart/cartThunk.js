import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/util/api';
import { getAuthHeaders } from '@/util/getAuthHeader';

// Save cart to server (for persistent cart across sessions)
export const saveCartToServer = createAsyncThunk(
  'cart/saveToServer',
  async (cartData, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const response = await api.post('/api/cart/save', cartData, { headers });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save cart');
    }
  }
);

// Load cart from server
export const loadCartFromServer = createAsyncThunk(
  'cart/loadFromServer',
  async (_, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const response = await api.get('/api/cart/load', { headers });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load cart');
    }
  }
);

// Apply coupon/discount
export const applyCoupon = createAsyncThunk(
  'cart/applyCoupon',
  async (couponCode, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const response = await api.post('/api/cart/apply-coupon', { couponCode }, { headers });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Invalid coupon code');
    }
  }
);

export default {
  saveCartToServer,
  loadCartFromServer,
  applyCoupon,
};
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/util/api";
import { getAuthHeaders } from "@/util/getAuthHeader";
import { sanitizePathParams } from "@/util/urlValidator";
import { sanitizeFormData, sanitizeInput } from "@/util/inputValidator";

// Validate product data
const validateProductData = (data) => {
  const errors = {};
  
  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Product name must be at least 2 characters';
  }
  
  if (!data.sku || data.sku.trim().length < 3) {
    errors.sku = 'SKU must be at least 3 characters';
  }
  
  if (!data.sellingPrice || data.sellingPrice <= 0) {
    errors.sellingPrice = 'Selling price must be greater than 0';
  }
  
  if (!data.mrp || data.mrp <= 0) {
    errors.mrp = 'MRP must be greater than 0';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const createProduct = createAsyncThunk(
  "product/create",
  async (dto, { rejectWithValue }) => {
    try {
      // Validate product data
      const validation = validateProductData(dto);
      if (!validation.isValid) {
        return rejectWithValue(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
      }

      const sanitizedData = sanitizeFormData(dto);
      const headers = getAuthHeaders();
      const res = await api.post(`/api/products`, sanitizedData, { headers });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create product");
    }
  },
);

export const updateProduct = createAsyncThunk(
  "product/update",
  async ({ id, dto }, { rejectWithValue }) => {
    try {
      // Validate product data
      const validation = validateProductData(dto);
      if (!validation.isValid) {
        return rejectWithValue(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
      }

      const sanitizedParams = sanitizePathParams({ id });
      const sanitizedData = sanitizeFormData(dto);
      const headers = getAuthHeaders();
      const res = await api.patch(`/api/products/${sanitizedParams.id}`, sanitizedData, { headers });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update product");
    }
  },
);

export const deleteProduct = createAsyncThunk(
  "product/delete",
  async (id, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ id });
      const headers = getAuthHeaders();
      const res = await api.delete(`/api/products/${sanitizedParams.id}`, { headers });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete product");
    }
  },
);

export const getProductsByStore = createAsyncThunk(
  "product/getByStore",
  async (storeId, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ storeId });
      const headers = getAuthHeaders();
      
      const res = await api.get(`/api/products/store/${sanitizedParams.storeId}`, { headers });
      
      return res.data;
    } catch (error) {
      console.error("❌ PRODUCT API ERROR:", error.response?.status, error.response?.data);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch store products");
    }
  },
);

export const searchProducts = createAsyncThunk(
  "product/search",
  async ({ storeId, query }, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ storeId });
      const sanitizedQuery = sanitizeInput(query);
      
      if (!sanitizedQuery || sanitizedQuery.trim().length < 2) {
        return rejectWithValue("Search query must be at least 2 characters");
      }
      
      const headers = getAuthHeaders();
      const res = await api.get(
        `/api/products/store/${sanitizedParams.storeId}/search?q=${encodeURIComponent(sanitizedQuery)}`,
        { headers },
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to search products");
    }
  },
);

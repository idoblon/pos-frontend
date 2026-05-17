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
      console.log("product create success", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error);
      return rejectWithValue(error.response?.data?.message || "Failed to create product");
    }
  },
);

export const getProductById = createAsyncThunk(
  "product/getById",
  async (id, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ id });
      const headers = getAuthHeaders();
      const res = await api.get(`/api/products/${sanitizedParams.id}`, { headers });
      console.log("get product success", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch product");
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
      console.log("product update success", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error);
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
      console.log("product delete success", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error);
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
      console.log("get store product success", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch store products");
    }
  },
);

export const getProductsByBranch = createAsyncThunk(
  "product/getByBranch",
  async ({ branchId }, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ branchId });
      const headers = getAuthHeaders();
      const res = await api.get(`/api/products/branch/${sanitizedParams.branchId}`, { headers });
      console.log("get branch product success", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch branch products");
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
      console.log("product search success", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error);
      return rejectWithValue(error.response?.data?.message || "Failed to search products");
    }
  },
);

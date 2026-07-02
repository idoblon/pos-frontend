import { getAuthHeaders } from "@/util/getAuthHeader";
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/util/api";
import { sanitizePathParams } from "@/util/urlValidator";
import { sanitizeFormData, validateEmail, validatePhone } from "@/util/inputValidator";
import secureStorage from "@/util/secureStorage";

// Validate customer data
const validateCustomerData = (data) => {
  const errors = {};
  
  if (!data.fullName || data.fullName.trim().length < 2) {
    errors.fullName = 'Customer full name must be at least 2 characters';
  }
  
  if (data.email && !validateEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (data.phone && !validatePhone(data.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

const getStoreId = () => {
  const userData = secureStorage.getUserData();
  return userData?.storeId || null;
};

export const createCustomer = createAsyncThunk("customer/create",
  async (customer, { rejectWithValue }) => {
    try {
      const storeId = getStoreId();
      if (!storeId) return rejectWithValue("Store context missing. Please log in again.");

      const validation = validateCustomerData(customer);
      if (!validation.isValid) {
        return rejectWithValue(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
      }

      const sanitizedData = { ...sanitizeFormData(customer), storeId };
      const headers = getAuthHeaders();
      const res = await api.post(`/api/customers`, sanitizedData, { headers });
      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to create customer");
    }
  }
);

export const updateCustomer = createAsyncThunk("customer/update",
  async ({ id, customer }, { rejectWithValue }) => {
    try {
      const storeId = getStoreId();
      if (!storeId) return rejectWithValue("Store context missing. Please log in again.");

      const validation = validateCustomerData(customer);
      if (!validation.isValid) {
        return rejectWithValue(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
      }

      const sanitizedParams = sanitizePathParams({ id });
      const sanitizedData = { ...sanitizeFormData(customer), storeId };
      const headers = getAuthHeaders();
      const res = await api.put(`/api/customers/${sanitizedParams.id}?storeId=${storeId}`, sanitizedData, { headers });
      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to update customer");
    }
  }
);

export const deleteCustomer = createAsyncThunk("customer/delete",
  async (id, { rejectWithValue }) => {
    try {
      const storeId = getStoreId();
      if (!storeId) return rejectWithValue("Store context missing. Please log in again.");

      const sanitizedParams = sanitizePathParams({ id });
      const headers = getAuthHeaders();
      const res = await api.delete(`/api/customers/${sanitizedParams.id}?storeId=${storeId}`, { headers });
      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to delete customer");
    }
  }
);

export const getCustomerById = createAsyncThunk("customer/getById",
  async (id, { rejectWithValue }) => {
    try {
      const storeId = getStoreId();
      if (!storeId) return rejectWithValue("Store context missing. Please log in again.");

      const sanitizedParams = sanitizePathParams({ id });
      const headers = getAuthHeaders();
      const res = await api.get(`/api/customers/${sanitizedParams.id}?storeId=${storeId}`, { headers });
      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to fetch customer by id");
    }
  }
);

export const getAllCustomers = createAsyncThunk("customer/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const storeId = getStoreId();
      if (!storeId) return rejectWithValue("Store context missing. Please log in again.");

      const headers = getAuthHeaders();
      const res = await api.get(`/api/customers?storeId=${storeId}`, { headers });
      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to fetch all customers");
    }
  }
);

export const searchCustomers = createAsyncThunk("customer/search",
  async (query, { rejectWithValue }) => {
    try {
      const storeId = getStoreId();
      if (!storeId) return rejectWithValue("Store context missing. Please log in again.");

      if (!query || query.trim().length < 2) {
        return rejectWithValue("Search query must be at least 2 characters");
      }

      const sanitizedQuery = encodeURIComponent(query.trim());
      const headers = getAuthHeaders();
      const res = await api.get(`/api/customers/search?q=${sanitizedQuery}&storeId=${storeId}`, { headers });
      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to search customers");
    }
  }
);

import { getAuthHeaders } from "@/util/getAuthHeader";
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/util/api";
import { sanitizePathParams } from "@/util/urlValidator";
import { sanitizeFormData, validateEmail, validatePhone } from "@/util/inputValidator";

// Validate customer data
const validateCustomerData = (data) => {
  const errors = {};
  
  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Customer name must be at least 2 characters';
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

export const createCustomer = createAsyncThunk("customer/create",
  async (customer, { rejectWithValue }) => {
    try {
      // Validate customer data
      const validation = validateCustomerData(customer);
      if (!validation.isValid) {
        return rejectWithValue(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
      }

      const sanitizedData = sanitizeFormData(customer);
      const headers = getAuthHeaders();
      const res = await api.post(`/api/customers`, sanitizedData, { headers });
      console.log("create customer success", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error?.response?.data);
      return rejectWithValue(error?.response?.data?.message || "Failed to create customer");
    }
  }
);   

export const updateCustomer = createAsyncThunk("customer/update",
  async ({ id, customer }, { rejectWithValue }) => {
    try {
      // Validate customer data
      const validation = validateCustomerData(customer);
      if (!validation.isValid) {
        return rejectWithValue(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
      }

      const sanitizedParams = sanitizePathParams({ id });
      const sanitizedData = sanitizeFormData(customer);
      const headers = getAuthHeaders();
      const res = await api.put(`/api/customers/${sanitizedParams.id}`, sanitizedData, { headers });
      console.log("update customer success", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error?.response?.data);
      return rejectWithValue(error?.response?.data?.message || "Failed to update customer");
    }
  }
);   

export const deleteCustomer = createAsyncThunk("customer/delete",
  async (id, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ id });
      const headers = getAuthHeaders();
      const res = await api.delete(`/api/customers/${sanitizedParams.id}`, { headers });
      console.log("delete customer success", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error?.response?.data);
      return rejectWithValue(error?.response?.data?.message || "Failed to delete customer");
    }
  }
);   

export const getCustomerById = createAsyncThunk("customer/getById",
  async (id, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ id });
      const headers = getAuthHeaders();
      const res = await api.get(`/api/customers/${sanitizedParams.id}`, { headers });
      console.log("get customer by id success", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error?.response?.data);
      return rejectWithValue(error?.response?.data?.message || "Failed to fetch customer by id");
    }
  }
);   

export const getAllCustomers = createAsyncThunk("customer/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get(`/api/customers`, { headers });
      console.log("get All customer success", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error?.response?.data);
      return rejectWithValue(error?.response?.data?.message || "Failed to fetch all customers");
    }
  }
);

export const searchCustomers = createAsyncThunk("customer/search",
  async (query, { rejectWithValue }) => {
    try {
      if (!query || query.trim().length < 2) {
        return rejectWithValue("Search query must be at least 2 characters");
      }
      
      const sanitizedQuery = encodeURIComponent(query.trim());
      const headers = getAuthHeaders();
      const res = await api.get(`/api/customers/search?q=${sanitizedQuery}`, { headers });
      console.log("search customers success", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error?.response?.data);
      return rejectWithValue(error?.response?.data?.message || "Failed to search customers");
    }
  }
);

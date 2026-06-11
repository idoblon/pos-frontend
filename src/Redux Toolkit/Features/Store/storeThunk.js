import api from "@/util/api";
import { getAuthHeaders } from "@/util/getAuthHeader";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { sanitizePathParams } from "@/util/urlValidator";
import { sanitizeFormData, sanitizeInput } from "@/util/inputValidator";
import { mergeRegistrationDataWithStores } from "@/util/registrationDataMerger";

// Validate store data
const validateStoreData = (data) => {
  const errors = {};
  
  if (!data.brand || data.brand.trim().length < 2) {
    errors.brand = 'Store brand must be at least 2 characters';
  }
  
  // contact fields are optional — only validate email format if provided
  if (data.contact?.email && !/\S+@\S+\.\S+/.test(data.contact.email)) {
    errors.email = 'Invalid contact email format';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const createStore = createAsyncThunk(
  "/store/create",
  async (storeData, { rejectWithValue }) => {
    try {
      // Validate store data
      const validation = validateStoreData(storeData);
      if (!validation.isValid) {
        return rejectWithValue(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
      }

      const sanitizedData = sanitizeFormData(storeData);
      const headers = getAuthHeaders();
      const res = await api.post(`/api/stores`, sanitizedData, { headers });
      console.log("create store success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create store");
    }
  },
);

export const getStoreById = createAsyncThunk(
  "/store/getById",
  async (id, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ id });
      const headers = getAuthHeaders();
      const res = await api.get(`/api/stores/${sanitizedParams.id}`, { headers });
      console.log("get store success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch store");
    }
  },
);

export const getAllStores = createAsyncThunk(
  "/store/getAll",
  async (status, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const params = {};
      
      if (status) {
        const sanitizedStatus = sanitizeInput(status);
        // Validate status against allowed values
        const allowedStatuses = ['PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED'];
        if (allowedStatuses.includes(sanitizedStatus)) {
          params.status = sanitizedStatus;
        }
      }
      
      const res = await api.get(`/api/stores`, {
        headers,
        params: Object.keys(params).length > 0 ? params : undefined,
      });
      console.log("get all stores success", res.data);
      const mergedStores = await mergeRegistrationDataWithStores(res.data, headers);
      return mergedStores;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch stores");
    }
  },
);

export const updateStore = createAsyncThunk(
  "/store/update",
  async ({ id, storeData }, { rejectWithValue }) => {
    try {
      // Validate store data
      const validation = validateStoreData(storeData);
      if (!validation.isValid) {
        return rejectWithValue(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
      }

      const sanitizedParams = sanitizePathParams({ id });
      const sanitizedData = sanitizeFormData(storeData);
      const headers = getAuthHeaders();
      const res = await api.put(`/api/stores/${sanitizedParams.id}`, sanitizedData, { headers });
      console.log("update store success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update store");
    }
  },
);

export const deleteStore = createAsyncThunk(
  "/store/delete",
  async (id, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ id });
      const headers = getAuthHeaders();
      const res = await api.delete(`/api/stores/${sanitizedParams.id}`, { headers });
      console.log("delete store success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete store");
    }
  },
);

export const getStoreByAdmin = createAsyncThunk(
  "/store/getByAdmin",
  async (_, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get(`/api/stores/admin`, { headers });
      console.log("get admin store success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch admin store");
    }
  },
);

export const getStoreByEmployee = createAsyncThunk(
  "/store/getStoreByEmployee",
  async (_, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get(`/api/stores/employee`, { headers });
      console.log("get employee store success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch employee store");
    }
  },
);

export const moderateStore = createAsyncThunk(
  "/store/moderateStore",
  async ({ storeId, action }, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ storeId });
      const sanitizedAction = sanitizeInput(action);
      
      // Validate action against allowed values
      const allowedActions = ['APPROVE', 'REJECT', 'SUSPEND', 'ACTIVATE'];
      if (!allowedActions.includes(sanitizedAction)) {
        return rejectWithValue('Invalid moderation action');
      }
      
      const headers = getAuthHeaders();
      const res = await api.put(
        `/api/stores/${sanitizedParams.storeId}/moderate`,
        {},
        { headers, params: { action: sanitizedAction } },
      );
      console.log("moderate store success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to moderate store");
    }
  },
);

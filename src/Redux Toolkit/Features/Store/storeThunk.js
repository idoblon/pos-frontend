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
  const email = data.email || data.contact?.email;
  if (email && !/\S+@\S+\.\S+/.test(email)) {
    errors.email = 'Invalid email format';
  }
  return { isValid: Object.keys(errors).length === 0, errors };
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
      return res.data;
    } catch (firstError) {
      // Previously registered stores may have store_admin_id NULL (the
      // back-link was only added to newer flows), so /api/stores/admin fails
      // with "No store found for current admin". GET /api/stores returns the
      // caller's own store for non-admin roles, so resolve through it
      // instead of failing every store-admin page.
      try {
        const headers = getAuthHeaders();
        const res = await api.get(`/api/stores`, { headers });
        const raw = res.data;
        const list = Array.isArray(raw)
          ? raw
          : raw?.content || raw?.data || raw?.stores || [];
        const own = (Array.isArray(list) ? list : []).filter((s) => !s?.isRegistrationOnly)[0]
          || list[0];
        if (own) return own;
      } catch { /* fall through to the original error below */ }
      return rejectWithValue(firstError.response?.data?.message || "Failed to fetch admin store");
    }
  },
);

export const getStoreByEmployee = createAsyncThunk(
  "/store/getStoreByEmployee",
  async (_, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get(`/api/stores/employee`, { headers });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch employee store");
    }
  },
);

export const getEnabledPaymentMethods = createAsyncThunk(
  "/store/getEnabledPaymentMethods",
  async () => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get(`/api/payment-config/store/enabled`, { headers });
      return res.data;
    } catch {
      // If no config exists yet, return all methods as enabled
      return [];
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
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to moderate store");
    }
  },
);

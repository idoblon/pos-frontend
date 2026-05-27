import { getAuthHeaders } from "@/util/getAuthHeader";
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/util/api";
import { sanitizePathParams } from "@/util/urlValidator";
import { sanitizeFormData } from "@/util/inputValidator";

// Validate branch data
const validateBranchData = (data) => {
  const errors = {};
  
  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Branch name must be at least 2 characters';
  }
  
  if (!data.address || data.address.trim().length < 3) {
    errors.address = 'Address is required';
  }
  
  // storeId or store.id is required
  if (!data.storeId && !data.store?.id) {
    errors.storeId = 'Store ID is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
};

export const createBranch = createAsyncThunk(
  "branch/create",
  async (dto, { rejectWithValue }) => {
    try {
      // Validate branch data
      const validation = validateBranchData(dto);
      if (!validation.isValid) {
        return rejectWithValue(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
      }

      const sanitizedData = sanitizeFormData(dto);
      const headers = getAuthHeaders();
      const res = await api.post(`/api/branches`, sanitizedData, { headers });
      console.log("branch created successfully", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error);
      return rejectWithValue(
        error.response?.data.message || "Failed to create branch",
      );
    }
  },
);

export const getBranchById = createAsyncThunk(
  "branch/getById",
  async (id, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ id });
      const headers = getAuthHeaders();
      const res = await api.get(`/api/branches/${sanitizedParams.id}`, { headers });
      console.log("get branch successfully", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error);
      return rejectWithValue(
        error.response?.data.message || "Failed to get branch",
      );
    }
  },
);

export const getBranchesByStore = createAsyncThunk(
  "branch/getAllByStore",
  async (id, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ id });
      const headers = getAuthHeaders();
      const res = await api.get(`/api/branches/stores/${sanitizedParams.id}`, { headers });
      console.log("get store branches successfully", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error);
      return rejectWithValue(
        error.response?.data.message || "Failed to fetch store branches",
      );
    }
  },
);

export const updateBranch = createAsyncThunk(
  "branch/update",
  async ({ id, dto }, { rejectWithValue }) => {
    try {
      // Validate branch data
      const validation = validateBranchData(dto);
      if (!validation.isValid) {
        return rejectWithValue(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
      }

      const sanitizedParams = sanitizePathParams({ id });
      const sanitizedData = sanitizeFormData(dto);
      const headers = getAuthHeaders();
      const res = await api.put(`/api/branches/${sanitizedParams.id}`, sanitizedData, { headers });
      console.log("update branch successfully", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error);
      return rejectWithValue(
        error.response?.data.message || "Failed to update the branch",
      );
    }
  },
);

export const deleteBranch = createAsyncThunk(
  "branch/delete",
  async (id, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ id });
      const headers = getAuthHeaders();
      const res = await api.delete(`/api/branches/${sanitizedParams.id}`, { headers });
      console.log("delete branch successfully", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error);
      return rejectWithValue(
        error.response?.data.message || "Failed to delete branch",
      );
    }
  },
);
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/util/api";
import { getAuthHeaders } from "@/util/getAuthHeader";
import { sanitizePathParams } from "@/util/urlValidator";
import { sanitizeFormData, sanitizeInput } from "@/util/inputValidator";

// Validate refund data
const validateRefundData = (data) => {
  const errors = {};
  
  if (!data.orderId) {
    errors.orderId = 'Order ID is required';
  }
  
  if (!data.reason || data.reason.trim().length < 5) {
    errors.reason = 'Refund reason must be at least 5 characters';
  }
  
  if (!data.amount || data.amount <= 0) {
    errors.amount = 'Refund amount must be greater than 0';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Validate date format
const validateDateFormat = (dateString) => {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString.match(/^\d{4}-\d{2}-\d{2}/);
};

export const createRefund = createAsyncThunk(
  "refund/createRefund",
  async (refundDTO, { rejectWithValue }) => {
    try {
      // Validate refund data
      const validation = validateRefundData(refundDTO);
      if (!validation.isValid) {
        return rejectWithValue(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
      }

      const sanitizedData = sanitizeFormData(refundDTO);
      const headers = getAuthHeaders();
      const res = await api.post("/api/refunds", sanitizedData, { headers });
      console.log("create refund success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create refund",
      );
    }
  },
);

export const getAllRefund = createAsyncThunk(
  "refund/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get("/api/refunds", { headers });
      console.log("get All refund success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get all refunds",
      );
    }
  },
);

export const getRefundsByCashier = createAsyncThunk(
  "refund/getByCashier",
  async (cashierId, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ cashierId });
      const headers = getAuthHeaders();
      const res = await api.get(`/api/refunds/cashier/${sanitizedParams.cashierId}`, { headers });
      console.log("get refund by cashier success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get refund by cashier",
      );
    }
  },
);

export const getRefundsByBranch = createAsyncThunk(
  "refund/getByBranch",
  async (branchId, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ branchId });
      const headers = getAuthHeaders();
      const res = await api.get(`/api/refunds/branch/${sanitizedParams.branchId}`, { headers });
      console.log("get refund by branch success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get refunds by branch",
      );
    }
  },
);

export const getRefundsByShift = createAsyncThunk(
  "refund/getByShift",
  async (shiftReportId, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ shiftReportId });
      const headers = getAuthHeaders();
      const res = await api.get(`/api/refunds/shift/${sanitizedParams.shiftReportId}`, { headers });
      console.log("get refund by shift success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get refund by shift",
      );
    }
  },
);

export const getRefundByCashierAndDateRange = createAsyncThunk(
  "refund/getByCashierAndDateRange",
  async ({ cashierId, from, to }, { rejectWithValue }) => {
    try {
      // Validate inputs
      const sanitizedParams = sanitizePathParams({ cashierId });
      const sanitizedFrom = sanitizeInput(from);
      const sanitizedTo = sanitizeInput(to);
      
      // Validate date formats
      if (!validateDateFormat(sanitizedFrom)) {
        return rejectWithValue('Invalid from date format. Use YYYY-MM-DD');
      }
      
      if (!validateDateFormat(sanitizedTo)) {
        return rejectWithValue('Invalid to date format. Use YYYY-MM-DD');
      }
      
      const headers = getAuthHeaders();
      const formattedFrom = encodeURIComponent(sanitizedFrom);
      const formattedTo = encodeURIComponent(sanitizedTo);
      
      const res = await api.get(
        `/api/refunds/cashier/${sanitizedParams.cashierId}/range?from=${formattedFrom}&to=${formattedTo}`,
        { headers },
      );
      console.log("get by date range refund success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch refund by date range",
      );
    }
  },
);

export const getRefundById = createAsyncThunk(
  "refund/getById",
  async (refundId, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ refundId });
      const headers = getAuthHeaders();
      const res = await api.get(`/api/refunds/${sanitizedParams.refundId}`, { headers });
      console.log("get refund by id success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to get refund by id");
    }
  }
);

export const updateRefund = createAsyncThunk(
  "refund/update",
  async ({ id, refundData }, { rejectWithValue }) => {
    try {
      // Validate refund data
      const validation = validateRefundData(refundData);
      if (!validation.isValid) {
        return rejectWithValue(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
      }

      const sanitizedParams = sanitizePathParams({ id });
      const sanitizedData = sanitizeFormData(refundData);
      const headers = getAuthHeaders();
      const res = await api.put(`/api/refunds/${sanitizedParams.id}`, sanitizedData, { headers });
      console.log("update refund success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update refund");
    }
  }
);

export const deleteRefund = createAsyncThunk(
  "refund/delete",
  async (id, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ id });
      const headers = getAuthHeaders();
      const res = await api.delete(`/api/refunds/${sanitizedParams.id}`, { headers });
      console.log("delete refund success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete refund");
    }
  }
);

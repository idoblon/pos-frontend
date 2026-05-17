import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/util/api";
import { getAuthHeaders } from "@/util/getAuthHeader";
import { sanitizePathParams } from "@/util/urlValidator";
import { validateOrderData } from "@/util/inputValidator";

export const createOrder = createAsyncThunk(
  "order/create",
  async (dto, { rejectWithValue }) => {
    try {
      // Validate order data
      const validation = validateOrderData(dto);
      if (!validation.isValid) {
        return rejectWithValue(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
      }

      const headers = getAuthHeaders();
      const res = await api.post(`/api/orders`, dto, { headers });
      console.log("create order success", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error?.response?.data);
      return rejectWithValue(
        error?.response?.data?.message || "Failed to create order",
      );
    }
  },
);

export const getOrderById = createAsyncThunk(
  "order/getOrderById",
  async (id, { rejectWithValue }) => {
    try {
      // Sanitize path parameter
      const sanitizedParams = sanitizePathParams({ id });
      const headers = getAuthHeaders();
      const res = await api.get(`/api/orders/${sanitizedParams.id}`, { headers });
      console.log("fetch order success", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error?.response?.data);
      return rejectWithValue(
        error?.response?.data?.message || "Failed to get order by id",
      );
    }
  },
);

export const getOrdersByBranch = createAsyncThunk(
  "order/getOrderByBranch",
  async (
    { branchId, customerId, cashierId, paymentId, status },
    { rejectWithValue },
  ) => {
    try {
      // Sanitize all parameters
      const sanitizedParams = sanitizePathParams({ 
        branchId, customerId, cashierId, paymentId, status 
      });
      
      const headers = getAuthHeaders();
      const param = [];
      if (sanitizedParams.customerId) param.push(`customerId=${sanitizedParams.customerId}`);
      if (sanitizedParams.cashierId) param.push(`cashierId=${sanitizedParams.cashierId}`);
      if (sanitizedParams.paymentId) param.push(`paymentId=${sanitizedParams.paymentId}`);
      if (sanitizedParams.status) param.push(`status=${sanitizedParams.status}`);
      
      const query = param.length ? `?${param.join("&")}` : "";
      const res = await api.get(`/api/orders/branch/${sanitizedParams.branchId}${query}`, { headers });
      console.log("fetch branch order success", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error?.response?.data);
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch branch orders",
      );
    }
  },
);

export const getOrdersByCashier = createAsyncThunk(
  "order/getOrderByCashier",
  async (id, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ id });
      const headers = getAuthHeaders();
      const res = await api.get(`/api/orders/cashier/${sanitizedParams.id}`, { headers });
      console.log("fetch cashier order success", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error?.response?.data);
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch cashier orders",
      );
    }
  },
);

export const getTodayOrdersByBranch = createAsyncThunk(
  "order/getTodayByBranch",
  async (id, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ id });
      const headers = getAuthHeaders();
      const res = await api.get(`/api/orders/today/branch/${sanitizedParams.id}`, { headers });
      console.log("fetch today branch order success", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error?.response?.data);
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch today branch orders",
      );
    }
  },
);

export const deleteOrder = createAsyncThunk(
  "order/delete",
  async (id, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ id });
      const headers = getAuthHeaders();
      const res = await api.delete(`/api/orders/${sanitizedParams.id}`, { headers });
      console.log("delete order success", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error?.response?.data);
      return rejectWithValue(
        error?.response?.data?.message || "Failed to delete order",
      );
    }
  },
);

export const getOrdersByCustomer = createAsyncThunk(
  "order/getById",
  async (id, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ id });
      const headers = getAuthHeaders();
      const res = await api.get(`/api/orders/customer/${sanitizedParams.id}`, { headers });
      console.log("fetch customer orders success", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error?.response?.data);
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch customer orders",
      );
    }
  },
);

export const getRecentOrdersByBranch = createAsyncThunk(
  "order/getRecentByBranch",
  async (id, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ id });
      const headers = getAuthHeaders();
      const res = await api.get(`/api/orders/recent/${sanitizedParams.id}`, { headers });
      console.log("fetch recent branch order success", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error?.response?.data);
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch recent branch orders",
      );
    }
  },
);
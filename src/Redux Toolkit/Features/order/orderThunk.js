import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/util/api";
import { getAuthHeaders } from "@/util/getAuthHeader";

export const createOrder = createAsyncThunk(
  "order/create",
  async (dto, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.post(`/api/orders`, dto, {
        headers,
      });
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
      const headers = getAuthHeaders();
      const res = await api.get(`/api/orders/${id}`, {
        headers,
      });
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
      const headers = getAuthHeaders();
      const param = [];
      if (customerId) param.push(`customerId=${customerId}`);
      if (cashierId) param.push(`cashierId=${cashierId}`);
      if (paymentId) param.push(`paymentId=${paymentId}`);
      if (status) param.push(`status=${status}`);
      const query = param.length ? `?${param.join("&")}` : "";
      const res = await api.get(`/api/orders/branch/${branchId}${query}`,  {
        headers,
      });
      console.log("fetch branch order success", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error?.response?.data);
      return rejectWithValue(
        error?.response?.data?.message || "Failed to branch order by id",
      );
    }
  },
);

export const getOrdersByCashier = createAsyncThunk(
  "order/getOrderByCashier",
  async (id, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get(`/api/orders/cashier/${id}`, {
        headers,
      });
      console.log("fetch cashier order success", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error?.response?.data);
      return rejectWithValue(
        error?.response?.data?.message || "Failed to cashier order",
      );
    }
  },
);


export const getTodayOrdersByBranch = createAsyncThunk(
  "order/getTodayByBranch",
  async (id, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get(`/api/orders/today/branch/${id}`,  {
        headers,
      });
      console.log("fetch today branch order success", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error?.response?.data);
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch today branch order ",
      );
    }
  },
);


export const deleteOrder = createAsyncThunk(
  "order/delete",
  async (id, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.delete(`/api/orders/${id}`,{
        headers,
      });
      console.log("delete order success", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error?.response?.data);
      return rejectWithValue(
        error?.response?.data?.message || "Failed to delete order ",
      );
    }
  },
);


export const getOrdersByCustomer = createAsyncThunk(
  "order/getById",
  async (id, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get(`/api/orders/customer/${id}`,  {
        headers,
      });
      console.log("fetch customer success", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error?.response?.data);
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch customer order ",
      );
    }
  },
);

export const getRecentOrdersByBranch = createAsyncThunk(
  "order/getRecentByBranch",
  async (id, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get(`/api/orders/recent/${id}`,  {
        headers,
      });
      console.log("fetch recent branch order success", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error?.response?.data);
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch reent branch order ",
      );
    }
  },
);
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/util/api";
import { getAuthHeaders } from "@/util/getAuthHeader";
import { sanitizePathParams } from "@/util/urlValidator";

export const getStoreAnalytics = createAsyncThunk(
  "analytics/getSummary",
  async ({ storeId, startDate, endDate }, { rejectWithValue }) => {
    try {
      const { storeId: sid } = sanitizePathParams({ storeId });
      const headers = getAuthHeaders();
      const url = startDate && endDate
        ? `/api/analytics/store/${sid}/range?startDate=${startDate}&endDate=${endDate}`
        : `/api/analytics/store/${sid}`;
      const res = await api.get(url, { headers });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch analytics");
    }
  }
);

export const getSalesChart = createAsyncThunk(
  "analytics/getSalesChart",
  async (storeId, { rejectWithValue }) => {
    try {
      const { storeId: sid } = sanitizePathParams({ storeId });
      const headers = getAuthHeaders();
      const res = await api.get(`/api/analytics/store/${sid}/sales-chart`, { headers });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch sales chart");
    }
  }
);

export const getTopProducts = createAsyncThunk(
  "analytics/getTopProducts",
  async ({ storeId, limit = 10 }, { rejectWithValue }) => {
    try {
      const { storeId: sid } = sanitizePathParams({ storeId });
      const headers = getAuthHeaders();
      const res = await api.get(`/api/analytics/store/${sid}/top-products?limit=${limit}`, { headers });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch top products");
    }
  }
);

export const getPaymentSummary = createAsyncThunk(
  "analytics/getPaymentSummary",
  async (storeId, { rejectWithValue }) => {
    try {
      const { storeId: sid } = sanitizePathParams({ storeId });
      const headers = getAuthHeaders();
      const res = await api.get(`/api/analytics/store/${sid}/payment-summary`, { headers });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch payment summary");
    }
  }
);

export const getPeakHours = createAsyncThunk(
  "analytics/getPeakHours",
  async (storeId, { rejectWithValue }) => {
    try {
      const { storeId: sid } = sanitizePathParams({ storeId });
      const headers = getAuthHeaders();
      const res = await api.get(`/api/analytics/store/${sid}/peak-hours`, { headers });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch peak hours");
    }
  }
);

export const getEmployeeAnalytics = createAsyncThunk(
  "analytics/getEmployees",
  async (storeId, { rejectWithValue }) => {
    try {
      const { storeId: sid } = sanitizePathParams({ storeId });
      const headers = getAuthHeaders();
      const res = await api.get(`/api/analytics/store/${sid}/employees`, { headers });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch employee analytics");
    }
  }
);

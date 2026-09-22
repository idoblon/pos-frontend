import api from "@/util/api";
import { getAuthHeaders } from "@/util/getAuthHeader";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { sanitizePathParams } from "@/util/urlValidator";
import { sanitizeInput } from "@/util/inputValidator";

// Validate date format
const validateDateFormat = (dateString) => {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString.match(/^\d{4}-\d{2}-\d{2}/);
};

export const startShift = createAsyncThunk(
  "/shiftReport/start",
  async (_, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.post(`/api/shift-reports/start`, {}, { headers });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to start shift");
    }
  },
);

export const endShift = createAsyncThunk(
  "/shiftReport/end",
  async (_, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.patch(`/api/shift-reports/end`, {}, { headers });
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to end shift";
      const isDuplicateShiftClose =
        message.includes("Duplicate entry") &&
        message.includes("shift_report_top_selling_products");

      return rejectWithValue(
        isDuplicateShiftClose
          ? "Shift is already being closed. Please wait a moment."
          : message
      );
    }
  },
  {
    condition: (_, { getState }) => {
      return !getState().shiftReport?.endingShift;
    },
  },
);

export const getCurrentShiftProgress = createAsyncThunk(
  "/shiftReport/getCurrent",
  async (_, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get(`/api/shift-reports/current`, { headers });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch current shift");
    }
  },
);

export const getShiftReportByDate = createAsyncThunk(
  "/shiftReport/getByDate",
  async ({ cashierId, date }, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ cashierId });
      const sanitizedDate = sanitizeInput(date);
      
      // Validate date format
      if (!validateDateFormat(sanitizedDate)) {
        return rejectWithValue('Invalid date format. Use YYYY-MM-DD');
      }
      
      const headers = getAuthHeaders();
      const formattedDate = encodeURIComponent(sanitizedDate);
      const res = await api.get(
        `/api/shift-reports/cashier/${sanitizedParams.cashierId}/by-date?date=${formattedDate}`,
        { headers },
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch shift report by date");
    }
  },
);

export const getShiftsByCashier = createAsyncThunk(
  "/shiftReport/getByCashier",
  async (cashierId, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ cashierId });
      const headers = getAuthHeaders();
      const res = await api.get(`/api/shift-reports/cashier/${sanitizedParams.cashierId}`, { headers });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch cashier shifts");
    }
  },
);

export const getShiftsByStore = createAsyncThunk(
  "/shiftReport/getByStore",
  async (storeId, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ storeId });
      const headers = getAuthHeaders();
      const res = await api.get(`/api/shift-reports/store/${sanitizedParams.storeId}`, { headers });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch store shifts");
    }
  },
);

export const getShiftsByBranch = createAsyncThunk(
  "/shiftReport/getByBranch",
  async (params, { rejectWithValue }) => {
    try {
      const branchId = typeof params === "object" ? params.branchId : params;
      const sanitizedParams = sanitizePathParams({ branchId });
      const headers = getAuthHeaders();
      const res = await api.get(`/api/shift-reports/branch/${sanitizedParams.branchId}`, { headers });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch branch shifts");
    }
  },
);

export const getShiftById = createAsyncThunk(
  "/shiftReport/getById",
  async (id, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ id });
      const headers = getAuthHeaders();
      const res = await api.get(`/api/shift-reports/${sanitizedParams.id}`, { headers });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch shift by id");
    }
  },
);

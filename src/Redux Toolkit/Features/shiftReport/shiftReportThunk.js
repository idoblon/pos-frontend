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
  async (branchId, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ branchId });
      
      if (!sanitizedParams.branchId) {
        return rejectWithValue('Branch ID is required to start shift');
      }
      
      const headers = getAuthHeaders();
      const res = await api.post(
        `/api/shift-report/start?branchId=${sanitizedParams.branchId}`,
        {},
        { headers },
      );
      console.log("shift started successfully", res.data);
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
      const res = await api.patch(`/api/shift-report/end`, {}, { headers });
      console.log("shift end successfully", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to end shift");
    }
  },
);

export const getCurrentShiftProgress = createAsyncThunk(
  "/shiftReport/getCurrent",
  async (_, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get(`/api/shift-report/current`, { headers });
      console.log("current shift fetched successfully", res.data);
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
        `/api/shift-report/cashier/${sanitizedParams.cashierId}/by-date?date=${formattedDate}`,
        { headers },
      );
      console.log("shift report by date successfully", res.data);
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
      const res = await api.get(`/api/shift-report/cashier/${sanitizedParams.cashierId}`, { headers });
      console.log("cashier shift successfully", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch cashier shifts");
    }
  },
);

export const getShiftsByBranch = createAsyncThunk(
  "/shiftReport/getByBranch",
  async (branchId, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ branchId });
      const headers = getAuthHeaders();
      const res = await api.get(`/api/shift-report/branch/${sanitizedParams.branchId}`, { headers });
      console.log("branch shift successfully", res.data);
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
      const res = await api.get(`/api/shift-report/${sanitizedParams.id}`, { headers });
      console.log("shift by id successfully", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch shift by id");
    }
  },
);

export const getShiftsByDateRange = createAsyncThunk(
  "/shiftReport/getByDateRange",
  async ({ branchId, from, to }, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ branchId });
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
        `/api/shift-report/branch/${sanitizedParams.branchId}/range?from=${formattedFrom}&to=${formattedTo}`,
        { headers },
      );
      console.log("shifts by date range successfully", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch shifts by date range");
    }
  },
);

export const updateShiftReport = createAsyncThunk(
  "/shiftReport/update",
  async ({ id, shiftData }, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ id });
      const headers = getAuthHeaders();
      const res = await api.put(`/api/shift-report/${sanitizedParams.id}`, shiftData, { headers });
      console.log("update shift report successfully", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update shift report");
    }
  },
);

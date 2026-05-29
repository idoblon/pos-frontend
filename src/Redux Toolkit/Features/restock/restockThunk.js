import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/util/api";
import { getAuthHeaders } from "@/util/getAuthHeader";
import { sanitizePathParams } from "@/util/urlValidator";

export const createRestockRequest = createAsyncThunk(
  "restock/createRestockRequest",
  async (requestData, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.post("/api/restock-requests", requestData, { headers });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create restock request");
    }
  }
);

export const getRestockRequestsByBranch = createAsyncThunk(
  "restock/getRestockRequestsByBranch",
  async ({ branchId }, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ branchId });
      const headers = getAuthHeaders();
      const res = await api.get(`/api/restock-requests/branch/${sanitizedParams.branchId}`, { headers });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch branch restock requests");
    }
  }
);

export const getRestockRequestsByStore = createAsyncThunk(
  "restock/getRestockRequestsByStore",
  async ({ storeId, status }, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ storeId });
      const headers = getAuthHeaders();
      const url = status 
        ? `/api/restock-requests/store/${sanitizedParams.storeId}?status=${status}`
        : `/api/restock-requests/store/${sanitizedParams.storeId}`;
      const res = await api.get(url, { headers });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch store restock requests");
    }
  }
);

export const approveRestockRequest = createAsyncThunk(
  "restock/approveRestockRequest",
  async ({ requestId }, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ requestId });
      const headers = getAuthHeaders();
      const res = await api.patch(
        `/api/restock-requests/${sanitizedParams.requestId}/approve`,
        {},
        { headers }
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to approve request");
    }
  }
);

export const rejectRestockRequest = createAsyncThunk(
  "restock/rejectRestockRequest",
  async ({ requestId, reason }, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ requestId });
      const headers = getAuthHeaders();
      const res = await api.patch(
        `/api/restock-requests/${sanitizedParams.requestId}/reject`,
        { reason },
        { headers }
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to reject request");
    }
  }
);

export const fulfillRestockRequest = createAsyncThunk(
  "restock/fulfillRestockRequest",
  async ({ requestId }, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ requestId });
      const headers = getAuthHeaders();
      const res = await api.patch(
        `/api/restock-requests/${sanitizedParams.requestId}/fulfill`,
        {},
        { headers }
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fulfill request");
    }
  }
);

export const batchApproveRequests = createAsyncThunk(
  "restock/batchApproveRequests",
  async (requestIds, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.post(
        "/api/restock-requests/batch/approve",
        requestIds,
        { headers }
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to batch approve requests");
    }
  }
);

export const batchFulfillRequests = createAsyncThunk(
  "restock/batchFulfillRequests",
  async (requestIds, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.post(
        "/api/restock-requests/batch/fulfill",
        requestIds,
        { headers }
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to batch fulfill requests");
    }
  }
);

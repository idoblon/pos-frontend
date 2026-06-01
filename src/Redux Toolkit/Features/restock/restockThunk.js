import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/util/api";
import { getAuthHeaders } from "@/util/getAuthHeader";
import { sanitizePathParams } from "@/util/urlValidator";
import secureStorage from "@/util/secureStorage";

export const createRestockRequest = createAsyncThunk(
  "restock/createRestockRequest",
  async (requestData, { rejectWithValue }) => {
    try {
      console.log("🚀 Creating restock request:", requestData);
      const headers = getAuthHeaders();
      console.log("📡 Headers:", headers);
      console.log("📡 API Base URL:", import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080');
      
      const res = await api.post("/api/restock-requests", requestData, { headers });
      console.log("✅ Restock request created successfully:", res.data);
      return res.data;
    } catch (error) {
      console.error("❌ Restock request failed - Full error:", error);
      console.error("❌ Error message:", error.message);
      console.error("❌ Error response:", error.response);
      console.error("❌ Error status:", error.response?.status);
      console.error("❌ Error data:", error.response?.data);
      console.error("❌ Error config:", error.config);
      
      // Check if it's a network error or timeout
      if (!error.response || error.code === 'ECONNABORTED') {
        return rejectWithValue("Network error - Unable to connect to server. Please check if the backend is running.");
      }
      
      // Check for specific status codes
      if (error.response.status === 404) {
        return rejectWithValue("API endpoint not found - /api/restock-requests may not be implemented on the backend");
      }
      
      if (error.response.status === 401) {
        return rejectWithValue("Authentication failed - Please log in again");
      }
      
      if (error.response.status === 403) {
        return rejectWithValue("Access denied - You don't have permission to create restock requests");
      }
      
      return rejectWithValue(error.response?.data?.message || `Server error (${error.response?.status}): ${error.message}`);
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
  async ({ requestId, receivedQuantity }, { rejectWithValue }) => {
    try {
      console.log("🔍 FRONTEND DEBUG - Fulfilling restock request:", { requestId, receivedQuantity });
      
      const sanitizedParams = sanitizePathParams({ requestId });
      const headers = getAuthHeaders();
      const body = receivedQuantity ? { receivedQuantity } : {};
      
      // Check if we have a valid token
      const token = secureStorage.getToken();
      console.log("🔍 FRONTEND DEBUG - JWT Token exists:", !!token);
      console.log("🔍 FRONTEND DEBUG - JWT Token length:", token?.length || 0);
      console.log("🔍 FRONTEND DEBUG - JWT Token preview:", token ? token.substring(0, 20) + '...' : 'null');
      
      const fullUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/restock-requests/${sanitizedParams.requestId}/fulfill`;
      
      console.log("🔍 FRONTEND DEBUG - Request details:", {
        fullUrl,
        body,
        headers,
        baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
      });
      
      const res = await api.patch(
        `/api/restock-requests/${sanitizedParams.requestId}/fulfill`,
        body,
        { headers }
      );
      
      console.log("✅ FRONTEND DEBUG - Fulfill request successful:", res.data);
      console.log("🔍 FRONTEND DEBUG - Response status:", res.status);
      console.log("🔍 FRONTEND DEBUG - Response headers:", res.headers);
      
      return res.data;
    } catch (error) {
      console.error("❌ FRONTEND DEBUG - Fulfill request failed:", error);
      console.error("❌ FRONTEND DEBUG - Error response:", error.response);
      console.error("❌ FRONTEND DEBUG - Error status:", error.response?.status);
      console.error("❌ FRONTEND DEBUG - Error data:", error.response?.data);
      console.error("❌ FRONTEND DEBUG - Error message:", error.message);
      console.error("❌ FRONTEND DEBUG - Error config:", error.config);
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
  async (fulfillmentData, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.post(
        "/api/restock-requests/batch/fulfill",
        fulfillmentData,
        { headers }
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to batch fulfill requests");
    }
  }
);

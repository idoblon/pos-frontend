import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/util/api";
import { getAuthHeaders } from "@/util/getAuthHeader";
import { sanitizePathParams } from "@/util/urlValidator";

export const getInventoryByBranch = createAsyncThunk(
  "inventory/getInventoryByBranch",
  async ({ branchId }, { rejectWithValue }) => {
    try {
      console.log("📡 INVENTORY API: Starting getInventoryByBranch for branchId:", branchId);
      
      if (!branchId || branchId === 'null' || branchId === null) {
        console.log("❌ INVENTORY API: Invalid branchId, rejecting");
        return rejectWithValue("Invalid branch ID");
      }
      
      const sanitizedParams = sanitizePathParams({ branchId });
      const headers = getAuthHeaders();
      
      console.log("📡 INVENTORY API: Making request to /inventories/branch/" + sanitizedParams.branchId);
      const res = await api.get(`/api/inventories/branch/${sanitizedParams.branchId}`, { headers });
      
      console.log("✅ INVENTORY API SUCCESS:", res.data);
      return res.data;
    } catch (error) {
      console.error("❌ INVENTORY API ERROR:", error.response?.status, error.response?.data);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch inventory");
    }
  }
);

export const getInventoryByStore = createAsyncThunk(
  "inventory/getInventoryByStore",
  async ({ storeId }, { rejectWithValue }) => {
    try {
      console.log("📡 INVENTORY API: Starting getInventoryByStore for storeId:", storeId);
      const sanitizedParams = sanitizePathParams({ storeId });
      const headers = getAuthHeaders();
      console.log("📡 INVENTORY API: Making request to /api/inventories/store/" + sanitizedParams.storeId);
      const res = await api.get(`/api/inventories/store/${sanitizedParams.storeId}`, { headers });
      console.log("✅ INVENTORY API SUCCESS:", res.data);
      return res.data;
    } catch (error) {
      console.error("❌ INVENTORY API ERROR:", error.response?.status, error.response?.data);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch store inventory");
    }
  }
);

export const getLowStockItems = createAsyncThunk(
  "inventory/getLowStockItems",
  async ({ branchId, threshold = 10 }, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ branchId });
      const headers = getAuthHeaders();
      const res = await api.get(
        `/api/inventories/branch/${sanitizedParams.branchId}/low-stock?threshold=${threshold}`,
        { headers }
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch low stock items");
    }
  }
);

export const addInventoryItem = createAsyncThunk(
  "inventory/addInventoryItem",
  async ({ branchId, productId, quantity, unitPrice, storeId }, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.post(
        `/api/inventories`,
        { branchId: branchId || null, storeId: storeId || null, productId, quantity, unitPrice },
        { headers }
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to add inventory item");
    }
  }
);

export const updateInventoryStock = createAsyncThunk(
  "inventory/updateInventoryStock",
  async ({ inventoryId, quantity }, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ inventoryId });
      const headers = getAuthHeaders();
      const res = await api.patch(
        `/api/inventories/${sanitizedParams.inventoryId}/stock`,
        { quantity },
        { headers }
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update stock");
    }
  }
);

export const deleteInventoryItem = createAsyncThunk(
  "inventory/deleteInventoryItem",
  async ({ inventoryId }, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ inventoryId });
      const headers = getAuthHeaders();
      await api.delete(`/api/inventories/${sanitizedParams.inventoryId}`, { headers });
      return inventoryId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete inventory item");
    }
  }
);

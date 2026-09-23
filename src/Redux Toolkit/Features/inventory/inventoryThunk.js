import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/util/api";
import { getAuthHeaders } from "@/util/getAuthHeader";
import { sanitizePathParams } from "@/util/urlValidator";

export const getInventoryByBranch = createAsyncThunk(
  "inventory/getInventoryByBranch",
  async ({ branchId }, { rejectWithValue }) => {
    try {
      if (!branchId || branchId === 'null' || branchId === null) {
        return rejectWithValue("Invalid branch ID");
      }
      
      const sanitizedParams = sanitizePathParams({ branchId });
      const headers = getAuthHeaders();
      
      const res = await api.get(`/api/inventories/branch/${sanitizedParams.branchId}`, { headers });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch inventory");
    }
  }
);

export const getInventoryByStore = createAsyncThunk(
  "inventory/getInventoryByStore",
  async ({ storeId }, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ storeId });
      const headers = getAuthHeaders();
      const res = await api.get(`/api/inventories/store/${sanitizedParams.storeId}`, { headers });
      return res.data;
    } catch (error) {
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

/**
 * Server-joined POS catalog (GET /api/inventories/branch/{id}/pos-catalog).
 * Single query with server search + pagination. Rejects with status so the
 * terminal can fall back to the legacy two-fetch join on 404.
 */
export const getPosCatalog = createAsyncThunk(
  "inventory/getPosCatalog",
  async ({ branchId, q = "", page = 0, size = 100 }, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ branchId });
      const headers = getAuthHeaders();
      const params = new URLSearchParams({ page: String(page), size: String(size) });
      if (q) params.set("q", q);
      const res = await api.get(
        `/api/inventories/branch/${sanitizedParams.branchId}/pos-catalog?${params.toString()}`,
        { headers }
      );
      return res.data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || "Failed to fetch POS catalog",
        status: error.response?.status,
      });
    }
  }
);

/**
 * Atomic warehouse → branch transfer (POST /api/inventories/transfer).
 * Single transaction server-side: decrement warehouse, upsert branch row,
 * audit both movements. Rejects with status so callers can fall back to the
 * legacy two-call distribute when the backend predates the endpoint (404).
 */
export const transferStock = createAsyncThunk(
  "inventory/transferStock",
  async ({ warehouseInventoryId, toBranchId, quantity }, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ warehouseInventoryId, toBranchId });
      const headers = getAuthHeaders();
      const res = await api.post(
        `/api/inventories/transfer`,
        {
          warehouseInventoryId: sanitizedParams.warehouseInventoryId,
          toBranchId: sanitizedParams.toBranchId,
          quantity: Number(quantity),
        },
        { headers }
      );
      return res.data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || "Failed to transfer stock",
        status: error.response?.status,
      });
    }
  }
);

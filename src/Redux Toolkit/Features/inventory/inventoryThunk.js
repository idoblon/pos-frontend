import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/util/api";
import { getAuthHeaders } from "@/util/getAuthHeader";
import { sanitizePathParams } from "@/util/urlValidator";

export const getInventoryByBranch = createAsyncThunk(
  "inventory/getInventoryByBranch",
  async ({ branchId }, { rejectWithValue }) => {
    try {
      console.log("📡 INVENTORY API: Starting getInventoryByBranch for branchId:", branchId);
      
      // Validate branchId
      if (!branchId || branchId === 'null' || branchId === null) {
        console.log("❌ INVENTORY API: Invalid branchId, rejecting");
        return rejectWithValue("Invalid branch ID");
      }
      
      const sanitizedParams = sanitizePathParams({ branchId });
      const headers = getAuthHeaders();
      
      console.log("📡 INVENTORY API: Making request to /inventory/branch/" + sanitizedParams.branchId);
      const res = await api.get(`/inventory/branch/${sanitizedParams.branchId}`, { headers });
      
      console.log("✅ INVENTORY API SUCCESS:", res.data);
      return res.data;
    } catch (error) {
      console.error("❌ INVENTORY API ERROR:", error.response?.status, error.response?.data);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch inventory");
    }
  }
);

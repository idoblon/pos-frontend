import { getAuthHeaders } from "@/util/getAuthHeader";
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/util/api";

export const createCategory = createAsyncThunk(
  "/category/create",
  async ({ dto }, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.post("/api/categories", dto, { headers });
      console.log("create category success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const getCategoriesByStore = createAsyncThunk(
  "/category/getByStore",
  async ({ storeId }, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get(`/api/categories/store/${storeId}`, { headers });
      console.log("get category success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const updateCategory = createAsyncThunk(
  "/category/update",
  async ({ id, dto }, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.put(`/api/categories/${id}`, dto, { headers });
      console.log("update category success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const deleteCategory = createAsyncThunk(
  "/category/delete",
  async ({ id }, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.delete(`/api/categories/${id}`, { headers });
      console.log("delete category success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

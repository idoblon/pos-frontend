import { getAuthHeaders } from "@/util/getAuthHeader";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { redirect } from "react-router-dom";

export const createCategory = createAsyncThunk(
  "/category/create",
  async ({ dto }, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.post("/api/categories", dot, { headers });
      console.log("create category success", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error);
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const getCategoriesByStore = createAsyncThunk(
  "/category/getByStore",
  async ({ storeId }, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get(`/api/categories/store/${storeid}`, {
        headers,
      });
      console.log("get category success", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error);
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const updateCategory = createAsyncThunk(
  "/category/update",
  async ({ id, dto }, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.put(`/api/categories/${id}`, dot, { headers });
      console.log("update category success", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error);
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
      console.log("error", error);
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

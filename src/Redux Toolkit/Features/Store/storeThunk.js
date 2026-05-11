import api from "@/util/api";
import { getAuthHeaders } from "@/util/getAuthHeader";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const createStore = createAsyncThunk(
  "/store/create",
  async (storeData, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.post(`/api/stores`, storeData, { headers });
      console.log("create store success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const getStoreById = createAsyncThunk(
  "/store/getById",
  async (id, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get(`/api/stores/${id}`, { headers });
      console.log("get store success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const getAllStores = createAsyncThunk(
  "/store/getAll",
  async (status, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get(`/api/stores`, {
        headers,
        params: status ? { status } : undefined,
      });
      console.log("get all stores success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const updateStore = createAsyncThunk(
  "/store/update",
  async ({ id, storeData }, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.put(`/api/stores/${id}`, storeData, { headers });
      console.log("update store success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const getStoreByAdmin = createAsyncThunk(
  "/store/getByAdmin",
  async (_, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get(`/api/stores/admin`, { headers });
      console.log("get admin store success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const getStoreByEmployee = createAsyncThunk(
  "/store/getStoreByEmployee",
  async (_, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get(`/api/stores/employee`, { headers });
      console.log("get employee store success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const moderateStore = createAsyncThunk(
  "/store/moderateStore",
  async ({ storeId, action }, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.put(
        `/api/stores/${storeId}/moderate`,
        {},
        { headers, params: { action } },
      );
      console.log("moderate store success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

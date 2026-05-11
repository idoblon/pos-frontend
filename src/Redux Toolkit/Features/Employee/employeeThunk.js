import { getAuthHeaders } from "@/util/getAuthHeader";
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/util/api";

export const createStoreEmpoyee = createAsyncThunk(
  "/employee/createStoreEmployee",
  async ({ employee, storeId }, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.post(`/api/employees/store/${storeId}`, employee, { headers });
      console.log("create store employee success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const createBranchEmpoyee = createAsyncThunk(
  "/employee/createBranchEmployee",
  async ({ employee, branchId }, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.post(`/api/employees/branch/${branchId}`, employee, { headers });
      console.log("create branch employee success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const updateEmpoyee = createAsyncThunk(
  "/employee/update",
  async ({ employeeId, employeeDetails }, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.put(`/api/employees/${employeeId}`, employeeDetails, { headers });
      console.log("update employee success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const deleteEmployee = createAsyncThunk(
  "/employee/deleteEmployee",
  async ({ employeeId }, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.delete(`/api/employees/${employeeId}`, { headers });
      console.log("delete employee success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const findEmployeeById = createAsyncThunk(
  "/employee/findEmployeeById",
  async ({ employeeId }, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get(`/api/employees/${employeeId}`, { headers });
      console.log("find employee by id success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const findStoreEmployee = createAsyncThunk(
  "/employee/findStoreEmployee",
  async ({ storeId }, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get(`/api/employees/store/${storeId}`, { headers });
      console.log("find store employee success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const findBranchEmployee = createAsyncThunk(
  "/employee/findBranchEmployee",
  async ({ branchId }, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get(`/api/employees/branch/${branchId}`, { headers });
      console.log("find branch employee success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

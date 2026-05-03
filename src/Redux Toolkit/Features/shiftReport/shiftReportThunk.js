import api from "@/util/api";
import { getAuthHeaders } from "@/util/getAuthHeader";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const startShift = createAsyncThunk(
  "/shiftReport/start",
  async (branchId, { rejectwithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.post(
        `api/shift-report/start?branchId=${branchId}`,
        {},
        { headers },
      );
      console.log("shift started successfully", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error);
      return rejectwithValue(
        error.response?.data.message || "Failed to start shift",
      );
    }
  },
);

export const endShift = createAsyncThunk(
  "/shiftReport/end",
  async (_, { rejectwithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.patch(`api/shift-report/end`, {}, { headers });
      console.log("shift end successfully", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error);
      return rejectwithValue(
        error.response?.data.message || "Failed to end shift",
      );
    }
  },
);

export const getCurrentShiftProgress = createAsyncThunk(
  "/shiftReport/getCurrent",
  async (branchId, { rejectwithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get(`api/shift-report/current`, { headers });
      console.log("current shift started successfully", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error);
      return rejectwithValue(
        error.response?.data.message || "Failed to fetch current shift",
      );
    }
  },
);

export const getShiftReportByDate = createAsyncThunk(
  "/shiftReport/getByDate",
  async ({ cashierId, date }, { rejectwithValue }) => {
    try {
      const headers = getAuthHeaders();
      const formattedDate = encodeURIComponent(date);
      const res = await api.get(
        `api/shift-report/casheir/${cashierId}/by-date?date=${formattedDate}`,
        { headers },
      );
      console.log("shift report by date successfully", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error);
      return rejectwithValue(
        error.response?.data.message || "Failed to fetch  shift report by date",
      );
    }
  },
);

export const getShiftsByCashier = createAsyncThunk(
  "/shiftReport/getByCashier",
  async (cashierId, { rejectwithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get(
        `api/shift-report/casheir/${cashierId}`,
        {},
        { headers },
      );
      console.log("cashier shift successfully", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error);
      return rejectwithValue(
        error.response?.data.message || "Failed to fetch cashier shift",
      );
    }
  },
);

export const getShiftsByBranch = createAsyncThunk(
  "/shiftReport/getByBranch",
  async (cashierId, { rejectwithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get(`api/shift-report/branch/${branchId}`, {
        headers,
      });
      console.log("branch shift successfully", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error);
      return rejectwithValue(
        error.response?.data.message || "Failed to fetch branch shift",
      );
    }
  },
);

export const getShiftById = createAsyncThunk(
  "/shiftReport/getById",
  async (id, { rejectwithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get(`api/shift-report/${id}`, {}, { headers });
      console.log("shift by id successfully", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error);
      return rejectwithValue(
        error.response?.data.message || "Failed to fetch shift by id",
      );
    }
  },
);

import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const authApi = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await authApi.post("/auth/login", {
        email: credentials.email,
        password: credentials.password
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import api from "@/util/api";
import { userInfo } from "node:os";

export const signup = createAsyncThunk(
  "auth/signup",
  async (userData, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/signup", userData);
      localStorage.setItem("jwt", res.data.jwt);
      console.log("signup success", res.data);
      return res.data;
    } catch (error) {
      console.log("signup error", error);
      return rejectWithValue(error.response?.data?.message || "signup failed");
    }
  },
);

export const login = createAsyncThunk(
  "auth/login",
  async (userData, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/login", userData);
      localStorage.setItem("jwt", res.data.jwt);
      console.log("login success", res.data);
      return res.data;
    } catch (error) {
      console.log("signup error", error);
      return rejectWithValue(error.response?.data?.message || "login failed");
    }
  },
);

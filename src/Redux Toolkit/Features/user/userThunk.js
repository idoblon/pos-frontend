import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/util/api";
import { getAuthHeaders } from "@/util/getAuthHeader";
import { sanitizePathParams } from "@/util/urlValidator";
import { sanitizeFormData, validateEmail } from "@/util/inputValidator";
import secureStorage from "@/util/secureStorage";

// Validate user data
const validateUserData = (data) => {
  const errors = {};
  
  if (!data.fullName || data.fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters';
  }
  
  if (!data.email || !validateEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (data.password && data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const getUserProfile = createAsyncThunk(
  "user/getUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get("/api/users/profile", { headers });
      console.log("get user Profile success", res.data);
      
      // Update secureStorage with profile data including storeId and branchId
      const userData = secureStorage.getUserData() || {};
      const updatedUserData = {
        ...userData,
        storeId: res.data.storeId || userData.storeId,
        branchId: res.data.branchId || userData.branchId,
        userId: res.data.id,
        email: res.data.email,
        role: res.data.role || userData.role
      };
      secureStorage.setUserData(updatedUserData);
      console.log("Updated secureStorage with profile data:", updatedUserData);
      
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch profile");
    }
  },
);

export const updateUserProfile = createAsyncThunk(
  "user/updateProfile",
  async (userData, { rejectWithValue }) => {
    try {
      // Validate user data
      const validation = validateUserData(userData);
      if (!validation.isValid) {
        return rejectWithValue(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
      }

      const sanitizedData = sanitizeFormData(userData);
      const headers = getAuthHeaders();
      const res = await api.put("/api/users/profile", sanitizedData, { headers });
      console.log("update user profile success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update profile");
    }
  },
);

export const getAllCustomer = createAsyncThunk(
  "user/getAllCustomer",
  async (_, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get("/api/users/customers", { headers });
      console.log("get customer success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch customers");
    }
  },
);

export const getAllCashier = createAsyncThunk(
  "user/getAllCashier",
  async (_, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get("/api/users/cashiers", { headers });
      console.log("get cashier success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch cashiers");
    }
  },
);

export const getUserById = createAsyncThunk(
  "user/getUserById",
  async (userId, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ userId });
      const headers = getAuthHeaders();
      const res = await api.get(`/api/users/${sanitizedParams.userId}`, { headers });
      console.log("get user by id success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch user by id");
    }
  },
);

export const getUsersByStore = createAsyncThunk(
  "user/getUsersByStore",
  async (storeId, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ storeId });
      const headers = getAuthHeaders();
      const res = await api.get(`/api/users/store/${sanitizedParams.storeId}`, { headers });
      console.log("get users by store success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch store users");
    }
  },
);

export const getUsersByBranch = createAsyncThunk(
  "user/getUsersByBranch",
  async (branchId, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ branchId });
      const headers = getAuthHeaders();
      const res = await api.get(`/api/users/branch/${sanitizedParams.branchId}`, { headers });
      console.log("get users by branch success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch branch users");
    }
  },
);

export const changePassword = createAsyncThunk(
  "user/changePassword",
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      if (!currentPassword || !newPassword) {
        return rejectWithValue('Current password and new password are required');
      }
      
      if (newPassword.length < 6) {
        return rejectWithValue('New password must be at least 6 characters');
      }
      
      const headers = getAuthHeaders();
      const res = await api.put("/api/users/change-password", {
        currentPassword,
        newPassword
      }, { headers });
      console.log("change password success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to change password");
    }
  },
);

export const getAllStoreAdmins = createAsyncThunk(
  "user/getAllStoreAdmins",
  async (_, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get("/api/users/store-admins", { headers });
      console.log("get all store admins success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch store admins");
    }
  },
);

export const getAllUsers = createAsyncThunk(
  "user/getAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get("/api/users", { headers });
      console.log("get all users success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch all users");
    }
  },
);

export const createUser = createAsyncThunk(
  "user/createUser",
  async (userData, { rejectWithValue }) => {
    try {
      // Validate user data
      const validation = validateUserData(userData);
      if (!validation.isValid) {
        return rejectWithValue(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
      }

      const sanitizedData = sanitizeFormData(userData);
      const headers = getAuthHeaders();
      const res = await api.post("/api/users", sanitizedData, { headers });
      console.log("create user success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create user");
    }
  },
);

export const updateUser = createAsyncThunk(
  "user/updateUser",
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      // Validate user data
      const validation = validateUserData(userData);
      if (!validation.isValid) {
        return rejectWithValue(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
      }

      const sanitizedData = sanitizeFormData(userData);
      const sanitizedParams = sanitizePathParams({ userId });
      const headers = getAuthHeaders();
      const res = await api.put(`/api/users/${sanitizedParams.userId}`, sanitizedData, { headers });
      console.log("update user success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update user");
    }
  },
);

export const deleteUser = createAsyncThunk(
  "user/deleteUser",
  async (userId, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ userId });
      const headers = getAuthHeaders();
      await api.delete(`/api/users/${sanitizedParams.userId}`, { headers });
      console.log("delete user success");
      return userId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete user");
    }
  },
);

export const toggleUserStatus = createAsyncThunk(
  "user/toggleUserStatus",
  async ({ userId, status }, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ userId });
      const headers = getAuthHeaders();
      const res = await api.patch(`/api/users/${sanitizedParams.userId}/status`, { status }, { headers });
      console.log("toggle user status success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update user status");
    }
  },
);

export const logout = createAsyncThunk(
  "user/logout",
  async (_, { rejectWithValue }) => {
    try {
      // Use secure storage instead of localStorage
      secureStorage.clearAll();
      console.log("logout success");
      return { message: "Logged out successfully" };
    } catch (error) {
      return rejectWithValue("Failed to logout");
    }
  },
);

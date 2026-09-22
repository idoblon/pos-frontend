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
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update profile");
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
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch user by id");
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
      return { message: "Logged out successfully" };
    } catch {
      return rejectWithValue("Failed to logout");
    }
  },
);

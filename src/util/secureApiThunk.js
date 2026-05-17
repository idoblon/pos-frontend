// src/util/secureApiThunk.js
/**
 * Secure API thunk utilities to prevent SSRF and injection attacks
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "./api";
import { getAuthHeaders } from "./getAuthHeader";
import { sanitizePathParams } from "./urlValidator";
import { sanitizeFormData } from "./inputValidator";

/**
 * Create a secure GET thunk with path parameter sanitization
 */
export const createSecureGetThunk = (name, endpoint) => {
  return createAsyncThunk(name, async (params, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      let url = endpoint;
      
      // Handle path parameters
      if (params && typeof params === 'object') {
        const sanitizedParams = sanitizePathParams(params);
        // Replace placeholders in endpoint with sanitized values
        Object.entries(sanitizedParams).forEach(([key, value]) => {
          url = url.replace(`{${key}}`, value);
        });
      } else if (params) {
        // Single parameter case
        const sanitized = sanitizePathParams({ id: params });
        url = url.replace('{id}', sanitized.id);
      }
      
      const res = await api.get(url, { headers });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || `Failed to fetch ${name}`
      );
    }
  });
};

/**
 * Create a secure POST thunk with data sanitization
 */
export const createSecurePostThunk = (name, endpoint, validator = null) => {
  return createAsyncThunk(name, async (data, { rejectWithValue }) => {
    try {
      // Validate data if validator provided
      if (validator) {
        const validation = validator(data);
        if (!validation.isValid) {
          return rejectWithValue(
            `Validation failed: ${Object.values(validation.errors).join(', ')}`
          );
        }
      }
      
      // Sanitize form data
      const sanitizedData = sanitizeFormData(data);
      const headers = getAuthHeaders();
      
      const res = await api.post(endpoint, sanitizedData, { headers });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || `Failed to create ${name}`
      );
    }
  });
};

/**
 * Create a secure PUT thunk with data sanitization
 */
export const createSecurePutThunk = (name, endpoint, validator = null) => {
  return createAsyncThunk(name, async ({ id, data }, { rejectWithValue }) => {
    try {
      // Validate data if validator provided
      if (validator) {
        const validation = validator(data);
        if (!validation.isValid) {
          return rejectWithValue(
            `Validation failed: ${Object.values(validation.errors).join(', ')}`
          );
        }
      }
      
      // Sanitize parameters and data
      const sanitizedParams = sanitizePathParams({ id });
      const sanitizedData = sanitizeFormData(data);
      const headers = getAuthHeaders();
      
      const url = endpoint.replace('{id}', sanitizedParams.id);
      const res = await api.put(url, sanitizedData, { headers });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || `Failed to update ${name}`
      );
    }
  });
};

/**
 * Create a secure DELETE thunk with parameter sanitization
 */
export const createSecureDeleteThunk = (name, endpoint) => {
  return createAsyncThunk(name, async (id, { rejectWithValue }) => {
    try {
      const sanitizedParams = sanitizePathParams({ id });
      const headers = getAuthHeaders();
      
      const url = endpoint.replace('{id}', sanitizedParams.id);
      const res = await api.delete(url, { headers });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || `Failed to delete ${name}`
      );
    }
  });
};

/**
 * Example usage:
 * 
 * // GET with path params
 * export const getProductById = createSecureGetThunk(
 *   'product/getById',
 *   '/api/products/{id}'
 * );
 * 
 * // POST with validation
 * export const createProduct = createSecurePostThunk(
 *   'product/create',
 *   '/api/products',
 *   validateProductData
 * );
 * 
 * // PUT with validation
 * export const updateProduct = createSecurePutThunk(
 *   'product/update',
 *   '/api/products/{id}',
 *   validateProductData
 * );
 * 
 * // DELETE
 * export const deleteProduct = createSecureDeleteThunk(
 *   'product/delete',
 *   '/api/products/{id}'
 * );
 */
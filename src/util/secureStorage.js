// src/util/secureStorage.js
/**
 * Secure token storage utility to prevent XSS attacks
 */

class SecureStorage {
  constructor() {
    this.tokenKey = 'pos_jwt_token';
    this.userDataKey = 'pos_user_data';
  }

  // Store token securely (consider httpOnly cookies for production)
  setToken(token) {
    try {
      // For development, use sessionStorage instead of localStorage
      // In production, use httpOnly cookies
      sessionStorage.setItem(this.tokenKey, token);
    } catch (error) {
      console.error('Failed to store token:', error);
    }
  }

  getToken() {
    try {
      return sessionStorage.getItem(this.tokenKey);
    } catch (error) {
      console.error('Failed to retrieve token:', error);
      return null;
    }
  }

  setUserData(userData) {
    try {
      // Sanitize user data before storing
      const sanitizedData = this.sanitizeUserData(userData);
      sessionStorage.setItem(this.userDataKey, JSON.stringify(sanitizedData));
    } catch (error) {
      console.error('Failed to store user data:', error);
    }
  }

  getUserData() {
    try {
      const data = sessionStorage.getItem(this.userDataKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to retrieve user data:', error);
      return null;
    }
  }

  clearAll() {
    try {
      sessionStorage.removeItem(this.tokenKey);
      sessionStorage.removeItem(this.userDataKey);
      // Also clear any legacy localStorage items
      localStorage.removeItem('jwt');
      localStorage.removeItem('role');
      localStorage.removeItem('storeId');
      localStorage.removeItem('branchId');
      localStorage.removeItem('storeName');
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }

  sanitizeUserData(userData) {
    const sanitized = {};
    const allowedFields = ['role', 'storeId', 'branchId', 'storeName', 'userId', 'email'];
    
    for (const field of allowedFields) {
      if (userData[field] !== undefined) {
        // Basic sanitization - remove any HTML/script tags
        sanitized[field] = String(userData[field]).replace(/<[^>]*>/g, '');
      }
    }
    
    return sanitized;
  }

  // Check if token exists and is not expired
  isTokenValid() {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      // Basic JWT expiration check (decode payload)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }
}

export default new SecureStorage();
import api from "./api";

/**
 * Email Service
 * Handles all email-related operations
 */

export const emailService = {
  /**
   * Send welcome email after successful signup
   * @param {Object} userData - User data
   * @param {string} userData.email - User email
   * @param {string} userData.fullName - User full name
   * @param {string} userData.storeName - Store name
   * @returns {Promise}
   */
  sendWelcomeEmail: async (userData) => {
    try {
      const response = await api.post("/api/email/welcome", {
        to: userData.email,
        fullName: userData.fullName,
        storeName: userData.storeName,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to send welcome email:", error);
      throw error;
    }
  },

  /**
   * Send account creation confirmation email
   * @param {Object} data - Email data
   * @param {string} data.email - Recipient email
   * @param {string} data.fullName - User full name
   * @param {string} data.storeName - Store name
   * @param {string} data.role - User role
   * @returns {Promise}
   */
  sendAccountCreatedEmail: async (data) => {
    try {
      const response = await api.post("/api/email/account-created", {
        to: data.email,
        fullName: data.fullName,
        storeName: data.storeName,
        role: data.role,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to send account created email:", error);
      throw error;
    }
  },

  /**
   * Send password reset email
   * @param {string} email - User email
   * @param {string} resetToken - Password reset token
   * @returns {Promise}
   */
  sendPasswordResetEmail: async (email, resetToken) => {
    try {
      const response = await api.post("/api/email/password-reset", {
        to: email,
        resetToken,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to send password reset email:", error);
      throw error;
    }
  },

  /**
   * Send order confirmation email
   * @param {Object} orderData - Order data
   * @returns {Promise}
   */
  sendOrderConfirmationEmail: async (orderData) => {
    try {
      const response = await api.post("/api/email/order-confirmation", orderData);
      return response.data;
    } catch (error) {
      console.error("Failed to send order confirmation email:", error);
      throw error;
    }
  },

  /**
   * Send shift report email
   * @param {Object} shiftData - Shift report data
   * @returns {Promise}
   */
  sendShiftReportEmail: async (shiftData) => {
    try {
      const response = await api.post("/api/email/shift-report", shiftData);
      return response.data;
    } catch (error) {
      console.error("Failed to send shift report email:", error);
      throw error;
    }
  },
};

export default emailService;

// src/util/inputValidator.js
/**
 * Input validation utility to prevent injection attacks
 */

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

export const validatePrice = (price) => {
  const priceRegex = /^\d+(\.\d{1,2})?$/;
  return priceRegex.test(price) && parseFloat(price) >= 0;
};

export const validateSKU = (sku) => {
  const skuRegex = /^[A-Za-z0-9\-_]{3,20}$/;
  return skuRegex.test(sku);
};

export const sanitizeFormData = (formData) => {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(formData)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

export const validateOrderData = (orderData) => {
  const errors = {};
  
  if (!orderData.items || orderData.items.length === 0) {
    errors.items = 'Order must contain at least one item';
  }
  
  if (!orderData.paymentType) {
    errors.paymentType = 'Payment type is required';
  }
  
  if (orderData.totalAmount <= 0) {
    errors.totalAmount = 'Total amount must be greater than 0';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
// src/config/security.js
/**
 * Security configuration for the POS frontend application
 */

export const SECURITY_CONFIG = {
  // Content Security Policy
  CSP: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"], // Note: Remove unsafe-inline in production
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'", process.env.VITE_API_BASE_URL || "http://localhost:8080"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"]
  },

  // API Security
  API: {
    timeout: 10000, // 10 seconds
    maxRetries: 3,
    allowedDomains: [
      'localhost:8080',
      process.env.VITE_API_BASE_URL?.replace(/https?:\/\//, '') || 'localhost:8080'
    ],
    blockedIPs: [
      '127.0.0.1',
      '0.0.0.0',
      '169.254.169.254', // AWS metadata service
      '::1',
      'localhost' // Block localhost in production
    ]
  },

  // Token Security
  TOKEN: {
    storageType: 'sessionStorage', // Use sessionStorage instead of localStorage
    keyName: 'pos_jwt_token',
    expirationBuffer: 300, // 5 minutes before actual expiration
    autoRefresh: true
  },

  // Input Validation
  VALIDATION: {
    maxInputLength: 1000,
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    sanitizeHtml: true,
    preventXSS: true
  },

  // Rate Limiting (client-side)
  RATE_LIMIT: {
    maxRequestsPerMinute: 60,
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000 // 15 minutes
  },

  // Feature Flags
  FEATURES: {
    enableDevTools: process.env.NODE_ENV === 'development',
    enableLogging: process.env.NODE_ENV === 'development',
    enableAnalytics: process.env.NODE_ENV === 'production',
    strictMode: process.env.NODE_ENV === 'production'
  }
};

// Security Headers for production
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
};

// Generate CSP header string
export const generateCSPHeader = () => {
  const csp = SECURITY_CONFIG.CSP;
  const directives = Object.entries(csp).map(([key, values]) => {
    const directive = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    return `${directive} ${values.join(' ')}`;
  });
  return directives.join('; ');
};

// Validate environment configuration
export const validateSecurityConfig = () => {
  const errors = [];
  
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.VITE_API_BASE_URL) {
      errors.push('VITE_API_BASE_URL must be set in production');
    }
    
    if (process.env.VITE_API_BASE_URL?.includes('localhost')) {
      errors.push('API URL should not use localhost in production');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
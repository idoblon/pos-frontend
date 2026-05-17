// src/util/urlValidator.js
/**
 * URL Validation utility to prevent SSRF attacks
 */

const ALLOWED_DOMAINS = [
  'localhost:8080',
  'your-production-api.com' // Add your production domain
];

const BLOCKED_IPS = [
  '127.0.0.1',
  '0.0.0.0',
  '169.254.169.254', // AWS metadata service
  '::1'
];

export const validateApiUrl = (url) => {
  try {
    const urlObj = new URL(url, window.location.origin);
    
    // Check if domain is in allowlist
    const isAllowedDomain = ALLOWED_DOMAINS.some(domain => 
      urlObj.host === domain || urlObj.hostname === domain
    );
    
    if (!isAllowedDomain) {
      throw new Error(`Domain ${urlObj.host} not in allowlist`);
    }
    
    // Check for blocked IPs
    const isBlockedIP = BLOCKED_IPS.some(ip => 
      urlObj.hostname === ip
    );
    
    if (isBlockedIP) {
      throw new Error(`IP ${urlObj.hostname} is blocked`);
    }
    
    // Only allow HTTP/HTTPS
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error(`Protocol ${urlObj.protocol} not allowed`);
    }
    
    return urlObj.href;
  } catch (error) {
    console.error('URL validation failed:', error);
    throw new Error('Invalid URL provided');
  }
};

export const sanitizePathParams = (params) => {
  const sanitized = {};
  for (const [key, value] of Object.entries(params)) {
    // Remove any path traversal attempts
    sanitized[key] = String(value).replace(/\.\./g, '').replace(/[\/\\]/g, '');
  }
  return sanitized;
};
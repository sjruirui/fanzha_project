/**
 * Validation helper functions
 */

/**
 * Check if value is not empty
 */
const isNotEmpty = (value) => {
  return value !== undefined && value !== null && value !== '';
};

/**
 * Check if value is a valid email
 */
const isEmail = (value) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

/**
 * Check if value is a valid phone number (Chinese mobile)
 */
const isPhone = (value) => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(value);
};

/**
 * Check if value is a valid username (alphanumeric, 3-20 chars)
 */
const isUsername = (value) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(value);
};

/**
 * Check if value is a valid password (min 6 chars)
 */
const isPassword = (value) => {
  return typeof value === 'string' && value.length >= 6;
};

/**
 * Validate required fields
 */
const validateRequired = (data, fields) => {
  const errors = [];
  for (const field of fields) {
    if (!isNotEmpty(data[field])) {
      errors.push({ field, message: `${field} 不能为空` });
    }
  }
  return errors;
};

/**
 * Validate pagination params
 */
const validatePagination = (page, pageSize) => {
  const p = parseInt(page) || 1;
  const ps = parseInt(pageSize) || 10;
  return {
    page: Math.max(1, p),
    pageSize: Math.min(100, Math.max(1, ps))
  };
};

/**
 * Sanitize string (trim and escape)
 */
const sanitizeString = (value) => {
  if (typeof value !== 'string') return value;
  return value.trim();
};

module.exports = {
  isNotEmpty,
  isEmail,
  isPhone,
  isUsername,
  isPassword,
  validateRequired,
  validatePagination,
  sanitizeString
};
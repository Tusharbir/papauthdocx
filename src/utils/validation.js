/**
 * Application-level form validation utilities
 * Provides consistent validation rules and error messages across the application
 */

export const validationRules = {
  // Name validation
  name: {
    required: (value) => !value || value.trim() === '',
    minLength: (value, min = 2) => value && value.length < min,
    maxLength: (value, max = 255) => value && value.length > max,
  },

  // Email validation
  email: {
    required: (value) => !value || value.trim() === '',
    format: (value) => value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  },

  // Password validation
  password: {
    required: (value) => !value || value.trim() === '',
    minLength: (value, min = 8) => value && value.length < min,
    uppercase: (value) => value && !/[A-Z]/.test(value),
    lowercase: (value) => value && !/[a-z]/.test(value),
    number: (value) => value && !/\d/.test(value),
    strength: (value) => {
      if (!value) return false;
      return !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value);
    },
  },

  // Organization name validation
  orgName: {
    required: (value) => !value || value.trim() === '',
    minLength: (value, min = 2) => value && value.length < min,
    maxLength: (value, max = 100) => value && value.length > max,
  },

  // Document ID validation
  docId: {
    required: (value) => !value || value.trim() === '',
    format: (value) => value && !/^[a-zA-Z0-9_-]+$/.test(value),
  },

  // Generic text validation
  text: {
    required: (value) => !value || value.trim() === '',
    minLength: (value, min) => value && value.length < min,
    maxLength: (value, max) => value && value.length > max,
  },
};

export const errorMessages = {
  name: {
    required: 'Name is required',
    minLength: 'Name must be at least 2 characters',
    maxLength: 'Name cannot exceed 255 characters',
  },

  email: {
    required: 'Email is required',
    format: 'Please enter a valid email address',
  },

  password: {
    required: 'Password is required',
    minLength: 'Password must be at least 8 characters',
    uppercase: 'Password must contain at least one uppercase letter',
    lowercase: 'Password must contain at least one lowercase letter',
    number: 'Password must contain at least one number',
    strength: 'Password must contain uppercase, lowercase, and number',
  },

  orgName: {
    required: 'Organization name is required',
    minLength: 'Organization name must be at least 2 characters',
    maxLength: 'Organization name cannot exceed 100 characters',
  },

  docId: {
    required: 'Document ID is required',
    format: 'Document ID can only contain letters, numbers, hyphens, and underscores',
  },

  text: {
    required: 'This field is required',
    minLength: (min) => `Must be at least ${min} characters`,
    maxLength: (max) => `Cannot exceed ${max} characters`,
  },
};

/**
 * Validate a single field
 * @param {string} fieldType - Type of field (name, email, password, etc.)
 * @param {string} value - Field value to validate
 * @param {object} customRules - Optional custom validation rules
 * @returns {string|null} - Error message or null if valid
 */
export const validateField = (fieldType, value, customRules = {}) => {
  const rules = validationRules[fieldType];
  const messages = errorMessages[fieldType];

  if (!rules || !messages) return null;

  // Check required
  if (rules.required(value)) {
    return messages.required;
  }

  // Check other rules
  for (const [rule, validator] of Object.entries(rules)) {
    if (rule === 'required') continue;

    if (customRules[rule] !== undefined) {
      // Use custom rule parameter
      if (validator(value, customRules[rule])) {
        return typeof messages[rule] === 'function' 
          ? messages[rule](customRules[rule]) 
          : messages[rule];
      }
    } else if (validator(value)) {
      return messages[rule];
    }
  }

  return null;
};

/**
 * Validate multiple fields in a form
 * @param {object} formData - Object with field names as keys and values
 * @param {object} fieldTypes - Object mapping field names to validation types
 * @returns {object} - Object with field names as keys and error messages as values
 */
export const validateForm = (formData, fieldTypes) => {
  const errors = {};

  for (const [fieldName, fieldType] of Object.entries(fieldTypes)) {
    const value = formData[fieldName];
    const error = validateField(fieldType, value);
    if (error) {
      errors[fieldName] = error;
    }
  }

  return errors;
};

/**
 * Check if form has any errors
 * @param {object} errors - Errors object from validateForm
 * @returns {boolean} - True if there are errors
 */
export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0;
};

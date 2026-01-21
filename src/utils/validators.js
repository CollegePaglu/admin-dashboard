/**
 * Validation utility functions
 */

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate phone number (Indian format)
 */
export const isValidPhone = (phone) => {
    const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Validate URL format
 */
export const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

/**
 * Validate required field
 */
export const isRequired = (value) => {
    if (typeof value === 'string') {
        return value.trim().length > 0;
    }
    return value !== null && value !== undefined;
};

/**
 * Validate minimum length
 */
export const minLength = (value, min) => {
    if (typeof value === 'string') {
        return value.trim().length >= min;
    }
    return false;
};

/**
 * Validate maximum length
 */
export const maxLength = (value, max) => {
    if (typeof value === 'string') {
        return value.trim().length <= max;
    }
    return false;
};

/**
 * Validate number range
 */
export const inRange = (value, min, max) => {
    const num = Number(value);
    return !isNaN(num) && num >= min && num <= max;
};

/**
 * Validate positive number
 */
export const isPositive = (value) => {
    const num = Number(value);
    return !isNaN(num) && num > 0;
};

/**
 * Validate file size
 */
export const isValidFileSize = (file, maxSizeMB) => {
    if (!file) return false;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
};

/**
 * Validate file type
 */
export const isValidFileType = (file, allowedTypes) => {
    if (!file) return false;
    return allowedTypes.includes(file.type);
};

/**
 * Sanitize HTML to prevent XSS
 */
export const sanitizeHtml = (html) => {
    const temp = document.createElement('div');
    temp.textContent = html;
    return temp.innerHTML;
};

/**
 * Validate form data
 */
export const validateForm = (data, rules) => {
    const errors = {};

    Object.keys(rules).forEach((field) => {
        const value = data[field];
        const fieldRules = rules[field];

        if (fieldRules.required && !isRequired(value)) {
            errors[field] = `${field} is required`;
            return;
        }

        if (fieldRules.email && value && !isValidEmail(value)) {
            errors[field] = 'Invalid email format';
            return;
        }

        if (fieldRules.phone && value && !isValidPhone(value)) {
            errors[field] = 'Invalid phone number';
            return;
        }

        if (fieldRules.url && value && !isValidUrl(value)) {
            errors[field] = 'Invalid URL format';
            return;
        }

        if (fieldRules.minLength && value && !minLength(value, fieldRules.minLength)) {
            errors[field] = `Minimum length is ${fieldRules.minLength}`;
            return;
        }

        if (fieldRules.maxLength && value && !maxLength(value, fieldRules.maxLength)) {
            errors[field] = `Maximum length is ${fieldRules.maxLength}`;
            return;
        }

        if (fieldRules.min !== undefined && value && !inRange(value, fieldRules.min, Infinity)) {
            errors[field] = `Minimum value is ${fieldRules.min}`;
            return;
        }

        if (fieldRules.max !== undefined && value && !inRange(value, -Infinity, fieldRules.max)) {
            errors[field] = `Maximum value is ${fieldRules.max}`;
            return;
        }

        if (fieldRules.positive && value && !isPositive(value)) {
            errors[field] = 'Value must be positive';
            return;
        }

        if (fieldRules.custom && value) {
            const customError = fieldRules.custom(value);
            if (customError) {
                errors[field] = customError;
            }
        }
    });

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};

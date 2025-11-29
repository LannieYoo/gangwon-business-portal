/**
 * File validation utilities
 */

// Maximum file size: 10MB (matching backend MAX_UPLOAD_SIZE)
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

// Allowed file types (matching backend ALLOWED_FILE_TYPES)
export const ALLOWED_FILE_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif'],
  documents: ['application/pdf'],
  all: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
};

/**
 * Format file size to human-readable string
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size (e.g., "5.2 MB")
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Validate file size
 * @param {File} file - File object to validate
 * @param {number} maxSize - Maximum file size in bytes (default: MAX_FILE_SIZE)
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validateFileSize(file, maxSize = MAX_FILE_SIZE) {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }
  
  if (file.size > maxSize) {
    const maxSizeFormatted = formatFileSize(maxSize);
    const fileSizeFormatted = formatFileSize(file.size);
    return {
      valid: false,
      error: `File size (${fileSizeFormatted}) exceeds maximum allowed size of ${maxSizeFormatted}`
    };
  }
  
  return { valid: true };
}

/**
 * Validate file type
 * @param {File} file - File object to validate
 * @param {string[]} allowedTypes - Array of allowed MIME types (default: ALLOWED_FILE_TYPES.all)
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validateFileType(file, allowedTypes = ALLOWED_FILE_TYPES.all) {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }
  
  if (!file.type) {
    return { valid: false, error: 'File type could not be determined' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    const allowedTypesStr = allowedTypes.join(', ');
    return {
      valid: false,
      error: `File type '${file.type}' is not allowed. Allowed types: ${allowedTypesStr}`
    };
  }
  
  return { valid: true };
}

/**
 * Validate file (both size and type)
 * @param {File} file - File object to validate
 * @param {Object} options - Validation options
 * @param {number} options.maxSize - Maximum file size in bytes
 * @param {string[]} options.allowedTypes - Array of allowed MIME types
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validateFile(file, options = {}) {
  const {
    maxSize = MAX_FILE_SIZE,
    allowedTypes = ALLOWED_FILE_TYPES.all
  } = options;
  
  // Validate file size
  const sizeValidation = validateFileSize(file, maxSize);
  if (!sizeValidation.valid) {
    return sizeValidation;
  }
  
  // Validate file type
  const typeValidation = validateFileType(file, allowedTypes);
  if (!typeValidation.valid) {
    return typeValidation;
  }
  
  return { valid: true };
}

/**
 * Validate image file
 * @param {File} file - File object to validate
 * @param {number} maxSize - Maximum file size in bytes (default: MAX_FILE_SIZE)
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validateImageFile(file, maxSize = MAX_FILE_SIZE) {
  return validateFile(file, {
    maxSize,
    allowedTypes: ALLOWED_FILE_TYPES.images
  });
}

/**
 * Validate PDF file
 * @param {File} file - File object to validate
 * @param {number} maxSize - Maximum file size in bytes (default: MAX_FILE_SIZE)
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validatePdfFile(file, maxSize = MAX_FILE_SIZE) {
  return validateFile(file, {
    maxSize,
    allowedTypes: ALLOWED_FILE_TYPES.documents
  });
}


/**
 * Email validation regex pattern
 */
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Password validation regex pattern (min 8 chars, at least 1 letter and 1 number)
 */
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;

/**
 * URL validation regex pattern
 */
const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

/**
 * Validation utility functions
 */
const validation = {
  /**
   * Validate email format
   * @param email Email to validate
   * @returns True if valid, false otherwise
   */
  isValidEmail: (email: string): boolean => {
    return EMAIL_REGEX.test(email);
  },
  
  /**
   * Validate password strength
   * @param password Password to validate
   * @returns True if valid, false otherwise
   */
  isValidPassword: (password: string): boolean => {
    return PASSWORD_REGEX.test(password);
  },
  
  /**
   * Validate URL format
   * @param url URL to validate
   * @returns True if valid, false otherwise
   */
  isValidUrl: (url: string): boolean => {
    return URL_REGEX.test(url);
  },
  
  /**
   * Check if string is empty or only whitespace
   * @param str String to check
   * @returns True if empty, false otherwise
   */
  isEmpty: (str: string): boolean => {
    return !str || str.trim() === '';
  },
  
  /**
   * Check if string meets minimum length requirement
   * @param str String to check
   * @param minLength Minimum length required
   * @returns True if valid, false otherwise
   */
  minLength: (str: string, minLength: number): boolean => {
    return Boolean(str) && str.length >= minLength;
  },
  
  /**
   * Check if string exceeds maximum length
   * @param str String to check
   * @param maxLength Maximum length allowed
   * @returns True if valid, false otherwise
   */
  maxLength: (str: string, maxLength: number): boolean => {
    return !str || str.length <= maxLength;
  },
  
  /**
   * Check if value is a number
   * @param value Value to check
   * @returns True if number, false otherwise
   */
  isNumber: (value: any): boolean => {
    return !isNaN(parseFloat(value)) && isFinite(value);
  },
  
  /**
   * Check if value is a positive number
   * @param value Value to check
   * @returns True if positive number, false otherwise
   */
  isPositiveNumber: (value: any): boolean => {
    return validation.isNumber(value) && parseFloat(value) > 0;
  }
};

export default validation;

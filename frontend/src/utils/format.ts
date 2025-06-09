import { format, formatDistanceToNow } from 'date-fns';

/**
 * Format a date string to a readable format
 * @param dateString Date string to format
 * @param formatStr Format string for date-fns
 * @returns Formatted date string
 */
export const formatDate = (dateString: string, formatStr: string = 'MMM dd, yyyy'): string => {
  try {
    const date = new Date(dateString);
    return format(date, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Format a date string to a relative time (e.g., "2 days ago")
 * @param dateString Date string to format
 * @param addSuffix Whether to add a suffix
 * @returns Relative time string
 */
export const formatRelativeTime = (dateString: string, addSuffix: boolean = true): string => {
  try {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix });
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return dateString;
  }
};

/**
 * Format a currency value
 * @param value Value to format
 * @param currency Currency code
 * @param locale Locale for formatting
 * @returns Formatted currency string
 */
export const formatCurrency = (
  value: number, 
  currency: string = 'USD', 
  locale: string = 'en-US'
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(value);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${value} ${currency}`;
  }
};

/**
 * Truncate a string to a specified length
 * @param str String to truncate
 * @param length Maximum length
 * @param suffix Suffix to add if truncated
 * @returns Truncated string
 */
export const truncateString = (str: string, length: number = 50, suffix: string = '...'): string => {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length - suffix.length) + suffix;
};

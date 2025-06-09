import { useState, useCallback, ChangeEvent } from 'react';
import validation from '../utils/validation';

/**
 * Form field validation rule
 */
interface ValidationRule {
  validator: (value: any, formValues?: any) => boolean;
  message: string;
}

/**
 * Form field configuration
 */
interface FieldConfig {
  value: any;
  validations?: ValidationRule[];
}

/**
 * Form configuration with field definitions
 */
type FormConfig = Record<string, FieldConfig>;

/**
 * Custom hook for form handling with validation
 * @param initialValues Initial form values
 * @param onSubmit Form submission handler
 * @returns Form state and handlers
 */
export function useForm<T extends Record<string, any>>(
  initialValues: T,
  onSubmit?: (values: T) => void | Promise<void>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  /**
   * Handle input change
   * @param e Change event
   */
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : value
    }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  /**
   * Handle input blur
   * @param e Blur event
   */
  const handleBlur = useCallback((e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  /**
   * Set form field value
   * @param name Field name
   * @param value Field value
   */
  const setValue = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  /**
   * Reset form to initial values
   */
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  /**
   * Validate form fields
   * @param fieldConfigs Field configurations with validation rules
   * @returns Validation errors
   */
  const validateForm = useCallback((fieldConfigs: FormConfig) => {
    const newErrors: Record<string, string> = {};
    
    Object.entries(fieldConfigs).forEach(([fieldName, config]) => {
      if (config.validations) {
        for (const rule of config.validations) {
          const isValid = rule.validator(config.value, values);
          
          if (!isValid) {
            newErrors[fieldName] = rule.message;
            break;
          }
        }
      }
    });
    
    return newErrors;
  }, [values]);

  /**
   * Handle form submission
   * @param e Submit event
   * @param fieldConfigs Field configurations with validation rules
   */
  const handleSubmit = useCallback(async (
    e: React.FormEvent<HTMLFormElement>,
    fieldConfigs?: FormConfig
  ) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate form if field configs are provided
      if (fieldConfigs) {
        const formErrors = validateForm(fieldConfigs);
        setErrors(formErrors);
        
        // Mark all fields as touched
        const allTouched = Object.keys(fieldConfigs).reduce((acc, field) => {
          acc[field] = true;
          return acc;
        }, {} as Record<string, boolean>);
        
        setTouched(allTouched);
        
        // Don't submit if there are errors
        if (Object.keys(formErrors).length > 0) {
          setIsSubmitting(false);
          return;
        }
      }
      
      // Call onSubmit handler if provided
      if (onSubmit) {
        await onSubmit(values);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, validateForm, values]);

  /**
   * Create common validation rules
   * @param message Error message
   * @returns Validation rule
   */
  const createValidationRules = {
    required: (message: string = 'This field is required'): ValidationRule => ({
      validator: (value: any) => !validation.isEmpty(String(value)),
      message
    }),
    email: (message: string = 'Please enter a valid email'): ValidationRule => ({
      validator: (value: string) => validation.isValidEmail(value),
      message
    }),
    minLength: (length: number, message?: string): ValidationRule => ({
      validator: (value: string) => validation.minLength(value, length),
      message: message || `Must be at least ${length} characters`
    }),
    maxLength: (length: number, message?: string): ValidationRule => ({
      validator: (value: string) => validation.maxLength(value, length),
      message: message || `Must be no more than ${length} characters`
    }),
    pattern: (pattern: RegExp, message: string): ValidationRule => ({
      validator: (value: string) => pattern.test(value),
      message
    }),
    match: (fieldName: string, message: string): ValidationRule => ({
      validator: (value: string, formValues?: any) => value === formValues?.[fieldName],
      message
    })
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setValue,
    resetForm,
    createValidationRules
  };
}

export default useForm;

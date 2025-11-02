import React, { createContext, useContext, useState, useCallback } from 'react';
import { validateField, validateForm } from '../../shared/validation-rules';
import { UseFormValidatorReturn, FormValidatorProps, FormErrors } from '../../shared/types';

interface FormContextValue<T extends Record<string, any>> extends UseFormValidatorReturn<T> {
  // Additional context values can be added here
}

const FormContext = createContext<FormContextValue<any> | undefined>(undefined);

export const useFormValidator = <T extends Record<string, any>>(): UseFormValidatorReturn<T> => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormValidator must be used within a FormValidator component');
  }
  return context;
};

export const FormValidator = <T extends Record<string, any>>({ 
  fields, 
  initialValues = {} as T, 
  onSubmit, 
  children 
}: FormValidatorProps<T> & { children?: React.ReactNode }) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target;
    const { name, value, type } = target;
    let checkedValue: any = value;
    if (target instanceof HTMLInputElement && type === 'checkbox') {
      checkedValue = target.checked;
    }
    setValues(prev => ({
      ...prev,
      [name]: checkedValue
    }));

    // Clear error when field is modified
    if (errors[name as keyof T]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  }, [errors]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate field on blur
    const error = validateField(value, fields[name as keyof T], values);
    if (error) {
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  }, [fields, values]);

  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when field is modified
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  }, [errors]);

  const setFieldError = useCallback((field: keyof T, error: string | undefined) => {
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  }, []);

  const validateFieldCallback = useCallback((field: keyof T, value: any) => {
    return validateField(value, fields[field], values);
  }, [fields, values]);

  const validateFormCallback = useCallback(() => {
    const formErrors = validateForm(values, fields);
    setErrors(formErrors as Partial<Record<keyof T, string>>);
    return Object.keys(formErrors).length === 0;
  }, [values, fields]);

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched: Partial<Record<keyof T, boolean>> = {};
    Object.keys(fields).forEach(field => {
      allTouched[field as keyof T] = true;
    });
    setTouched(allTouched);
    
    // Validate the form
    const isValid = validateFormCallback();
    if (isValid) {
      onSubmit(values);
    }
  }, [fields, onSubmit, validateFormCallback, values]);

  const contextValue: FormContextValue<T> = {
    values,
    errors,
    touched,
    handleChange: handleChange as any,
    handleBlur: handleBlur as any,
    handleSubmit: handleSubmit as any,
    setFieldValue,
    setFieldError,
    validateField: validateFieldCallback,
    validateForm: validateFormCallback
  };

  return (
    <FormContext.Provider value={contextValue}>
      <form onSubmit={handleSubmit}>
        {children}
      </form>
    </FormContext.Provider>
  );
};

// Form Field Component
export const FormField = <T extends Record<string, any>>({ 
  name, 
  label, 
  type = 'text', 
  placeholder, 
  children 
}: {
  name: keyof T;
  label: string;
  type?: string;
  placeholder?: string;
  children?: React.ReactNode;
}) => {
  const { values, errors, touched, handleChange, handleBlur } = useFormValidator<T>();
  const hasError = touched[name] && errors[name];

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label htmlFor={name as string} style={{ display: 'block', marginBottom: '0.5rem' }}>
        {label}
      </label>
      {children ? (
        children
      ) : (
        <input
          type={type}
          id={name as string}
          name={name as string}
          value={values[name] as string}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: hasError ? '1px solid red' : '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
      )}
      {hasError && (
        <span style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
          {errors[name]}
        </span>
      )}
    </div>
  );
};

// Submit Button Component
export const SubmitButton = ({ children = 'Submit' }: { children?: React.ReactNode }) => {
  return (
    <button
      type="submit"
      style={{
        padding: '0.5rem 1rem',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      {children}
    </button>
  );
};
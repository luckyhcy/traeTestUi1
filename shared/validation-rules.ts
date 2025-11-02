export const required = (value: any): string | undefined => {
  if (value === undefined || value === null || value === '') {
    return 'This field is required';
  }
  return undefined;
};

export const email = (value: string): string | undefined => {
  if (!value) return undefined;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return 'Please enter a valid email address';
  }
  return undefined;
};

export const phone = (value: string): string | undefined => {
  if (!value) return undefined;
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(value)) {
    return 'Please enter a valid phone number';
  }
  return undefined;
};

export const minLength = (min: number) => {
  return (value: string): string | undefined => {
    if (!value) return undefined;
    if (value.length < min) {
      return `Please enter at least ${min} characters`;
    }
    return undefined;
  };
};

export const maxLength = (max: number) => {
  return (value: string): string | undefined => {
    if (!value) return undefined;
    if (value.length > max) {
      return `Please enter no more than ${max} characters`;
    }
    return undefined;
  };
};

export const passwordConfirm = (passwordField: string) => {
  return (value: string, values: Record<string, any>): string | undefined => {
    if (!value) return undefined;
    if (value !== values[passwordField]) {
      return 'Passwords do not match';
    }
    return undefined;
  };
};

export const validateField = (value: any, rules: Array<Function>, values?: Record<string, any>): string | undefined => {
  for (const rule of rules) {
    const error = rule(value, values);
    if (error) {
      return error;
    }
  }
  return undefined;
};

export const validateForm = (values: Record<string, any>, fields: Record<string, Array<Function>>): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  for (const field in fields) {
    if (Object.prototype.hasOwnProperty.call(fields, field)) {
      const rules = fields[field] || [];
      const error = validateField(values[field], rules, values);
      if (error) {
        errors[field] = error;
      }
    }
  }
  
  return errors;
};
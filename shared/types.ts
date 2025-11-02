export type ValidationRule = (value: any, values?: Record<string, any>) => string | undefined;

export type FormFields<T extends Record<string, any>> = Record<keyof T, ValidationRule[]>;

export type FormErrors<T extends Record<string, any>> = Partial<Record<keyof T, string>>;

export interface FormValidatorProps<T extends Record<string, any>> {
  fields: FormFields<T>;
  initialValues?: T;
  onSubmit: (values: T) => void;

}

export interface UseFormValidatorReturn<T extends Record<string, any>> {
  values: T;
  errors: FormErrors<T>;
  touched: Partial<Record<keyof T, boolean>>;
  handleChange: (e: any) => void;
  handleBlur: (e: any) => void;
  handleSubmit: (e: any) => void;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: keyof T, error: string | undefined) => void;
  validateField: (field: keyof T, value: any) => string | undefined;
  validateForm: () => boolean;
}
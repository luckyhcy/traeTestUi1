<template>
  <form @submit.prevent="handleSubmit">
    <slot />
  </form>
</template>

<script lang="ts">
import { defineComponent, reactive, provide, inject } from 'vue';
import type { PropType } from 'vue';
import { validateForm, validateField } from '../../../shared/validation-rules';
import type { FormFields, FormErrors } from '../../../shared/types';

type FormContextValue = {
  values: Record<string, any>;
  errors: FormErrors<any>;
  touched: Partial<Record<string, boolean>>;
  handleChange: (e: Event) => void;
  handleBlur: (e: Event) => void;
  setFieldValue: (field: string | number | symbol, value: any) => void;
  setFieldError: (field: string | number | symbol, error: string | undefined) => void;
  validateField: (field: string | number | symbol, value: any) => string | undefined;
  validateForm: () => boolean;
};

const FormContextSymbol = Symbol('FormContext');

export function useFormValidator(): FormContextValue {
  const context = inject<FormContextValue>(FormContextSymbol);
  if (!context) {
    throw new Error('useFormValidator must be used within a FormValidator component');
  }
  return context;
}

export default defineComponent<{
  fields: FormFields<any>;
  initialValues?: Record<string, any>;
  onSubmit: (values: any) => void;
}>({
  name: 'FormValidator',
  props: {
    fields: {
      type: Object as PropType<FormFields<any>>,
      required: true
    },
    initialValues: {
      type: Object as PropType<Record<string, any>>,
      default: () => ({})
    },
    onSubmit: {
      type: Function as PropType<(values: any) => void>,
      required: true
    }
  },
  setup(props) {
    const values = reactive<Record<string, any>>({ ...props.initialValues });
    const errors = reactive<FormErrors<any>>({});
    const touched = reactive<Partial<Record<string, boolean>>>({});

    const handleChange = (e: Event) => {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      const { name, value, type } = target;
      
      values[name] = type === 'checkbox' ? (target as HTMLInputElement).checked : value;
      
      // Clear error when field is modified
      if (errors[name]) {
        errors[name] = undefined;
      }
    };

    const handleBlur = (e: Event) => {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      const { name, value } = target;
      
      touched[name] = true;
      
      // Validate field on blur
      const error = validateField(value, props.fields[name] || [], values);
      if (error) {
        errors[name] = error;
      }
    };

    const setFieldValue = (field: string | number | symbol, value: any) => {
      values[field as string] = value;
      
      // Clear error when field is modified
      if (errors[field as string]) {
        errors[field as string] = undefined;
      }
    };

    const setFieldError = (field: string | number | symbol, error: string | undefined) => {
      errors[field as string] = error;
    };

    const validateFieldCallback = (field: string | number | symbol, value: any) => {
      return validateField(value, props.fields[field as string] || [], values);
    };

    const validateFormCallback = () => {
      const formErrors = validateForm(values, props.fields);
      
      // Clear existing errors
      for (const field in errors) {
        if (Object.prototype.hasOwnProperty.call(errors, field)) {
          delete errors[field];
        }
      }
      
      // Set new errors
      for (const field in formErrors) {
        if (Object.prototype.hasOwnProperty.call(formErrors, field)) {
          errors[field] = formErrors[field];
        }
      }
      
      return Object.keys(formErrors).length === 0;
    };

    const handleSubmit = () => {
      // Mark all fields as touched
      for (const field in props.fields) {
        if (Object.prototype.hasOwnProperty.call(props.fields, field)) {
          touched[field] = true;
        }
      }
      
      // Validate the form
      const isValid = validateFormCallback();
      if (isValid) {
        props.onSubmit({ ...values });
      }
    };

    const contextValue: FormContextValue = {
      values,
      errors,
      touched,
      handleChange,
      handleBlur,
      setFieldValue,
      setFieldError,
      validateField: validateFieldCallback,
      validateForm: validateFormCallback
    };

    provide(FormContextSymbol, contextValue);

    return {
      handleSubmit
    };
  }
});
</script>
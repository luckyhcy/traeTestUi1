import React from 'react';
import { FormValidator, FormField, SubmitButton } from './FormValidator';
import { required, email, minLength } from '../../shared/validation-rules';

interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

const FormExample: React.FC = () => {
  const handleSubmit = (values: LoginFormValues) => {
    alert(`Form submitted successfully!\n\nEmail: ${values.email}\nPassword: ${values.password}\nRemember Me: ${values.rememberMe}`);
    console.log('Form submitted:', values);
  };

  const fields = {
    email: [required, email],
    password: [required, minLength(6)],
    rememberMe: []
  };

  const initialValues: LoginFormValues = {
    email: '',
    password: '',
    rememberMe: false
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '2rem' }}>
      <h2>Login Form</h2>
      <FormValidator
        fields={fields}
        initialValues={initialValues}
        onSubmit={handleSubmit}
      >
        <FormField
          name="email"
          label="Email"
          type="email"
          placeholder="Enter your email"
        />
        <FormField
          name="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
        />
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              name="rememberMe"
              onChange={() => {
                // This is handled automatically by FormValidator
              }}
              style={{ marginRight: '0.5rem' }}
            />
            Remember Me
          </label>
        </div>
        <SubmitButton>Log In</SubmitButton>
      </FormValidator>
    </div>
  );
};

export default FormExample;
<template>
  <div id="login-form-container" class="form-example" style="max-width: 400px; margin: 0 auto; padding: 2rem; border: 1px solid #ccc; border-radius: 8px; background-color: #fff;">
    <h2 style="text-align: center; margin-bottom: 2rem;">Login Form</h2>
    <FormValidator
      :fields="fields"
      :initial-values="initialValues"
      :on-submit="handleSubmit"
    >
      <FormContent />
    </FormValidator>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FormValidator from './FormValidator.vue';
import FormContent from './FormContent.vue';
import { required, email, minLength } from '../../../shared/validation-rules';

interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}



export default defineComponent({
  name: 'FormExample',
  components: {
    FormValidator,
    FormContent
  },
  setup() {
    console.log('FormExample component is being rendered');
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

    return {
      handleSubmit,
      fields,
      initialValues
    };
  }
});
</script>
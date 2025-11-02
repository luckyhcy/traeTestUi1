<template>
  <div>
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
    <div style="margin-bottom: 1rem">
      <label style="display: flex; alignItems: center">
        <input
          type="checkbox"
          name="rememberMe"
          :checked="values.rememberMe"
          @change="handleChange"
          @blur="handleBlur"
          style="marginRight: 0.5rem"
        />
        Remember Me
      </label>
    </div>
    <SubmitButton>Log In</SubmitButton>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FormField from './FormField.vue';
import SubmitButton from './SubmitButton.vue';
import { useFormValidator } from './FormValidator.vue';

export default defineComponent({
  name: 'FormContent',
  components: {
    FormField,
    SubmitButton
  },
  setup() {
    // 使用useFormValidator hook获取表单上下文
    const {
      values,
      handleChange,
      handleBlur
    } = useFormValidator();

    return {
      values,
      handleChange,
      handleBlur
    };
  }
});
</script>
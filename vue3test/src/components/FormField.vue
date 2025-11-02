<template>
  <div style="margin-bottom: 1rem">
    <label :for="name" style="display: block; margin-bottom: 0.5rem">
      {{ label }}
    </label>
    <input
      :type="type"
      :id="name"
      :name="name"
      :value="values[name] || ''"
      @input="handleChange"
      @blur="handleBlur"
      :placeholder="placeholder"
      :style="{
        width: '100%',
        padding: '0.5rem',
        border: hasError ? '1px solid red' : '1px solid #ccc',
        borderRadius: '4px'
      }"
    />
    <span v-if="hasError" style="color: red; fontSize: '0.8rem'; marginTop: '0.25rem'; display: 'block'">
      {{ errors[name] }}
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useFormValidator } from './FormValidator.vue';

export default defineComponent({
  name: 'FormField',
  props: {
    name: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'text'
    },
    placeholder: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const { values, errors, touched, handleChange, handleBlur } = useFormValidator();
    
    const hasError = computed(() => {
      return touched[props.name] && errors[props.name];
    });
    
    return {
      values,
      errors,
      touched,
      handleChange,
      handleBlur,
      hasError
    };
  }
});
</script>
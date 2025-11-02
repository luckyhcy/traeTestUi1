<template>
  <button
    type="submit"
    style="
      padding: 0.5rem 1rem;
      backgroundColor: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    "
  >
    {{ children || 'Submit' }}
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SubmitButton',
  props: {
    children: {
      type: String,
      default: 'Submit'
    }
  }
});
</script>
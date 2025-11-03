<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="120px"
    @submit.prevent="handleSubmit"
  >
    <el-form-item label="Email" prop="email">
      <el-input
        v-model="form.email"
        placeholder="Enter your email"
        type="email"
      />
    </el-form-item>
    <el-form-item label="Password" prop="password">
      <el-input
        v-model="form.password"
        placeholder="Enter your password"
        type="password"
        show-password
      />
    </el-form-item>
    <el-form-item label="Confirm Password" prop="confirmPassword">
      <el-input
        v-model="form.confirmPassword"
        placeholder="Confirm your password"
        type="password"
        show-password
      />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" native-type="submit">Submit</el-button>
      <el-button @click="resetForm">Reset</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';

// 定义表单数据类型
interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
}

// 组件属性
interface Props {
  initialValues?: Partial<FormData>;
}

// 组件事件
const emits = defineEmits(['submit', 'reset']);

const props = withDefaults(defineProps<Props>(), {
  initialValues: () => ({}),
});

// 表单实例
const formRef = ref<FormInstance>();

// 表单数据
const form = reactive<FormData>({
  email: props.initialValues.email || '',
  password: props.initialValues.password || '',
  confirmPassword: props.initialValues.confirmPassword || '',
});

// 监听初始值变化
watch(() => props.initialValues, (newValues) => {
  if (newValues) {
    Object.assign(form, newValues);
  }
}, { deep: true });

// 表单验证规则
const rules = reactive<FormRules<FormData>>({
  email: [
    { required: true, message: 'Please input your email', trigger: 'blur' },
    { type: 'email', message: 'Please input a valid email', trigger: 'blur' },
  ],
  password: [
    { required: true, message: 'Please input your password', trigger: 'blur' },
    { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: 'Please confirm your password', trigger: 'blur' },
    {
      validator(_, value) {
        if (!value || form.password === value) {
          return true;
        }
        return Promise.reject(new Error('The two passwords do not match'));
      },
      trigger: 'blur',
    },
  ],
});

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields();
  emits('reset');
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate((valid) => {
    if (valid) {
      emits('submit', form);
    } else {
      console.log('Form validation failed');
    }
  });
};

// 暴露方法给父组件
const exposeMethods = {
  resetForm,
  validate: () => formRef.value?.validate(),
};

defineExpose(exposeMethods);
</script>
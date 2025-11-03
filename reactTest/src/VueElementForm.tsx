import React, { useState, useRef, useEffect } from 'react';
import { createApp, h } from 'vue';
import { applyVueInReact } from 'veaury';
import ElementPlus from 'element-plus';
import type { App } from 'vue';
import 'element-plus/dist/index.css';
// 使用type断言解决类型问题
import zhCn from 'element-plus/es/locale/lang/zh-cn';

// 导入Vue组件
// @ts-ignore - Vue组件没有类型声明文件
import ElementFormVue from './vue-components/ElementForm.vue';

// 定义表单数据类型
interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
}

// 定义组件属性
interface VueElementFormProps {
  initialValues?: Partial<FormData>;
  onSubmit: (values: FormData) => void;
  onReset?: () => void;
}

const VueElementForm: React.FC<VueElementFormProps> = ({
  initialValues = {},
  onSubmit,
  onReset,
}) => {
  // React状态
  const [formValues, setFormValues] = useState<FormData>({
    email: initialValues.email || '',
    password: initialValues.password || '',
    confirmPassword: initialValues.confirmPassword || '',
  });

  // 保存Vue组件实例的引用
  const vueComponentRef = useRef<any>(null);

  // 当initialValues变化时，更新Vue组件
  useEffect(() => {
    if (vueComponentRef.current) {
      vueComponentRef.current.$props.initialValues = initialValues;
    }
  }, [initialValues]);

  // 处理表单提交
  const handleSubmit = (values: FormData) => {
    setFormValues(values);
    onSubmit(values);
  };

  // 处理表单重置
  const handleReset = () => {
    setFormValues({
      email: '',
      password: '',
      confirmPassword: '',
    });
    if (onReset) {
      onReset();
    }
  };



  // 转换Vue组件为React组件
  const ReactElementForm = applyVueInReact({
    rootComponent: ElementFormVue,
    vueOptions: {
      // Vue应用配置
      createApp,
      h,
      plugins: [
        // 配置Element Plus
        (app: App) => {
          app.use(ElementPlus, {
            locale: zhCn,
          });
        },
      ],
    },
    // 传递给Vue组件的属性
    props: {
      initialValues: formValues,
    },
    // 传递给Vue组件的事件
    events: {
      submit: handleSubmit,
      reset: handleReset,
    },
    // 引用Vue组件实例
    ref: vueComponentRef,
  }) as React.FC;

  // 返回React组件
  return <ReactElementForm />;
};

export default VueElementForm;

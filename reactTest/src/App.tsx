

import './App.css';
import VueElementForm from './VueElementForm';

function App() {
  // 初始表单值
  const initialValues = {
    email: 'test@example.com',
  };

  // 处理表单提交
  const handleSubmit = (values: any) => {
    alert(`Form submitted successfully!\n\nEmail: ${values.email}\nPassword: ${values.password}`);
    console.log('Form submitted:', values);
  };

  // 处理表单重置
  const handleReset = () => {
    console.log('Form reset');
  };

  return (
    <div className="App">
      <h1>React中使用Vue Element Plus表单</h1>
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '2rem' }}>
        <VueElementForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          onReset={handleReset}
        />
      </div>
    </div>
  );
}

export default App;
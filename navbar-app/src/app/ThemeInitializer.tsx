'use client';

import { useEffect } from 'react';

const ThemeInitializer = () => {
  // 在页面加载时应用主题
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = savedTheme ? savedTheme === 'dark' : systemDarkMode;
      
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  return null; // 这个组件不需要渲染任何内容
};

export default ThemeInitializer;
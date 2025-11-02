'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

// 定义语言类型
type Language = 'zh' | 'en' | 'ja';

// 定义导航菜单项类型
type NavItem = {
  label: string;
  href: string;
};

// 定义用户菜单项类型
type UserMenuItem = {
  label: string;
  href: string;
};

const Navbar: React.FC = () => {
  // 使用next-intl翻译函数
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  // 状态管理
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>(locale as Language);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 导航菜单项
  const navItems: NavItem[] = [
    { label: t('nav.home'), href: '/' },
    { label: t('nav.about'), href: '/about' },
    { label: t('nav.services'), href: '/services' },
    { label: t('nav.products'), href: '/products' },
    { label: t('nav.contact'), href: '/contact' },
  ];

  // 用户菜单项
  const userMenuItems: UserMenuItem[] = [
    { label: t('userMenu.profile'), href: '/profile' },
    { label: t('userMenu.settings'), href: '/settings' },
    { label: t('userMenu.logout'), href: '/logout' },
  ];

  // 语言选项
  const languageOptions = [
    { code: 'zh', name: '中文' },
    { code: 'en', name: 'English' },
    { code: 'ja', name: '日本語' },
  ];

  // 检测系统颜色模式并设置初始值
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 从本地存储获取主题设置
      const savedTheme = localStorage.getItem('theme');
      const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = savedTheme ? savedTheme === 'dark' : systemDarkMode;
      
      setIsDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  // 切换颜色模式
  const toggleDarkMode = () => {
    const newIsDarkMode = !isDarkMode;
    setIsDarkMode(newIsDarkMode);
    
    if (typeof window !== 'undefined') {
      // 更新DOM
      if (newIsDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // 保存到本地存储
      localStorage.setItem('theme', newIsDarkMode ? 'dark' : 'light');
    }
  };

  // 切换移动端菜单
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // 切换语言下拉菜单
  const toggleLanguageMenu = () => {
    setIsLanguageMenuOpen(!isLanguageMenuOpen);
  };

  // 切换用户下拉菜单
  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const pathname = usePathname();

  // 选择语言
  const selectLanguage = (language: Language) => {
    setCurrentLanguage(language);
    setIsLanguageMenuOpen(false);
    // For App Router, we need to construct the URL with the locale prefix
    const currentPath = pathname.replace(/^\/(zh|en|ja)/, '');
    router.push(`/${language}${currentPath}`);
  };

  // 关闭所有下拉菜单
  const closeAllMenus = () => {
    setIsLanguageMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // 检查是否点击了语言菜单外部
      const languageMenu = document.getElementById('language-menu');
      const languageButton = document.getElementById('language-button');
      if (languageMenu && !languageMenu.contains(target) && languageButton && !languageButton.contains(target)) {
        setIsLanguageMenuOpen(false);
      }

      // 检查是否点击了用户菜单外部
      const userMenu = document.getElementById('user-menu');
      const userButton = document.getElementById('user-button');
      if (userMenu && !userMenu.contains(target) && userButton && !userButton.contains(target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-md transition-colors duration-300">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/next.svg"
            alt="Logo"
            width={40}
            height={40}
            className="dark:invert"
          />
          <span className="text-xl font-bold text-gray-800 dark:text-white">MyWebsite</span>
        </Link>

        {/* 桌面端导航菜单 */}
        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* 右侧功能区 */}
        <div className="flex items-center space-x-4">
          {/* 语言切换器 */}
          <div className="relative">
            <button
              id="language-button"
              onClick={toggleLanguageMenu}
              className="flex items-center space-x-1 text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
            >
              <span>{currentLanguage.toUpperCase()}</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* 语言下拉菜单 */}
            {isLanguageMenuOpen && (
              <div
                id="language-menu"
                className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50"
              >
                {languageOptions.map((option) => (
                  <button
                    key={option.code}
                    onClick={() => selectLanguage(option.code as Language)}
                    className={`w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${currentLanguage === option.code ? 'bg-blue-100 dark:bg-blue-900 font-medium' : ''}`}
                  >
                    {option.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 主题切换按钮 */}
          <button
            onClick={toggleDarkMode}
            className="text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
            aria-label="切换主题"
          >
            {isDarkMode ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            )}
          </button>

          {/* 用户头像 */}
          <div className="relative">
            <button
              id="user-button"
              onClick={toggleUserMenu}
              className="flex items-center space-x-1 text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
            >
              <Image
              src="/globe.svg"
              alt="User Avatar"
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
            </button>

            {/* 用户下拉菜单 */}
            {isUserMenuOpen && (
              <div
                id="user-menu"
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50"
              >
                {userMenuItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    onClick={closeAllMenus}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 移动端汉堡菜单按钮 */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
            aria-label="切换菜单"
          >
            {isMobileMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* 移动端导航菜单 */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 shadow-lg absolute w-full z-40">
          <div className="container mx-auto px-4 py-3 flex flex-col space-y-4">
            {navItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200 py-2 border-b border-gray-100 dark:border-gray-800"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
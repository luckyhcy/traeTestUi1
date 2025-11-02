import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['zh', 'en', 'ja'],
  
  // If no locale matches, use this one as the fallback
  defaultLocale: 'zh',
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(zh|en|ja)/:path*'],
};
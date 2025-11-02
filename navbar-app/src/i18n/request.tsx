import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Define the supported locales
const locales = ['zh', 'en', 'ja'];

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming locale is supported
  if (!locale || !locales.includes(locale)) notFound();

  // Load the messages for the current locale
  const messages = (await import(`../messages/${locale}/common.json`)).default;

  return {
    messages,
    locale,
  };
});
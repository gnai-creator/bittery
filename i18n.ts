export const locales = ['en', 'pt', 'es', 'fr', 'sv', 'de', 'ru'] as const;
export const defaultLocale = 'en';
export const localePrefix = 'always';

import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({locale}) => ({
  messages: (await import(`./locales/${locale || defaultLocale}/common.json`)).default,
  locale: locale || defaultLocale,
}));

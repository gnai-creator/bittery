export const locales = ['en', 'pt', 'es', 'fr', 'sv', 'de', 'ru'] as const;
export const defaultLocale = 'en';
export const localePrefix = 'always';

import {getRequestConfig} from 'next-intl/server';

const messagesMap = {
  en: () => import('./locales/en/common.json').then((m) => m.default),
  pt: () => import('./locales/pt/common.json').then((m) => m.default),
  es: () => import('./locales/es/common.json').then((m) => m.default),
  fr: () => import('./locales/fr/common.json').then((m) => m.default),
  sv: () => import('./locales/sv/common.json').then((m) => m.default),
  de: () => import('./locales/de/common.json').then((m) => m.default),
  ru: () => import('./locales/ru/common.json').then((m) => m.default),
} as const;

export default getRequestConfig(async ({locale}) => ({
  messages: await messagesMap[(locale ?? defaultLocale) as keyof typeof messagesMap](),
  locale: locale || defaultLocale,
}));

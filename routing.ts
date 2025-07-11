import {defineRouting} from 'next-intl/routing';
import {locales, defaultLocale, localePrefix} from './i18n';

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix,
});

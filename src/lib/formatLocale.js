export const LOCALE_AR = 'ar-SA-u-nu-latn';
export const LOCALE_EN = 'en-US';

export function appLocale(lang) {
  return lang === 'ar' ? LOCALE_AR : LOCALE_EN;
}

export function formatDate(date, lang, options) {
  return new Date(date).toLocaleDateString(appLocale(lang), options);
}

export function formatNumber(value, lang, options) {
  return Number(value).toLocaleString(appLocale(lang), options);
}

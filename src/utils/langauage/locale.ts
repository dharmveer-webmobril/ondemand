/** Map app i18n language codes to BCP 47 locales for Intl formatting. */
export function mapI18nLanguageToIntlLocale(language: string): string {
  const map: Record<string, string> = {
    en: 'en-US',
    sp: 'es-ES',
    frcd: 'fr-CA',
    pt: 'pt-BR',
    hn: 'hi-IN',
  };
  return map[language] || 'en-US';
}

/** Map app language codes to Accept-Language header values. */
export function mapI18nLanguageToAcceptLanguage(language: string): string {
  const map: Record<string, string> = {
    en: 'en',
    sp: 'es',
    frcd: 'fr-CA',
    pt: 'pt',
    hn: 'hi',
  };
  return map[language] || 'en';
}

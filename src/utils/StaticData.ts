import imagePaths from "@assets";

/** Language picker rows — display names come from i18n in LanguageSettings */
export const LANGUAGE_OPTIONS_CONFIG = [
  { id: 1, image: imagePaths.US_flag, type: 'en', labelKey: 'languageSetting.languageList.en' },
  { id: 2, image: imagePaths.france, type: 'frcd', labelKey: 'languageSetting.languageList.frcd' },
  { id: 3, image: imagePaths.spain, type: 'sp', labelKey: 'languageSetting.languageList.sp' },
  { id: 4, image: imagePaths.portugal, type: 'pt', labelKey: 'languageSetting.languageList.port' },
  { id: 5, image: imagePaths.india, type: 'hn', labelKey: 'languageSetting.languageList.hn' },
] as const;

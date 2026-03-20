import imagePaths from "@assets";
import i18next from "i18next";

export const categories = [
    
]

export const getLanguageData = () => [
    {
      name: i18next.t('languageSetting.languageList.en'),
      id: 1,
      image: imagePaths.US_flag,
      type: 'en',
    },
    {
      name: i18next.t('languageSetting.languageList.frcd'),
      id: 2,
      image: imagePaths.france,
      type: 'frcd',
    },
    {
      name: i18next.t('languageSetting.languageList.sp'),
      id: 3,
      image: imagePaths.spain,
      type: 'sp',
    },
    {
      name: i18next.t('languageSetting.languageList.port'),
      id: 4,
      image: imagePaths.portugal,
      type: 'pt',
    },
    {
      name: i18next.t('languageSetting.languageList.hn'),
      id: 4,
      image: imagePaths.portugal,
      type: 'hn',
    },
  ];
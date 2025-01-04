import i18n from '../i18n/config';

export const getDynamicTranslation = (key: string, defaultText: string) => {
  const translation = i18n.t(key, { defaultValue: defaultText });
  return translation === key ? defaultText : translation;
};

export const addDynamicTranslation = (key: string, translations: { [lang: string]: string }) => {
  Object.entries(translations).forEach(([lang, text]) => {
    i18n.addResource(lang, 'translation', key, text);
  });
};
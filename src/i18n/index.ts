import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ar from './locales/ar.json';
import en from './locales/en.json';
import fr from './locales/fr.json';

// اللغات المدعومة حاليًا. عند إضافة لغة جديدة مستقبلاً: أضف ملف JSON في locales/
// وأضف مفتاحها هنا فقط — بقية التطبيق (الاتجاه RTL/LTR، مبدّل اللغة) يتكيّف تلقائيًا.
export const SUPPORTED_LANGUAGES = [
  { code: 'ar', label: 'العربية', dir: 'rtl' as const },
  { code: 'fr', label: 'Français', dir: 'ltr' as const },
  { code: 'en', label: 'English', dir: 'ltr' as const },
];

const STORAGE_KEY = 'tamanina-lang';

function detectInitialLanguage(): string {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED_LANGUAGES.some((l) => l.code === stored)) return stored;
  return 'ar';
}

i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: detectInitialLanguage(),
  fallbackLng: 'ar',
  interpolation: { escapeValue: false },
});

export function applyDocumentDirection(lang: string) {
  const meta = SUPPORTED_LANGUAGES.find((l) => l.code === lang) ?? SUPPORTED_LANGUAGES[0];
  document.documentElement.lang = meta.code;
  document.documentElement.dir = meta.dir;
}

export function changeLanguage(lang: string) {
  localStorage.setItem(STORAGE_KEY, lang);
  i18n.changeLanguage(lang);
  applyDocumentDirection(lang);
}

applyDocumentDirection(i18n.language);

export default i18n;

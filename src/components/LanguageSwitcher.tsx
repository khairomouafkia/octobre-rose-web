import React from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, changeLanguage } from '../i18n';

interface LanguageSwitcherProps {
  variant?: 'light' | 'dark';
}

export default function LanguageSwitcher({ variant = 'light' }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();

  return (
    <select
      value={i18n.language}
      onChange={(e) => changeLanguage(e.target.value)}
      aria-label="اللغة / Language"
      style={{
        background: variant === 'dark' ? 'rgba(255,255,255,0.08)' : 'var(--surface)',
        color: variant === 'dark' ? 'white' : 'var(--ink)',
        border: variant === 'dark' ? '1px solid rgba(255,255,255,0.18)' : '1px solid var(--border-strong)',
        borderRadius: 8,
        padding: '8px 10px',
        fontSize: '0.8125rem',
        width: '100%',
        cursor: 'pointer',
      }}
    >
      {SUPPORTED_LANGUAGES.map((lang) => (
        <option key={lang.code} value={lang.code} style={{ color: 'initial' }}>
          {lang.label}
        </option>
      ))}
    </select>
  );
}

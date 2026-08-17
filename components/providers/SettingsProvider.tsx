'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'ko' | 'ja';
type FontSize = 'normal' | 'large' | 'xlarge';

interface SettingsContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  t: (koText: string, jaText: string) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('ko');
  const [fontSize, setFontSize] = useState<FontSize>('normal');

  // 💡 마법의 글자 크기 스케일링: html 기본 폰트 사이즈를 조작하여 Tailwind의 모든 rem 단위를 키웁니다.
  useEffect(() => {
    const htmlElement = document.documentElement;
    if (fontSize === 'normal') htmlElement.style.fontSize = '16px';
    if (fontSize === 'large') htmlElement.style.fontSize = '19px';
    if (fontSize === 'xlarge') htmlElement.style.fontSize = '22px';
  }, [fontSize]);

  // 💡 시연용 초간단 번역 함수
  const t = (koText: string, jaText: string) => {
    return lang === 'ko' ? koText : jaText;
  };

  return (
    <SettingsContext.Provider value={{ lang, setLang, fontSize, setFontSize, t }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
}
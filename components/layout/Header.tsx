'use client';

import React from 'react';
import { HeartHandshake, Mic } from 'lucide-react';
import { useSettings } from '@/components/providers/SettingsProvider';

export default function Header() {
  const { t } = useSettings();

  return (
    <header className="fixed w-full top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <a href="/" className="flex items-center gap-2 cursor-pointer">
            <HeartHandshake className="w-8 h-8 text-teal-600" />
            <span className="font-bold text-2xl text-slate-900 tracking-tight">CareCircle</span>
          </a>

          <nav className="hidden md:flex space-x-8">
            <a href="/#about" className="text-slate-600 hover:text-teal-600 font-medium transition-colors">{t('서비스 소개', 'サービス紹介')}</a>
            <a href="/#features" className="text-slate-600 hover:text-teal-600 font-medium transition-colors">{t('주요 기능', '主な機能')}</a>
            <a href="/#contact" className="text-slate-600 hover:text-teal-600 font-medium transition-colors">{t('도입 문의', '導入のお問い合わせ')}</a>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <a href="/login" className="text-slate-600 hover:text-slate-900 font-medium px-4 py-2">
              {t('관리자/보호자 로그인', '管理者/保護者ログイン')}
            </a>
            <a href="/login" className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2">
              <Mic className="w-5 h-5" /> {t('어르신 시작하기', 'シニア向けスタート')}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
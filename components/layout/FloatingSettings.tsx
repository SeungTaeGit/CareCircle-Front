'use client';

import React, { useState } from 'react';
import { useSettings } from '../providers/SettingsProvider';
import { Settings, X, Globe, Type } from 'lucide-react';

export default function FloatingSettings() {
  const { lang, setLang, fontSize, setFontSize } = useSettings();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">
      {/* 설정 메뉴 패널 */}
      {isOpen && (
        <div className="bg-white p-4 rounded-2xl shadow-2xl border border-slate-200 w-64 animate-in slide-in-from-bottom-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1"><Settings className="w-4 h-4"/> 설정</h3>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4"/></button>
          </div>

          {/* 다국어 설정 */}
          <div className="mb-4">
            <p className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1"><Globe className="w-3 h-3"/> 언어 (Language)</p>
            <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
              <button onClick={() => setLang('ko')} className={`flex-1 py-1.5 text-xs font-bold rounded-md ${lang === 'ko' ? 'bg-white shadow-sm text-teal-600' : 'text-slate-500'}`}>🇰🇷 한국어</button>
              <button onClick={() => setLang('ja')} className={`flex-1 py-1.5 text-xs font-bold rounded-md ${lang === 'ja' ? 'bg-white shadow-sm text-teal-600' : 'text-slate-500'}`}>🇯🇵 日本語</button>
            </div>
          </div>

          {/* 글자 크기 설정 */}
          <div>
            <p className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1"><Type className="w-3 h-3"/> 글자 크기 (Kiosk)</p>
            <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
              <button onClick={() => setFontSize('normal')} className={`flex-1 py-1.5 text-xs font-bold rounded-md ${fontSize === 'normal' ? 'bg-white shadow-sm text-teal-600' : 'text-slate-500'}`}>기본</button>
              <button onClick={() => setFontSize('large')} className={`flex-1 py-1.5 text-sm font-bold rounded-md ${fontSize === 'large' ? 'bg-white shadow-sm text-teal-600' : 'text-slate-500'}`}>크게</button>
              <button onClick={() => setFontSize('xlarge')} className={`flex-1 py-1.5 text-base font-bold rounded-md ${fontSize === 'xlarge' ? 'bg-white shadow-sm text-teal-600' : 'text-slate-500'}`}>더 크게</button>
            </div>
          </div>
        </div>
      )}

      {/* 플로팅 토글 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-slate-800 transition-transform active:scale-95 border-2 border-white/20"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Settings className="w-6 h-6 animate-[spin_4s_linear_infinite]" />}
      </button>
    </div>
  );
}
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HeartHandshake, UserRound, Home, Building2, Play, MessageCircle } from 'lucide-react';
import { useSettings } from '@/components/providers/SettingsProvider'; // 💡 번역 모듈 추가

type RoleTab = 'senior' | 'guardian' | 'admin';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useSettings(); // 💡 번역 함수 사용
  const [activeTab, setActiveTab] = useState<RoleTab>('senior');

  const [pinCode, setPinCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSeniorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/senior/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinCode })
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.token || data.accessToken;
        localStorage.setItem('accessToken', token);
        localStorage.setItem('userRole', 'ROLE_SENIOR');
        router.push('/senior');
      } else {
        alert(t('PIN 번호를 다시 확인해주세요.', 'PIN番号をもう一度ご確認ください。'));
      }
    } catch (error) {
      console.error('로그인 에러:', error);
      alert(t('서버와 연결할 수 없습니다. 백엔드 서버가 켜져 있는지 확인해주세요.', 'サーバーに接続できません。'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStaffLogin = async (e: React.FormEvent, role: 'guardian' | 'admin') => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const endpoint = role === 'guardian'
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/auth/guardian/login`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/auth/admin/login`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.token || data.accessToken;
        localStorage.setItem('accessToken', token);
        localStorage.setItem('userRole', role === 'guardian' ? 'ROLE_GUARDIAN' : 'ROLE_ADMIN');
        router.push(`/${role}`);
      } else {
        alert(t('이메일 또는 비밀번호가 일치하지 않습니다.', 'メールアドレスまたはパスワードが一致しません。'));
      }
    } catch (error) {
      console.error('로그인 에러:', error);
      alert(t('서버와 연결할 수 없습니다.', 'サーバーに接続できません。'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-sky-50 flex items-center justify-center p-4 selection:bg-teal-200">

      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100">

        <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500 rounded-full blur-2xl"></div>
          </div>
          <button onClick={() => router.push('/')} className="inline-flex items-center gap-2 relative z-10 text-white hover:opacity-80 transition-opacity">
            <HeartHandshake className="w-8 h-8 text-teal-500" />
            <span className="font-bold text-2xl tracking-tight">CareCircle</span>
          </button>
          <p className="text-slate-300 mt-2 relative z-10 text-sm">{t('환영합니다! 역할을 선택해주세요.', 'ようこそ！役割を選択してください。')}</p>
        </div>

        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('senior')}
            className={`flex-1 py-4 font-bold transition-colors flex items-center justify-center gap-2 ${activeTab === 'senior' ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50' : 'text-slate-500 hover:text-slate-800 bg-white'}`}
          >
            <UserRound className="w-5 h-5" />{t('어르신', 'シニア')}
          </button>
          <button
            onClick={() => setActiveTab('guardian')}
            className={`flex-1 py-4 font-bold transition-colors flex items-center justify-center gap-2 ${activeTab === 'guardian' ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50' : 'text-slate-500 hover:text-slate-800 bg-white'}`}
          >
            <Home className="w-5 h-5" />{t('보호자', '保護者')}
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex-1 py-4 font-bold transition-colors flex items-center justify-center gap-2 ${activeTab === 'admin' ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50' : 'text-slate-500 hover:text-slate-800 bg-white'}`}
          >
            <Building2 className="w-5 h-5" />{t('관리자', '管理者')}
          </button>
        </div>

        <div className="p-8 h-[520px] flex flex-col justify-center relative overflow-hidden">

          {activeTab === 'senior' && (
            <form onSubmit={handleSeniorLogin} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 w-full">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{t('어르신 간편 시작', 'シニア簡単スタート')}</h3>
                <p className="text-slate-500 text-sm break-keep">
                  {t('기관에서 발급받은', '施設から発行された')} <span className="text-teal-600 font-bold">{t('6자리 번호', '6桁の番号')}</span>{t('를 누르세요.', 'を入力してください。')}
                </p>
              </div>
              <div>
                <input
                  type="text"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  className="w-full px-4 py-6 rounded-2xl border-2 border-slate-200 focus:ring-0 focus:border-teal-500 outline-none transition-colors bg-slate-50 text-teal-600 text-center text-3xl font-bold tracking-[0.5em]"
                  placeholder="------"
                  maxLength={6}
                />
              </div>
              <button disabled={isLoading} type="submit" className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-bold py-5 rounded-2xl transition-colors shadow-md text-xl flex items-center justify-center gap-2">
                <Play className="w-6 h-6 fill-white" /> {isLoading ? t('로그인 중...', 'ログイン中...') : t('시작하기', 'はじめる')}
              </button>
            </form>
          )}

          {activeTab === 'guardian' && (
            <form onSubmit={(e) => handleStaffLogin(e, 'guardian')} className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-slate-900">{t('보호자 로그인', '保護者ログイン')}</h3>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">{t('이메일', 'メールアドレス')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="guardian@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">{t('비밀번호', 'パスワード')}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button disabled={isLoading} type="submit" className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-600 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md mt-2">
                {isLoading ? t('로그인 중...', 'ログイン中...') : t('이메일로 로그인', 'メールでログイン')}
              </button>

              <div className="relative flex py-4 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-sm font-medium">{t('또는', 'または')}</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <button
                type="button"
                onClick={() => router.push(`${process.env.NEXT_PUBLIC_API_URL}/oauth2/authorization/kakao`)}
                className="w-full bg-[#FEE500] hover:bg-[#E5CF00] text-[#000000] font-bold py-3.5 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5 fill-black" /> {t('카카오로 3초 만에 시작', 'カカオで3秒でスタート')}
              </button>
            </form>
          )}

          {activeTab === 'admin' && (
            <form onSubmit={(e) => handleStaffLogin(e, 'admin')} className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-slate-900">{t('기관 관리자 접속', '施設管理者アクセス')}</h3>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">{t('관리자 이메일', '管理者メールアドレス')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="admin@gicon.or.kr"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">{t('비밀번호', 'パスワード')}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center gap-2 text-sm text-slate-600 font-medium cursor-pointer">
                  <input type="checkbox" className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer" /> {t('로그인 유지', 'ログイン状態を保持')}
                </label>
              </div>
              <button disabled={isLoading} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md mt-4">
                {isLoading ? t('로그인 중...', 'ログイン中...') : t('관리자 대시보드 입장', '管理者ダッシュボードへ')}
              </button>
            </form>
          )}
        </div>

        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
          <p className="text-sm text-slate-500 break-keep">
            {t('기관 등록 및 계정 발급 문의는', '施設登録およびアカウント発行のお問い合わせは')} <button onClick={() => router.push('/#contact')} className="text-teal-600 font-bold hover:underline">{t('여기', 'こちら')}</button>{t('를 눌러주세요.', 'をクリックしてください。')}
          </p>
        </div>
      </div>
    </div>
  );
}
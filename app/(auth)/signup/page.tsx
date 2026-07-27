'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HeartHandshake, Home, Building2, UserPlus } from 'lucide-react';
import Link from 'next/link';

type SignupTab = 'guardian' | 'admin';

export default function SignupPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SignupTab>('guardian');

  // 보호자 회원가입 폼 상태 (Swagger: GuardianSignupRequest 대응)
  const [guardianForm, setGuardianForm] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    password: '',
    linkCode: '' // 어르신과 연결하기 위한 기관 발급 코드
  });

  // 관리자 회원가입 폼 상태 (Swagger: AdminSignupRequest 대응)
  const [adminForm, setAdminForm] = useState({
    institutionName: '',
    managerName: '',
    email: '',
    password: ''
  });

  // 보호자 회원가입 제출 로직
  const handleGuardianSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/guardian/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(guardianForm)
      });
      if (res.ok) {
        alert('보호자 회원가입이 완료되었습니다. 로그인해주세요!');
        router.push('/login');
      } else {
        alert('회원가입에 실패했습니다. 입력 정보를 확인해주세요.');
      }
    } catch (err) {
      console.error(err);
      alert('서버와 연결할 수 없습니다.');
    }
  };

  // 관리자 회원가입 제출 로직
  const handleAdminSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/admin/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminForm)
      });
      if (res.ok) {
        alert('기관 관리자 등록이 완료되었습니다. 승인 후 로그인 가능합니다.');
        router.push('/login');
      } else {
        alert('회원가입에 실패했습니다.');
      }
    } catch (err) {
      console.error(err);
      alert('서버와 연결할 수 없습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-sky-50 flex items-center justify-center p-4 selection:bg-teal-200 py-12">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-100">

        {/* 상단 헤더 */}
        <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500 rounded-full blur-2xl"></div>
          </div>
          <Link href="/" className="inline-flex items-center gap-2 relative z-10 text-white hover:opacity-80 transition-opacity">
            <HeartHandshake className="w-8 h-8 text-teal-500" />
            <span className="font-bold text-2xl tracking-tight">CareCircle</span>
          </Link>
          <p className="text-slate-300 mt-2 relative z-10 text-sm">함께 돌봄의 고리를 만들어가요.</p>
        </div>

        {/* 탭 버튼 영역 */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('guardian')}
            className={`flex-1 py-4 font-bold transition-colors flex items-center justify-center gap-2 ${activeTab === 'guardian' ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50' : 'text-slate-500 hover:text-slate-800 bg-white'}`}
          >
            <Home className="w-5 h-5" /> 보호자 가입
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex-1 py-4 font-bold transition-colors flex items-center justify-center gap-2 ${activeTab === 'admin' ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50' : 'text-slate-500 hover:text-slate-800 bg-white'}`}
          >
            <Building2 className="w-5 h-5" /> 관리자 등록
          </button>
        </div>

        {/* 폼 영역 (UX 개선: 높이가 자주 변하지 않도록 min-h 지정) */}
        <div className="p-8 min-h-[450px] flex flex-col justify-center">

          {/* 보호자 폼 */}
          {activeTab === 'guardian' && (
            <form onSubmit={handleGuardianSignup} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h3 className="text-xl font-bold text-slate-900 mb-4 text-center">보호자 계정 생성</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">이름</label>
                  <input type="text" required
                    value={guardianForm.name} onChange={(e) => setGuardianForm({...guardianForm, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="홍길동" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">연락처</label>
                  <input type="tel" required
                    value={guardianForm.phoneNumber} onChange={(e) => setGuardianForm({...guardianForm, phoneNumber: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="010-0000-0000" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">이메일</label>
                <input type="email" required
                  value={guardianForm.email} onChange={(e) => setGuardianForm({...guardianForm, email: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="guardian@example.com" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">비밀번호</label>
                <input type="password" required
                  value={guardianForm.password} onChange={(e) => setGuardianForm({...guardianForm, password: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">어르신 연결 코드 <span className="text-xs text-teal-600 font-normal">(선택)</span></label>
                <input type="text"
                  value={guardianForm.linkCode} onChange={(e) => setGuardianForm({...guardianForm, linkCode: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="기관에서 발급받은 8자리 코드" />
              </div>
              <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md mt-6 flex justify-center items-center gap-2">
                <UserPlus className="w-5 h-5" /> 보호자 가입완료
              </button>
            </form>
          )}

          {/* 관리자 폼 */}
          {activeTab === 'admin' && (
            <form onSubmit={handleAdminSignup} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h3 className="text-xl font-bold text-slate-900 mb-4 text-center">기관 관리자 등록 신청</h3>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">기관명</label>
                <input type="text" required
                  value={adminForm.institutionName} onChange={(e) => setAdminForm({...adminForm, institutionName: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="예: 전주 행복복지관" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">담당자 성함</label>
                <input type="text" required
                  value={adminForm.managerName} onChange={(e) => setAdminForm({...adminForm, managerName: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="김복지" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">기관 이메일 (아이디)</label>
                <input type="email" required
                  value={adminForm.email} onChange={(e) => setAdminForm({...adminForm, email: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="admin@carecircle.or.kr" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">비밀번호</label>
                <input type="password" required
                  value={adminForm.password} onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="••••••••" />
              </div>
              <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md mt-6 flex justify-center items-center gap-2">
                <Building2 className="w-5 h-5" /> 관리자 등록완료
              </button>
            </form>
          )}

        </div>

        {/* 하단 로그인 링크 */}
        <div className="bg-slate-50 p-5 text-center border-t border-slate-100">
          <p className="text-sm text-slate-500">이미 계정이 있으신가요? <Link href="/login" className="text-teal-600 font-bold hover:underline">로그인하기</Link></p>
        </div>
      </div>
    </div>
  );
}
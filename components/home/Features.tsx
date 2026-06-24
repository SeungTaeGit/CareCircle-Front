import React from 'react';
import { UserRound, Home, Building2, CheckCircle2 } from 'lucide-react';

export default function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">누구를 위한 서비스인가요?</h2>
        <p className="text-lg text-slate-500 mb-16">세 가지 핵심 사용자를 위한 맞춤형 생태계를 제공합니다.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {/* 어르신 */}
          <div className="p-8 rounded-3xl bg-slate-50 hover:-translate-y-2 transition-transform duration-300 border border-slate-100">
            <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mb-6">
              <UserRound className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">어르신</h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              복잡한 입력 없이 <strong>큰 마이크 버튼 하나</strong>로 일상을 기록하고, 이웃 나라 친구와 목소리를 나눕니다.
            </p>
            <ul className="text-sm text-slate-500 space-y-3">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /> 매일 주어지는 쉬운 취미 미션</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /> 성취감을 주는 '함께정원' 보상</li>
            </ul>
          </div>

          {/* 보호자 */}
          <div className="p-8 rounded-3xl bg-slate-50 hover:-translate-y-2 transition-transform duration-300 border border-slate-100">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
              <Home className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">가족 (보호자)</h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              부모님의 활동량과 정서 상태를 분석한 <strong>안심 리포트</strong>를 주간 단위로 받아보며 멀리서도 마음을 전합니다.
            </p>
            <ul className="text-sm text-slate-500 space-y-3">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500" /> 정서 분석 기반 AI 요약 보고서</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500" /> 음성 편지로 응원 메시지 전송</li>
            </ul>
          </div>

          {/* 기관 관리자 */}
          <div className="p-8 rounded-3xl bg-slate-50 hover:-translate-y-2 transition-transform duration-300 border border-slate-100">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">복지관/지자체</h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              수십 명의 어르신 상태를 한눈에 파악하는 <strong>통합 대시보드</strong>로 돌봄 인력의 한계를 극복합니다.
            </p>
            <ul className="text-sm text-slate-500 space-y-3">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600" /> 부정적 발화 및 무응답 이상 탐지</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600" /> 참여도 통계 기반 맞춤형 케어</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
'use client';

import React, { useState } from 'react';
import { 
  Play,
  UserRound, 
  Home, 
  Building2, 
  CheckCircle2 
} from 'lucide-react';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface InquiryFormData {
  name: string;
  organization: string;
  contactInfo: string;
  message: string;
}

export default function App() {
  const [formData, setFormData] = useState<InquiryFormData>({
    name: '',
    organization: '',
    contactInfo: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    console.log("백엔드로 전송할 데이터:", formData);
    alert("도입 문의가 성공적으로 접수되었습니다! (현재는 UI 테스트입니다)");
    
    setFormData({ name: '', organization: '', contactInfo: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-teal-200 selection:text-teal-900">
      
      {/* 네비게이션 바 */}
      <Header />

      {/* 히어로 섹션 */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-br from-teal-50 to-sky-50 overflow-hidden">
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-600/5 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 text-teal-700 font-semibold mb-6">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-600"></span>
                </span>
                2026 글로벌 피우다 프로젝트 선정작
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight mb-6">
                어르신을 돌봄의 대상에서<br/>
                <span className="text-teal-600">사회참여의 주체</span>로.
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                음성 하나로 기록되는 일상, 한국과 일본을 잇는 시니어 취미 교류. <br/>
                AI 기술로 따뜻한 소통의 다리를 놓습니다.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#contact" className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition-colors shadow-lg text-center">
                  기관 도입 상담하기
                </a>
                <button className="bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center gap-2">
                  <Play className="w-5 h-5 fill-slate-900" /> 소개 영상 보기
                </button>
              </div>
            </div>
            
            <div className="relative rounded-2xl overflow-hidden shadow-2xl h-[400px] md:h-[500px]">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent z-10"></div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="스마트패드를 보며 웃는 어르신" 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-6 left-6 right-6 z-20 text-white">
                <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg inline-block mb-3 border border-white/30 text-sm font-medium">
                  🌱 함께정원 레벨 4 달성!
                </div>
                <p className="font-bold text-xl md:text-2xl leading-snug">&quot;오늘 부침개 부치는 소리를 녹음해서 일본 친구에게 보냈단다.&quot;</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 사용자 베네핏 섹션 */}
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
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /> 성취감을 주는 함께정원 보상</li>
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

      {/* 도입 문의 (Contact Form) */}
      <section id="contact" className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">CareCircle 도입 문의</h2>
            <p className="text-slate-500">복지관, 주간보호센터, 지자체 사업 담당자님의 연락을 기다립니다.</p>
          </div>
          
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-2">담당자 성함</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors" 
                    placeholder="홍길동" 
                    required 
                  />
                </div>
                <div>
                  <label htmlFor="organization" className="block text-sm font-bold text-slate-700 mb-2">소속 기관명</label>
                  <input 
                    type="text" 
                    id="organization" 
                    name="organization" 
                    value={formData.organization}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors" 
                    placeholder="ㅇㅇ복지관" 
                    required 
                  />
                </div>
              </div>
              <div>
                <label htmlFor="contactInfo" className="block text-sm font-bold text-slate-700 mb-2">연락처 (이메일 또는 전화번호)</label>
                <input 
                  type="text" 
                  id="contactInfo" 
                  name="contactInfo" 
                  value={formData.contactInfo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors" 
                  placeholder="test@example.com" 
                  required 
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-bold text-slate-700 mb-2">문의 내용</label>
                <textarea 
                  id="message" 
                  name="message" 
                  rows="4" 
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors resize-none" 
                  placeholder="도입 규모 및 궁금하신 점을 남겨주세요." 
                  required 
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl transition-colors shadow-md text-lg"
              >
                문의 접수하기
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <Footer />
    </div>
  );
}
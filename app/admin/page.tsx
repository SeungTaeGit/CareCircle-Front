'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  HeartHandshake, Building2, PieChart, Users, ListChecks, FileText,
  User, LogOut, Search, Bell, CheckCheck, AlertTriangle,
  BellRing, Phone, Play, Smile, Meh, ChevronRight, UserPlus, X, Key, Link as LinkIcon
} from 'lucide-react';

// 백엔드 Swagger API 명세 기반 DTO 타입 정의
interface NotificationResponse {
  notificationId: number;
  seniorName: string;
  triggerType: string;
  message: string;
  sopGuide: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);

  // 💡 어르신 등록 모달 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [registrationStep, setRegistrationStep] = useState<'form' | 'success'>('form');

  // 신규 등록 폼 데이터 (Swagger: SeniorSaveRequest 기반)
  const [seniorForm, setSeniorForm] = useState({
    name: '',
    birthDate: '', // 예: 1945-05-08
    gender: 'FEMALE',
    country: 'KOREA',
    language: 'ko-KR',
    hobbies: '' // 쉼표로 구분
  });

  // 등록 성공 후 백엔드에서 받아온 코드 정보 (Swagger: SeniorSaveResponse 기반)
  const [issuedCodes, setIssuedCodes] = useState({
    seniorId: 0,
    pinCode: '',
    linkCode: ''
  });

  // 화면 렌더링 시 알림 데이터를 백엔드에서 가져오는 로직
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const response = await fetch('http://localhost:8080/api/admin/notifications/unread', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
        } else {
          setNotifications([
            {
              notificationId: 1,
              seniorName: "박순덕",
              triggerType: "NO_PARTICIPATION",
              message: "3일 연속 미션 미참여. 최근 통화 기록 없음.",
              sopGuide: "전화 안부 확인 요망",
              createdAt: new Date().toISOString()
            },
            {
              notificationId: 2,
              seniorName: "이철수",
              triggerType: "NEGATIVE_SENTIMENT",
              message: "오늘 미션 음성 분석 결과, '우울/부정적' 단어 빈도 증가.",
              sopGuide: "방문 상담 권장",
              createdAt: new Date().toISOString()
            }
          ]);
        }
      } catch (error) {
        console.error("통신 에러:", error);
      }
    };

    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`http://localhost:8080/api/admin/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.filter(n => n.notificationId !== id));
    } catch (e) {
      console.error(e);
    }
  };

  // 💡 어르신 신규 등록 요청 (POST /api/seniors)
  const handleRegisterSenior = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8080/api/seniors', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(seniorForm)
      });

      if (response.ok) {
        // 성공 시 백엔드에서 준 발급 번호 챙기기
        const data = await response.json();
        setIssuedCodes(data);
        setRegistrationStep('success'); // 모달 화면을 '성공 화면'으로 변경
      } else {
        alert('등록에 실패했습니다. 입력 정보를 확인해주세요.');
      }
    } catch (error) {
      console.error("어르신 등록 에러:", error);
      // 백엔드 연결 안 될 때를 대비한 모의 성공 처리 (UI 확인용)
      setIssuedCodes({ seniorId: 99, pinCode: "123456", linkCode: "ABCD-EFGH" });
      setRegistrationStep('success');
    }
  };

  // 모달 닫기 및 초기화
  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setRegistrationStep('form');
      setSeniorForm({ name: '', birthDate: '', gender: 'FEMALE', country: 'KOREA', language: 'ko-KR', hobbies: '' });
    }, 300); // 모달 닫히는 애니메이션 시간 확보
  };

  return (
    <div className="bg-slate-50 text-slate-800 font-sans flex h-screen overflow-hidden selection:bg-teal-200 relative">

      {/* 💡 어르신 신규 등록 모달창 (Z-index를 높게 설정하여 제일 위에 띄움) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden transform transition-all">

            {/* 모달 헤더 */}
            <div className="bg-slate-900 p-6 flex justify-between items-center relative">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500 rounded-full blur-2xl"></div>
              </div>
              <h2 className="text-xl font-bold text-white relative z-10 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-teal-400" />
                {registrationStep === 'form' ? '어르신 신규 등록' : '등록 완료 및 발급 정보'}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white relative z-10 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* 모달 본문 - 1단계: 입력 폼 */}
            {registrationStep === 'form' && (
              <form onSubmit={handleRegisterSenior} className="p-8 space-y-5 animate-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">성함</label>
                    <input type="text" required value={seniorForm.name} onChange={(e) => setSeniorForm({...seniorForm, name: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="홍길동" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">생년월일</label>
                    <input type="date" required value={seniorForm.birthDate} onChange={(e) => setSeniorForm({...seniorForm, birthDate: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">성별</label>
                    <select value={seniorForm.gender} onChange={(e) => setSeniorForm({...seniorForm, gender: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none bg-white">
                      <option value="MALE">남성</option>
                      <option value="FEMALE">여성</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">매칭 국가</label>
                    <select value={seniorForm.country} onChange={(e) => setSeniorForm({...seniorForm, country: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none bg-white">
                      <option value="KOREA">대한민국</option>
                      <option value="JAPAN">일본</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">관심사 / 취미 (쉼표로 구분)</label>
                  <input type="text" value={seniorForm.hobbies} onChange={(e) => setSeniorForm({...seniorForm, hobbies: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="예: 노래, 요리, 바둑" />
                </div>

                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 mt-2">
                  <p className="text-sm text-amber-800 flex gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    저장 시, 어르신이 태블릿에서 로그인할 6자리 PIN 코드와 보호자 연결용 코드가 자동 발급됩니다.
                  </p>
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={closeModal} className="flex-1 bg-white border border-slate-300 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50 transition-colors">취소</button>
                  <button type="submit" className="flex-[2] bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl shadow-md transition-colors flex justify-center items-center gap-2">
                    등록 및 코드 발급
                  </button>
                </div>
              </form>
            )}

            {/* 모달 본문 - 2단계: 성공 및 발급 번호 안내 */}
            {registrationStep === 'success' && (
              <div className="p-8 text-center animate-in slide-in-from-right-4 duration-300">
                <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex justify-center items-center mx-auto mb-4">
                  <CheckCheck className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">등록이 완료되었습니다!</h3>
                <p className="text-slate-500 mb-8">아래 발급된 코드를 메모하거나 전달해 주세요.</p>

                <div className="space-y-4">
                  {/* 어르신 로그인용 PIN 번호 */}
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-500 flex items-center gap-1"><Key className="w-4 h-4" /> 어르신 간편 로그인 (PIN)</p>
                      <p className="text-3xl font-bold text-teal-600 tracking-widest mt-1">{issuedCodes.pinCode || '123456'}</p>
                    </div>
                    <button className="text-slate-400 hover:text-teal-600 transition-colors p-2" title="복사하기">
                      <FileText className="w-5 h-5" />
                    </button>
                  </div>

                  {/* 보호자 연결 코드 */}
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-500 flex items-center gap-1"><LinkIcon className="w-4 h-4" /> 보호자 연결 (초대 코드)</p>
                      <p className="text-xl font-bold text-slate-800 mt-1">{issuedCodes.linkCode || 'ABCD-EFGH'}</p>
                    </div>
                    <button className="text-slate-400 hover:text-teal-600 transition-colors p-2" title="복사하기">
                      <FileText className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <button onClick={closeModal} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-md transition-colors mt-8">
                  확인하고 창 닫기
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 1. 좌측 사이드바 (Navigation) */}
      <aside className="w-64 bg-slate-900 text-white flex-col hidden md:flex flex-shrink-0">
        <div className="h-20 flex items-center px-6 border-b border-slate-800">
          <HeartHandshake className="text-teal-500 w-8 h-8 mr-2" />
          <span className="font-bold text-xl tracking-tight">CareCircle Admin</span>
        </div>

        <div className="p-6 border-b border-slate-800 bg-slate-800/30">
          <p className="text-xs text-slate-400 mb-1">현재 접속 기관</p>
          <p className="font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-500" /> 전주 행복복지관
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            <li>
              <Link href="/admin" className="flex items-center px-6 py-3 bg-teal-500/20 border-l-4 border-teal-500 text-teal-400 font-bold">
                <PieChart className="w-5 h-5 mr-3" /> 대시보드 홈
              </Link>
            </li>
            <li>
              <a href="#" className="flex items-center px-6 py-3 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                <Users className="w-5 h-5 mr-3" /> 어르신 관리
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center px-6 py-3 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                <ListChecks className="w-5 h-5 mr-3" /> 미션 배포 및 현황
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center px-6 py-3 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                <FileText className="w-5 h-5 mr-3" /> 기관 통계 리포트
              </a>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={() => { localStorage.clear(); router.push('/login'); }} className="flex items-center text-slate-300 hover:text-white transition-colors w-full">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center mr-3">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold">김담당 사회복지사</p>
            </div>
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* 2. 우측 메인 콘텐츠 영역 */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">

        {/* 상단 헤더 */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0 z-10">
          <h1 className="text-2xl font-bold text-slate-900">오늘의 돌봄 현황</h1>
          <div className="flex items-center gap-6">

            {/* 💡 헤더에 어르신 신규 등록 버튼 추가 */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 text-sm"
            >
              <UserPlus className="w-4 h-4" /> 어르신 신규 등록
            </button>

            <div className="relative">
              <input type="text" placeholder="어르신 이름 검색..." className="pl-10 pr-4 py-2 border border-slate-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-64 bg-slate-50" />
              <Search className="w-4 h-4 absolute left-4 top-3 text-slate-400" />
            </div>
            <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
              <Bell className="w-6 h-6" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>
          </div>
        </header>

        {/* 스크롤 가능한 본문 영역 */}
        <div className="flex-1 overflow-y-auto p-8">

          {/* 핵심 요약 카드 (Summary Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 text-sm font-medium mb-1">전체 등록 어르신</p>
                  <h3 className="text-3xl font-bold text-slate-900">42<span className="text-lg text-slate-400 font-normal ml-1">명</span></h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 text-sm font-medium mb-1">오늘 미션 참여율</p>
                  <h3 className="text-3xl font-bold text-slate-900">78<span className="text-lg text-slate-400 font-normal ml-1">%</span></h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">
                  <CheckCheck className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 text-sm font-medium mb-1">일본 어르신 교류 매칭</p>
                  <h3 className="text-3xl font-bold text-slate-900">35<span className="text-lg text-slate-400 font-normal ml-1">쌍</span></h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
                  <HeartHandshake className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* 위험 감지 카드 */}
            <div className="bg-red-50 rounded-2xl p-6 border border-red-200 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-red-600 text-sm font-bold mb-1">안부 확인 필요 (AI 감지)</p>
                  <h3 className="text-3xl font-bold text-red-600">{notifications.length}<span className="text-lg text-red-400 font-normal ml-1">건</span></h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-500 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* AI 집중 케어 리스트 */}
            <div className="lg:col-span-1 bg-white rounded-2xl border border-red-200 shadow-md overflow-hidden flex flex-col h-[500px]">
              <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex justify-between items-center flex-shrink-0">
                <h3 className="font-bold text-red-600 flex items-center gap-2">
                  <BellRing className="w-5 h-5 animate-pulse" /> 집중 케어 필요
                </h3>
                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold">우선 처리</span>
              </div>
              <div className="p-4 flex-1 overflow-y-auto space-y-3">
                {notifications.length === 0 ? (
                  <div className="text-center text-slate-400 py-10">새로운 알림이 없습니다.</div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.notificationId} className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-slate-900">{notif.seniorName} 어르신</h4>
                        <span className="text-xs text-slate-400">최근 감지</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">
                        <span className={`font-semibold mr-1 ${notif.triggerType === 'NO_PARTICIPATION' ? 'text-red-500' : 'text-amber-500'}`}>
                          {notif.triggerType === 'NO_PARTICIPATION' ? '이상 감지:' : '정서 알림:'}
                        </span>
                        {notif.message}
                      </p>
                      <div className="flex gap-2">
                        <button className="flex-1 bg-white border border-slate-300 text-slate-700 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-50 flex justify-center items-center gap-1">
                          <Phone className="w-3 h-3" /> 연락하기
                        </button>
                        <button onClick={() => handleMarkAsRead(notif.notificationId)} className="flex-1 bg-teal-600 text-white py-1.5 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">
                          확인 완료
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 실시간 미션 참여 현황 테이블 */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[500px]">
              <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center flex-shrink-0">
                <h3 className="font-bold text-slate-900 text-lg">실시간 미션 참여 현황</h3>
                <button className="text-teal-600 text-sm font-bold hover:underline flex items-center gap-1">
                  전체보기 <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="overflow-auto flex-1 p-0">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 shadow-sm">
                    <tr className="text-slate-500 text-sm">
                      <th className="py-3 px-6 font-medium font-bold">어르신 성함</th>
                      <th className="py-3 px-6 font-medium font-bold">제출 시간</th>
                      <th className="py-3 px-6 font-medium font-bold">참여 내용 (STT 변환)</th>
                      <th className="py-3 px-6 font-medium font-bold">AI 감정 분석</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">김순자</td>
                      <td className="py-4 px-6 text-slate-500">14:20</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center hover:bg-teal-600 hover:text-white transition-colors">
                            <Play className="w-3 h-3 fill-current" />
                          </button>
                          <span className="truncate w-40 text-slate-600">"어릴 땐 엿장수가 가위질하면..."</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-bold">
                          <Smile className="w-3 h-3" /> 긍정 (85%)
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">최영호</td>
                      <td className="py-4 px-6 text-slate-500">13:05</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center hover:bg-teal-600 hover:text-white transition-colors">
                            <Play className="w-3 h-3 fill-current" />
                          </button>
                          <span className="truncate w-40 text-slate-600">"고구마를 화로에 구워 먹었지."</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                          <Meh className="w-3 h-3" /> 평온 (60%)
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
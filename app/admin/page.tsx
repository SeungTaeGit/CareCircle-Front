'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  HeartHandshake, Building2, PieChart, Users, ListChecks, FileText,
  User, LogOut, Search, Bell, CheckCheck, AlertTriangle,
  BellRing, Phone, Play, Smile, Meh, Check, ChevronRight
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

  // 화면 렌더링 시 알림 데이터를 백엔드에서 가져오는 로직
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          alert('로그인이 필요합니다.');
          router.push('/login');
          return;
        }

        // 🚀 Swagger에 정의된 미확인 알림 조회 API 호출
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
          // 백엔드 API가 아직 없거나 에러일 경우 임시(Mock) 데이터 세팅
          console.warn("알림 API를 찾을 수 없어 임시 데이터를 표시합니다.");
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
  }, [router]);

  // 알림 읽음 처리 로직 (PATCH /api/admin/notifications/{id}/read)
  const handleMarkAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`http://localhost:8080/api/admin/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // 성공 시 화면에서 해당 알림 제거
      setNotifications(prev => prev.filter(n => n.notificationId !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-slate-50 text-slate-800 font-sans flex h-screen overflow-hidden selection:bg-teal-200">

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
                  {/* 수정된 부분: class -> className */}
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

            {/* AI 집중 케어 리스트 (백엔드 알림 연동) */}
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

            {/* 실시간 미션 참여 현황 테이블 (임시 하드코딩, 추후 연동 필요) */}
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
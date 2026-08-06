'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import SummaryCards from '@/components/admin/SummaryCards';
import NotificationList from '@/components/admin/NotificationList';
import AddSeniorModal from '@/components/admin/AddSeniorModal';
import MissionManager from '@/components/admin/MissionManager'; // 💡 새로 만든 컴포넌트 임포트
import { Plus, Link as LinkIcon, RefreshCcw, Bell, X, UserCheck } from 'lucide-react';

export default function AdminDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 데이터 State 관리
  const [seniors, setSeniors] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [dangerSignals, setDangerSignals] = useState<any[]>([]);

  // 추천 매칭 모달 관련 State
  const [isRecommendModalOpen, setIsRecommendModalOpen] = useState(false);
  const [selectedSeniorId, setSelectedSeniorId] = useState<number | null>(null);
  const [recommendedPartners, setRecommendedPartners] = useState<any[]>([]);

  // 💡 탭 상태 관리 (어르신 목록 vs 미션 관리) 추가
  const [activeTab, setActiveTab] = useState<'SENIORS' | 'MISSIONS'>('SENIORS');

  useEffect(() => {
    fetchSeniors();
    fetchNotifications();
    fetchDangerSignals();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // 1. 데이터 Fetch 함수들
  const fetchSeniors = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/admin/seniors', { headers: getAuthHeaders() });
      if (res.ok) setSeniors(await res.json());
    } catch (e) { console.error("어르신 목록 조회 실패", e); }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/admin/notifications/unread', { headers: getAuthHeaders() });
      if (res.ok) setNotifications(await res.json());
    } catch (e) { console.error("알림 조회 실패", e); }
  };

  const fetchDangerSignals = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/admin/signals', { headers: getAuthHeaders() });
      if (res.ok) setDangerSignals(await res.json());
    } catch (e) { console.error("위험 신호 조회 실패", e); }
  };

  // 2. 추천 매칭 프로세스
  const openRecommendModal = async (seniorId: number) => {
    setSelectedSeniorId(seniorId);
    try {
      const res = await fetch(`http://localhost:8080/api/admin/seniors/${seniorId}/recommends`, { headers: getAuthHeaders() });
      if (res.ok) {
        setRecommendedPartners(await res.json());
        setIsRecommendModalOpen(true);
      }
    } catch (e) {
      console.error("추천 목록 조회 실패", e);
      alert("추천 목록을 불러올 수 없습니다.");
    }
  };

  const confirmMatch = async (partnerId: number) => {
    if (!selectedSeniorId) return;

    console.log("👉 백엔드로 전송할 파트너 ID: ", partnerId);

    if (partnerId === undefined || partnerId === null) {
      alert("매칭 대상의 ID를 찾을 수 없습니다. (백엔드 데이터 필드명 확인 필요)");
      return;
    }

    try {
      const res = await fetch(`http://localhost:8080/api/admin/seniors/${selectedSeniorId}/match`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ partnerId: partnerId })
      });

      if (res.ok) {
        alert("매칭이 성공적으로 확정되었습니다!");
        setIsRecommendModalOpen(false);
        fetchSeniors(); // 매칭 완료 후 목록 최신화
      } else {
        alert("매칭 처리에 실패했습니다. (서버 응답 오류)");
      }
    } catch (e) {
      alert("매칭 확정 중 오류가 발생했습니다.");
    }
  };

  const handleUnmatch = async (seniorId: number) => {
    if (!window.confirm('정말 매칭을 해제하시겠습니까?')) return;
    try {
      const res = await fetch(`http://localhost:8080/api/admin/seniors/${seniorId}/unmatch`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        alert("매칭이 해제되었습니다.");
        fetchSeniors();
      }
    } catch (e) { console.error("매칭 해제 실패", e); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* 상단 헤더 */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
          <h1 className="text-2xl font-bold text-slate-900">관리자 대시보드</h1>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-teal-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20"
            >
              <Plus className="w-5 h-5" /> 신규 어르신 등록
            </button>
            <button className="text-slate-400 hover:text-slate-600 text-xl relative">
              <Bell />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <SummaryCards notificationCount={dangerSignals.length + notifications.length} />

          {/* 💡 탭 메뉴 버튼 (어르신 관리 / 미션 배포 현황) */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setActiveTab('SENIORS')}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm ${activeTab === 'SENIORS' ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
            >
              어르신 관리
            </button>
            <button
              onClick={() => setActiveTab('MISSIONS')}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm ${activeTab === 'MISSIONS' ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
            >
              미션 배포 및 현황
            </button>
          </div>

          {/* 메인 콘텐츠 영역 (그리드 레이아웃) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* 💡 탭 상태에 따라 좌측 넓은 영역의 컴포넌트를 교체합니다 */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
              {activeTab === 'SENIORS' ? (
                <>
                  <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 text-lg">어르신 펜팔 매칭 관리</h3>
                    <span className="text-sm text-slate-500">총 <span className="font-bold text-teal-600">{seniors.length}</span>명</span>
                  </div>
                  <div className="overflow-x-auto flex-1 p-4">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-slate-500 text-sm border-b border-slate-200">
                          <th className="py-3 px-4 font-medium">성함 (나이)</th>
                          <th className="py-3 px-4 font-medium">국적</th>
                          <th className="py-3 px-4 font-medium">상태</th>
                          <th className="py-3 px-4 font-medium">매칭 파트너</th>
                          <th className="py-3 px-4 font-medium text-center">관리 액션</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-slate-100">
                        {seniors.map(senior => (
                          <tr key={senior.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-4 font-bold text-slate-900">{senior.name}</td>
                            <td className="py-4 px-4 text-slate-500">{senior.country === 'KR' ? '🇰🇷 한국' : '🇯🇵 일본'}</td>
                            <td className="py-4 px-4">
                              {senior.matchStatus === 'WAITING' ? (
                                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">대기 중</span>
                              ) : (
                                <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-bold">교류 중</span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-slate-600 font-medium">{senior.partnerName || '-'}</td>
                            <td className="py-4 px-4 text-center">
                              {senior.matchStatus === 'WAITING' ? (
                                <button
                                  onClick={() => openRecommendModal(senior.id)}
                                  className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold mx-auto flex items-center gap-1"
                                >
                                  <LinkIcon className="w-3 h-3" /> 매칭 추천받기
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUnmatch(senior.id)}
                                  className="bg-white border border-red-200 text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-bold mx-auto flex items-center gap-1"
                                >
                                  <RefreshCcw className="w-3 h-3" /> 매칭 해제
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                /* 💡 새로 추가한 미션 배포 및 현황 컴포넌트 렌더링 */
                <MissionManager seniors={seniors} />
              )}
            </div>

            {/* 기존 알림/위험 신호 컴포넌트 통합 (우측 좁은 영역 고정) */}
            <NotificationList
              notifications={notifications}
              dangerSignals={dangerSignals}
              refreshData={() => { fetchNotifications(); fetchDangerSignals(); }}
            />
          </div>
        </div>
      </main>

      {/* 추천 매칭 모달 */}
      {isRecommendModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-teal-600" /> AI 매칭 추천 목록
              </h2>
              <button onClick={() => setIsRecommendModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {recommendedPartners.length === 0 ? (
                <p className="text-center text-slate-500 py-10">현재 적합한 대기자가 없습니다.</p>
              ) : (
                recommendedPartners.map((partner, index) => {
                  const targetId = partner.id || partner.partnerId || partner.seniorId;

                  return (
                    <div key={targetId || index} className="p-4 border border-slate-200 rounded-xl flex justify-between items-center hover:border-teal-500 hover:bg-teal-50 transition-colors">
                      <div>
                        <h4 className="font-bold text-slate-900">{partner.name} <span className="text-sm font-normal text-slate-500">({partner.country === 'JP' ? '일본' : '한국'})</span></h4>
                        <p className="text-xs text-slate-500 mt-1">공통 관심사: <span className="text-teal-600 font-bold">{partner.commonHobbies}</span></p>
                      </div>
                      <button onClick={() => confirmMatch(targetId)} className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-teal-700">
                        확정
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* 신규 어르신 등록 모달 */}
      <AddSeniorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import SummaryCards from '@/components/admin/SummaryCards';
import NotificationList from '@/components/admin/NotificationList';
import AddSeniorModal from '@/components/admin/AddSeniorModal';
import { Plus, Link as LinkIcon, RefreshCcw, Bell } from 'lucide-react';

export default function AdminDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notifications] = useState([
    { notificationId: 1, seniorName: '김철수', triggerType: 'NO_PARTICIPATION', message: '오전 미션 미수행', sopGuide: '전화 상담', createdAt: '10:00' }
  ]);

  const [seniors, setSeniors] = useState<any[]>([]);

  const fetchSeniors = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch('http://localhost:8080/api/admin/seniors', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSeniors(data);
      }
    } catch (error) {
      console.error("어르신 목록 조회 실패:", error);
    }
  };

  useEffect(() => {
    fetchSeniors();
  }, []);

  const handleMatch = async (seniorId: number) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8080/api/admin/seniors/${seniorId}/match`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('성공적으로 해외 파트너와 매칭되었습니다!');
        fetchSeniors();
      } else {
        alert('매칭 가능한 대기 중인 해외 파트너가 없습니다.');
      }
    } catch (error) {
      console.error("매칭 요청 실패:", error);
      alert('서버와 연결할 수 없습니다.');
    }
  };

  const handleUnmatch = async (seniorId: number) => {
    if (window.confirm('정말 이 어르신의 매칭을 해제하시겠습니까?')) {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`http://localhost:8080/api/admin/seniors/${seniorId}/unmatch`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          alert('매칭이 해제되었습니다.');
          fetchSeniors();
        } else {
          alert('매칭 해제 처리에 실패했습니다.');
        }
      } catch (error) {
        console.error("매칭 해제 실패:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">

        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
          <h1 className="text-2xl font-bold text-slate-900">관리자 대시보드</h1>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-teal-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20"
            >
              <Plus className="w-5 h-5" /> 신규 어르신 등록
            </button>
            <button className="text-slate-400 hover:text-slate-600 text-xl"><Bell /></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <SummaryCards notificationCount={notifications.length} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* 어르신 매칭 관리 테이블 */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-lg">어르신 펜팔 매칭 관리</h3>
                <span className="text-sm text-slate-500">총 <span className="font-bold text-teal-600">{seniors.length}</span>명</span>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white text-slate-500 text-sm border-b border-slate-200">
                      <th className="py-4 px-6 font-medium">성함 (나이)</th>
                      <th className="py-4 px-6 font-medium">상태</th>
                      <th className="py-4 px-6 font-medium">매칭 파트너</th>
                      <th className="py-4 px-6 font-medium text-center">관리 액션</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-100">
                    {seniors.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400">등록된 어르신이 없습니다.</td>
                      </tr>
                    ) : (
                      seniors.map(senior => (
                        <tr key={senior.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-6 font-bold text-slate-900">
                            {senior.name} <span className="text-slate-400 font-normal text-xs ml-1">({senior.age}세)</span>
                          </td>
                          <td className="py-4 px-6">
                            {senior.matchStatus === 'WAITING' ? (
                              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold animate-pulse">대기 중</span>
                            ) : (
                              <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-bold">교류 중</span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-slate-600 font-medium">
                            {senior.partnerName || <span className="text-slate-400 italic">없음</span>}
                          </td>
                          <td className="py-4 px-6 text-center">
                            {senior.matchStatus === 'WAITING' ? (
                              <button
                                onClick={() => handleMatch(senior.id)}
                                className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-1 mx-auto"
                              >
                                <LinkIcon className="w-3 h-3" /> 매칭하기
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUnmatch(senior.id)}
                                className="bg-white border border-red-200 text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 mx-auto"
                              >
                                <RefreshCcw className="w-3 h-3" /> 매칭 해제
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <NotificationList notifications={notifications} onMarkAsRead={(id) => console.log(id)} />
          </div>
        </div>
      </main>
      <AddSeniorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
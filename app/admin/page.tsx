'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import SummaryCards from '@/components/admin/SummaryCards';
import NotificationList from '@/components/admin/NotificationList';
import AddSeniorModal from '@/components/admin/AddSeniorModal';
import { Plus, Users, Search, Bell } from 'lucide-react';

export default function AdminDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notifications] = useState([
    { notificationId: 1, seniorName: '김철수', triggerType: 'NO_PARTICIPATION', message: '오전 미션 미수행', sopGuide: '전화 상담', createdAt: '10:00' }
  ]);

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
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="font-bold text-slate-900 mb-4">최근 미션 참여 현황</h2>
              <div className="h-64 flex items-center justify-center bg-slate-50 rounded-xl text-slate-400 border border-dashed border-slate-200">
                데이터 시각화 그래프 영역
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
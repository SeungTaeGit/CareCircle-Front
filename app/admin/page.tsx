'use client';
import React, { useState } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import SummaryCards from '@/components/admin/SummaryCards';
import NotificationList from '@/components/admin/NotificationList';
import AddSeniorModal from '@/components/admin/AddSeniorModal';
import { Plus } from 'lucide-react';

export default function AdminDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notifications] = useState([
    { notificationId: 1, seniorName: '김철수', triggerType: 'NO_PARTICIPATION', message: '오전 미션 미수행', sopGuide: '전화 상담', createdAt: '10:00' }
  ]);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">관리자 대시보드</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-teal-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20"
          >
            <Plus className="w-5 h-5" /> 신규 어르신 등록
          </button>
        </header>

        <SummaryCards notificationCount={notifications.length} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-bold text-slate-900 mb-4">최근 미션 참여 현황</h2>
            <div className="h-64 flex items-center justify-center bg-slate-50 rounded-xl text-slate-400">데이터 시각화 그래프 영역</div>
          </div>
          <NotificationList notifications={notifications} onMarkAsRead={(id) => console.log(id)} />
        </div>
      </main>
      <AddSeniorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
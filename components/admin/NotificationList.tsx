import React, { useState } from 'react';
import { BellRing, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface NotificationListProps {
  notifications: any[];
  dangerSignals: any[];
  refreshData: () => void;
}

export default function NotificationList({ notifications, dangerSignals, refreshData }: NotificationListProps) {
  const [activeTab, setActiveTab] = useState<'SIGNAL' | 'NOTI'>('SIGNAL');

  // 위험 신호 조치 완료 처리 (PATCH /api/admin/signals/{signalId}/resolve)
  const handleResolveSignal = async (signalId: number) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`https://api.carescircles.com/api/admin/signals/${signalId}/resolve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        refreshData(); // 성공 시 목록 갱신
      } else {
         alert("위험 신호 처리에 실패했습니다.");
      }
    } catch (e) {
      console.error("위험 신호 처리 실패", e);
      alert("서버 연결에 실패했습니다.");
    }
  };

  // 일반 알림 읽음 처리 (PATCH /api/admin/notifications/{id}/read)
  const handleReadNoti = async (notiId: number) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`https://api.carescircles.com/api/admin/notifications/${notiId}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        refreshData(); // 성공 시 목록 갱신
      } else {
        alert("알림 읽음 처리에 실패했습니다.");
      }
    } catch (e) {
      console.error("알림 읽음 처리 실패", e);
      alert("서버 연결에 실패했습니다.");
    }
  };

  return (
    <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">

      {/* 탭 헤더 */}
      <div className="flex border-b border-slate-200 bg-slate-50 flex-shrink-0">
        <button
          onClick={() => setActiveTab('SIGNAL')}
          className={`flex-1 py-4 font-bold text-sm flex justify-center items-center gap-2 transition-colors ${activeTab === 'SIGNAL' ? 'text-red-600 border-b-2 border-red-600 bg-red-50' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          <AlertTriangle className="w-4 h-4" /> 긴급 신호
          {dangerSignals.length > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{dangerSignals.length}</span>}
        </button>
        <button
          onClick={() => setActiveTab('NOTI')}
          className={`flex-1 py-4 font-bold text-sm flex justify-center items-center gap-2 transition-colors ${activeTab === 'NOTI' ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          <BellRing className="w-4 h-4" /> 일반 알림
          {notifications.length > 0 && <span className="bg-teal-500 text-white text-[10px] px-2 py-0.5 rounded-full">{notifications.length}</span>}
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-slate-50/50">
        {/* 위험 신호 목록 렌더링 */}
        {activeTab === 'SIGNAL' && (
          dangerSignals.length === 0 ? (
            <div className="text-center text-slate-400 py-10 font-medium">현재 발생한 긴급 신호가 없습니다.</div>
          ) : (
            dangerSignals.map((sig) => (
              <div key={sig.signalId || sig.id} className="p-4 rounded-xl border border-red-200 bg-white shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-900">{sig.seniorName || '어르신'}</h4>
                  <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md">위험 감지</span>
                </div>
                <p className="text-sm text-slate-700 mb-3 leading-relaxed">
                  {sig.message || sig.content}
                </p>
                <button
                  onClick={() => handleResolveSignal(sig.signalId || sig.id)}
                  className="w-full bg-red-50 border border-red-200 text-red-600 py-2 rounded-lg text-sm font-bold hover:bg-red-500 hover:text-white transition-colors"
                >
                  조치 완료 처리
                </button>
              </div>
            ))
          )
        )}

        {/* 일반 알림 목록 렌더링 */}
        {activeTab === 'NOTI' && (
          notifications.length === 0 ? (
            <div className="text-center text-slate-400 py-10 font-medium">새로운 알림이 없습니다.</div>
          ) : (
            notifications.map((noti) => (
              <div key={noti.id || noti.notificationId} className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex gap-3">
                <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm text-slate-700 mb-2">{noti.content || noti.message}</p>
                  <button
                    onClick={() => handleReadNoti(noti.id || noti.notificationId)}
                    className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-teal-600 transition-colors"
                  >
                    <CheckCircle2 className="w-3 h-3" /> 읽음 표시
                  </button>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}
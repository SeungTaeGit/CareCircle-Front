import React from 'react';
import { BellRing, Phone } from 'lucide-react';

interface NotificationResponse {
  notificationId: number;
  seniorName: string;
  triggerType: string;
  message: string;
  sopGuide: string;
  createdAt: string;
}

interface NotificationListProps {
  notifications: NotificationResponse[];
  onMarkAsRead: (id: number) => void;
}

export default function NotificationList({ notifications, onMarkAsRead }: NotificationListProps) {
  return (
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
                <button onClick={() => onMarkAsRead(notif.notificationId)} className="flex-1 bg-teal-600 text-white py-1.5 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">
                  확인 완료
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
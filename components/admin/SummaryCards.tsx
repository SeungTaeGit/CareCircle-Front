import React from 'react';
import { Users, CheckCheck, HeartHandshake, AlertTriangle } from 'lucide-react';

interface SummaryCardsProps {
  notificationCount: number;
  totalSeniors: number;
  matchedPairs: number;
  participationRate?: number;
}

export default function SummaryCards({ notificationCount, totalSeniors, matchedPairs, participationRate = 0 }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">전체 등록 어르신</p>
            <h3 className="text-3xl font-bold text-slate-900">{totalSeniors}<span className="text-lg text-slate-400 font-normal ml-1">명</span></h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">오늘 미션 참여율</p>
            <h3 className="text-3xl font-bold text-slate-900">{participationRate}<span className="text-lg text-slate-400 font-normal ml-1">%</span></h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">
            <CheckCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">일본 어르신 교류 매칭</p>
            <h3 className="text-3xl font-bold text-slate-900">{matchedPairs}<span className="text-lg text-slate-400 font-normal ml-1">쌍</span></h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
            <HeartHandshake className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="bg-red-50 rounded-2xl p-6 border border-red-200 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-red-600 text-sm font-bold mb-1">안부 확인 필요 (AI 감지)</p>
            <h3 className="text-3xl font-bold text-red-600">{notificationCount}<span className="text-lg text-red-400 font-normal ml-1">건</span></h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-500 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
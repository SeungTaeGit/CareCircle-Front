import React from 'react';
import { TreePine, Sprout } from 'lucide-react';

interface SeniorProfile {
  name: string;
}

interface SeniorHeaderProps {
  profile: SeniorProfile | null;
}

export default function SeniorHeader({ profile }: SeniorHeaderProps) {
  return (
    <header className="p-6 bg-white rounded-b-3xl shadow-sm z-10">
      <div className="flex justify-between items-center mb-5">
        <div>
          <p className="text-slate-500 font-medium">10월 11일 목요일</p>
          <h1 className="text-3xl font-bold text-slate-900 mt-1">{profile?.name || '어르신'},<br/>안녕하세요!</h1>
        </div>
        <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center shadow-inner border-2 border-teal-200">
          <TreePine className="w-8 h-8 text-teal-600" />
        </div>
      </div>

      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sprout className="w-8 h-8 text-teal-600" />
          <div>
            <p className="text-sm text-slate-500 font-bold">나의 정원</p>
            <p className="text-lg font-bold text-slate-800">레벨 3 (새싹)</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">다음 레벨까지</p>
          <p className="text-teal-600 font-bold">미션 2번 남음!</p>
        </div>
      </div>
    </header>
  );
}
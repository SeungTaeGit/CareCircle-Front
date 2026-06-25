import React from 'react';
import { Sun, CloudRain } from 'lucide-react';

interface StatusProps {
  seniorName: string;
  sentiment: 'Sunny' | 'Rainy' | 'Cloudy';
  gardenLevel: number;
}

export default function SeniorStatusCard({ seniorName, sentiment, gardenLevel }: StatusProps) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
      <h2 className="text-lg font-bold text-slate-800 mb-4">{seniorName} 어르신의 이번 주</h2>

      <div className="grid grid-cols-2 gap-4">
        {/* 정서 상태 (날씨) */}
        <div className="bg-sky-50 rounded-2xl p-4 border border-sky-100 flex flex-col items-center justify-center text-center">
          {sentiment === 'Sunny' ? (
            <Sun className="w-10 h-10 text-amber-400 mb-2 fill-amber-400" />
          ) : (
            <CloudRain className="w-10 h-10 text-blue-400 mb-2" />
          )}
          <p className="text-sm font-bold text-sky-900">마음 날씨: 맑음</p>
          <p className="text-xs text-sky-600 mt-1">긍정적 단어 빈도 높음</p>
        </div>

        {/* 함께정원 레벨 */}
        <div className="bg-teal-50 rounded-2xl p-4 border border-teal-100 flex flex-col items-center justify-center text-center">
          <div className="text-4xl mb-2">🌱</div>
          <p className="text-sm font-bold text-teal-900">함께정원</p>
          <p className="text-xs text-teal-600 mt-1">레벨 {gardenLevel} (새싹)</p>
        </div>
      </div>
    </div>
  );
}
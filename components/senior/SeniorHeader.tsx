'use client';

import React, { useState, useEffect } from 'react';

interface SeniorProfile {
  name: string;
}

interface GardenData {
  plantLevel: number;
  currentExp: number;
  requiredExp: number;
}

interface SeniorHeaderProps {
  profile: SeniorProfile | null;
  gardenData: GardenData | null;
}

export default function SeniorHeader({ profile, gardenData }: SeniorHeaderProps) {
  const [todayString, setTodayString] = useState('');

  useEffect(() => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const date = today.getDate();
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = days[today.getDay()];

    setTodayString(`${month}월 ${date}일 ${dayName}요일`);
  }, []);

  const getPlantEmoji = (level: number) => {
    if (level === 1) return '🌱';
    if (level === 2) return '🌿';
    if (level === 3) return '🌳';
    if (level >= 4) return '🌲';
    return '🌱';
  };

  const getLevelName = (level: number) => {
    if (level === 1) return '씨앗';
    if (level === 2) return '새싹';
    if (level === 3) return '작은 나무';
    if (level >= 4) return '숲';
    return '씨앗';
  };

  return (
    <header className="p-6 bg-white rounded-b-3xl shadow-sm z-10 relative">
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-slate-500 text-lg font-medium">{todayString}</p>
          <h1 className="text-3xl font-bold text-slate-900 mt-1 leading-tight">
            {profile?.name || '어르신'},<br/>안녕하세요!
          </h1>
        </div>

        {/* 현재 레벨 이모지 뱃지 */}
        <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center text-3xl shadow-inner border-2 border-teal-500">
          {getPlantEmoji(gardenData?.plantLevel || 1)}
        </div>
      </div>

      {/* 요약 리워드 바 */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between mt-2">
        <div className="flex items-center gap-3">
          <span className="text-teal-600 text-2xl">🌱</span>
          <div>
            <p className="text-sm text-slate-500 font-bold">나의 정원 레벨</p>
            <p className="text-lg font-bold text-slate-900">
              레벨 {gardenData?.plantLevel || 1} ({getLevelName(gardenData?.plantLevel || 1)})
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">다음 레벨까지</p>
          <p className="text-teal-600 font-bold">
            {gardenData ? gardenData.requiredExp - gardenData.currentExp : 0} XP 남음
          </p>
        </div>
      </div>
    </header>
  );
}
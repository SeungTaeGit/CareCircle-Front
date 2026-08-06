'use client';

import React, { useState, useEffect } from 'react';

interface SeniorProfile {
  name: string;
}

interface SeniorHeaderProps {
  profile: SeniorProfile | null;
}

export default function SeniorHeader({ profile }: SeniorHeaderProps) {
  const [todayString, setTodayString] = useState('');

  // 컴포넌트가 켜질 때 오늘 날짜를 계산해서 세팅합니다.
  useEffect(() => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const date = today.getDate();
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = days[today.getDay()];

    setTodayString(`${month}월 ${date}일 ${dayName}요일`);
  }, []);

  return (
    <header className="p-6 bg-white rounded-b-3xl shadow-sm z-10 relative">
      <div className="flex justify-between items-center mb-4">
        <div>
          {/* 💡 계산된 오늘 날짜를 화면에 뿌려줍니다 */}
          <p className="text-slate-500 text-lg font-medium">{todayString}</p>
          <h1 className="text-3xl font-bold text-slate-900 mt-1">
            {profile?.name || '어르신'},<br/>안녕하세요!
          </h1>
        </div>
        {/* 임시 프로필 이미지 (나중에 정원 레벨 등에 따라 변경 가능) */}
        <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center text-3xl shadow-inner border-2 border-teal-500">
          🌳
        </div>
      </div>

      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between mt-2">
        <div className="flex items-center gap-3">
          <span className="text-teal-600 text-2xl">🌱</span>
          <div>
            <p className="text-sm text-slate-500 font-bold">나의 정원 레벨</p>
            <p className="text-lg font-bold text-slate-900">레벨 3 (새싹)</p>
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
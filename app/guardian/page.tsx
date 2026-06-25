'use client';

import React, { useState, useEffect } from 'react';
import { Mic } from 'lucide-react';
import GuardianHeader from '@/components/guardian/GuardianHeader';
import SeniorStatusCard from '@/components/guardian/SeniorStatusCard';
import ActivityFeed from '@/components/guardian/ActivityFeed';

interface Activity {
  id: number;
  date: string;
  missionTitle: string;
  type: 'VOICE' | 'PHOTO';
  contentSummary: string;
}

export default function GuardianDashboardPage() {
  const [seniorStatus, setSeniorStatus] = useState({ name: '', sentiment: 'Sunny' as const, gardenLevel: 1 });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGuardianData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.warn('로그인 토큰이 없습니다.');
          setIsLoading(false);
          return;
        }

        const response = await fetch('http://localhost:8080/api/activities/guardian', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setSeniorStatus({
            name: data.seniorName,
            sentiment: data.sentiment,
            gardenLevel: data.gardenLevel
          });
          setActivities(data.activities);
        } else {
          console.error("데이터를 불러오는데 실패했습니다. 상태 코드:", response.status);
        }
      } catch (error) {
        console.error("서버 통신 에러:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuardianData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-amber-200 text-slate-800 font-sans pb-20">

      <GuardianHeader />

      <main className="max-w-3xl mx-auto px-4 pt-6">
        {isLoading ? (
          <div className="text-center py-20 text-slate-500 font-bold animate-pulse">
            어르신 데이터를 불러오는 중입니다...
          </div>
        ) : (
          <>
            <SeniorStatusCard
              seniorName={seniorStatus.name}
              sentiment={seniorStatus.sentiment}
              gardenLevel={seniorStatus.gardenLevel}
            />

            <ActivityFeed activities={activities} />
          </>
        )}
      </main>

      <div className="fixed bottom-0 w-full bg-white border-t border-slate-200 p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-50">
        <div className="max-w-3xl mx-auto">
          <button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2">
            <Mic className="w-6 h-6" /> 부모님께 응원 메시지 보내기
          </button>
        </div>
      </div>

    </div>
  );
}
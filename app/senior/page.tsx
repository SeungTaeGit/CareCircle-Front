'use client';

import React, { useState, useEffect } from 'react';
import SeniorHeader from '@/components/senior/SeniorHeader';
import MessageAlert from '@/components/senior/MessageAlert';
import MissionRecorder from '@/components/senior/MissionRecorder';
import BottomNav from '@/components/senior/BottomNav';

interface SeniorProfile {
  name: string;
}

export default function SeniorMainPage() {
  const [profile, setProfile] = useState<SeniorProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const response = await fetch('http://localhost:8080/api/seniors/me', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        }
      } catch (error) {
        console.error("서버 통신 에러:", error);
      }
    };
    fetchProfile();
  }, []);

  const todayMission = "어릴 적 가장 좋아했던 간식은 무엇이었나요?";

  return (
    <div className="bg-slate-200 min-h-screen flex justify-center selection:bg-teal-200">
      <div className="bg-slate-50 w-full max-w-[480px] min-h-screen shadow-2xl relative flex flex-col pb-24 overflow-hidden">

        <SeniorHeader profile={profile} />

        <main className="flex-grow p-6 flex flex-col gap-5">
          <MessageAlert />

          <MissionRecorder todayMission={todayMission} />
        </main>

        <BottomNav />

      </div>
    </div>
  );
}
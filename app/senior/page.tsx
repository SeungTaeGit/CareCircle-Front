'use client';

import React, { useState, useEffect } from 'react';
import SeniorHeader from '@/components/senior/SeniorHeader';
import MessageAlert from '@/components/senior/MessageAlert';
import MissionRecorder from '@/components/senior/MissionRecorder';
import BottomNav from '@/components/senior/BottomNav';

interface SeniorProfile {
  name: string;
}

interface ExchangeMessage {
  messageId: number;
  senderName: string;
  audioUrl: string;
  translatedContent: string;
  status: string;
}

export default function SeniorMainPage() {
  const [profile, setProfile] = useState<SeniorProfile | null>(null);
  const [unreadMessage, setUnreadMessage] = useState<ExchangeMessage | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        fetch('http://localhost:8080/api/seniors/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json()).then(data => setProfile(data));

        const msgRes = await fetch('http://localhost:8080/api/exchange/received', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (msgRes.ok) {
          const messages = await msgRes.json();
          const unread = messages.find((msg: ExchangeMessage) => msg.status === 'UNREAD');
          setUnreadMessage(unread || null);
        }
      } catch (error) {
        console.error("서버 통신 에러:", error);
      }
    };

    fetchData();
  }, []);

  const handleMarkAsRead = async (messageId: number) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8080/api/exchange/${messageId}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setUnreadMessage(null);
      }
    } catch (error) {
      console.error("읽음 처리 에러:", error);
    }
  };

  const todayMission = "어릴 적 가장 좋아했던 간식은 무엇이었나요?";

  return (
    <div className="bg-slate-200 min-h-screen flex justify-center selection:bg-teal-200">
      <div className="bg-slate-50 w-full max-w-[480px] min-h-screen shadow-2xl relative flex flex-col pb-24 overflow-hidden">

        <SeniorHeader profile={profile} />

        <main className="flex-grow p-6 flex flex-col gap-5">
          <MessageAlert message={unreadMessage} onRead={handleMarkAsRead} />

          <MissionRecorder todayMission={todayMission} />
        </main>

        <BottomNav />

      </div>
    </div>
  );
}
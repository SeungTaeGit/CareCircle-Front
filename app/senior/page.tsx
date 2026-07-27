'use client';

import React, { useState, useEffect } from 'react';
import SeniorHeader from '@/components/senior/SeniorHeader';
import MessageAlert from '@/components/senior/MessageAlert';
import MissionRecorder from '@/components/senior/MissionRecorder';
import BottomNav from '@/components/senior/BottomNav';

interface SeniorProfile {
  name: string;
}

interface PartnerProfile {
  partnerId: number;
  partnerName: string;
  country: string;
  language: string;
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
  const [partnerInfo, setPartnerInfo] = useState<PartnerProfile | null>(null);
  const [unreadMessage, setUnreadMessage] = useState<ExchangeMessage | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const headers = { 'Authorization': `Bearer ${token}` };

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/seniors/me`, { headers })
          .then(res => res.ok ? res.json() : null)
          .then(data => setProfile(data));

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/seniors/partner`, { headers })
          .then(res => res.ok ? res.json() : null)
          .then(data => setPartnerInfo(data));

        const msgRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/exchange/received`, { headers });
        if (msgRes.ok) {
          const messages = await msgRes.json();
          const unread = messages.find((msg: ExchangeMessage) => msg.status === 'UNREAD');
          setUnreadMessage(unread || null);
        }
      } catch (error) {
        console.error("데이터 로딩 에러:", error);
      }
    };

    fetchData();
  }, []);

  const handleMarkAsRead = async (messageId: number) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/exchange/${messageId}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        // 읽음 처리 후 알림 상태 업데이트 로직 (MessageAlert 내부에서 UI가 바뀌므로 당장 null로 만들지 않음)
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
          <MessageAlert
            message={unreadMessage}
            partnerInfo={partnerInfo}
            onRead={handleMarkAsRead}
          />

          <MissionRecorder todayMission={todayMission} />
        </main>

        <BottomNav />

      </div>
    </div>
  );
}
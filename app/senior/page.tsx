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

// 💡 텍스트 및 이미지 확장을 위한 타입 업데이트
interface ExchangeMessage {
  messageId: number;
  senderName: string;
  messageType: 'VOICE' | 'TEXT' | 'IMAGE';
  content?: string;
  audioUrl?: string;
  imageUrl?: string;
  translatedContent?: string;
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
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/exchange/${messageId}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error("읽음 처리 에러:", error);
    }
  };

  const todayMission = "오늘 점심은 어떤 맛있는 음식을 드셨나요?";

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
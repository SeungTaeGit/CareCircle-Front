'use client';

import React, { useState, useEffect } from 'react';
import SeniorHeader from '@/components/senior/SeniorHeader';
import MessageAlert from '@/components/senior/MessageAlert';
import MissionRecorder from '@/components/senior/MissionRecorder';
import BottomNav from '@/components/senior/BottomNav';
import TogetherGarden from '@/components/senior/TogetherGarden'; // 💡 정원 컴포넌트 추가

// ... 기존 인터페이스들 ...
interface SeniorProfile { id?: number; seniorId?: number; name: string; }
interface PartnerProfile { partnerId: number; partnerName: string; country: string; language: string; }
interface ExchangeMessage { messageId: number; senderName: string; messageType: 'VOICE'|'TEXT'|'IMAGE'; content?: string; audioUrl?: string; imageUrl?: string; translatedContent?: string; status: string; }
interface DailyMission { id?: number; missionId?: number; content?: string; title?: string; missionContent?: string; text?: string; status: string; }

// 💡 정원 데이터 인터페이스 추가
interface GardenData {
  plantLevel: number;
  currentExp: number;
  requiredExp: number;
}

export default function SeniorMainPage() {
  const [profile, setProfile] = useState<SeniorProfile | null>(null);
  const [partnerInfo, setPartnerInfo] = useState<PartnerProfile | null>(null);
  const [unreadMessage, setUnreadMessage] = useState<ExchangeMessage | null>(null);

  const [seniorId, setSeniorId] = useState<number>(1);
  const [missions, setMissions] = useState<DailyMission[]>([]);
  const [currentMissionIndex, setCurrentMissionIndex] = useState<number>(0);
  const [isAllDone, setIsAllDone] = useState<boolean>(false);
  const [isLoadingMissions, setIsLoadingMissions] = useState<boolean>(true);

  // 💡 정원 및 탭 상태 추가
  const [gardenData, setGardenData] = useState<GardenData | null>(null);
  const [activeTab, setActiveTab] = useState<'HOME' | 'GARDEN' | 'GALLERY'>('HOME');

  const fetchMissions = async (id: number) => {
    setIsLoadingMissions(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/missions/today?seniorId=${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const missionsArray = Array.isArray(data) ? data : (data ? [data] : []);
        setMissions(missionsArray);

        const firstPendingIdx = missionsArray.findIndex((m: DailyMission) => m.status === 'PENDING');
        if (firstPendingIdx !== -1) {
          setCurrentMissionIndex(firstPendingIdx);
          setIsAllDone(false);
        } else {
          setCurrentMissionIndex(missionsArray.length > 0 ? missionsArray.length - 1 : 0);
          setIsAllDone(missionsArray.length > 0);
        }
      }
    } catch (e) { console.error("미션 로딩 실패:", e); }
    finally { setIsLoadingMissions(false); }
  };

  // 💡 정원 정보 로드 함수 추가
  const fetchGarden = async (id: number) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/garden/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setGardenData(await res.json());
      }
    } catch (e) { console.error("정원 정보 로딩 실패:", e); }
  };

  useEffect(() => {
    const initData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        const headers = { 'Authorization': `Bearer ${token}` };

        const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/seniors/me`, { headers });
        let currentId = 1;
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
          currentId = profileData.id || profileData.seniorId || 1;
          setSeniorId(currentId);
        }

        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/seniors/partner`, { headers })
          .then(res => res.ok ? res.json() : null)
          .then(data => setPartnerInfo(data));

        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/exchange/received`, { headers })
          .then(res => res.ok ? res.json() : null)
          .then(messages => {
            if (messages) {
              const msgsArray = Array.isArray(messages) ? messages : [];
              const unread = msgsArray.find((msg: ExchangeMessage) => msg.status === 'UNREAD');
              setUnreadMessage(unread || null);
            }
          });

        fetchMissions(currentId);
        fetchGarden(currentId); // 💡 앱 켤 때 정원 정보도 함께 로드

      } catch (error) {
        console.error("초기 데이터 로딩 에러:", error);
        setIsLoadingMissions(false);
      }
    };
    initData();
  }, []);

  const handleMarkAsRead = async (messageId: number) => {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/exchange/${messageId}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) { console.error("읽음 처리 에러:", error); }
  };

  return (
    <div className="bg-slate-200 min-h-screen flex justify-center selection:bg-teal-200">
      <div className="bg-slate-50 w-full max-w-[480px] min-h-screen shadow-2xl relative flex flex-col pb-24 overflow-hidden">

        {/* 헤더에는 프로필과 정원 데이터를 모두 넘겨줍니다 */}
        <SeniorHeader profile={profile} gardenData={gardenData} />

        <main className="flex-grow p-6 flex flex-col gap-5 overflow-y-auto">

          {/* 💡 탭 분기 처리: HOME일 때 미션/편지, GARDEN일 때 정원 렌더링 */}
          {activeTab === 'HOME' && (
            <>
              <MessageAlert
                message={unreadMessage}
                partnerInfo={partnerInfo}
                onRead={handleMarkAsRead}
                onReplySent={() => {
                  setUnreadMessage(null);
                  fetchGarden(seniorId); // 💡 답장 후 정원 경험치 갱신
                }}
              />

              <MissionRecorder
                mission={missions[currentMissionIndex] || null}
                currentIndex={currentMissionIndex}
                totalCount={missions.length}
                isAllDone={isAllDone}
                isLoading={isLoadingMissions}
                onRefresh={() => {
                  fetchMissions(seniorId);
                  fetchGarden(seniorId); // 💡 미션 완료/스킵 후 정원 경험치 갱신
                }}
              />
            </>
          )}

          {activeTab === 'GARDEN' && (
            <TogetherGarden
              gardenData={gardenData}
            />
          )}

          {activeTab === 'GALLERY' && (
            <div className="flex-grow flex flex-col items-center justify-center text-slate-400">
              <span className="text-6xl mb-4">📸</span>
              <p className="font-bold">사진첩은 곧 업데이트 됩니다!</p>
            </div>
          )}

        </main>

        {/* 하단 네비게이션 */}
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import SeniorHeader from '@/components/senior/SeniorHeader';
import MessageAlert from '@/components/senior/MessageAlert';
import FamilyMessageAlert from '@/components/senior/FamilyMessageAlert';
import MissionRecorder from '@/components/senior/MissionRecorder';
import BottomNav from '@/components/senior/BottomNav';
import TogetherGarden from '@/components/senior/TogetherGarden';

// 인터페이스 정의
interface SeniorProfile { id?: number; seniorId?: number; name: string; }
interface PartnerProfile { partnerId: number; partnerName: string; country: string; language: string; }
interface ExchangeMessage { messageId: number; senderName: string; messageType: 'VOICE'|'TEXT'|'IMAGE'; content?: string; audioUrl?: string; imageUrl?: string; translatedContent?: string; status: string; }
interface DailyMission { id?: number; missionId?: number; content?: string; title?: string; missionContent?: string; text?: string; status: string; }
interface FamilyMessage { id: number; senderName: string; messageType: 'TEXT'|'AUDIO'|'IMAGE'; content?: string; audioUrl?: string; imageUrl?: string; read: boolean; createdAt: string; }
interface GardenData { plantLevel: number; currentExp: number; requiredExp: number; }

export default function SeniorMainPage() {
  const [profile, setProfile] = useState<SeniorProfile | null>(null);
  const [partnerInfo, setPartnerInfo] = useState<PartnerProfile | null>(null);
  const [unreadMessage, setUnreadMessage] = useState<ExchangeMessage | null>(null);
  const [familyMessage, setFamilyMessage] = useState<FamilyMessage | null>(null);
  const [seniorId, setSeniorId] = useState<number>(1);
  const [missions, setMissions] = useState<DailyMission[]>([]);
  const [currentMissionIndex, setCurrentMissionIndex] = useState<number>(0);
  const [isAllDone, setIsAllDone] = useState<boolean>(false);
  const [isLoadingMissions, setIsLoadingMissions] = useState<boolean>(true);

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

        // 1. 프로필 조회
        const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/seniors/me`, { headers });
        let currentId = 1;
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
          currentId = profileData.id || profileData.seniorId || 1;
          setSeniorId(currentId);
        }

        // 2. 파트너 조회
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/seniors/partner`, { headers })
          .then(res => res.ok ? res.json() : null)
          .then(data => setPartnerInfo(data));

        // 3. 펜팔 메시지 조회
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/exchange/received`, { headers })
          .then(res => res.ok ? res.json() : null)
          .then(messages => {
            if (messages) {
              const msgsArray = Array.isArray(messages) ? messages : [];
              const unread = msgsArray.find((msg: ExchangeMessage) => msg.status === 'UNREAD');
              setUnreadMessage(unread || null);
            }
          });

        // 4. 가족 메시지 조회 및 디버깅 로직
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/messages/${currentId}`, { headers })
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            console.log("💌 [디버그] 백엔드에서 넘어온 가족 메시지 원본 데이터:", data);

            if (data) {
              const msgList = Array.isArray(data) ? data : (data.data || data.content || []);
              if (msgList.length > 0) {
                const unreadFamily = msgList.find((msg: any) => msg.read === false || msg.isRead === false);

                if (unreadFamily) {
                  setFamilyMessage(unreadFamily);
                } else {
                  console.log("💌 [디버그] 안 읽은 메시지가 없어서, 가장 최근 메시지를 강제로 화면에 띄웁니다.");
                  setFamilyMessage(msgList[0]);
                }
              } else {
                console.log("💌 [디버그] 조회된 가족 메시지가 없습니다. (빈 배열)");
              }
            }
          })
          .catch(err => console.error("💌 [디버그] 가족 메시지 API 호출 에러:", err));

        // 5. 미션 및 정원 데이터 조회
        fetchMissions(currentId);
        fetchGarden(currentId);

      } catch (error) {
        console.error("초기화 에러:", error);
      }
    }; // 💡 여기서 initData 함수가 닫혀야 합니다.

    initData(); // 💡 위에서 선언한 함수를 실행합니다.
  }, []); // 💡 여기서 useEffect가 닫혀야 합니다. (이전 코드에서 이 부분이 통째로 날아갔습니다 ㅠㅠ)

  const handleMarkAsRead = (id: number) => {
    // 펜팔 메시지 읽음 처리 로직 (생략됨, 필요 시 추가)
  };

  const handleFamilyMessageRead = (id: number) => {
    setFamilyMessage(null);
    // (선택) 백엔드에 읽음 처리 API가 있다면 여기서 호출하면 됩니다.
  };

  return (
    <div className="bg-slate-200 min-h-screen flex justify-center selection:bg-teal-200">
      <div className="bg-slate-50 w-full max-w-[480px] min-h-screen shadow-2xl relative flex flex-col pb-24 overflow-hidden">

        <SeniorHeader profile={profile} gardenData={gardenData} />

        <main className="flex-grow p-6 flex flex-col gap-5 overflow-y-auto">

          {activeTab === 'HOME' && (
            <>
              {/* 가족 메시지 최상단 렌더링 */}
              <FamilyMessageAlert
                message={familyMessage}
                onRead={handleFamilyMessageRead}
              />

              <MessageAlert
                message={unreadMessage}
                partnerInfo={partnerInfo}
                onRead={handleMarkAsRead}
                onReplySent={() => {
                  setUnreadMessage(null);
                  fetchGarden(seniorId);
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
                  fetchGarden(seniorId);
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

        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}
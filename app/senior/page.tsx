'use client';

import React, { useState, useEffect } from 'react';
import { Mic, Square, Play, TreePine, Image as ImageIcon, Home, Mail, Volume2, Sprout } from 'lucide-react';
import Link from 'next/link';

interface SeniorProfile {
  id: number;
  name: string;
  country: string;
  language: string;
  matchStatus: string;
  hobbies: string;
}

export default function SeniorMainPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [profile, setProfile] = useState<SeniorProfile | null>(null);

  const [recordStartTime, setRecordStartTime] = useState<number | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const response = await fetch('http://localhost:8080/api/seniors/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
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

  const toggleRecording = async () => {
    if (!isRecording) {
      setIsRecording(true);
      setRecordStartTime(Date.now());
    } else {
      setIsRecording(false);

      const playTimeSeconds = recordStartTime
        ? Math.floor((Date.now() - recordStartTime) / 1000)
        : 0;

      try {
        const token = localStorage.getItem('accessToken');

        const response = await fetch('http://localhost:8080/api/activities', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            activityType: "VOICE_MISSION",
            score: 10,
            playTimeSeconds: playTimeSeconds
          })
        });

        if (response.ok) {
          setShowReward(true);
          setTimeout(() => setShowReward(false), 3000);
        } else {
          alert('미션 전송에 실패했습니다. 다시 시도해주세요.');
        }
      } catch (error) {
        console.error("활동 기록 저장 에러:", error);
        alert('서버와 연결할 수 없습니다.');
      }
    }
  };

  return (
    <div className="bg-slate-200 min-h-screen flex justify-center selection:bg-teal-200">
      <div className="bg-slate-50 w-full max-w-[480px] min-h-screen shadow-2xl relative flex flex-col pb-24 overflow-hidden">

        {showReward && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white p-8 rounded-3xl text-center transform animate-in zoom-in-50 duration-500">
              <div className="text-6xl mb-4 animate-bounce">🌱</div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">참 잘하셨어요!</h2>
              <p className="text-teal-600 font-bold">씨앗 1개를 얻었습니다</p>
            </div>
          </div>
        )}

        <header className="p-6 bg-white rounded-b-3xl shadow-sm z-10">
          <div className="flex justify-between items-center mb-5">
            <div>
              <p className="text-slate-500 font-medium">10월 11일 목요일</p>
              <h1 className="text-3xl font-bold text-slate-900 mt-1">{profile?.name || '어르신'},<br/>안녕하세요!</h1>
            </div>
            <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center shadow-inner border-2 border-teal-200">
              <TreePine className="w-8 h-8 text-teal-600" />
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sprout className="w-8 h-8 text-teal-600" />
              <div>
                <p className="text-sm text-slate-500 font-bold">나의 정원</p>
                <p className="text-lg font-bold text-slate-800">레벨 3 (새싹)</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">다음 레벨까지</p>
              <p className="text-teal-600 font-bold">미션 2번 남음!</p>
            </div>
          </div>
        </header>

        <main className="flex-grow p-6 flex flex-col gap-5">
          <button className="w-full bg-amber-50 rounded-3xl p-5 border-2 border-amber-200 cursor-pointer hover:bg-amber-100 transition-colors shadow-sm flex items-center gap-4 relative overflow-hidden text-left group">
            <Mail className="absolute -right-4 -top-4 w-24 h-24 text-amber-200 opacity-50 group-hover:scale-110 transition-transform duration-500" />
            <div className="w-14 h-14 bg-white rounded-full flex flex-col items-center justify-center text-2xl flex-shrink-0 z-10 shadow-sm border border-amber-100">
              🇯P
            </div>
            <div className="z-10 flex-1">
              <span className="inline-block px-2 py-1 bg-amber-200 text-amber-800 text-xs font-bold rounded-lg mb-1">새로운 답장</span>
              <h2 className="text-lg font-bold text-slate-800 leading-tight">사토코님이 인사를<br/>보냈어요! 들어볼까요?</h2>
            </div>
            <Play className="w-8 h-8 text-amber-500 z-10 fill-amber-500" />
          </button>

          <div className="bg-teal-50 rounded-3xl p-6 border-2 border-teal-500 shadow-md flex-grow flex flex-col justify-center items-center text-center relative">
            <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-teal-600 text-white px-5 py-1.5 rounded-full font-bold shadow-md">
              오늘의 미션
            </span>

            <div className="mt-4 mb-8 w-full">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-snug break-keep">
                {todayMission}
              </h2>
              <button className="mt-4 text-teal-700 font-bold text-base flex items-center justify-center gap-2 mx-auto bg-white px-4 py-2 rounded-full shadow-sm border border-teal-100 active:bg-teal-50">
                <Volume2 className="w-5 h-5" /> 질문 다시 듣기
              </button>
            </div>

            <button
              onClick={toggleRecording}
              className={`relative flex flex-col items-center justify-center w-40 h-40 rounded-full text-white transition-all duration-300 transform active:scale-95 ${
                isRecording
                  ? 'bg-red-500 shadow-[0_0_40px_rgba(239,68,68,0.6)]'
                  : 'bg-teal-600 shadow-[0_15px_30px_rgba(13,148,136,0.4)] hover:bg-teal-700'
              }`}
            >
              {isRecording && (
                <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping opacity-75"></div>
              )}

              {isRecording ? (
                <>
                  <Square className="w-12 h-12 mb-2 fill-white" />
                  <span className="font-bold text-xl animate-pulse">녹음 중...</span>
                </>
              ) : (
                <>
                  <Mic className="w-14 h-14 mb-2" />
                  <span className="font-bold text-xl">눌러서 말하기</span>
                </>
              )}
            </button>

            <p className="mt-8 text-slate-500 font-medium text-sm sm:text-base break-keep">
              버튼을 누르고 편하게 말씀해 주세요.<br/>다 말씀하신 후 다시 누르면 전송됩니다.
            </p>
          </div>
        </main>

        <nav className="absolute bottom-0 w-full bg-white border-t-2 border-slate-100 flex justify-around items-center pb-6 pt-3 px-2 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] rounded-t-3xl z-50">
          <Link href="/senior" className="flex flex-col items-center justify-center w-1/3 text-teal-600">
            <Home className="w-7 h-7 mb-1" />
            <span className="font-bold text-xs">홈</span>
          </Link>
          <button className="flex flex-col items-center justify-center w-1/3 text-slate-400 hover:text-slate-600 transition-colors relative">
            <TreePine className="w-7 h-7 mb-1" />
            <span className="absolute top-0 right-7 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            <span className="font-bold text-xs">함께정원</span>
          </button>
          <button className="flex flex-col items-center justify-center w-1/3 text-slate-400 hover:text-slate-600 transition-colors">
            <ImageIcon className="w-7 h-7 mb-1" />
            <span className="font-bold text-xs">사진첩</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
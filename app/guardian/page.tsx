'use client';

import React, { useState, useEffect } from 'react';
import { Mic, Heart, Calendar, Activity, Sun, CloudRain, Cloud, Sparkles, AlertCircle } from 'lucide-react';
import CheerMessageModal from '@/components/guardian/CheerMessageModal';

export default function GuardianDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [seniorStatus, setSeniorStatus] = useState({
    seniorId: 0,
    name: '부모님',
    sentiment: 'Sunny',
    gardenLevel: 1
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 💡 신규: 5일 감정 추이 데이터 상태
  const [emotionData, setEmotionData] = useState<{ todayMood: string, recentEmotions: any[] }>({
    todayMood: 'NONE',
    recentEmotions: []
  });

  useEffect(() => {
    const fetchGuardianData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');

        if (!token) {
          setError('로그인이 필요합니다.');
          setLoading(false);
          return;
        }

        // 1. 대시보드 기본 정보 호출
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.carescircles.com'}/api/activities/guardian`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();

          const currentSeniorId = data.seniorId || 0;

          setSeniorStatus({
            seniorId: currentSeniorId,
            name: data.seniorName || '부모님',
            sentiment: data.sentiment || 'Sunny',
            gardenLevel: data.gardenLevel || 1
          });
          setActivities(data.activities || []);

          // 2. 💡 신규: 어르신 식별자(seniorId)가 있으면 5일 감정 추이 API 추가 호출
          if (currentSeniorId !== 0) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.carescircles.com'}/api/dashboard/${currentSeniorId}/emotions`, {
              headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => res.ok ? res.json() : null)
            .then(emotionRes => {
              if (emotionRes) {
                setEmotionData({
                  todayMood: emotionRes.todayMood || 'NONE',
                  recentEmotions: emotionRes.recentEmotions || []
                });
              }
            }).catch(e => console.error("감정 데이터 로딩 실패", e));
          }

        } else {
          setError('데이터를 불러오는데 실패했습니다.');
        }
      } catch (err) {
        console.error("데이터 로딩 에러:", err);
        setError('서버와 연결할 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchGuardianData();
  }, []);

  const getSentimentIcon = (sentiment: string) => {
    const s = sentiment?.toUpperCase() || '';
    if (s === 'SUNNY' || s === 'HAPPY' || s === 'JOY') return <Sun className="w-10 h-10 text-orange-500" />;
    if (s === 'RAINY' || s === 'SAD' || s === 'SADNESS' || s === 'LONELY') return <CloudRain className="w-10 h-10 text-blue-500" />;
    if (s === 'CLOUDY' || s === 'ANGRY' || s === 'FEAR') return <Cloud className="w-10 h-10 text-slate-500" />;
    return <Heart className="w-10 h-10 text-rose-300" />; // 기본값 NONE
  };

  const getSentimentText = (sentiment: string) => {
    const s = sentiment?.toUpperCase() || '';
    if (s === 'SUNNY' || s === 'HAPPY' || s === 'JOY') return '맑음 (기분 좋음)';
    if (s === 'RAINY' || s === 'SAD' || s === 'SADNESS' || s === 'LONELY') return '비 (우울/외로움)';
    if (s === 'CLOUDY' || s === 'ANGRY' || s === 'FEAR') return '흐림 (서운함/불안)';
    if (s === 'NONE') return '활동 없음';
    return '평온함';
  };

  // 미니 감정 차트용 헬퍼 함수
  const getMiniEmoji = (sentiment: string) => {
    const s = sentiment?.toUpperCase() || '';
    if (s === 'HAPPY' || s === 'JOY') return '😄';
    if (s === 'SAD' || s === 'SADNESS' || s === 'LONELY') return '😢';
    if (s === 'ANGRY' || s === 'FEAR') return '😠';
    return '😐';
  };

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center animate-pulse">
          <Heart className="w-12 h-12 text-rose-300 mb-4 animate-bounce" />
          <p className="text-slate-500 font-bold">부모님 소식을 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center p-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm text-center border border-slate-200">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <p className="text-slate-700 font-bold">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg font-medium">다시 시도</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 min-h-screen flex justify-center selection:bg-teal-200">
      <div className="bg-slate-50 w-full max-w-[480px] min-h-screen shadow-2xl relative flex flex-col pb-24 overflow-hidden">

        <header className="bg-white p-6 pt-10 rounded-b-3xl shadow-sm z-10">
          <p className="text-slate-500 font-medium text-sm mb-1">사랑하는 부모님의 오늘</p>
          <h1 className="text-2xl font-bold text-slate-900">
            <span className="text-teal-600">{seniorStatus.name}</span> 어르신 대시보드
          </h1>
        </header>

        <main className="flex-grow p-5 space-y-4 overflow-y-auto">

          {/* 💡 신규: 오늘 기분 및 5일 감정 추이 카드 통합 */}
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
              <div>
                <p className="text-xs font-bold text-slate-400 mb-1 flex items-center gap-1"><Heart className="w-3 h-3"/> 오늘의 AI 분석 기분</p>
                <p className="font-bold text-slate-800 text-lg">{getSentimentText(emotionData.todayMood)}</p>
              </div>
              <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shadow-inner">
                {getSentimentIcon(emotionData.todayMood)}
              </div>
            </div>

            {/* 5일 감정 추이 미니 차트 */}
            <div>
              <p className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-1"><Activity className="w-3 h-3"/> 최근 5일 감정 추이</p>
              <div className="flex justify-between items-end h-16 bg-slate-50 rounded-xl p-3 border border-slate-100">
                {emotionData.recentEmotions.length === 0 ? (
                  <p className="text-xs text-slate-400 font-medium w-full text-center my-auto">최근 기록된 감정 데이터가 없습니다.</p>
                ) : (
                  emotionData.recentEmotions.map((em, idx) => (
                    <div key={idx} className="flex flex-col items-center justify-end h-full w-1/5 gap-1 group">
                      <span className="text-xl transition-transform group-hover:-translate-y-1">{getMiniEmoji(em.emotion)}</span>
                      <span className="text-[10px] font-bold text-slate-400">{em.date}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 정원 레벨 카드 */}
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center text-2xl border border-teal-100">
                 {seniorStatus.gardenLevel >= 4 ? '🌲' : seniorStatus.gardenLevel === 3 ? '🌳' : seniorStatus.gardenLevel === 2 ? '🌿' : '🌱'}
               </div>
               <div>
                 <p className="text-xs font-bold text-slate-400 flex items-center gap-1"><Sparkles className="w-3 h-3"/> 함께정원</p>
                 <p className="font-bold text-teal-700 text-lg">레벨 {seniorStatus.gardenLevel}</p>
               </div>
             </div>
             <button className="text-xs bg-teal-50 text-teal-700 font-bold px-3 py-1.5 rounded-lg border border-teal-200">구경하기</button>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mt-2">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-500" /> 최근 활동 내역
            </h2>

            {activities.length === 0 ? (
              <div className="text-center py-8 text-slate-400 font-medium text-sm">
                아직 기록된 활동이 없습니다.
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div key={activity.id || index} className="flex gap-4 items-start relative">
                    {index !== activities.length - 1 && (
                      <div className="absolute left-4 top-8 w-0.5 h-full bg-slate-100 -z-10"></div>
                    )}
                    <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0 border border-teal-100 text-teal-600">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100 flex-grow shadow-sm">
                      <p className="text-xs text-teal-600 font-bold mb-1.5">{activity.date}</p>

                      <p className="text-sm font-bold text-slate-800 mb-1">{activity.missionTitle || '활동 완료'}</p>
                      <p className="text-xs font-medium text-slate-600 leading-relaxed break-keep">
                        {activity.contentSummary || '상세 내용이 없습니다.'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        <div className="fixed bottom-0 w-full max-w-[480px] bg-white border-t border-slate-100 p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.03)] z-40 pb-safe">
          <button
            onClick={() => {
              if (seniorStatus.seniorId === 0) {
                alert("연결된 어르신 정보(seniorId)가 없습니다. 다시 로그인해주세요.");
                return;
              }
              setIsModalOpen(true);
            }}
            disabled={seniorStatus.seniorId === 0}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Mic className="w-6 h-6" /> 부모님께 응원 메시지 보내기
          </button>
        </div>

        <CheerMessageModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          seniorId={seniorStatus.seniorId}
        />
      </div>
    </div>
  );
}
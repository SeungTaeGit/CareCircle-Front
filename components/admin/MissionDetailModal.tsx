import React, { useState, useEffect } from 'react';
import { X, FileText, CheckCircle2, Clock, SkipForward, Mic, Activity, AlertTriangle } from 'lucide-react';

interface Mission {
  id: number;
  seniorId: number;
  content: string;
  status: string;
  createdAt: string;
}

interface Props {
  mission: Mission | null;
  seniorName: string;
  onClose: () => void;
}

export default function MissionDetailModal({ mission, seniorName, onClose }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [missionResult, setMissionResult] = useState<any>(null);

  // 💡 백엔드 가이드: 단일 emotion 텍스트를 직관적인 한글로 매핑합니다.
  const translateEmotion = (emotion: string) => {
    if (!emotion) return { label: '분석 중', color: 'text-slate-500' };

    const upperEmotion = emotion.toUpperCase();
    switch (upperEmotion) {
      case 'JOY':
      case 'HAPPY':
        return { label: '기쁨/긍정', color: 'text-teal-600' };
      case 'SADNESS':
      case 'SAD':
        return { label: '슬픔/우울', color: 'text-blue-500' };
      case 'ANGER':
      case 'ANGRY':
        return { label: '서운함/분노', color: 'text-rose-500' };
      case 'FEAR':
        return { label: '불안/두려움', color: 'text-amber-500' };
      case 'NEUTRAL':
      default:
        return { label: '평온/중립', color: 'text-slate-600' };
    }
  };

  useEffect(() => {
    if (mission) {
      if (mission.status === 'PENDING') {
        setMissionResult(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const fetchResult = async () => {
        try {
          const token = localStorage.getItem('accessToken');
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/missions/${mission.id}/result`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (res.ok) {
            setMissionResult(await res.json());
          } else {
            setMissionResult(null);
          }
        } catch (e) {
          console.error("미션 상세 결과 로딩 실패", e);
          setMissionResult(null);
        } finally {
          setIsLoading(false);
        }
      };

      fetchResult();
    }
  }, [mission]);

  if (!mission) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col">

        {/* 헤더 */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{seniorName} 어르신 미션 기록</h2>
              <p className="text-xs text-slate-500 font-medium">발급 일시: {new Date(mission.createdAt).toLocaleString('ko-KR')}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full shadow-sm border border-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 본문 */}
        <div className="p-6 bg-[#f8fafc]">

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm mb-6">
            <p className="text-xs font-bold text-teal-600 mb-2">Q. 배포된 미션 (질문)</p>
            <p className="font-bold text-slate-800 text-lg leading-snug break-keep">"{mission.content}"</p>
          </div>

          <div>
            <p className="text-sm font-bold text-slate-700 mb-3">미션 진행 결과</p>

            {isLoading ? (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 flex flex-col items-center justify-center animate-pulse">
                 <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin mb-3"></div>
                 <p className="text-sm text-slate-500 font-bold">결과 데이터를 불러오는 중...</p>
              </div>
            ) : (
              <>
                {mission.status === 'PENDING' && (
                  <div className="bg-white rounded-2xl p-8 border border-slate-200 flex flex-col items-center justify-center text-center">
                    <Clock className="w-12 h-12 text-amber-400 mb-3" />
                    <h3 className="font-bold text-amber-700 mb-1">응답 대기 중입니다.</h3>
                    <p className="text-sm text-slate-500">어르신이 아직 이 미션을 확인하지 않았거나<br/>답변을 고민 중입니다.</p>
                  </div>
                )}

                {mission.status === 'SKIPPED' && (
                  <div className="bg-slate-100 rounded-2xl p-8 border border-slate-200 flex flex-col items-center justify-center text-center">
                    <SkipForward className="w-12 h-12 text-slate-400 mb-3" />
                    <h3 className="font-bold text-slate-700 mb-1">미션을 건너뛰었습니다.</h3>
                    <p className="text-sm text-slate-500 mb-3">어르신이 답변하기 어려워 패스한 미션입니다.</p>
                    {missionResult?.skippedAt && (
                      <span className="text-xs font-bold bg-white px-3 py-1 rounded-lg text-slate-500 border border-slate-200 shadow-sm">
                        스킵 일시: {new Date(missionResult.skippedAt).toLocaleString('ko-KR')}
                      </span>
                    )}
                  </div>
                )}

                {(mission.status === 'COMPLETED' || mission.status === 'REJECTED') && missionResult && (
                  <div className={`rounded-2xl p-6 border shadow-sm relative overflow-hidden ${mission.status === 'REJECTED' || missionResult.isHarmful ? 'bg-rose-50 border-rose-200' : 'bg-teal-50 border-teal-200'}`}>
                    <div className={`absolute -right-4 -top-4 ${mission.status === 'REJECTED' || missionResult.isHarmful ? 'text-rose-100' : 'text-teal-100'}`}>
                      {mission.status === 'REJECTED' || missionResult.isHarmful ? <AlertTriangle className="w-24 h-24" /> : <CheckCircle2 className="w-24 h-24" />}
                    </div>

                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-4">
                        <span className={`${mission.status === 'REJECTED' || missionResult.isHarmful ? 'bg-rose-500' : 'bg-teal-500'} text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1`}>
                          <Mic className="w-3 h-3" /> 음성 응답
                        </span>
                        {missionResult.completedAt && (
                          <span className={`text-xs font-bold ${mission.status === 'REJECTED' || missionResult.isHarmful ? 'text-rose-700' : 'text-teal-700'}`}>
                            {new Date(missionResult.completedAt).toLocaleString('ko-KR')}
                          </span>
                        )}
                        {/* 💡 유해 표현 필터링 감지 시 뱃지 표시 */}
                        {(mission.status === 'REJECTED' || missionResult.isHarmful) && (
                          <span className="bg-rose-100 border border-rose-300 text-rose-700 text-[10px] font-bold px-2 py-1 rounded-md ml-auto">
                            ⚠️ 필터링 감지됨 (반려)
                          </span>
                        )}
                      </div>

                      <div className="bg-white rounded-xl p-4 border border-teal-100 mb-4 shadow-sm">
                        <p className="text-slate-800 font-medium leading-relaxed">
                          "{missionResult.answer || missionResult.content || '답변 내용이 없습니다.'}"
                        </p>
                      </div>

                      <div className="flex flex-col gap-3">
                        <div className="bg-white px-3 py-2 rounded-lg border border-teal-100 flex items-center gap-2 shadow-sm w-fit">
                          <Activity className="w-4 h-4 text-teal-500" />
                          <span className="text-xs font-bold text-slate-600">AI 주 감정:</span>
                          <span className={`text-sm font-bold ${translateEmotion(missionResult.emotion).color}`}>
                            {translateEmotion(missionResult.emotion).label}
                          </span>
                        </div>

                        {/* 💡 유해 필터링 상세 정보 표시 */}
                        {missionResult.isHarmful && missionResult.toxicCategory && (
                          <div className="bg-white px-3 py-2 rounded-lg border border-rose-200 flex flex-col gap-1 shadow-sm">
                            <span className="text-xs font-bold text-rose-600">AI 필터링 사유 (카테고리)</span>
                            <span className="text-sm font-medium text-slate-700">{missionResult.toxicCategory}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
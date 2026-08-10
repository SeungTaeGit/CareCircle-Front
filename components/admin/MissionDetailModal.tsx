import React, { useState, useEffect } from 'react';
import { X, FileText, CheckCircle2, Clock, SkipForward, Mic, Activity } from 'lucide-react';

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
  const [mockResult, setMockResult] = useState<any>(null);

  useEffect(() => {
    if (mission) {
      setIsLoading(true);
      // 💡 실제로는 여기서 GET /api/v1/admin/missions/{mission.id}/result 등을 호출합니다.
      // 현재는 UI 시뮬레이션을 위해 setTimeout으로 가짜 데이터를 로딩합니다.
      setTimeout(() => {
        if (mission.status === 'COMPLETED') {
          setMockResult({
            answer: "내가 어릴 적에는 가마솥에 고구마 구워 먹는 게 제일 맛있었지. 그땐 참 달았어.",
            emotion: "SMILE",
            score: 85,
            completedAt: new Date(new Date(mission.createdAt).getTime() + 1000 * 60 * 60 * 2).toISOString() // 2시간 뒤 완료 가정
          });
        } else if (mission.status === 'SKIPPED') {
          setMockResult({
            skippedAt: new Date(new Date(mission.createdAt).getTime() + 1000 * 60 * 30).toISOString() // 30분 뒤 스킵 가정
          });
        } else {
          setMockResult(null);
        }
        setIsLoading(false);
      }, 500);
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

          {/* 미션 원본 질문 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm mb-6">
            <p className="text-xs font-bold text-teal-600 mb-2">Q. 배포된 미션 (질문)</p>
            <p className="font-bold text-slate-800 text-lg leading-snug break-keep">"{mission.content}"</p>
          </div>

          {/* 진행 상태 및 결과 */}
          <div>
            <p className="text-sm font-bold text-slate-700 mb-3">미션 진행 결과</p>

            {isLoading ? (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 flex flex-col items-center justify-center animate-pulse">
                 <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin mb-3"></div>
                 <p className="text-sm text-slate-500 font-bold">결과 데이터를 불러오는 중...</p>
              </div>
            ) : (
              <>
                {/* 1. 대기중 상태 */}
                {mission.status === 'PENDING' && (
                  <div className="bg-white rounded-2xl p-8 border border-slate-200 flex flex-col items-center justify-center text-center">
                    <Clock className="w-12 h-12 text-amber-400 mb-3" />
                    <h3 className="font-bold text-amber-700 mb-1">응답 대기 중입니다.</h3>
                    <p className="text-sm text-slate-500">어르신이 아직 이 미션을 확인하지 않았거나<br/>답변을 고민 중입니다.</p>
                  </div>
                )}

                {/* 2. 스킵 상태 */}
                {mission.status === 'SKIPPED' && (
                  <div className="bg-slate-100 rounded-2xl p-8 border border-slate-200 flex flex-col items-center justify-center text-center">
                    <SkipForward className="w-12 h-12 text-slate-400 mb-3" />
                    <h3 className="font-bold text-slate-700 mb-1">미션을 건너뛰었습니다.</h3>
                    <p className="text-sm text-slate-500 mb-3">어르신이 답변하기 어려워 패스한 미션입니다.</p>
                    <span className="text-xs font-bold bg-white px-3 py-1 rounded-lg text-slate-500 border border-slate-200 shadow-sm">
                      스킵 일시: {mockResult?.skippedAt ? new Date(mockResult.skippedAt).toLocaleString('ko-KR') : '-'}
                    </span>
                  </div>
                )}

                {/* 3. 완료 상태 */}
                {mission.status === 'COMPLETED' && mockResult && (
                  <div className="bg-teal-50 rounded-2xl p-6 border border-teal-200 shadow-sm relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 text-teal-100">
                      <CheckCircle2 className="w-24 h-24" />
                    </div>

                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="bg-teal-500 text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                          <Mic className="w-3 h-3" /> 음성 응답
                        </span>
                        <span className="text-xs font-bold text-teal-700">
                          {new Date(mockResult.completedAt).toLocaleString('ko-KR')}
                        </span>
                      </div>

                      <div className="bg-white rounded-xl p-4 border border-teal-100 mb-4 shadow-sm">
                        <p className="text-slate-800 font-medium leading-relaxed">"{mockResult.answer}"</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="bg-white px-3 py-2 rounded-lg border border-teal-100 flex items-center gap-2 shadow-sm">
                          <Activity className="w-4 h-4 text-teal-500" />
                          <span className="text-xs font-bold text-slate-600">AI 감정 분석:</span>
                          <span className="text-sm font-bold text-teal-700">긍정 (85%)</span>
                        </div>
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
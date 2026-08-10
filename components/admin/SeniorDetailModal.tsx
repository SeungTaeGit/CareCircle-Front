import React from 'react';
import { X, Activity, HeartPulse, AlertCircle, Calendar } from 'lucide-react';

interface Participant {
  seniorId: number;
  name: string;
  gender: string;
  age: number;
  lastActiveAt: string;
  thisWeekCompletedCount: number;
  thisWeekTotalCount: number;
  recentEmotions: string[];
  interestLevel: string;
  recommendedAction: string;
}

interface Props {
  senior: Participant | null;
  onClose: () => void;
}

export default function SeniorDetailModal({ senior, onClose }: Props) {
  if (!senior) return null;

  // 상태 뱃지 컬러
  const getStatusColor = (level: string) => {
    switch (level) {
      case 'URGENT': return 'bg-red-100 text-red-600 border-red-200';
      case 'CHECK': return 'bg-amber-100 text-amber-600 border-amber-200';
      case 'WATCH': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'NONE': default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col">

        {/* 헤더 영역 */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-full shadow-sm border border-slate-200 flex items-center justify-center text-2xl">
              {senior.gender === 'M' ? '👴' : '👵'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {senior.name} 어르신 <span className="text-lg text-slate-500 font-medium">({senior.gender === 'M' ? '남' : '여'} / {senior.age}세)</span>
              </h2>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                <Calendar className="w-4 h-4" /> 최근 참여: {new Date(senior.lastActiveAt).toLocaleString('ko-KR')}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full shadow-sm border border-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 본문 영역 */}
        <div className="p-6 space-y-6">

          {/* 상태 요약 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm flex flex-col justify-center">
              <p className="text-sm font-bold text-slate-500 mb-2 flex items-center gap-1.5"><HeartPulse className="w-4 h-4 text-rose-500"/> AI 관심 수준</p>
              <div className="flex items-center gap-3">
                <span className={`px-4 py-1.5 rounded-lg text-sm font-bold border ${getStatusColor(senior.interestLevel)}`}>
                  {senior.interestLevel}
                </span>
                <span className="text-sm font-medium text-slate-700">{senior.recommendedAction || '특이사항 없음'}</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm flex flex-col justify-center">
              <p className="text-sm font-bold text-slate-500 mb-2 flex items-center gap-1.5"><Activity className="w-4 h-4 text-teal-500"/> 이번 주 미션 참여율</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-slate-900">{senior.thisWeekCompletedCount}</span>
                <span className="text-slate-400 font-medium mb-1">/ {senior.thisWeekTotalCount}회 완료</span>
              </div>
              {/* 프로그레스 바 */}
              <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-teal-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(senior.thisWeekCompletedCount / (senior.thisWeekTotalCount || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* 최근 감정 추이 */}
          <div>
            <p className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-1.5"><AlertCircle className="w-4 h-4 text-amber-500"/> 최근 감정 변화 추이</p>
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex gap-2 overflow-x-auto">
              {senior.recentEmotions && senior.recentEmotions.length > 0 ? (
                senior.recentEmotions.map((emotion, idx) => (
                  <div key={idx} className="flex-shrink-0 w-20 flex flex-col items-center gap-2">
                    <div className="text-2xl bg-white w-12 h-12 rounded-full flex items-center justify-center shadow-sm border border-slate-200">
                      {emotion === 'HAPPY' ? '😄' : emotion === 'SAD' ? '😢' : emotion === 'ANGRY' ? '😠' : '😐'}
                    </div>
                    <span className="text-xs font-bold text-slate-500">{idx === senior.recentEmotions.length - 1 ? '최근' : `${senior.recentEmotions.length - 1 - idx}회 전`}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 py-4 w-full text-center">아직 기록된 감정 데이터가 없습니다.</p>
              )}
            </div>
          </div>

        </div>

        {/* 하단 액션 버튼 */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
            활동 로그 전체보기
          </button>
          <button className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-md">
            담당자 메모 작성
          </button>
        </div>

      </div>
    </div>
  );
}
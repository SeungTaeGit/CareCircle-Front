import React, { useState, useEffect } from 'react';
import { X, Activity, HeartPulse, Phone, Globe, Users, Target, Book, Sparkles } from 'lucide-react';

interface Participant {
  seniorId: number;
  name: string;
  gender: string;
  age: number;
  interestLevel: string;
}

// 백엔드에서 주신 DTO 그대로 반영
interface SeniorDetailResponse {
  seniorId: number;
  name: string;
  contact: string;
  gender: string;
  birthDate: string;
  country: string;
  language: string;
  hobbies: string;
  matchStatus: string;
  partnerId: number;
  interestLevel: string;
  recommendedAction: string;
  lastActiveAt: string;
  xp: number;
}

// 최근 감정 차트를 그리기 위한 데이터
interface EmotionData {
  date: string;
  emotion: string;
}

interface Props {
  senior: Participant | null;
  onClose: () => void;
}

export default function SeniorDetailModal({ senior, onClose }: Props) {
  const [detailData, setDetailData] = useState<SeniorDetailResponse | null>(null);
  const [emotionData, setEmotionData] = useState<EmotionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (senior && senior.seniorId) {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken');

      const fetchDetails = async () => {
        try {
          // 1. 어르신 DB 상세 정보 (DTO 반영)
          const detailRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/seniors/detail/${senior.seniorId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (detailRes.ok) setDetailData(await detailRes.json());

          // 2. 5일 감정 추이 데이터
          const emotionRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/dashboard/${senior.seniorId}/emotions`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (emotionRes.ok) {
            const eData = await emotionRes.json();
            setEmotionData(eData.recentEmotions || []);
          }
        } catch (err) {
          console.error("데이터 로딩 실패", err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchDetails();
    }
  }, [senior]);

  if (!senior) return null;

  const getStatusColor = (level: string) => {
    switch (level) {
      case 'URGENT': return 'bg-red-100 text-red-600 border-red-200 animate-pulse';
      case 'CHECK': return 'bg-amber-100 text-amber-600 border-amber-200';
      case 'WATCH': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'NONE': default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  // 감정에 따른 Y축 높이 및 색상 (차트 그리기 용도)
  const getEmotionVisuals = (emotion: string) => {
    const e = emotion?.toUpperCase() || 'NEUTRAL';
    if (e === 'HAPPY' || e === 'JOY') return { y: 15, color: '#10b981', emoji: '😄' }; // 최고점 (초록)
    if (e === 'NEUTRAL') return { y: 50, color: '#3b82f6', emoji: '😐' }; // 중간 (파랑)
    if (e === 'SAD' || e === 'SADNESS') return { y: 85, color: '#8b5cf6', emoji: '😢' }; // 낮음 (보라)
    if (e === 'ANGRY' || e === 'FEAR') return { y: 85, color: '#f43f5e', emoji: '😠' }; // 낮음 (빨강)
    return { y: 50, color: '#3b82f6', emoji: '😐' };
  };

  // SVG 라인 차트를 위한 path 데이터 생성
  const generateChartPath = () => {
    if (emotionData.length === 0) return '';
    const spacing = emotionData.length > 1 ? 100 / (emotionData.length - 1) : 50;
    return emotionData.map((d, i) => {
      const { y } = getEmotionVisuals(d.emotion);
      const x = emotionData.length > 1 ? i * spacing : 50;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">

        {/* 헤더 */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-full shadow-sm border border-slate-200 flex items-center justify-center text-2xl">
              {senior.gender === 'M' ? '👴' : '👵'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {senior.name} 어르신
              </h2>
              {detailData && (
                <p className="text-sm text-slate-500 mt-1 font-medium">
                  {detailData.gender === 'M' ? '남성' : detailData.gender === 'F' ? '여성' : detailData.gender} • 생년월일: {detailData.birthDate || '미상'}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full shadow-sm border border-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto bg-[#f8fafc] flex flex-col gap-6">

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 animate-pulse text-slate-400 font-bold">
              어르신 상세 데이터와 차트를 불러오는 중입니다...
            </div>
          ) : detailData ? (
            <>
              {/* 1. 어르신 DB 기본 정보 그리드 */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-1">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><Phone className="w-3 h-3"/> 연락처</span>
                  <span className="text-sm font-bold text-slate-800">{detailData.contact || '등록되지 않음'}</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-1">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><Globe className="w-3 h-3"/> 국가 / 언어</span>
                  <span className="text-sm font-bold text-slate-800">{detailData.country || '알 수 없음'} / {detailData.language || '-'}</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-1">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><Book className="w-3 h-3"/> 관심사(취미)</span>
                  <span className="text-sm font-bold text-slate-800">{detailData.hobbies || '없음'}</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-1">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><Users className="w-3 h-3"/> 매칭 상태</span>
                  <span className="text-sm font-bold text-teal-600">{detailData.matchStatus || '-'} {detailData.partnerId ? `(파트너 ID: ${detailData.partnerId})` : ''}</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-1">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><Sparkles className="w-3 h-3"/> 획득 경험치(XP)</span>
                  <span className="text-sm font-bold text-slate-800">{detailData.xp || 0} XP</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
                   <div className="flex items-center gap-2">
                     <span className={`px-2 py-1 rounded text-[10px] font-bold border ${getStatusColor(detailData.interestLevel)}`}>{detailData.interestLevel}</span>
                     <span className="text-xs font-bold text-slate-600 truncate">{detailData.recommendedAction || '-'}</span>
                   </div>
                </div>
              </div>

              {/* 2. 최근 5일 감정 추이 꺾은선 차트 */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mt-6">
                <h3 className="text-sm font-bold text-slate-700 mb-6 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-500"/> 최근 5일간 감정 변화 추이
                </h3>

                {emotionData.length === 0 ? (
                  <p className="text-sm text-slate-400 py-6 text-center bg-slate-50 rounded-2xl">감정 데이터가 충분하지 않습니다.</p>
                ) : (
                  <div className="relative w-full h-32 mt-4 px-6 mb-8">
                    <div className="relative w-full h-full">
                      {/* Y축 보조선 */}
                      <div className="absolute inset-0 flex flex-col justify-between pt-4 pb-4">
                        <div className="border-b border-dashed border-slate-200 w-full flex-1"></div>
                        <div className="border-b border-dashed border-slate-200 w-full flex-1"></div>
                      </div>

                      {/* SVG 꺾은선 차트 */}
                      <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                        {/* 차트 배경 그라데이션 */}
                        <defs>
                          <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path
                          d={`${generateChartPath()} L 100 100 L 0 100 Z`}
                          fill="url(#chartGradient)"
                        />
                        <path
                          d={generateChartPath()}
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          vectorEffect="non-scaling-stroke"
                        />
                      </svg>

                      {/* 데이터 포인트(이모지) 및 X축 날짜 */}
                      <div className="absolute inset-0">
                        {emotionData.map((d, i) => {
                          const { y, emoji } = getEmotionVisuals(d.emotion);
                          const spacing = emotionData.length > 1 ? 100 / (emotionData.length - 1) : 50;
                          const x = emotionData.length > 1 ? i * spacing : 50;

                          return (
                            <div
                              key={i}
                              className="absolute h-full"
                              style={{ left: `${x}%` }}
                            >
                              {/* 차트 위의 점 (이모지) */}
                              <div
                                className="absolute bg-white rounded-full p-1 shadow-sm border border-slate-200 transform -translate-x-1/2 -translate-y-1/2 z-10 text-xl transition-transform hover:scale-125 flex items-center justify-center"
                                style={{ top: `${y}%` }}
                              >
                                {emoji}
                              </div>
                              {/* 하단 날짜 */}
                              <div className="absolute -bottom-7 text-center text-xs font-bold text-slate-500 transform -translate-x-1/2 w-16">
                                {d.date}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="py-10 text-center text-slate-500 font-medium bg-white rounded-2xl border border-slate-100">
              상세 정보를 불러오지 못했습니다.
            </div>
          )}

        </div>

        {/* 푸터 버튼 */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-md">
            확인 (닫기)
          </button>
        </div>

      </div>
    </div>
  );
}
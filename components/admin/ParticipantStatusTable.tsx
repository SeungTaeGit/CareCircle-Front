'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, MoreHorizontal, TrendingUp, TrendingDown, Minus, HelpCircle, UserPlus, RefreshCw } from 'lucide-react';
import SeniorDetailModal from './SeniorDetailModal'; // 💡 모달 컴포넌트 임포트

interface Participant {
  seniorId: number;
  name: string;
  gender: string;
  age: number;
  lastActiveAt: string;
  thisWeekCompletedCount: number;
  thisWeekTotalCount: number;
  recentEmotions: string[];
  interestLevel: 'NONE' | 'WATCH' | 'CHECK' | 'URGENT';
  recommendedAction: string;
}

interface Props {
  onAddSeniorClick: () => void;
}

export default function ParticipantStatusTable({ onAddSeniorClick }: Props) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 검색 및 필터링용 State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // 💡 선택된 어르신 상세 정보 모달용 State
  const [selectedSenior, setSelectedSenior] = useState<Participant | null>(null);

  // 백엔드 API 연동
  const fetchParticipants = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/dashboard/seniors`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setParticipants(await res.json());
      }
    } catch (e) {
      console.error("참여자 목록 조회 실패:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  // 1. 날짜 변환 헬퍼
  const formatRelativeTime = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      if (diffHours === 0) return '방금 전';
      if (diffHours < 24) return `${diffHours}시간 전`;
      return '오늘';
    }
    if (diffDays === 1) return '어제';
    return `${diffDays}일 전`;
  };

  // 2. 상태 뱃지 스타일 헬퍼 (백엔드 알고리즘과 1:1 매칭)
  const getBadgeStyle = (level: string) => {
    switch (level) {
      case 'CHECK': return 'bg-red-50 text-red-500 border-red-100';
      case 'WATCH': return 'bg-blue-50 text-blue-500 border-blue-100';
      case 'URGENT': return 'bg-red-600 text-white border-red-700 font-bold animate-pulse';
      case 'NONE':
      default: return 'bg-slate-100 text-slate-400 border-slate-200';
    }
  };

  // 3. 감정 분석 스타일 헬퍼
  const getEmotionUI = (emotions: string[]) => {
    const lastEmotion = emotions && emotions.length > 0 ? emotions[emotions.length - 1] : 'NEUTRAL';

    switch (lastEmotion) {
      case 'SAD':
        return { label: '외로움', color: 'text-purple-500', stroke: '#a855f7', icon: <TrendingUp className="w-3 h-3 text-purple-500" /> };
      case 'HAPPY':
        return { label: '기쁨', color: 'text-emerald-500', stroke: '#10b981', icon: <TrendingDown className="w-3 h-3 text-emerald-500" /> };
      case 'ANGRY':
        return { label: '서운함', color: 'text-orange-500', stroke: '#f97316', icon: <TrendingUp className="w-3 h-3 text-orange-500" /> };
      case 'NEUTRAL':
      default:
        return { label: '평온', color: 'text-blue-500', stroke: '#3b82f6', icon: <Minus className="w-3 h-3 text-blue-500" /> };
    }
  };

  // 💡 2단계: 실시간 검색 및 상태 필터링 적용된 목록 계산
  const filteredParticipants = participants.filter(p => {
    const matchName = p.name.includes(searchTerm);
    const matchStatus = selectedStatus === 'ALL' || p.interestLevel === selectedStatus;
    return matchName && matchStatus;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col animate-in fade-in duration-300">

      {/* 1. 테이블 헤더 & 필터 영역 */}
      <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <h2 className="text-xl font-bold text-slate-900 mr-4">참여자 현황</h2>

          {/* 전체 그룹 필터 (추후 그룹 데이터 생기면 활용) */}
          <select className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 w-32 outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer">
            <option value="ALL">전체 그룹</option>
            <option value="1">방 1만</option>
            <option value="2">방 2반</option>
          </select>

          {/* 💡 2단계: 상태 필터 (Select box로 기능 활성화) */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 w-32 outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            <option value="ALL">전체 상태</option>
            <option value="URGENT">URGENT</option>
            <option value="CHECK">CHECK</option>
            <option value="WATCH">WATCH</option>
            <option value="NONE">NONE</option>
          </select>

          {/* 💡 2단계: 실시간 이름 검색 */}
          <div className="relative">
            <input
              type="text"
              placeholder="이름 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-48"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto justify-end">
          <button onClick={fetchParticipants} className="p-2 border border-slate-300 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-slate-50 transition-colors">
             <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={onAddSeniorClick} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-colors">
            <UserPlus className="w-4 h-4" /> 신규 어르신 등록
          </button>
        </div>
      </div>

      {/* 2. 참여자 목록 테이블 */}
      <div className="overflow-x-auto flex-1 pb-4">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm font-bold border-b border-slate-200">
              <th className="py-4 px-6 font-medium">참여자</th>
              <th className="py-4 px-6 font-medium text-center">최근 참여</th>
              <th className="py-4 px-6 font-medium text-center">이번 주 참여</th>
              <th className="py-4 px-6 font-medium">주요 감정 경향</th>

              <th className="py-4 px-6 font-medium text-center relative group">
                <div className="flex items-center justify-center gap-1.5 cursor-help w-fit mx-auto">
                  상태
                  <HelpCircle className="w-4 h-4 text-slate-700" fill="white" />
                </div>

                <div className="absolute hidden group-hover:block top-full left-1/2 -translate-x-1/2 mt-3 w-64 p-3 bg-slate-800 text-white text-xs rounded-xl shadow-2xl z-50 text-left font-normal cursor-default animate-in fade-in zoom-in-95 duration-200">
                  <p className="font-bold mb-2 text-slate-200 border-b border-slate-600 pb-2">상태별 권장 조치 가이드</p>
                  <ul className="space-y-2 mt-2">
                    <li><span className="inline-block w-14 text-slate-400 font-bold">NONE:</span> 기록만 유지</li>
                    <li><span className="inline-block w-14 text-blue-400 font-bold">WATCH:</span> 추세 관찰</li>
                    <li><span className="inline-block w-14 text-amber-400 font-bold">CHECK:</span> 안부 및 참여 권장</li>
                    <li><span className="inline-block w-14 text-red-500 font-bold animate-pulse">URGENT:</span> 즉각적인 안전 확인</li>
                  </ul>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-b-slate-800"></div>
                </div>
              </th>

              <th className="py-4 px-6 font-medium text-center">권장 조치</th>
              <th className="py-4 px-6 font-medium text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {/* 💡 2단계: participants 대신 필터링된 filteredParticipants를 매핑합니다 */}
            {filteredParticipants.length === 0 && !isLoading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                  {searchTerm || selectedStatus !== 'ALL' ? '검색 결과가 없습니다.' : '등록된 참여자가 없습니다.'}
                </td>
              </tr>
            ) : (
              filteredParticipants.map((p, idx) => {
                const emotion = getEmotionUI(p.recentEmotions);
                return (
                  <tr
                    key={p.seniorId || idx}
                    onClick={() => setSelectedSenior(p)} // 💡 행 클릭 시 모달 열기
                    className="hover:bg-slate-50 transition-colors group cursor-pointer" // 💡 커서 포인터 추가
                  >
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-bold text-slate-900">{p.name} <span className="font-medium text-slate-500">({p.gender}/{p.age})</span></p>
                        <p className="text-xs text-slate-400 mt-0.5">방 {p.seniorId}반</p>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-center text-slate-600 font-medium">
                      {formatRelativeTime(p.lastActiveAt)}
                    </td>

                    <td className="py-4 px-6 text-center text-slate-600 font-medium">
                      {p.thisWeekCompletedCount}회 / {p.thisWeekTotalCount}회
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <svg width="40" height="20" viewBox="0 0 40 20" className="flex-shrink-0 opacity-70">
                           <polyline points="0,15 10,5 20,18 30,8 40,10" fill="none" stroke={emotion.stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className={`font-bold flex items-center gap-1 ${emotion.color}`}>
                          {emotion.label} {emotion.icon}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-center">
                      <span className={`px-3 py-1.5 rounded-md text-xs font-bold border ${getBadgeStyle(p.interestLevel)}`}>
                        {p.interestLevel}
                      </span>
                    </td>

                    {/* 백엔드에서 전달받은 권장 조치 텍스트 표시 */}
                    <td className="py-4 px-6 text-center font-medium text-slate-600">
                      {p.recommendedAction || '-'}
                    </td>

                    <td className="py-4 px-6 text-center">
                      <button className="text-slate-400 hover:text-slate-700 p-1.5 rounded-md hover:bg-slate-200 transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 3. 하단 페이지네이션 */}
      <div className="p-4 border-t border-slate-200 flex justify-between items-center text-sm text-slate-500 bg-slate-50 rounded-b-2xl">
        <p>총 <span className="font-bold text-slate-700">{filteredParticipants.length}</span>명 중 1-5명 표시</p>
        <div className="flex gap-1">
          <button className="w-8 h-8 flex items-center justify-center rounded-md bg-white border border-teal-500 text-teal-600 font-bold shadow-sm">1</button>
          <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-200 transition-colors">2</button>
          <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-200 transition-colors">3</button>
          <span className="w-8 h-8 flex items-center justify-center">...</span>
          <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-200 transition-colors">&gt;</button>
        </div>
      </div>

      {/* 💡 어르신 상세 정보 모달 렌더링 */}
      <SeniorDetailModal senior={selectedSenior} onClose={() => setSelectedSenior(null)} />
    </div>
  );
}
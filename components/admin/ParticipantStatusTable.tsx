'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, MoreHorizontal, TrendingUp, TrendingDown, Minus, HelpCircle, UserPlus, RefreshCw } from 'lucide-react';
import SeniorDetailModal from './SeniorDetailModal';

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

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedSenior, setSelectedSenior] = useState<Participant | null>(null);

  const fetchParticipants = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.carescircles.com'}/api/admin/dashboard/seniors`, {
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

  const getBadgeStyle = (level: string) => {
    switch (level) {
      case 'CHECK': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'WATCH': return 'bg-blue-50 text-blue-500 border-blue-100';
      case 'URGENT': return 'bg-red-600 text-white border-red-700 font-bold animate-pulse';
      case 'NONE':
      default: return 'bg-slate-100 text-slate-400 border-slate-200';
    }
  };

  const getEmotionUI = (emotions: string[]) => {
    const lastEmotion = emotions && emotions.length > 0 ? emotions[emotions.length - 1] : 'NEUTRAL';

    switch (lastEmotion) {
      case 'SAD':
      case 'SADNESS':
        return { label: '외로움/우울', color: 'text-blue-500', icon: <TrendingDown className="w-4 h-4 text-blue-500" /> };
      case 'HAPPY':
      case 'JOY':
        return { label: '기쁨/긍정', color: 'text-emerald-500', icon: <TrendingUp className="w-4 h-4 text-emerald-500" /> };
      case 'ANGRY':
      case 'FEAR':
        return { label: '불안/서운함', color: 'text-orange-500', icon: <TrendingDown className="w-4 h-4 text-orange-500" /> };
      case 'NEUTRAL':
      default:
        return { label: '평온', color: 'text-slate-500', icon: <Minus className="w-4 h-4 text-slate-500" /> };
    }
  };

  const safeParticipants = Array.isArray(participants) ? participants : [];
  const filteredParticipants = safeParticipants.filter(p => {
    if (!p) return false;
    const matchName = p.name ? p.name.includes(searchTerm) : false;
    const matchStatus = selectedStatus === 'ALL' || p.interestLevel === selectedStatus;
    return matchName && matchStatus;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col animate-in fade-in duration-300">
      <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <h2 className="text-xl font-bold text-slate-900 mr-4">참여자 현황</h2>

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

      <div className="overflow-x-auto flex-1 pb-4">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm font-bold border-b border-slate-200">
              <th className="py-4 px-6 font-medium">참여자</th>
              <th className="py-4 px-6 font-medium text-center">최근 참여</th>
              <th className="py-4 px-6 font-medium text-center">이번 주 참여</th>
              <th className="py-4 px-6 font-medium">오늘의 감정</th>
              <th className="py-4 px-6 font-medium text-center relative group">
                <div className="flex items-center justify-center gap-1.5 cursor-help w-fit mx-auto">
                  상태
                  <HelpCircle className="w-4 h-4 text-slate-700" fill="white" />
                </div>
                <div className="absolute hidden group-hover:block top-full left-1/2 -translate-x-1/2 mt-3 w-64 p-3 bg-slate-800 text-white text-xs rounded-xl shadow-2xl z-50 text-left font-normal cursor-default animate-in fade-in zoom-in-95 duration-200">
                  <p className="font-bold mb-2 text-slate-200 border-b border-slate-600 pb-2">상태별 권장 조치 가이드</p>
                  <ul className="space-y-2 mt-2">
                    <li><span className="inline-block w-14 text-slate-400 font-bold">NONE:</span> 기록만 유지</li>
                    <li><span className="inline-block w-14 text-blue-400 font-bold">WATCH:</span> 가벼운 추세 관찰</li>
                    <li><span className="inline-block w-14 text-amber-400 font-bold">CHECK:</span> 안부 확인 및 참여 권장</li>
                    <li><span className="inline-block w-14 text-red-500 font-bold animate-pulse">URGENT:</span> 즉각적인 안전 확인 필요</li>
                  </ul>
                </div>
              </th>
              <th className="py-4 px-6 font-medium text-center">권장 조치</th>
              <th className="py-4 px-6 font-medium text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredParticipants.length === 0 && !isLoading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                  {searchTerm || selectedStatus !== 'ALL' ? '검색 결과가 없습니다.' : '등록된 어르신이 없습니다.'}
                </td>
              </tr>
            ) : (
              filteredParticipants.map((p, idx) => {
                const emotion = getEmotionUI(p.recentEmotions);
                return (
                  <tr
                    key={p.seniorId || idx}
                    onClick={() => setSelectedSenior(p)}
                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                  >
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                          {p.name || '어르신'} <span className="font-medium text-slate-500">({p.gender || '-'}/{p.age || '-'})</span>
                        </p>
                        {/* 💡 이 부분에 있던 '방 x반' 텍스트를 삭제했습니다 */}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center text-slate-600 font-medium">
                      {formatRelativeTime(p.lastActiveAt)}
                    </td>
                    <td className="py-4 px-6 text-center text-slate-600 font-medium">
                      {p.thisWeekCompletedCount || 0}회 / {p.thisWeekTotalCount || 0}회
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-bold flex items-center gap-1.5 ${emotion.color}`}>
                        {emotion.icon} {emotion.label}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-3 py-1.5 rounded-md text-xs font-bold border ${getBadgeStyle(p.interestLevel || 'NONE')}`}>
                        {p.interestLevel || 'NONE'}
                      </span>
                    </td>
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

      <div className="p-4 border-t border-slate-200 flex justify-between items-center text-sm text-slate-500 bg-slate-50 rounded-b-2xl">
        <p>총 <span className="font-bold text-slate-700">{filteredParticipants.length}</span>명</p>
      </div>

      <SeniorDetailModal senior={selectedSenior} onClose={() => setSelectedSenior(null)} />
    </div>
  );
}
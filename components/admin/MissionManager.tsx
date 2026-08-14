import React, { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCcw, CheckCircle2, Clock, SkipForward, Ban } from 'lucide-react';
import AddMissionModal from './AddMissionModal';
import MissionDetailModal from './MissionDetailModal'; // 💡 새로 만든 미션 상세 모달 임포트

interface MissionManagerProps {
  seniors: any[];
}

export default function MissionManager({ seniors }: MissionManagerProps) {
  const [missions, setMissions] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 💡 선택된 미션 상태 추가
  const [selectedMission, setSelectedMission] = useState<any | null>(null);

  const fetchMissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.carescircles.com'}/api/v1/admin/missions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMissions(await res.json());
      }
    } catch (e) {
      console.error("미션 목록 조회 에러", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  const getSeniorName = (id: number) => {
    const s = seniors.find(s => s.id === id);
    return s ? s.name : `어르신(ID:${id})`;
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">

      <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center flex-shrink-0">
        <h3 className="font-bold text-slate-800 text-lg">미션 배포 현황</h3>
        <div className="flex items-center gap-3">
          <button onClick={fetchMissions} className="text-slate-400 hover:text-teal-600 transition-colors" title="새로고침">
            <RefreshCcw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setIsModalOpen(true)} className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1 shadow-md hover:bg-teal-700 transition-colors">
            <Plus className="w-4 h-4" /> 미션 발급
          </button>
        </div>
      </div>

      <div className="overflow-x-auto flex-1 p-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-slate-500 text-sm border-b border-slate-200 bg-white">
              <th className="py-3 px-4 font-medium">대상 어르신</th>
              <th className="py-3 px-4 font-medium">미션 내용</th>
              <th className="py-3 px-4 font-medium">발급 일시</th>
              <th className="py-3 px-4 font-medium">진행 상태</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-100">
            {missions.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-10 text-center text-slate-400 font-medium">아직 발급된 미션이 없습니다.</td>
              </tr>
            ) : (
              missions.map(m => (
                <tr
                  key={m.id}
                  onClick={() => setSelectedMission(m)} // 💡 행 클릭 시 모달 열기
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <td className="py-4 px-4 font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                    {getSeniorName(m.seniorId)}
                  </td>
                  <td className="py-4 px-4 text-slate-700 font-medium truncate max-w-[200px] lg:max-w-xs group-hover:text-teal-600 transition-colors">
                    {m.content}
                  </td>
                  <td className="py-4 px-4 text-slate-500">
                    {new Date(m.createdAt).toLocaleString('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-4 px-4">
                    {m.status === 'COMPLETED' ? (
                      <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-bold flex items-center w-fit gap-1"><CheckCircle2 className="w-3 h-3"/> 완료</span>
                    ) : m.status === 'REJECTED' ? (
                      <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold flex items-center w-fit gap-1"><Ban className="w-3 h-3"/> 반려됨</span>
                    ) : m.status === 'SKIPPED' ? (
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold flex items-center w-fit gap-1"><SkipForward className="w-3 h-3"/> 스킵</span>
                    ) : (
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold flex items-center w-fit gap-1"><Clock className="w-3 h-3"/> 대기중</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddMissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        seniors={seniors}
        onSuccess={fetchMissions}
      />

      {/* 💡 미션 상세 모달 렌더링 */}
      <MissionDetailModal
        mission={selectedMission}
        seniorName={selectedMission ? getSeniorName(selectedMission.seniorId) : ''}
        onClose={() => setSelectedMission(null)}
      />
    </div>
  );
}
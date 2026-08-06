import React, { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCcw, CheckCircle2, Clock } from 'lucide-react';
import AddMissionModal from './AddMissionModal';

interface MissionManagerProps {
  seniors: any[];
}

export default function MissionManager({ seniors }: MissionManagerProps) {
  const [missions, setMissions] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/admin/missions`, {
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

  // 어르신 ID로 이름 찾기 헬퍼 함수
  const getSeniorName = (id: number) => {
    const s = seniors.find(s => s.id === id);
    return s ? s.name : `어르신(ID:${id})`;
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">

      {/* 테이블 헤더 */}
      <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
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

      {/* 테이블 본문 */}
      <div className="overflow-x-auto flex-1 p-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-slate-500 text-sm border-b border-slate-200">
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
                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4 font-bold text-slate-900">{getSeniorName(m.seniorId)}</td>
                  <td className="py-4 px-4 text-slate-700 font-medium truncate max-w-[200px] lg:max-w-xs">{m.content}</td>
                  <td className="py-4 px-4 text-slate-500">{new Date(m.createdAt).toLocaleString('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="py-4 px-4">
                    {m.status === 'COMPLETED' ? (
                      <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-bold flex items-center w-fit gap-1"><CheckCircle2 className="w-3 h-3"/> 완료</span>
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

      {/* 미션 발급 모달 렌더링 */}
      <AddMissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        seniors={seniors}
        onSuccess={fetchMissions}
      />
    </div>
  );
}
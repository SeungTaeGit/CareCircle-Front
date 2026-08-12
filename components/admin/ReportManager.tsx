import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Send, CheckCircle2, Clock, RefreshCcw } from 'lucide-react';
import ReportDetailModal from './ReportDetailModal';

export default function ReportManager() {
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'PENDING' | 'SENT'>('PENDING'); // PENDING: 검수 대기, SENT: 전송 완료

  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      // 백엔드 요청대로 ?status= 파라미터 활용
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/reports?status=${filter}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setReports(await res.json());
      } else {
        setReports([]);
      }
    } catch (e) {
      console.error("리포트 목록 조회 에러", e);
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">

      {/* 상단 헤더 & 탭 */}
      <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex flex-col gap-4 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">주간 감정 리포트 발송 관리</h3>
            <p className="text-xs text-slate-500 mt-1">AI가 매주 월요일 새벽 자동으로 작성한 요약본을 검수하고 보호자에게 전송합니다.</p>
          </div>
          <button onClick={fetchReports} className="text-slate-400 hover:text-teal-600 transition-colors" title="새로고침">
            <RefreshCcw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
          >
            검수 대기중 (전송 전)
          </button>
          <button
            onClick={() => setFilter('SENT')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === 'SENT' ? 'bg-teal-100 text-teal-700' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
          >
            보호자 전송 완료
          </button>
        </div>
      </div>

      {/* 리스트 테이블 */}
      <div className="overflow-x-auto flex-1 p-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-slate-500 text-sm border-b border-slate-200 bg-white">
              <th className="py-3 px-4 font-medium">대상 어르신</th>
              <th className="py-3 px-4 font-medium">리포트 대상 기간</th>
              <th className="py-3 px-4 font-medium">AI 요약 미리보기</th>
              <th className="py-3 px-4 font-medium">상태</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-100">
            {reports.length === 0 && !isLoading ? (
              <tr>
                <td colSpan={4} className="py-10 text-center text-slate-400 font-medium">
                  해당 상태의 리포트가 없습니다.
                </td>
              </tr>
            ) : (
              reports.map(r => (
                <tr
                  key={r.reportId}
                  onClick={() => setSelectedReport(r)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <td className="py-4 px-4 font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                    {r.seniorName} 어르신
                  </td>
                  <td className="py-4 px-4 text-slate-600 font-medium">
                    {r.startDate} ~ {r.endDate}
                  </td>
                  <td className="py-4 px-4 text-slate-500 truncate max-w-[250px]">
                    {r.reportContent}
                  </td>
                  <td className="py-4 px-4">
                    {r.status === 'SENT' ? (
                      <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-bold flex items-center w-fit gap-1"><CheckCircle2 className="w-3 h-3"/> 전송 완료</span>
                    ) : (
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold flex items-center w-fit gap-1"><Clock className="w-3 h-3"/> 검수 대기</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 리포트 상세 검수 모달 */}
      <ReportDetailModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        onSuccess={fetchReports} // 전송 성공 시 리스트 갱신
      />
    </div>
  );
}
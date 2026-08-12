import React, { useState } from 'react';
import { X, Send, FileText, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface ReportDetailModalProps {
  report: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReportDetailModal({ report, onClose, onSuccess }: ReportDetailModalProps) {
  const [isSending, setIsSending] = useState(false);

  if (!report) return null;

  const handleSendReport = async () => {
    if (!window.confirm(`${report.seniorName} 어르신의 보호자에게 리포트를 전송하시겠습니까?`)) return;

    setIsSending(true);
    try {
      const token = localStorage.getItem('accessToken');
      // 백엔드 요청 규격: POST /api/admin/reports/{reportId}/send
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/reports/${report.reportId}/send`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        alert("보호자에게 리포트가 성공적으로 전송되었습니다!");
        onSuccess(); // 목록 새로고침
        onClose();   // 모달 닫기
      } else {
        alert("리포트 전송에 실패했습니다.");
      }
    } catch (e) {
      console.error("전송 에러", e);
      alert("서버 연결에 문제가 발생했습니다.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col">

        {/* 헤더 */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${report.status === 'SENT' ? 'bg-teal-100 text-teal-600' : 'bg-amber-100 text-amber-600'}`}>
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{report.seniorName} 어르신 주간 리포트</h2>
              <p className="text-xs text-slate-500 font-medium">대상 기간: {report.startDate} ~ {report.endDate}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full shadow-sm border border-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 본문 (AI 리포트 내용) */}
        <div className="p-8 bg-[#f8fafc]">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
            <div className="absolute -top-3 -right-3 bg-gradient-to-r from-teal-500 to-emerald-400 text-white p-2 rounded-full shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-teal-600 mb-4 border-b border-slate-100 pb-2">AI 주간 요약 분석 결과</h3>

            <div className="text-slate-700 leading-loose font-medium whitespace-pre-wrap min-h-[150px]">
              {report.reportContent}
            </div>
          </div>

          <div className="mt-6">
            {report.status === 'SENT' ? (
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-center justify-center gap-2 text-teal-700 font-bold">
                <CheckCircle2 className="w-5 h-5" /> 이미 보호자에게 전송이 완료된 리포트입니다.
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <p className="text-amber-800 font-bold mb-1">내용 검수가 완료되었나요?</p>
                <p className="text-sm text-amber-700 mb-4">전송 버튼을 누르면 보호자의 대시보드로 리포트가 발송됩니다.</p>
                <button
                  onClick={handleSendReport}
                  disabled={isSending}
                  className="w-full max-w-sm bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 disabled:bg-slate-400"
                >
                  {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  {isSending ? '전송 중...' : '보호자에게 전송하기'}
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
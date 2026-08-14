import React, { useState, useEffect } from 'react';
import { X, Send, FileText, CheckCircle2, Loader2, Sparkles, Edit2, Save } from 'lucide-react';

interface ReportDetailModalProps {
  report: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReportDetailModal({ report, onClose, onSuccess }: ReportDetailModalProps) {
  const [isSending, setIsSending] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // 모달이 열릴 때 원본 내용을 수정용 상태에 세팅
  useEffect(() => {
    if (report) {
      setEditedContent(report.reportContent || '');
      setIsEditing(false);
    }
  }, [report]);

  if (!report) return null;

  // 💡 신규: 리포트 내용 수동 수정(PATCH) 함수
  const handleSaveEdit = async () => {
    setIsSavingEdit(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.carescircles.com'}/api/admin/reports/${report.reportId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: editedContent })
      });

      if (res.ok) {
        alert("리포트 내용이 성공적으로 수정되었습니다.");
        setIsEditing(false);
        onSuccess(); // 목록을 새로고침하여 부모 컴포넌트의 원본 데이터도 갱신
      } else {
        alert("수정에 실패했습니다. 다시 시도해 주세요.");
      }
    } catch (e) {
      console.error("리포트 수정 에러", e);
      alert("서버 연결에 문제가 발생했습니다.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleSendReport = async () => {
    if (isEditing) return alert("먼저 수정 중인 내용을 저장해 주세요.");
    if (!window.confirm(`${report.seniorName} 어르신의 보호자에게 리포트를 전송하시겠습니까?`)) return;

    setIsSending(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.carescircles.com'}/api/admin/reports/${report.reportId}/send`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        alert("보호자에게 리포트가 성공적으로 전송되었습니다!");
        onSuccess();
        onClose();
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
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">

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

        <div className="p-8 bg-[#f8fafc] overflow-y-auto">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
            <div className="absolute -top-3 -right-3 bg-gradient-to-r from-teal-500 to-emerald-400 text-white p-2 rounded-full shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>

            <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-4">
              <h3 className="text-sm font-bold text-teal-600">AI 주간 요약 분석 결과</h3>

              {/* 💡 신규: 수정 모드 토글 버튼 (전송 전일 때만 보임) */}
              {report.status !== 'SENT' && (
                isEditing ? (
                  <button onClick={handleSaveEdit} disabled={isSavingEdit} className="flex items-center gap-1 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 px-3 py-1.5 rounded-md shadow-sm transition-colors disabled:opacity-50">
                    {isSavingEdit ? <Loader2 className="w-3 h-3 animate-spin"/> : <Save className="w-3 h-3"/>} 완료 및 저장
                  </button>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-teal-600 px-2 py-1 rounded-md transition-colors">
                    <Edit2 className="w-3 h-3"/> 직접 수정하기
                  </button>
                )
              )}
            </div>

            {isEditing ? (
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full min-h-[150px] p-3 border border-teal-500 rounded-lg outline-none focus:ring-2 focus:ring-teal-200 resize-y text-slate-700 font-medium leading-relaxed"
                placeholder="리포트 내용을 입력하세요..."
              />
            ) : (
              <div className="text-slate-700 leading-loose font-medium whitespace-pre-wrap min-h-[150px]">
                {editedContent}
              </div>
            )}
          </div>

          <div className="mt-6">
            {report.status === 'SENT' ? (
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-center justify-center gap-2 text-teal-700 font-bold shadow-sm">
                <CheckCircle2 className="w-5 h-5" /> 이미 보호자에게 전송이 완료된 리포트입니다.
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex flex-col items-center justify-center text-center shadow-sm">
                <p className="text-amber-800 font-bold mb-1">내용 검수가 완료되었나요?</p>
                <p className="text-sm text-amber-700 mb-4">전송 버튼을 누르면 보호자의 대시보드로 리포트가 발송됩니다.</p>
                <button
                  onClick={handleSendReport}
                  disabled={isSending || isEditing}
                  className="w-full max-w-sm bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                  {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  {isSending ? '전송 중...' : isEditing ? '수정을 완료해주세요' : '보호자에게 전송하기'}
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
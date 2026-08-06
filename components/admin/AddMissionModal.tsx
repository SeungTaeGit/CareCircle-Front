import React, { useState } from 'react';
import { X, Send, Calendar, User, FileText } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  seniors: any[];
  onSuccess: () => void; // 발급 성공 후 목록 갱신용 콜백
}

export default function AddMissionModal({ isOpen, onClose, seniors, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    seniorId: '',
    content: '',
    targetDate: new Date().toISOString().split('T')[0] // 오늘 날짜를 기본값으로 세팅
  });
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.seniorId) return alert("대상 어르신을 선택해주세요.");

    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/admin/missions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          seniorId: parseInt(formData.seniorId),
          content: formData.content,
          targetDate: formData.targetDate
        })
      });

      if (response.ok) {
        alert("미션 발급이 완료되었습니다!");
        onSuccess(); // 부모 컴포넌트의 목록 새로고침
        onClose(); // 모달 닫기
      } else {
        alert("미션 발급에 실패했습니다. (서버 응답 오류)");
      }
    } catch (error) {
      console.error("미션 발급 에러:", error);
      alert("서버 연결에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">

        {/* 모달 헤더 */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50 rounded-t-3xl">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Send className="w-5 h-5 text-teal-600" /> 신규 미션 발급
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-white p-1.5 rounded-full shadow-sm"><X className="w-5 h-5"/></button>
        </div>

        {/* 폼 본문 */}
        <form id="missionForm" onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1"><User className="w-4 h-4 text-teal-600"/> 대상 어르신</label>
            <select
              value={formData.seniorId}
              onChange={(e) => setFormData({...formData, seniorId: e.target.value})}
              className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none bg-white font-medium"
              required
            >
              <option value="" disabled>어르신을 선택하세요</option>
              {seniors.map(senior => (
                <option key={senior.id} value={senior.id}>{senior.name} 어르신 (ID: {senior.id})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1"><FileText className="w-4 h-4 text-amber-500"/> 미션 내용 (질문)</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none resize-none shadow-inner bg-slate-50"
              placeholder="예: 오늘 점심은 무엇을 드셨나요?"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1"><Calendar className="w-4 h-4 text-blue-500"/> 발급 기준 일자</label>
            <input
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData({...formData, targetDate: e.target.value})}
              className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-slate-700"
              required
            />
          </div>
        </form>

        {/* 모달 푸터 */}
        <div className="p-6 border-t border-slate-100 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">
            취소
          </button>
          <button type="submit" form="missionForm" disabled={isLoading} className="flex-1 px-4 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-md disabled:opacity-50">
            {isLoading ? '발급 중...' : '미션 전송'}
          </button>
        </div>

      </div>
    </div>
  );
}
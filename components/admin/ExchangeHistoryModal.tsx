import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Mic, Image as ImageIcon, ArrowRightLeft } from 'lucide-react';

interface Senior {
  id: number;
  name: string;
  country: string;
  partnerName: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  senior: Senior | null;
}

export default function ExchangeHistoryModal({ isOpen, onClose, senior }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && senior) {
      setIsLoading(true);

      const fetchHistory = async () => {
        try {
          const token = localStorage.getItem('accessToken');
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.carescircles.com'}/api/admin/exchange/${senior.id}/history`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (res.ok) {
            setHistory(await res.json());
          } else {
            setHistory([]);
          }
        } catch (e) {
          console.error("교류 내역 로딩 실패", e);
          setHistory([]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchHistory();
    }
  }, [isOpen, senior]);

  if (!isOpen || !senior) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col h-[80vh]">

        {/* 헤더 */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                {senior.name} <ArrowRightLeft className="w-4 h-4 text-slate-400" /> {senior.partnerName}
              </h2>
              <p className="text-xs text-slate-500 font-medium">교류 내역 모니터링</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full shadow-sm border border-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 본문 (채팅 내역) */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#f8fafc]">
          {isLoading ? (
            <div className="flex justify-center items-center h-full text-slate-400 font-bold animate-pulse">
              교류 내역을 불러오는 중입니다...
            </div>
          ) : history.length === 0 ? (
            <div className="flex justify-center items-center h-full text-slate-400 font-medium">
              아직 교류한 내역이 없습니다.
            </div>
          ) : (
            <div className="space-y-6">
              {history.map((msg) => {
                // 현재 선택된 어르신이 보낸 메시지인지 판단 (채팅 방향 결정)
                const isMe = msg.sender === senior.name;

                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="text-xs font-bold text-slate-500">{msg.sender}</span>
                      <span className="text-[10px] text-slate-400">{msg.date}</span>
                    </div>

                    <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm border ${isMe ? 'bg-teal-600 text-white border-teal-700 rounded-tr-sm' : 'bg-white text-slate-800 border-slate-200 rounded-tl-sm'}`}>

                      {/* 메시지 타입 뱃지 */}
                      <div className={`flex items-center gap-1 mb-2 text-xs font-bold ${isMe ? 'text-teal-200' : 'text-slate-400'}`}>
                        {msg.type === 'VOICE' ? <Mic className="w-3 h-3"/> : msg.type === 'IMAGE' ? <ImageIcon className="w-3 h-3"/> : <MessageCircle className="w-3 h-3"/>}
                        {msg.type === 'VOICE' ? '음성 메시지' : msg.type === 'IMAGE' ? '사진 메시지' : '텍스트 메시지'}
                      </div>

                      {/* 원본 내용 */}
                      <p className="font-medium text-[15px] leading-relaxed mb-2">"{msg.content}"</p>

                      {/* 번역된 내용 */}
                      {msg.translated && (
                        <div className={`pt-2 mt-2 border-t ${isMe ? 'border-teal-500/50 text-teal-100' : 'border-slate-100 text-slate-500'}`}>
                          <p className="text-xs font-bold mb-0.5">A.I 번역</p>
                          <p className="text-sm">"{msg.translated}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
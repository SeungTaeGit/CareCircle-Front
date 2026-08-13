import React, { useState, useRef } from 'react';
import { Play, Mic, Image as ImageIcon, Type, Heart, Loader2 } from 'lucide-react';

interface FamilyMessage {
  id: number;
  senderName: string;
  messageType: 'TEXT' | 'AUDIO' | 'IMAGE';
  content?: string;
  audioUrl?: string;
  imageUrl?: string;
  read: boolean;
  createdAt: string;
}

interface FamilyMessageAlertProps {
  message: FamilyMessage | null;
  onRead: (messageId: number) => void;
}

export default function FamilyMessageAlert({ message, onRead }: FamilyMessageAlertProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!message) return null; // 메시지가 없으면 렌더링하지 않음

  const handlePlayAudio = () => {
    if (!audioRef.current) return;
    setIsPlaying(true);
    audioRef.current.play();
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className="bg-rose-50 rounded-3xl p-5 border-2 border-rose-200 shadow-sm animate-in slide-in-from-top-4 mb-2">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center p-1.5 bg-rose-200 text-rose-700 rounded-full animate-bounce">
            <Heart className="w-4 h-4 fill-current" />
          </span>
          <span className="text-sm font-bold text-slate-700">
            사랑하는 <span className="text-rose-600">{message.senderName}</span>의 편지가 도착했어요!
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-rose-100 mb-4 shadow-sm">
        <div className="flex flex-col gap-4">

          {/* 음성 메시지 */}
          {message.messageType === 'AUDIO' && (
            <>
              <button
                onClick={handlePlayAudio}
                disabled={isPlaying}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  isPlaying ? 'bg-slate-100 text-slate-400' : 'bg-rose-500 hover:bg-rose-600 text-white shadow-md'
                }`}
              >
                {isPlaying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                {isPlaying ? '목소리 듣는 중...' : '가족의 목소리 듣기'}
              </button>
              {message.audioUrl && (
                <audio ref={audioRef} src={message.audioUrl} onEnded={handleAudioEnded} className="hidden" />
              )}
            </>
          )}

          {/* 텍스트 메시지 (또는 음성/사진 캡션) */}
          {(message.content) && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="font-medium text-lg leading-relaxed text-slate-800 break-keep">
                "{message.content}"
              </p>
            </div>
          )}

          {/* 사진 메시지 */}
          {message.messageType === 'IMAGE' && message.imageUrl && (
            <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
              <img src={message.imageUrl} alt="가족이 보낸 사진" className="w-full h-auto object-cover max-h-80" />
            </div>
          )}
        </div>
      </div>

      {!message.read && (
        <button onClick={() => onRead(message.id)} className="w-full py-4 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold rounded-xl shadow-sm transition-colors flex justify-center items-center">
          확인 완료 (닫기)
        </button>
      )}
    </div>
  );
}
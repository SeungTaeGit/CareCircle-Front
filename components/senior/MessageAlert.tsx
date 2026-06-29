'use client';

import React, { useState } from 'react';
import { Mail, Play, Loader2 } from 'lucide-react';

interface ExchangeMessage {
  messageId: number;
  senderName: string;
  audioUrl: string;
  translatedContent: string;
}

interface MessageAlertProps {
  message: ExchangeMessage | null;
  onRead: (messageId: number) => void;
}

export default function MessageAlert({ message, onRead }: MessageAlertProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!message) return null;

  const handlePlayAudio = () => {
    if (isPlaying || !message.audioUrl) return;

    setIsPlaying(true);

    const audio = new Audio(message.audioUrl);

    audio.play().catch(error => {
      console.error("오디오 재생 에러:", error);
      alert("음성을 재생할 수 없습니다.");
      setIsPlaying(false);
    });

    audio.onended = () => {
      setIsPlaying(false);
      onRead(message.messageId);
    };
  };

  return (
    <button
      onClick={handlePlayAudio}
      disabled={isPlaying}
      className="w-full bg-amber-50 rounded-3xl p-5 border-2 border-amber-200 cursor-pointer hover:bg-amber-100 transition-colors shadow-sm flex items-center gap-4 relative overflow-hidden text-left group"
    >
      <Mail className="absolute -right-4 -top-4 w-24 h-24 text-amber-200 opacity-50 group-hover:scale-110 transition-transform duration-500" />
      <div className="w-14 h-14 bg-white rounded-full flex flex-col items-center justify-center text-2xl flex-shrink-0 z-10 shadow-sm border border-amber-100">
        🇯P
      </div>
      <div className="z-10 flex-1">
        <span className="inline-block px-2 py-1 bg-amber-200 text-amber-800 text-xs font-bold rounded-lg mb-1">
          새로운 답장
        </span>
        <h2 className="text-lg font-bold text-slate-800 leading-tight">
          {message.senderName}님이 인사를<br/>보냈어요! 들어볼까요?
        </h2>
        {isPlaying && message.translatedContent && (
          <p className="mt-2 text-sm text-teal-700 font-medium animate-pulse">
            "{message.translatedContent}"
          </p>
        )}
      </div>

      {isPlaying ? (
        <Loader2 className="w-8 h-8 text-amber-500 z-10 animate-spin" />
      ) : (
        <Play className="w-8 h-8 text-amber-500 z-10 fill-amber-500" />
      )}
    </button>
  );
}
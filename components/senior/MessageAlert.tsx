'use client';

import React, { useState, useRef } from 'react';
import { Mail, Play, Loader2, Mic, Square, X, Leaf } from 'lucide-react';

interface ExchangeMessage {
  messageId: number;
  senderName: string;
  audioUrl: string;
  translatedContent: string;
}

interface PartnerProfile {
  partnerId: number;
  partnerName: string;
  country: string;
  language: string;
}

interface MessageAlertProps {
  message: ExchangeMessage | null;
  partnerInfo: PartnerProfile | null;
  onRead: (messageId: number) => void;
}

export default function MessageAlert({ message, partnerInfo, onRead }: MessageAlertProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRead, setIsRead] = useState(false);
  const [showReplyUI, setShowReplyUI] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  if (!message && !showSuccess) return null;

  const handlePlayAudio = () => {
    if (isPlaying || !message?.audioUrl) return;

    setIsPlaying(true);
    const audio = new Audio(message.audioUrl);

    audio.play().catch(error => {
      console.error("오디오 재생 에러:", error);
      alert("음성을 재생할 수 없습니다.");
      setIsPlaying(false);
    });

    audio.onended = () => {
      setIsPlaying(false);

      if (!isRead) {
        setIsRead(true);
        setShowReplyUI(true);
        if (message) onRead(message.messageId);
      }
    };
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("마이크 권한을 허용해주세요!");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = async () => {
        if (!partnerInfo || !partnerInfo.partnerId) {
          alert("매칭된 파트너 정보가 없어 답장을 보낼 수 없습니다.");
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audioFile', audioBlob, 'reply_audio.webm');

        const requestData = {
          receiverId: partnerInfo.partnerId,
          messageType: "VOICE",
          content: "음성 답장"
        };

        const jsonBlob = new Blob([JSON.stringify(requestData)], { type: "application/json" });
        formData.append('data', jsonBlob);

        try {
          const token = localStorage.getItem('accessToken');
          const response = await fetch('http://localhost:8080/api/exchange', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
          });

          if (response.ok) {
            setShowSuccess(true);
            setTimeout(() => {
              setShowSuccess(false);
              window.location.reload();
            }, 2500);
          } else {
            alert("답장 전송에 실패했습니다.");
          }
        } catch (error) {
          alert("서버 연결 오류가 발생했습니다.");
        }
      };

      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleQuickReaction = () => {
    alert(`${partnerInfo?.partnerName}님에게 정원 씨앗(좋아요)을 보냈습니다!`);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      window.location.reload();
    }, 2500);
  };

  if (showSuccess) {
    return (
      <div className="w-full bg-teal-50 rounded-3xl p-5 border-2 border-teal-200 text-center animate-in fade-in">
        <span className="text-3xl mb-2 block">🕊️</span>
        <h2 className="text-lg font-bold text-teal-800">
          {partnerInfo?.partnerName}님에게 마음을 전했어요!
        </h2>
      </div>
    );
  }

  return (
    <div className="w-full bg-amber-50 rounded-3xl p-5 border-2 border-amber-200 shadow-sm transition-all duration-500">

      <div className="flex items-center gap-4 relative">
        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-2xl flex-shrink-0 z-10 shadow-sm border border-amber-100">
          🇯P
        </div>
        <div className="z-10 flex-1">
          <span className="inline-block px-2 py-1 bg-amber-200 text-amber-800 text-xs font-bold rounded-lg mb-1">
            새로운 답장
          </span>
          <h2 className="text-lg font-bold text-slate-800 leading-tight">
            {message?.senderName}님이 인사를<br/>보냈어요!
          </h2>
          {isPlaying && message?.translatedContent && (
            <p className="mt-2 text-sm text-teal-700 font-medium animate-pulse">"{message.translatedContent}"</p>
          )}
        </div>

        <button onClick={handlePlayAudio} disabled={isPlaying} className="z-10 flex flex-col items-center">
          {isPlaying ? (
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
          ) : (
            <>
              <Play className="w-10 h-10 text-amber-500 fill-amber-500 hover:scale-110 transition-transform" />
              {isRead && <span className="text-[10px] font-bold text-amber-700 mt-1">다시듣기</span>}
            </>
          )}
        </button>
      </div>

      {showReplyUI && (
        <div className="mt-6 pt-5 border-t border-amber-200 animate-in slide-in-from-top-4 relative">

          <button
            onClick={() => setShowReplyUI(false)}
            className="absolute -top-3 -right-2 bg-white rounded-full p-1.5 shadow-sm border border-amber-100 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>

          <p className="text-slate-600 font-bold mb-4 text-center">어떻게 화답할까요?</p>

          <div className="flex justify-center gap-6">
            <button
              onClick={handleQuickReaction}
              disabled={isRecording}
              className="flex flex-col items-center justify-center w-20 h-20 rounded-full bg-white text-teal-600 shadow-md border-2 border-teal-100 hover:bg-teal-50 transition-all transform active:scale-95 disabled:opacity-50"
            >
              <Leaf className="w-8 h-8" />
              <span className="text-[10px] font-bold mt-1">씨앗 주기</span>
            </button>

            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`flex flex-col items-center justify-center w-20 h-20 rounded-full text-white transition-all transform active:scale-95 ${
                isRecording ? 'bg-red-500 shadow-lg animate-pulse' : 'bg-amber-500 shadow-md hover:bg-amber-600'
              }`}
            >
              {isRecording ? <Square className="w-8 h-8 fill-white" /> : <Mic className="w-8 h-8" />}
              <span className="text-[10px] font-bold mt-1">{isRecording ? "전송하기" : "답장 녹음"}</span>
            </button>
          </div>
        </div>
      )}

      {isRead && !showReplyUI && (
        <button
          onClick={() => setShowReplyUI(true)}
          className="w-full mt-4 py-2 bg-white rounded-xl border border-amber-200 text-amber-700 font-bold text-sm hover:bg-amber-100 transition-colors"
        >
          답장 쓰기
        </button>
      )}
    </div>
  );
}
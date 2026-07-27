'use client';

import React, { useState, useRef } from 'react';
import { Play, Loader2, Mic, Square, X, Leaf, Hourglass } from 'lucide-react';

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
  const [isWaitingForReply, setIsWaitingForReply] = useState(false);
  const [safetyError, setSafetyError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handlePlayAudio = () => {
    if (isPlaying || !message?.audioUrl) return;

    setIsPlaying(true);
    const audio = new Audio(message.audioUrl);

    audio.play().catch(error => {
      console.error("오디오 재생 에러:", error);
      showFeedback("음성을 재생할 수 없습니다.");
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
      showFeedback("마이크 권한을 허용해주세요!");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = async () => {
        if (!partnerInfo || !partnerInfo.partnerId) {
          showFeedback("매칭된 파트너 정보가 없어 답장을 보낼 수 없습니다.");
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audioFile', audioBlob, 'reply_audio.webm');

        const requestData = {
          receiverId: partnerInfo.partnerId,
          messageType: "VOICE",
          content: ""
        };

        const jsonBlob = new Blob([JSON.stringify(requestData)], { type: "application/json" });
        formData.append('data', jsonBlob);

        setIsProcessing(true);

        try {
          const token = localStorage.getItem('accessToken');
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/exchange`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
          });

          if (response.ok) {
            setShowSuccess(true);
            setTimeout(() => {
              setShowSuccess(false);
              setIsWaitingForReply(true);
            }, 2500);
          } else if (response.status === 400) {
            setSafetyError(true);
          } else {
            showFeedback("답장 전송에 실패했습니다.");
          }
        } catch (error) {
          showFeedback("서버 연결 오류가 발생했습니다.");
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleQuickReaction = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setIsWaitingForReply(true);
    }, 2500);
  };

  const feedbackUI = feedbackMsg && (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-bold z-50 shadow-lg animate-in fade-in slide-in-from-top-2">
      {feedbackMsg}
    </div>
  );

  return (
    <>
      {isProcessing && (
        <div className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm animate-in fade-in duration-200">
          <Loader2 className="w-16 h-16 text-teal-600 animate-spin mb-6" />
          <h3 className="text-xl font-bold text-slate-800 text-center leading-snug">
            상대방에게 음성을 전송하고<br/>번역하는 중입니다...
          </h3>
          <p className="text-slate-500 mt-3 font-medium">잠시만 기다려주세요 ⏳</p>
        </div>
      )}

      {safetyError && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl transform animate-in zoom-in-90 duration-300">
            <div className="text-6xl mb-4 animate-bounce">🚨</div>
            <h3 className="text-xl font-bold text-red-600 mb-2">전송이 차단되었습니다</h3>
            <p className="text-slate-600 mb-6 text-sm break-keep leading-relaxed">
              부적절한 표현이 감지되어 메시지가<br/>전송되지 않았습니다.<br/>
              <span className="font-bold text-slate-800 mt-2 block">따뜻하고 고운 말로 다시 건네볼까요?</span>
            </p>
            <button
              onClick={() => setSafetyError(false)}
              className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-colors active:scale-95"
            >
              네, 다시 녹음할게요
            </button>
          </div>
        </div>
      )}

      {showSuccess ? (
        <div className="w-full bg-teal-50 rounded-3xl p-5 border-2 border-teal-200 text-center animate-in fade-in relative">
          {feedbackUI}
          <span className="text-3xl mb-2 block">🕊️</span>
          <h2 className="text-lg font-bold text-teal-800">
            {partnerInfo?.partnerName}님에게 마음을 전했어요!
          </h2>
        </div>
      ) : isWaitingForReply ? (
        <div className="w-full bg-sky-50 rounded-3xl p-6 border-2 border-sky-200 text-center shadow-sm relative animate-in fade-in">
          {feedbackUI}
          <div className="text-4xl mb-3 animate-pulse">✉️</div>
          <h2 className="text-lg font-bold text-sky-800 mb-1">메시지가 날아가고 있어요!</h2>
          <p className="text-sm text-sky-600">일본 친구의 답장이 올 때까지 기다려주세요.</p>
        </div>
      ) : !partnerInfo || !partnerInfo.partnerId ? (
        <div className="w-full bg-slate-50 rounded-3xl p-6 border-2 border-slate-200 text-center shadow-sm relative">
          {feedbackUI}
          <Hourglass className="w-10 h-10 mx-auto text-slate-400 mb-3 animate-pulse" />
          <h2 className="text-lg font-bold text-slate-700 mb-1">해외 펜팔을 찾는 중이에요</h2>
          <p className="text-sm text-slate-500">조금만 기다려주시면 좋은 친구를 소개시켜 드릴게요!</p>
        </div>
      ) : !message ? (
        <div className="w-full bg-amber-50 rounded-3xl p-5 border-2 border-amber-200 shadow-sm flex flex-col items-center text-center relative">
          {feedbackUI}
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-2xl mb-3 shadow-sm border border-amber-100">
            {partnerInfo.country === 'JP' ? '🇯P' : '🇰R'}
          </div>
          <h2 className="text-lg font-bold text-slate-800 leading-tight mb-2">
            {partnerInfo.partnerName}님과 짝꿍이 되었어요!<br/>먼저 반갑게 인사를 건네볼까요?
          </h2>
          <div className="mt-4 flex justify-center gap-6">
            <button onClick={handleQuickReaction} disabled={isRecording || isProcessing} className="flex flex-col items-center justify-center w-20 h-20 rounded-full bg-white text-teal-600 shadow-md border-2 border-teal-100 hover:bg-teal-50 transition-all transform active:scale-95 disabled:opacity-50">
              <Leaf className="w-8 h-8" />
              <span className="text-[10px] font-bold mt-1">씨앗 주기</span>
            </button>
            <button onClick={isRecording ? stopRecording : startRecording} disabled={isProcessing} className={`flex flex-col items-center justify-center w-20 h-20 rounded-full text-white transition-all transform active:scale-95 disabled:opacity-50 ${isRecording ? 'bg-red-500 shadow-lg animate-pulse' : 'bg-amber-500 shadow-md hover:bg-amber-600'}`}>
              {isRecording ? <Square className="w-8 h-8 fill-white" /> : <Mic className="w-8 h-8" />}
              <span className="text-[10px] font-bold mt-1">{isRecording ? "전송하기" : "첫 인사 녹음"}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full bg-amber-50 rounded-3xl p-5 border-2 border-amber-200 shadow-sm relative">
          {feedbackUI}
          <div className="flex items-center gap-4 relative">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-2xl flex-shrink-0 z-10 shadow-sm border border-amber-100">
              {partnerInfo.country === 'JP' ? '🇯P' : '🇰R'}
            </div>
            <div className="z-10 flex-1">
              <span className="inline-block px-2 py-1 bg-amber-200 text-amber-800 text-xs font-bold rounded-lg mb-1">새로운 답장</span>
              <h2 className="text-lg font-bold text-slate-800 leading-tight">
                {message.senderName}님이 인사를<br/>보냈어요!
              </h2>
              {isPlaying && message.translatedContent && (
                <p className="mt-2 text-sm text-teal-700 font-medium animate-pulse">"{message.translatedContent}"</p>
              )}
            </div>
            <button onClick={handlePlayAudio} disabled={isPlaying || isProcessing} className="z-10 flex flex-col items-center">
              {isPlaying ? <Loader2 className="w-10 h-10 text-amber-500 animate-spin" /> : (
                <>
                  <Play className="w-10 h-10 text-amber-500 fill-amber-500 hover:scale-110 transition-transform" />
                  {isRead && <span className="text-[10px] font-bold text-amber-700 mt-1">다시듣기</span>}
                </>
              )}
            </button>
          </div>

          {showReplyUI && (
            <div className="mt-6 pt-5 border-t border-amber-200 animate-in slide-in-from-top-4 relative">
              <button onClick={() => setShowReplyUI(false)} className="absolute -top-3 -right-2 bg-white rounded-full p-1.5 shadow-sm border border-amber-100 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
              <p className="text-slate-600 font-bold mb-4 text-center">어떻게 화답할까요?</p>
              <div className="flex justify-center gap-6">
                <button onClick={handleQuickReaction} disabled={isRecording || isProcessing} className="flex flex-col items-center justify-center w-20 h-20 rounded-full bg-white text-teal-600 shadow-md border-2 border-teal-100 hover:bg-teal-50 transition-all transform active:scale-95 disabled:opacity-50">
                  <Leaf className="w-8 h-8" />
                  <span className="text-[10px] font-bold mt-1">씨앗 주기</span>
                </button>
                <button onClick={isRecording ? stopRecording : startRecording} disabled={isProcessing} className={`flex flex-col items-center justify-center w-20 h-20 rounded-full text-white transition-all transform active:scale-95 disabled:opacity-50 ${isRecording ? 'bg-red-500 shadow-lg animate-pulse' : 'bg-amber-500 shadow-md hover:bg-amber-600'}`}>
                  {isRecording ? <Square className="w-8 h-8 fill-white" /> : <Mic className="w-8 h-8" />}
                  <span className="text-[10px] font-bold mt-1">{isRecording ? "전송하기" : "답장 녹음"}</span>
                </button>
              </div>
            </div>
          )}
          {isRead && !showReplyUI && (
            <button onClick={() => setShowReplyUI(true)} className="w-full mt-4 py-2 bg-white rounded-xl border border-amber-200 text-amber-700 font-bold text-sm hover:bg-amber-100 transition-colors">답장 쓰기</button>
          )}
        </div>
      )}
    </>
  );
}
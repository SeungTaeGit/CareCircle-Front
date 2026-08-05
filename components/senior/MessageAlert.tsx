'use client';

import React, { useState, useRef } from 'react';
import { Play, Loader2, Mic, Square, X, Leaf, Hourglass, Type, Image as ImageIcon, Send } from 'lucide-react';

interface ExchangeMessage {
  messageId: number;
  senderName: string;
  messageType: 'VOICE' | 'TEXT' | 'IMAGE'; // 💡 타입 확장
  content?: string;
  audioUrl?: string;
  imageUrl?: string;
  translatedContent?: string;
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

  // 답장 모드 관리 (VOICE, TEXT, IMAGE)
  const [replyMode, setReplyMode] = useState<'VOICE' | 'TEXT' | 'IMAGE' | null>(null);
  const [textContent, setTextContent] = useState('');

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  // 🔊 수신: 기존 음성 재생 처리
  const handlePlayAudio = () => {
    if (isPlaying || !message?.audioUrl) return;
    setIsPlaying(true);
    const audio = new Audio(message.audioUrl);
    audio.play().catch(() => {
      showFeedback("음성을 재생할 수 없습니다.");
      setIsPlaying(false);
    });
    audio.onended = () => {
      setIsPlaying(false);
      markAsReadAndShowReply();
    };
  };

  const markAsReadAndShowReply = () => {
    if (!isRead) {
      setIsRead(true);
      if (message) onRead(message.messageId);
    }
  };

  // 🎤 발신 1: 음성 녹음 (기존 API)
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      showFeedback("마이크 권한을 허용해주세요!");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = async () => {
        if (!partnerInfo) return;
        setIsProcessing(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audioFile', audioBlob, 'reply_audio.webm');

        // 기존 음성 API 유지
        const requestData = { receiverId: partnerInfo.partnerId, messageType: "VOICE", content: "" };
        formData.append('data', new Blob([JSON.stringify(requestData)], { type: "application/json" }));

        try {
          const token = localStorage.getItem('accessToken');
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/exchange`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
          });
          if (res.ok) handleSuccess();
          else showFeedback("전송 실패");
        } catch (e) { showFeedback("서버 오류"); }
        finally { setIsProcessing(false); setReplyMode(null); }
      };
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  // ✍️ 발신 2: 텍스트 전송 (신규 API)
  const sendTextReply = async () => {
    if (!textContent.trim() || !partnerInfo) return;
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('accessToken');
      // 💡 백엔드 명세 적용: POST /api/exchanges/{exchangeId}/text
      // (exchangeId 자리에 상대방 ID인 partnerId 사용)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${partnerInfo.partnerId}/text`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: textContent })
      });
      if (res.ok) {
        handleSuccess();
        setTextContent('');
      } else showFeedback("전송 실패");
    } catch (e) { showFeedback("서버 오류"); }
    finally { setIsProcessing(false); setReplyMode(null); }
  };

  // 📷 발신 3: 이미지 전송 (신규 API)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !partnerInfo) return;
    setIsProcessing(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('accessToken');
      // 💡 백엔드 명세 적용: POST /api/exchanges/{exchangeId}/image (Multipart)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${partnerInfo.partnerId}/image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }, // Content-Type은 브라우저가 자동 설정
        body: formData
      });
      if (res.ok) handleSuccess();
      else showFeedback("전송 실패");
    } catch (err) { showFeedback("서버 오류"); }
    finally { setIsProcessing(false); setReplyMode(null); }
  };

  const handleSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2500);
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
          <h3 className="text-xl font-bold text-slate-800 text-center leading-snug">메시지를 전송하는 중입니다...</h3>
        </div>
      )}

      {showSuccess ? (
        <div className="w-full bg-teal-50 rounded-3xl p-5 border-2 border-teal-200 text-center animate-in fade-in relative">
          {feedbackUI}
          <span className="text-3xl mb-2 block">🕊️</span>
          <h2 className="text-lg font-bold text-teal-800">{partnerInfo?.partnerName}님에게 마음을 전했어요!</h2>
        </div>
      ) : !partnerInfo ? (
        <div className="w-full bg-slate-50 rounded-3xl p-6 border-2 border-slate-200 text-center shadow-sm relative">
          <Hourglass className="w-10 h-10 mx-auto text-slate-400 mb-3 animate-pulse" />
          <h2 className="text-lg font-bold text-slate-700 mb-1">해외 펜팔을 찾는 중이에요</h2>
        </div>
      ) : !message ? (
        <div className="w-full bg-amber-50 rounded-3xl p-5 border-2 border-amber-200 shadow-sm flex flex-col items-center text-center relative">
          <h2 className="text-lg font-bold text-slate-800 leading-tight mb-2">
            먼저 반갑게 인사를 건네볼까요?
          </h2>
          {/* 최초 인사도 3가지 모드 제공 가능하지만 여기선 기존대로 음성 버튼 유지 */}
          <button onClick={isRecording ? stopRecording : startRecording} className={`mt-4 flex flex-col items-center justify-center w-20 h-20 rounded-full text-white transition-all transform active:scale-95 ${isRecording ? 'bg-red-500 shadow-lg animate-pulse' : 'bg-amber-500 shadow-md hover:bg-amber-600'}`}>
            {isRecording ? <Square className="w-8 h-8 fill-white" /> : <Mic className="w-8 h-8" />}
            <span className="text-[10px] font-bold mt-1">{isRecording ? "전송" : "인사 녹음"}</span>
          </button>
        </div>
      ) : (
        <div className="w-full bg-amber-50 rounded-3xl p-5 border-2 border-amber-200 shadow-sm relative">
          {feedbackUI}

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl flex-shrink-0 shadow-sm border border-amber-100 mt-1">
              {partnerInfo.country === 'JP' ? '🇯P' : '🇰R'}
            </div>
            <div className="flex-1">
              <span className="inline-block px-2 py-1 bg-amber-200 text-amber-800 text-xs font-bold rounded-lg mb-1">새로운 답장</span>
              <h2 className="text-base font-bold text-slate-800 mb-2">{message.senderName}님이 보냈어요!</h2>

              {/* 💡 수신 메시지 타입별 렌더링 분기 */}
              {message.messageType === 'TEXT' && (
                <div className="bg-white p-3 rounded-xl border border-amber-100 shadow-sm inline-block" onClick={markAsReadAndShowReply}>
                  <p className="text-slate-800 font-medium">"{message.translatedContent || message.content}"</p>
                </div>
              )}

              {message.messageType === 'IMAGE' && (
                <div className="rounded-xl overflow-hidden border border-amber-100 shadow-sm mt-1" onClick={markAsReadAndShowReply}>
                  <img src={message.imageUrl} alt="전송된 사진" className="w-full h-48 object-cover" />
                </div>
              )}

              {message.messageType === 'VOICE' && (
                <div className="flex items-center gap-3 mt-1">
                  <button onClick={handlePlayAudio} className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center hover:scale-105 transition-transform shadow-md">
                    {isPlaying ? <Loader2 className="w-6 h-6 animate-spin" /> : <Play className="w-6 h-6 fill-white ml-1" />}
                  </button>
                  {isPlaying && message.translatedContent && (
                    <p className="text-sm text-amber-700 font-medium animate-pulse">"{message.translatedContent}"</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 💡 답장 방식 선택 UI */}
          {isRead && !replyMode && (
            <div className="mt-5 pt-4 border-t border-amber-200 animate-in slide-in-from-top-4">
              <p className="text-slate-600 font-bold mb-3 text-center text-sm">어떻게 답장할까요?</p>
              <div className="flex justify-center gap-4">
                <button onClick={() => setReplyMode('VOICE')} className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-white text-teal-600 shadow-md border-2 border-teal-100 hover:bg-teal-50 active:scale-95">
                  <Mic className="w-6 h-6" /><span className="text-[10px] font-bold mt-1">목소리</span>
                </button>
                <button onClick={() => setReplyMode('TEXT')} className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-white text-blue-500 shadow-md border-2 border-blue-100 hover:bg-blue-50 active:scale-95">
                  <Type className="w-6 h-6" /><span className="text-[10px] font-bold mt-1">글쓰기</span>
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-white text-rose-500 shadow-md border-2 border-rose-100 hover:bg-rose-50 active:scale-95">
                  <ImageIcon className="w-6 h-6" /><span className="text-[10px] font-bold mt-1">사진</span>
                </button>
                <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
              </div>
            </div>
          )}

          {/* 🎤 음성 답장 모드 */}
          {replyMode === 'VOICE' && (
            <div className="mt-5 pt-4 border-t border-amber-200 text-center animate-in zoom-in-95">
              <button onClick={() => setReplyMode(null)} className="absolute top-2 right-2 text-slate-400"><X className="w-5 h-5"/></button>
              <button onClick={isRecording ? stopRecording : startRecording} className={`mx-auto flex flex-col items-center justify-center w-20 h-20 rounded-full text-white transition-all transform active:scale-95 ${isRecording ? 'bg-red-500 shadow-lg animate-pulse' : 'bg-teal-600 shadow-md hover:bg-teal-700'}`}>
                {isRecording ? <Square className="w-8 h-8 fill-white" /> : <Mic className="w-8 h-8" />}
                <span className="text-[10px] font-bold mt-1">{isRecording ? "전송하기" : "녹음 시작"}</span>
              </button>
            </div>
          )}

          {/* ✍️ 텍스트 답장 모드 */}
          {replyMode === 'TEXT' && (
            <div className="mt-5 pt-4 border-t border-amber-200 animate-in zoom-in-95 relative">
              <button onClick={() => setReplyMode(null)} className="absolute -top-3 right-0 bg-white rounded-full p-1 border border-slate-200 text-slate-400"><X className="w-4 h-4"/></button>
              <textarea
                value={textContent} onChange={(e) => setTextContent(e.target.value)}
                placeholder="답장 내용을 적어주세요."
                className="w-full p-3 rounded-xl border border-amber-200 outline-none focus:ring-2 focus:ring-amber-400 resize-none h-24 mb-2 text-sm"
              />
              <button onClick={sendTextReply} className="w-full bg-blue-500 text-white font-bold py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2 hover:bg-blue-600">
                <Send className="w-4 h-4" /> 텍스트 전송
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
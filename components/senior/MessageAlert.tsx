'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Mic, Image as ImageIcon, Type, Send, Square, Loader2, X } from 'lucide-react';

interface ExchangeMessage {
  messageId: number;
  senderName: string;
  messageType: 'VOICE' | 'TEXT' | 'IMAGE';
  content?: string;
  audioUrl?: string;
  imageUrl?: string;
  translatedContent?: string;
  status: string;
}

interface PartnerProfile {
  id?: number; // 💡 빌드 에러 해결을 위해 선택적 속성 추가
  partnerId: number;
  partnerName: string;
  country: string;
  language: string;
}

interface MessageAlertProps {
  message: ExchangeMessage | null;
  partnerInfo: PartnerProfile | null;
  onRead: (messageId: number) => void;
  onReplySent: () => void;
}

export default function MessageAlert({ message, partnerInfo, onRead, onReplySent }: MessageAlertProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRead, setIsRead] = useState(false);
  const [replyMode, setReplyMode] = useState<'NONE' | 'VOICE' | 'TEXT' | 'IMAGE'>('NONE');

  const [textReply, setTextReply] = useState('');
  const [isDictating, setIsDictating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsRead(false);
    setReplyMode('NONE');
    setTextReply('');
    setSelectedImage(null);
    setImagePreview(null);
    setAudioBlob(null);
  }, [message]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ko-KR';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTextReply((prev) => prev + finalTranscript + ' ');
        }
      };
      recognition.onerror = () => setIsDictating(false);
      recognition.onend = () => setIsDictating(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const handlePlayAudio = () => {
    if (!audioRef.current) return;
    setIsPlaying(true);
    audioRef.current.play();
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setIsRead(true);
    if (message) onRead(message.messageId);
  };

  const handleMarkAsRead = () => {
    setIsRead(true);
    if (message) onRead(message.messageId);
  };

  const toggleDictation = () => {
    if (isDictating) {
      recognitionRef.current?.stop();
      setIsDictating(false);
    } else {
      recognitionRef.current?.start();
      setIsDictating(true);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const showFeedback = (msg: string) => {
    alert(msg);
    setIsProcessing(false);
  };

  const handleApiError = async (response: Response) => {
    try {
      const errData = await response.json();
      showFeedback(errData.message || "말씀을 잘 이해하지 못했어요. 다시 한번 예쁘게 들려주시겠어요?");
    } catch {
      showFeedback("전송에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const sendTextReply = async () => {
    if (!textReply.trim() || !partnerInfo) return showFeedback("내용을 입력해주세요.");
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/exchange/text`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: partnerInfo.partnerId || partnerInfo.id || 2,
          content: textReply.trim(),
          messageType: 'TEXT'
        })
      });
      if (response.ok) {
        alert("답장이 전송되었습니다!");
        onReplySent();
      } else {
        await handleApiError(response);
      }
    } catch (e) { showFeedback("네트워크 오류가 발생했습니다."); } finally { setIsProcessing(false); }
  };

  const sendImageReply = async () => {
    if (!selectedImage || !partnerInfo) return showFeedback("사진을 선택해주세요.");
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();

      formData.append('imageFile', selectedImage);
      const requestData = {
        receiverId: partnerInfo.partnerId || partnerInfo.id || 2,
        content: "",
        messageType: 'IMAGE'
      };

      formData.append('data', new Blob([JSON.stringify(requestData)], { type: 'application/json' }));

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/exchange/image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (response.ok) {
        alert("사진이 전송되었습니다!");
        onReplySent();
      } else {
        await handleApiError(response);
      }
    } catch (e) { showFeedback("네트워크 오류가 발생했습니다."); } finally { setIsProcessing(false); }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
      };

      mediaRecorder.start();
      setIsRecordingAudio(true);
    } catch (err) {
      alert("마이크 접근 권한이 필요합니다.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecordingAudio(false);
    }
  };

  const sendVoiceReply = async () => {
    if (!audioBlob || !partnerInfo) return showFeedback("녹음된 음성이 없습니다.");
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();

      formData.append('audioFile', audioBlob, 'voice.webm');
      const requestData = {
        receiverId: partnerInfo.partnerId || partnerInfo.id || 2,
        content: "",
        messageType: "VOICE"
      };

      formData.append('data', new Blob([JSON.stringify(requestData)], { type: 'application/json' }));

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/exchange/voice`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        alert("음성 편지가 전송되었습니다!");
        onReplySent();
      } else {
        await handleApiError(response);
      }
    } catch (e) {
      showFeedback("네트워크 오류가 발생했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  const renderInputForm = (themeColor: 'teal' | 'amber') => (
    <div className={`mt-4 bg-white rounded-2xl p-4 border border-${themeColor}-200 shadow-sm animate-in fade-in slide-in-from-top-2`}>
      <div className="flex justify-between items-center mb-3">
        <span className={`font-bold text-${themeColor}-800 text-sm`}>
          {replyMode === 'VOICE' ? '🎤 음성 편지 보내기' : replyMode === 'TEXT' ? '✍️ 글자로 편지 쓰기' : '🖼️ 사진 편지 보내기'}
        </span>
        <button onClick={() => setReplyMode('NONE')} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
      </div>

      {replyMode === 'TEXT' && (
        <div className="flex flex-col gap-3">
          <textarea value={textReply} onChange={(e) => setTextReply(e.target.value)} placeholder="여기를 눌러 직접 쓰시거나, 마이크 버튼을 눌러 말씀하세요."
            className={`w-full p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-${themeColor}-500 outline-none resize-none h-32`} />
          <div className="flex gap-2">
            <button onClick={toggleDictation} className={`flex-1 py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-colors ${isDictating ? 'bg-red-100 text-red-600 border border-red-300 animate-pulse' : 'bg-slate-50 border border-slate-300 text-slate-600 hover:bg-slate-100'}`}>
              {isDictating ? <Square className="w-5 h-5 fill-current"/> : <Mic className="w-5 h-5"/>} {isDictating ? '녹음 중지' : '음성으로 쓰기'}
            </button>
            <button onClick={sendTextReply} disabled={isProcessing} className={`flex-1 py-3 bg-${themeColor}-500 hover:bg-${themeColor}-600 text-white font-bold rounded-xl flex justify-center items-center gap-2 shadow-md disabled:bg-slate-400`}>
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />} 전송
            </button>
          </div>
        </div>
      )}

      {replyMode === 'IMAGE' && (
        <div className="flex flex-col gap-3">
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} className="hidden" />
          {imagePreview ? (
            <div className="relative w-full h-48 bg-slate-200 rounded-xl overflow-hidden border border-slate-300">
              <img src={imagePreview} alt="미리보기" className="w-full h-full object-contain" />
              <button onClick={() => { setSelectedImage(null); setImagePreview(null); }} className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70"><X className="w-5 h-5"/></button>
            </div>
          ) : (
            <button onClick={() => fileInputRef.current?.click()} className={`w-full h-48 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-${themeColor}-500 transition-colors`}>
              <ImageIcon className="w-10 h-10 mb-2 text-slate-400" />
              <span className="font-bold">사진 앨범에서 선택하기</span>
            </button>
          )}
          <button onClick={sendImageReply} disabled={isProcessing || !selectedImage} className={`w-full py-4 bg-${themeColor}-500 hover:bg-${themeColor}-600 disabled:bg-slate-300 text-white font-bold rounded-xl flex justify-center items-center gap-2 shadow-md`}>
            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />} 사진 보내기
          </button>
        </div>
      )}

      {replyMode === 'VOICE' && (
        <div className="flex flex-col items-center gap-4 py-4">
          {audioBlob ? (
            <div className="w-full flex flex-col gap-4">
              <audio src={URL.createObjectURL(audioBlob)} controls className="w-full" />
              <div className="flex gap-2 w-full">
                <button onClick={() => setAudioBlob(null)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-300 hover:bg-slate-200">
                  다시 녹음하기
                </button>
                <button onClick={sendVoiceReply} disabled={isProcessing} className={`flex-1 py-3 bg-${themeColor}-500 hover:bg-${themeColor}-600 text-white font-bold rounded-xl flex justify-center items-center gap-2 shadow-md`}>
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin"/> : <Send className="w-5 h-5"/>} 전송
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={isRecordingAudio ? stopRecording : startRecording}
                className={`w-32 h-32 rounded-full flex flex-col items-center justify-center text-white shadow-xl transition-all ${isRecordingAudio ? 'bg-red-500 animate-pulse' : `bg-${themeColor}-500 hover:bg-${themeColor}-600`}`}
              >
                {isRecordingAudio ? <Square className="w-10 h-10 fill-current mb-2" /> : <Mic className="w-10 h-10 mb-2" />}
                <span className="font-bold">{isRecordingAudio ? '녹음 중지' : '녹음 시작'}</span>
              </button>
              <p className="text-slate-500 text-sm font-medium mt-2">
                {isRecordingAudio ? '말씀이 끝나면 정지 버튼을 눌러주세요.' : '버튼을 눌러 음성 녹음을 시작하세요.'}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );

  if (!message) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-2">
        <h2 className="text-lg font-bold text-slate-800 mb-4">내 펜팔 친구</h2>
        {partnerInfo ? (
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-sm overflow-hidden border-2 border-white">
                 <img src={partnerInfo.country === 'JP' ? 'https://flagcdn.com/w80/jp.png' : 'https://flagcdn.com/w80/kr.png'} alt="국기" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-slate-900">{partnerInfo.partnerName} 어르신</h3>
                <p className="text-slate-500 font-medium text-sm mt-0.5">{partnerInfo.country === 'JP' ? '일본' : '한국'} • 나와 같은 취미</p>
              </div>
            </div>

            {replyMode === 'NONE' && (
              <div className="mt-5">
                <p className="text-center text-slate-600 font-bold mb-3 text-sm">먼저 인사를 건네볼까요?</p>
                <div className="grid grid-cols-3 gap-3">
                  <button onClick={() => setReplyMode('VOICE')} className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:bg-teal-50 transition-colors">
                    <Mic className="w-6 h-6 text-teal-600" />
                    <span className="text-xs font-bold text-slate-600">음성 녹음</span>
                  </button>
                  <button onClick={() => setReplyMode('TEXT')} className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:bg-amber-50 transition-colors">
                    <Type className="w-6 h-6 text-amber-500" />
                    <span className="text-xs font-bold text-slate-600">글자 쓰기</span>
                  </button>
                  <button onClick={() => setReplyMode('IMAGE')} className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:bg-blue-50 transition-colors">
                    <ImageIcon className="w-6 h-6 text-blue-500" />
                    <span className="text-xs font-bold text-slate-600">사진 전송</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400 font-medium">아직 매칭된 친구가 없습니다.</div>
        )}

        {replyMode !== 'NONE' && renderInputForm('teal')}
      </div>
    );
  }

  return (
    <div className="bg-amber-50 rounded-3xl p-5 border-2 border-amber-200 shadow-sm animate-in slide-in-from-top-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-block px-2 py-1 bg-amber-200 text-amber-800 text-xs font-bold rounded-lg">새로운 편지</span>
        <span className="text-sm font-bold text-slate-700">{message.senderName} 님이 보냈어요!</span>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-amber-100 mb-4 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 text-xl flex-shrink-0">
             {message.messageType === 'VOICE' ? <Mic /> : message.messageType === 'IMAGE' ? <ImageIcon /> : <Type />}
          </div>

          <div className="flex-1">
            {message.messageType === 'VOICE' && (
              <>
                <button
                  onClick={handlePlayAudio}
                  disabled={isPlaying}
                  className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    isPlaying ? 'bg-slate-100 text-slate-400' : 'bg-amber-500 hover:bg-amber-600 text-white shadow-md'
                  }`}
                >
                  {isPlaying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                  {isPlaying ? '재생 중...' : '목소리 듣기'}
                </button>
                {message.audioUrl && (
                  <audio ref={audioRef} src={message.audioUrl} onEnded={handleAudioEnded} className="hidden" />
                )}
                {isRead && message.translatedContent && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-sm text-slate-500 font-bold mb-1">AI 번역 요약</p>
                    <p className="text-slate-800 leading-relaxed">"{message.translatedContent}"</p>
                  </div>
                )}
              </>
            )}

            {message.messageType === 'TEXT' && (
              <p className="font-medium text-lg leading-relaxed text-slate-800">"{message.translatedContent || message.content}"</p>
            )}

            {message.messageType === 'IMAGE' && message.imageUrl && (
              <div className="bg-slate-50 rounded-xl p-2 border border-slate-200 mt-2">
                <img src={message.imageUrl} alt="받은 사진" className="w-full h-64 md:h-80 rounded-lg object-contain" />
              </div>
            )}
          </div>
        </div>
      </div>

      {(message.messageType === 'TEXT' || message.messageType === 'IMAGE') && !isRead && (
        <button onClick={handleMarkAsRead} className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md flex justify-center items-center gap-2 animate-bounce">
          <Send className="w-5 h-5" /> 내용 확인 완료 (답장 쓰기)
        </button>
      )}

      {isRead && replyMode === 'NONE' && (
        <div className="mt-4 animate-in fade-in">
          <p className="text-center text-amber-800 font-bold mb-3 text-sm">어떤 방법으로 답장을 보낼까요?</p>
          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => setReplyMode('VOICE')} className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-amber-200 rounded-xl hover:bg-teal-50 transition-colors shadow-sm">
              <Mic className="w-6 h-6 text-teal-600" />
              <span className="text-xs font-bold text-slate-700">음성 녹음</span>
            </button>
            <button onClick={() => setReplyMode('TEXT')} className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-amber-200 rounded-xl hover:bg-amber-50 transition-colors shadow-sm">
              <Type className="w-6 h-6 text-amber-500" />
              <span className="text-xs font-bold text-slate-700">글자 쓰기</span>
            </button>
            <button onClick={() => setReplyMode('IMAGE')} className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-amber-200 rounded-xl hover:bg-blue-50 transition-colors shadow-sm">
              <ImageIcon className="w-6 h-6 text-blue-500" />
              <span className="text-xs font-bold text-slate-700">사진 전송</span>
            </button>
          </div>
        </div>
      )}

      {replyMode !== 'NONE' && renderInputForm('amber')}
    </div>
  );
}
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Send, Loader2, Volume2 } from 'lucide-react';

interface MissionRecorderProps {
  todayMission: string;
}

export default function MissionRecorder({ todayMission }: MissionRecorderProps) {
  const [textInput, setTextInput] = useState('');
  const [isDictating, setIsDictating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<{ isPass: boolean; comment: string } | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // 브라우저 내장 STT (Web Speech API) 참조
  const recognitionRef = useRef<any>(null);

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
          setTextInput((prev) => prev + finalTranscript + ' ');
        }
      };

      recognition.onerror = (event: any) => {
        console.error("음성 인식 에러", event.error);
        setIsDictating(false);
      };

      recognition.onend = () => {
        setIsDictating(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleDictation = () => {
    if (isDictating) {
      recognitionRef.current?.stop();
      setIsDictating(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsDictating(true);
      } else {
        alert("현재 기기에서는 음성 인식(STT)을 지원하지 않습니다. 키보드를 사용해 주세요.");
      }
    }
  };

  const handleSubmit = async () => {
    if (!textInput.trim()) {
      alert("내용을 입력해 주세요.");
      return;
    }

    setIsProcessing(true);
    setAiFeedback(null); // 이전 피드백 초기화

    try {
      const token = localStorage.getItem('accessToken');
      // 💡 API 명세에 맞춤: /api/missions/{dailyMissionId}/text
      const dailyMissionId = 1; // 연동 시 props로 받아올 실제 미션 ID
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/missions/${dailyMissionId}/text`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ textResult: textInput.trim() })
      });

      if (response.ok) {
        const data = await response.json();

        if (data.isPass) {
          // 성공 시 UI 처리
          setAiFeedback({ isPass: true, comment: data.aiComment });
          setIsCompleted(true);
        } else {
          // 실패 시 UI 처리 (창 닫지 않고 피드백 노출)
          setAiFeedback({ isPass: false, comment: data.aiComment });
        }
      } else {
        alert('미션 제출에 실패했습니다.');
      }
    } catch (error) {
      console.error("미션 전송 에러:", error);
      alert('서버와 연결할 수 없습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ [성공] 미션 완료 시 렌더링될 뷰
  if (isCompleted) {
    return (
      <div className="bg-teal-50 rounded-3xl p-8 border-2 border-teal-500 shadow-md text-center animate-in zoom-in-95 duration-500 flex-grow flex flex-col justify-center">
        <div className="text-6xl mb-4 animate-bounce">🌱</div>
        <h2 className="text-2xl font-bold text-teal-800 mb-2">미션 완료!</h2>
        <p className="text-teal-600 font-bold mb-6">씨앗 1개를 얻었습니다.</p>
        <div className="bg-white p-5 rounded-2xl border border-teal-200 shadow-sm">
          <p className="text-slate-700 font-medium leading-relaxed">"{aiFeedback?.comment}"</p>
        </div>
      </div>
    );
  }

  // 📝 [진행/실패] 미션 입력 뷰
  return (
    <div className="bg-white rounded-3xl p-6 border-2 border-teal-500 shadow-md flex-grow flex flex-col relative">
      <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-teal-600 text-white px-5 py-1.5 rounded-full font-bold shadow-md">오늘의 미션</span>

      <div className="mt-4 mb-4 text-center w-full">
        <h2 className="text-2xl font-bold text-slate-900 leading-snug break-keep">{todayMission}</h2>
      </div>

      {/* 💡 AI 피드백 (재시도 필요 시 노출) */}
      {aiFeedback && !aiFeedback.isPass && (
        <div className="mb-4 bg-amber-50 p-4 rounded-2xl border border-amber-200 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🤖</div>
            <div>
              <p className="text-sm font-bold text-amber-800 mb-1">다시 한 번 생각해볼까요?</p>
              <p className="text-sm text-amber-700 leading-relaxed">{aiFeedback.comment}</p>
            </div>
          </div>
        </div>
      )}

      {/* 텍스트 입력 및 내장 마이크 기능 */}
      <div className="relative flex-grow flex flex-col mb-4">
        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="여기를 눌러 직접 글자를 쓰시거나, 아래 마이크 버튼을 눌러 말씀해 주세요."
          className="w-full flex-grow p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 resize-none text-lg text-slate-800 shadow-inner"
        />

        <button
          onClick={toggleDictation}
          className={`absolute bottom-4 right-4 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all ${
            isDictating ? 'bg-red-500 animate-pulse' : 'bg-teal-500 hover:bg-teal-600'
          }`}
        >
          {isDictating ? <Square className="w-6 h-6 fill-current" /> : <Mic className="w-7 h-7" />}
        </button>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isProcessing || isDictating}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl shadow-md text-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:bg-slate-400"
      >
        {isProcessing ? (
          <><Loader2 className="w-6 h-6 animate-spin" /> 전송 중...</>
        ) : (
          <><Send className="w-6 h-6" /> 미션 제출하기</>
        )}
      </button>
    </div>
  );
}
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Send, Loader2, Hourglass, CheckCircle } from 'lucide-react';

interface MissionRecorderProps {
  mission: any | null;
  currentIndex: number;
  totalCount: number;
  isAllDone: boolean;
  isLoading: boolean;
  onRefresh: () => void;
}

export default function MissionRecorder({ mission, currentIndex, totalCount, isAllDone, isLoading, onRefresh }: MissionRecorderProps) {
  const [textInput, setTextInput] = useState('');
  const [isDictating, setIsDictating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [aiFeedback, setAiFeedback] = useState<{ isPass: boolean; comment: string; isHarmful?: boolean } | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setTextInput('');
    setAiFeedback(null);
    setIsCompleted(false);
    setIsDictating(false);
  }, [mission?.id, mission?.missionId]);

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

      recognition.onerror = () => setIsDictating(false);
      recognition.onend = () => setIsDictating(false);
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
        alert("현재 브라우저에서는 마이크 입력을 지원하지 않습니다. 글자를 직접 적어주세요.");
      }
    }
  };

  const handleSubmit = async () => {
    if (!textInput.trim()) return alert("내용을 입력해 주세요.");
    if (!mission) return;

    setIsProcessing(true);
    setAiFeedback(null);

    try {
      const token = localStorage.getItem('accessToken');
      const targetId = mission.missionId || mission.id;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.carescircles.com'}/api/v1/missions/${targetId}/complete/text`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ textResult: textInput.trim() })
      });

      if (response.ok) {
        const data = await response.json();

        // 💡 백엔드 가이드: isHarmful이 true면 에러/실패 처리 대신 코멘트 띄우고 다시하기 유도
        if (data.isHarmful) {
          setAiFeedback({
            isPass: false,
            comment: data.aiComment || "말씀을 잘 이해하지 못했어요. 다시 한번 예쁘게 들려주시겠어요?",
            isHarmful: true
          });
          setIsCompleted(false);
        } else if (data.isPass) {
          setAiFeedback({ isPass: true, comment: data.aiComment });
          setIsCompleted(true);
        } else {
          setAiFeedback({ isPass: false, comment: data.aiComment });
        }
      } else {
        setAiFeedback({ isPass: false, comment: "지금은 AI 도우미가 바빠요! 잠시 후 다시 시도해주세요. ⏳" });
      }
    } catch (error) {
      alert('서버 전송 중 문제가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkip = async () => {
    if (!confirm("이 미션을 건너뛰시겠습니까?\n(다음 질문으로 넘어갑니다)")) return;
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('accessToken');
      const targetId = mission?.missionId || mission?.id;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.carescircles.com'}/api/v1/missions/${targetId}/skip`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        onRefresh();
      } else {
        alert("건너뛰기에 실패했습니다.");
      }
    } catch (e) {
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center flex-grow">
        <Hourglass className="w-10 h-10 text-teal-300 animate-pulse mb-3" />
        <h3 className="text-slate-500 font-bold">오늘의 미션을 확인하는 중이에요...</h3>
      </div>
    );
  }

  if (totalCount === 0) {
    return (
      <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 shadow-sm text-center flex-grow flex flex-col justify-center items-center">
        <CheckCircle className="w-12 h-12 text-slate-300 mb-3" />
        <h3 className="text-slate-500 font-bold text-lg">오늘은 배정된 미션이 없습니다.</h3>
        <p className="text-slate-400 text-sm mt-2">내일 다시 찾아와주세요!</p>
      </div>
    );
  }

  if (isAllDone && !isCompleted) {
    return (
      <div className="bg-teal-50 rounded-3xl p-8 border-2 border-teal-500 shadow-md text-center flex-grow flex flex-col justify-center animate-in zoom-in-95 duration-500">
        <div className="text-6xl mb-4 animate-bounce">🌳</div>
        <h2 className="text-2xl font-bold text-teal-800 mb-2">오늘의 미션 모두 완료!</h2>
        <p className="text-teal-600 font-bold mb-6">내일 또 새로운 미션으로 찾아뵐게요.</p>
      </div>
    );
  }

  if (isCompleted) {
    const isLastMission = currentIndex >= totalCount - 1;
    return (
      <div className="bg-teal-50 rounded-3xl p-8 border-2 border-teal-500 shadow-md text-center flex-grow flex flex-col justify-center animate-in zoom-in-95 duration-500">
        <div className="text-6xl mb-4 animate-bounce">🌱</div>
        <h2 className="text-2xl font-bold text-teal-800 mb-2">참 잘하셨습니다!</h2>
        <p className="text-teal-600 font-bold mb-6">씨앗 1개를 얻었습니다.</p>

        {aiFeedback?.comment && (
          <div className="bg-white p-5 rounded-2xl border border-teal-200 shadow-sm text-left mb-6">
            <p className="text-sm font-bold text-teal-800 mb-2">🤖 돌봄 AI의 한마디</p>
            <p className="text-slate-700 font-medium leading-relaxed">"{aiFeedback.comment}"</p>
          </div>
        )}

        <button
          onClick={() => {
            setIsCompleted(false);
            onRefresh();
          }}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl shadow-md text-lg transition-colors"
        >
          {isLastMission ? '확인 (오늘의 미션 끝)' : '다음 미션 하기 ➡️'}
        </button>
      </div>
    );
  }

  const missionText = mission?.content || mission?.title || mission?.missionContent || mission?.text || '미션 내용이 없습니다.';

  return (
    <div className="bg-white rounded-3xl p-6 border-2 border-teal-500 shadow-md flex-grow flex flex-col relative animate-in slide-in-from-right-4 duration-300">
      <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-teal-600 text-white px-5 py-1.5 rounded-full font-bold shadow-md text-sm">
        오늘의 미션 ({currentIndex + 1}/{totalCount})
      </span>

      <div className="mt-4 mb-4 text-center w-full">
        <h2 className="text-2xl font-bold text-slate-900 leading-snug break-keep">{missionText}</h2>
      </div>

      {/* 💡 유해 표현 감지 시 따뜻한 메시지로 재시도 유도 */}
      {aiFeedback && !aiFeedback.isPass && (
        <div className={`mb-4 p-4 rounded-2xl border animate-in slide-in-from-bottom-2 ${aiFeedback.isHarmful ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex items-start gap-3">
            <div className="text-2xl">🤖</div>
            <div>
              <p className={`text-sm font-bold mb-1 ${aiFeedback.isHarmful ? 'text-rose-800' : 'text-amber-800'}`}>
                {aiFeedback.isHarmful ? '잠깐만요!' : '다시 한 번 생각해볼까요?'}
              </p>
              <p className={`text-sm leading-relaxed break-keep ${aiFeedback.isHarmful ? 'text-rose-700' : 'text-amber-700'}`}>
                {aiFeedback.comment}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="relative flex-grow flex flex-col mb-4">
        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="여기를 눌러 직접 글자를 쓰시거나, 아래 마이크 버튼을 눌러 말씀해 주세요."
          className="w-full flex-grow p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 resize-none text-lg text-slate-800 shadow-inner"
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

      <div className="flex flex-col gap-2">
        <button
          onClick={handleSubmit}
          disabled={isProcessing || isDictating}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl shadow-md text-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:bg-slate-400"
        >
          {isProcessing ? <><Loader2 className="w-6 h-6 animate-spin" /> 전송 중...</> : <><Send className="w-6 h-6" /> 미션 확인받기</>}
        </button>

        <button
          onClick={handleSkip}
          disabled={isProcessing}
          className="w-full py-3 text-slate-400 hover:text-slate-600 font-bold text-sm underline transition-colors disabled:opacity-50"
        >
          이 질문은 대답하기 어려워요 (건너뛰기)
        </button>
      </div>
    </div>
  );
}
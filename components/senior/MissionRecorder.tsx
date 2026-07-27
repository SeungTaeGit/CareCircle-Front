'use client';

import React, { useState, useRef } from 'react';
import { Mic, Square, Volume2 } from 'lucide-react';

interface MissionRecorderProps {
  todayMission: string;
}

export default function MissionRecorder({ todayMission }: MissionRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [recordStartTime, setRecordStartTime] = useState<number | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordStartTime(Date.now());
    } catch (err) {
      console.error("마이크 접근 권한 에러:", err);
      alert("마이크 접근 권한을 허용해주세요!");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

        const formData = new FormData();
        formData.append('audioFile', audioBlob, 'mission_audio.webm');

        const playTimeSeconds = recordStartTime ? Math.floor((Date.now() - recordStartTime) / 1000) : 0;

        const requestData = {
          activityType: "VOICE_MISSION",
          score: 10,
          playTimeSeconds: playTimeSeconds
        };

        const jsonBlob = new Blob([JSON.stringify(requestData)], { type: "application/json" });
        formData.append('data', jsonBlob);

        try {
          const token = localStorage.getItem('accessToken');
          const response = await fetch('${process.env.NEXT_PUBLIC_API_URL}/api/activities', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });

          if (response.ok) {
            setShowReward(true);
            setTimeout(() => setShowReward(false), 3000);
          } else {
            alert('미션 전송에 실패했습니다. (상태 코드: ' + response.status + ')');
          }
        } catch (error) {
          console.error("활동 기록 저장 에러:", error);
          alert('서버와 연결할 수 없습니다.');
        }
      };

      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  return (
    <>
      {showReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-3xl text-center transform animate-in zoom-in-50 duration-500">
            <div className="text-6xl mb-4 animate-bounce">🌱</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">참 잘하셨어요!</h2>
            <p className="text-teal-600 font-bold">씨앗 1개를 얻었습니다</p>
          </div>
        </div>
      )}

      <div className="bg-teal-50 rounded-3xl p-6 border-2 border-teal-500 shadow-md flex-grow flex flex-col justify-center items-center text-center relative">
        <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-teal-600 text-white px-5 py-1.5 rounded-full font-bold shadow-md">오늘의 미션</span>

        <div className="mt-4 mb-8 w-full">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-snug break-keep">{todayMission}</h2>
          <button className="mt-4 text-teal-700 font-bold text-base flex items-center justify-center gap-2 mx-auto bg-white px-4 py-2 rounded-full shadow-sm border border-teal-100 active:bg-teal-50">
            <Volume2 className="w-5 h-5" /> 질문 다시 듣기
          </button>
        </div>

        <button
          onClick={toggleRecording}
          className={`relative flex flex-col items-center justify-center w-40 h-40 rounded-full text-white transition-all duration-300 transform active:scale-95 ${
            isRecording ? 'bg-red-500 shadow-[0_0_40px_rgba(239,68,68,0.6)]' : 'bg-teal-600 shadow-[0_15px_30px_rgba(13,148,136,0.4)] hover:bg-teal-700'
          }`}
        >
          {isRecording && <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping opacity-75"></div>}

          {isRecording ? (
            <><Square className="w-12 h-12 mb-2 fill-white" /><span className="font-bold text-xl animate-pulse">녹음 중...</span></>
          ) : (
            <><Mic className="w-14 h-14 mb-2" /><span className="font-bold text-xl">눌러서 말하기</span></>
          )}
        </button>

        <p className="mt-8 text-slate-500 font-medium text-sm sm:text-base break-keep">
          버튼을 누르고 편하게 말씀해 주세요.<br/>다 말씀하신 후 다시 누르면 전송됩니다.
        </p>
      </div>
    </>
  );
}
import React, { useState, useRef } from 'react';
import { X, Mic, Image as ImageIcon, Type, Send, Loader2, Square } from 'lucide-react';

interface CheerMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  seniorId: number;
}

export default function CheerMessageModal({ isOpen, onClose, seniorId }: CheerMessageModalProps) {
  const [activeTab, setActiveTab] = useState<'TEXT' | 'AUDIO' | 'IMAGE'>('TEXT');
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [senderName, setSenderName] = useState('가족'); // 기본값

  // 음성 녹음 관련 상태
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
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
        // Blob을 File 객체로 변환하여 selectedFile에 저장
        const file = new File([blob], 'voice_message.webm', { type: 'audio/webm' });
        setSelectedFile(file);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("마이크 접근 권한이 필요합니다.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(true); // UI 업데이트를 위해 딜레이 방지
      setTimeout(() => setIsRecording(false), 100);
    }
  };

  const handleSubmit = async () => {
    if (activeTab === 'TEXT' && !content.trim()) return alert("메시지 내용을 입력해주세요.");
    if (activeTab === 'AUDIO' && !selectedFile) return alert("음성을 녹음해주세요.");
    if (activeTab === 'IMAGE' && !selectedFile) return alert("사진을 선택해주세요.");
    if (!senderName.trim()) return alert("보내는 분의 이름을 입력해주세요.");

    setIsProcessing(true);
    try {
      const token = localStorage.getItem('accessToken');

      // FormData 객체 생성 (multipart/form-data 통신용)
      const formData = new FormData();
      formData.append('senderName', senderName.trim());
      formData.append('messageType', activeTab);

      if (content.trim()) {
        formData.append('content', content.trim());
      }

      if (selectedFile && (activeTab === 'AUDIO' || activeTab === 'IMAGE')) {
        formData.append('file', selectedFile);
      }

      // fetch 시 FormData를 body로 넘기면 브라우저가 자동으로 Content-Type과 Boundary를 설정함
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.carescircles.com'}/api/messages/send/${seniorId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        alert("부모님께 사랑의 메시지가 전송되었습니다! 💌");
        onClose();
      } else {
        alert("전송에 실패했습니다. 다시 시도해 주세요.");
      }
    } catch (error) {
      console.error("전송 에러:", error);
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col">

        {/* 헤더 */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-amber-50">
          <h2 className="text-xl font-bold text-amber-900 flex items-center gap-2">
            💌 부모님께 응원 메시지 보내기
          </h2>
          <button onClick={onClose} className="text-amber-700 hover:text-amber-900 bg-white p-2 rounded-full shadow-sm"><X className="w-5 h-5"/></button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">보내는 사람 (예: 큰아들, 예쁜 손녀)</label>
            <input type="text" value={senderName} onChange={(e) => setSenderName(e.target.value)} className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none" placeholder="이름이나 호칭을 적어주세요" />
          </div>

          {/* 탭 버튼 */}
          <div className="flex bg-slate-100 rounded-xl p-1 mb-5">
            <button onClick={() => { setActiveTab('TEXT'); setSelectedFile(null); }} className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${activeTab === 'TEXT' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500'}`}><Type className="w-4 h-4"/> 텍스트</button>
            <button onClick={() => { setActiveTab('AUDIO'); setSelectedFile(null); setAudioBlob(null); }} className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${activeTab === 'AUDIO' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500'}`}><Mic className="w-4 h-4"/> 음성</button>
            <button onClick={() => { setActiveTab('IMAGE'); setSelectedFile(null); setImagePreview(null); }} className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${activeTab === 'IMAGE' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500'}`}><ImageIcon className="w-4 h-4"/> 사진</button>
          </div>

          {/* 탭 본문 */}
          <div className="min-h-[160px] flex flex-col">
            {activeTab === 'TEXT' && (
              <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="부모님께 따뜻한 안부 인사를 남겨보세요!" className="w-full h-32 p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none resize-none bg-slate-50" />
            )}

            {activeTab === 'AUDIO' && (
              <div className="flex flex-col items-center justify-center py-4">
                {audioBlob ? (
                  <div className="w-full flex flex-col items-center gap-4">
                    <audio src={URL.createObjectURL(audioBlob)} controls className="w-full" />
                    <button onClick={() => { setAudioBlob(null); setSelectedFile(null); }} className="text-sm font-bold text-slate-500 underline">다시 녹음하기</button>
                  </div>
                ) : (
                  <>
                    <button onMouseDown={startRecording} onMouseUp={stopRecording} onTouchStart={startRecording} onTouchEnd={stopRecording} className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg transition-all ${isRecording ? 'bg-red-500 animate-pulse scale-110' : 'bg-amber-500 hover:bg-amber-600'}`}>
                      {isRecording ? <Square className="w-8 h-8 fill-current" /> : <Mic className="w-8 h-8" />}
                    </button>
                    <p className="text-slate-500 text-sm font-medium mt-4">버튼을 누른 채로 말씀해주세요.</p>
                  </>
                )}
              </div>
            )}

            {activeTab === 'IMAGE' && (
              <div className="flex flex-col gap-3">
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} className="hidden" />
                {imagePreview ? (
                  <div className="relative w-full h-40 bg-slate-200 rounded-xl overflow-hidden border border-slate-300">
                    <img src={imagePreview} alt="미리보기" className="w-full h-full object-cover" />
                    <button onClick={() => { setSelectedFile(null); setImagePreview(null); }} className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70"><X className="w-5 h-5"/></button>
                  </div>
                ) : (
                  <button onClick={() => fileInputRef.current?.click()} className="w-full h-40 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-amber-500 transition-colors">
                    <ImageIcon className="w-10 h-10 mb-2 text-slate-400" />
                    <span className="font-bold">사진 선택하기</span>
                  </button>
                )}
                <input type="text" value={content} onChange={(e) => setContent(e.target.value)} placeholder="사진에 대한 짧은 설명을 적어주세요 (선택)" className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
              </div>
            )}
          </div>

          <button onClick={handleSubmit} disabled={isProcessing} className="w-full mt-6 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-400 text-white font-bold py-4 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2">
            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />} 전송하기
          </button>
        </div>

      </div>
    </div>
  );
}
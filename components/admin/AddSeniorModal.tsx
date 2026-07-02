import React, { useState } from 'react';
import { X, UserPlus, Globe, Heart } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddSeniorModal({ isOpen, onClose }: ModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    gender: 'F',
    birthDate: '',
    country: 'KR',
    language: 'ko',
    hobbies: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'country') {
      const autoLang = value === 'KR' ? 'ko' : 'ja';
      setFormData(prev => ({ ...prev, country: value, language: autoLang }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8080/api/seniors', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('어르신 등록이 완료되었습니다!');
        onClose();
        window.location.reload();
      } else {
        alert('등록에 실패했습니다. 정보를 다시 확인해주세요.');
      }
    } catch (error) {
      console.error("어르신 등록 에러:", error);
      alert('서버와 연결할 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">

        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-teal-600" /> 신규 어르신 등록
            </h2>
            <p className="text-sm text-slate-500 mt-1">양방향 번역 및 매칭을 위한 필수 정보입니다.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full shadow-sm"><X className="w-5 h-5"/></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form id="addSeniorForm" onSubmit={handleSubmit} className="space-y-5">

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">성함</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required
                  className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none transition-colors" placeholder="예: 김순자" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">연락처</label>
                <input type="tel" name="contact" value={formData.contact} onChange={handleInputChange} required
                  className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none transition-colors" placeholder="010-0000-0000" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">성별</label>
                <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none bg-white">
                  <option value="F">여성 (Female)</option>
                  <option value="M">남성 (Male)</option>
                </select>
              </div>
              <div>
                {/* 💡 나이(number) 대신 생년월일(date)로 변경 */}
                <label className="block text-sm font-bold text-slate-700 mb-1.5">생년월일</label>
                <input type="date" name="birthDate" value={formData.birthDate} onChange={handleInputChange} required
                  className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none transition-colors" />
              </div>
            </div>

            <div className="bg-teal-50 p-4 rounded-2xl border border-teal-100">
              <label className="block text-sm font-bold text-teal-900 mb-3 flex items-center gap-1"><Globe className="w-4 h-4"/> 글로벌 매칭 설정</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-teal-700 mb-1">국적</label>
                  <select name="country" value={formData.country} onChange={handleInputChange} className="w-full p-2.5 rounded-lg border border-teal-200 outline-none bg-white">
                    <option value="KR">🇰🇷 대한민국 (KR)</option>
                    <option value="JP">🇯🇵 일본 (JP)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-teal-700 mb-1">사용 언어</label>
                  <select name="language" value={formData.language} onChange={handleInputChange} className="w-full p-2.5 rounded-lg border border-teal-200 outline-none bg-slate-50">
                    <option value="ko">한국어 (Korean)</option>
                    <option value="ja">일본어 (Japanese)</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1"><Heart className="w-4 h-4 text-rose-500"/> 관심사 / 취미</label>
              <input type="text" name="hobbies" value={formData.hobbies} onChange={handleInputChange} required
                className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none transition-colors" placeholder="예: 요리, 트로트, 산책" />
            </div>

          </form>
        </div>

        <div className="p-6 border-t border-slate-100 flex gap-3 bg-white flex-shrink-0">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-3.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">
            취소
          </button>
          <button type="submit" form="addSeniorForm" disabled={isLoading} className="flex-1 px-4 py-3.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors shadow-md disabled:bg-teal-400">
            {isLoading ? '저장 중...' : '등록 완료'}
          </button>
        </div>

      </div>
    </div>
  );
}
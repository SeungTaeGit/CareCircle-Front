import React from 'react';
import { X, UserPlus } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddSeniorModal({ isOpen, onClose }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-teal-600" /> 신규 어르신 등록
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">성함</label>
            <input type="text" className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="어르신 성함을 입력하세요" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">연락처</label>
            <input type="tel" className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="010-0000-0000" />
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200">취소</button>
          <button className="flex-1 px-4 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700">등록 완료</button>
        </div>
      </div>
    </div>
  );
}
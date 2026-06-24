import React from 'react';
import { Mail, Play } from 'lucide-react';

export default function MessageAlert() {
  return (
    <button className="w-full bg-amber-50 rounded-3xl p-5 border-2 border-amber-200 cursor-pointer hover:bg-amber-100 transition-colors shadow-sm flex items-center gap-4 relative overflow-hidden text-left group">
      <Mail className="absolute -right-4 -top-4 w-24 h-24 text-amber-200 opacity-50 group-hover:scale-110 transition-transform duration-500" />
      <div className="w-14 h-14 bg-white rounded-full flex flex-col items-center justify-center text-2xl flex-shrink-0 z-10 shadow-sm border border-amber-100">
        🇯P
      </div>
      <div className="z-10 flex-1">
        <span className="inline-block px-2 py-1 bg-amber-200 text-amber-800 text-xs font-bold rounded-lg mb-1">새로운 답장</span>
        <h2 className="text-lg font-bold text-slate-800 leading-tight">사토코님이 인사를<br/>보냈어요! 들어볼까요?</h2>
      </div>
      <Play className="w-8 h-8 text-amber-500 z-10 fill-amber-500" />
    </button>
  );
}
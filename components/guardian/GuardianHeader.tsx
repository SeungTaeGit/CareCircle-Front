import React from 'react';
import { HeartHandshake, LogOut } from 'lucide-react';

export default function GuardianHeader() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-4 h-16 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <HeartHandshake className="w-6 h-6 text-amber-500" />
          <span className="font-bold text-xl text-slate-900 tracking-tight">
            CareCircle <span className="text-amber-500 font-medium text-sm">Family</span>
          </span>
        </div>
        <button className="text-slate-400 hover:text-slate-600 transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
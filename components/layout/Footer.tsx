import React from 'react';
import { HeartHandshake } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <HeartHandshake className="w-6 h-6 text-teal-500" />
          <span className="font-bold text-xl text-white tracking-tight">CareCircle</span>
        </div>
        <p className="text-sm">2026 글로벌 피우다 프로젝트 참여팀 &copy; All rights reserved.</p>
      </div>
    </footer>
  );
}
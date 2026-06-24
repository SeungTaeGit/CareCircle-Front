import React from 'react';
import Link from 'next/link';
import { Home, TreePine, Image as ImageIcon } from 'lucide-react';

export default function BottomNav() {
  return (
    <nav className="absolute bottom-0 w-full bg-white border-t-2 border-slate-100 flex justify-around items-center pb-6 pt-3 px-2 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] rounded-t-3xl z-50">
      <Link href="/senior" className="flex flex-col items-center justify-center w-1/3 text-teal-600">
        <Home className="w-7 h-7 mb-1" />
        <span className="font-bold text-xs">홈</span>
      </Link>
      <button className="flex flex-col items-center justify-center w-1/3 text-slate-400 hover:text-slate-600 transition-colors relative">
        <TreePine className="w-7 h-7 mb-1" />
        <span className="absolute top-0 right-7 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        <span className="font-bold text-xs">함께정원</span>
      </button>
      <button className="flex flex-col items-center justify-center w-1/3 text-slate-400 hover:text-slate-600 transition-colors">
        <ImageIcon className="w-7 h-7 mb-1" />
        <span className="font-bold text-xs">사진첩</span>
      </button>
    </nav>
  );
}
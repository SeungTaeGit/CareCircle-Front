import React from 'react';
import { Home, TreePine, Image as ImageIcon } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'HOME' | 'GARDEN' | 'GALLERY';
  setActiveTab: (tab: 'HOME' | 'GARDEN' | 'GALLERY') => void;
}

export default function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 w-full max-w-[480px] bg-white border-t-2 border-slate-100 flex justify-around items-center pb-safe pt-2 px-2 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] rounded-t-3xl z-50 h-20">

      <button
        onClick={() => setActiveTab('HOME')}
        className={`flex flex-col items-center justify-center w-1/3 transition-colors ${activeTab === 'HOME' ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
      >
        <Home className={`w-7 h-7 mb-1 ${activeTab === 'HOME' ? 'fill-teal-100' : ''}`} />
        <span className={`text-xs font-bold ${activeTab === 'HOME' ? 'text-teal-700' : ''}`}>홈</span>
      </button>

      <button
        onClick={() => setActiveTab('GARDEN')}
        className={`flex flex-col items-center justify-center w-1/3 transition-colors ${activeTab === 'GARDEN' ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
      >
        <div className="relative">
          <TreePine className={`w-7 h-7 mb-1 ${activeTab === 'GARDEN' ? 'fill-teal-100' : ''}`} />
          {/* 정원에 새로운 소식이 있을 때 띄울 수 있는 빨간 점 (현재는 더미) */}
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </div>
        <span className={`text-xs font-bold ${activeTab === 'GARDEN' ? 'text-teal-700' : ''}`}>함께정원</span>
      </button>

      <button
        onClick={() => setActiveTab('GALLERY')}
        className={`flex flex-col items-center justify-center w-1/3 transition-colors ${activeTab === 'GALLERY' ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
      >
        <ImageIcon className={`w-7 h-7 mb-1 ${activeTab === 'GALLERY' ? 'fill-teal-100' : ''}`} />
        <span className={`text-xs font-bold ${activeTab === 'GALLERY' ? 'text-teal-700' : ''}`}>사진첩</span>
      </button>

    </nav>
  );
}
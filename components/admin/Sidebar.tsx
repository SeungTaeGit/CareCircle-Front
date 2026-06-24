import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HeartHandshake, Building2, PieChart, Users, ListChecks, FileText, User, LogOut } from 'lucide-react';

export default function Sidebar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  return (
    <aside className="w-64 bg-slate-900 text-white flex-col hidden md:flex flex-shrink-0">
      <div className="h-20 flex items-center px-6 border-b border-slate-800">
        <HeartHandshake className="text-teal-500 w-8 h-8 mr-2" />
        <span className="font-bold text-xl tracking-tight">CareCircle Admin</span>
      </div>

      <div className="p-6 border-b border-slate-800 bg-slate-800/30">
        <p className="text-xs text-slate-400 mb-1">현재 접속 기관</p>
        <p className="font-bold text-white flex items-center gap-2">
          <Building2 className="w-4 h-4 text-teal-500" /> 전주 행복복지관
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          <li>
            <Link href="/admin" className="flex items-center px-6 py-3 bg-teal-500/20 border-l-4 border-teal-500 text-teal-400 font-bold">
              <PieChart className="w-5 h-5 mr-3" /> 대시보드 홈
            </Link>
          </li>
          <li>
            <a href="#" className="flex items-center px-6 py-3 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
              <Users className="w-5 h-5 mr-3" /> 어르신 관리
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center px-6 py-3 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
              <ListChecks className="w-5 h-5 mr-3" /> 미션 배포 및 현황
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center px-6 py-3 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
              <FileText className="w-5 h-5 mr-3" /> 기관 통계 리포트
            </a>
          </li>
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button onClick={handleLogout} className="flex items-center text-slate-300 hover:text-white transition-colors w-full">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center mr-3">
            <User className="w-4 h-4" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-bold">김담당 사회복지사</p>
          </div>
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
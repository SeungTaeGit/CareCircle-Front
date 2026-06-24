import React from 'react';
import { Play } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-br from-teal-50 to-sky-50 overflow-hidden">
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-600/5 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 text-teal-700 font-semibold mb-6">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-600"></span>
              </span>
              2026 글로벌 피우다 프로젝트 선정작
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight mb-6">
              어르신을 돌봄의 대상에서<br/>
              <span className="text-teal-600">사회참여의 주체</span>로.
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              음성 하나로 기록되는 일상, 한국과 일본을 잇는 시니어 취미 교류. <br/>
              AI 기술로 따뜻한 소통의 다리를 놓습니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#contact" className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition-colors shadow-lg text-center">
                기관 도입 상담하기
              </a>
              <button className="bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center gap-2">
                <Play className="w-5 h-5 fill-slate-900" /> 소개 영상 보기
              </button>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-2xl h-[400px] md:h-[500px]">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent z-10"></div>
            <img
              src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="스마트패드를 보며 웃는 어르신"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-6 left-6 right-6 z-20 text-white">
              <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg inline-block mb-3 border border-white/30 text-sm font-medium">
                🌱 함께정원 레벨 4 달성!
              </div>
              <p className="font-bold text-xl md:text-2xl leading-snug">"오늘 부침개 부치는 소리를 녹음해서 일본 친구에게 보냈단다."</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
import React from 'react';
import { Sparkles, Trophy } from 'lucide-react';

interface GardenData {
  plantLevel: number;
  currentExp: number;
  requiredExp: number;
}

interface TogetherGardenProps {
  gardenData: GardenData | null;
  partnerName?: string;
}

export default function TogetherGarden({ gardenData, partnerName }: TogetherGardenProps) {
  if (!gardenData) {
    return (
      <div className="flex-grow flex items-center justify-center animate-pulse">
        <p className="text-slate-400 font-bold">정원 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  const calculateProgress = () => {
    if (gardenData.requiredExp === 0) return 100;
    const percentage = (gardenData.currentExp / gardenData.requiredExp) * 100;
    return Math.min(Math.max(percentage, 0), 100);
  };

  const getPlantVisuals = (level: number) => {
    if (level === 1) return { emoji: '🌱', title: '씨앗', desc: '이제 막 우정이 싹트기 시작했어요!' };
    if (level === 2) return { emoji: '🌿', title: '새싹', desc: '어르신들의 추억을 먹고 파릇파릇 자라났어요.' };
    if (level === 3) return { emoji: '🌳', title: '작은 나무', desc: '서로를 아끼는 마음이 모여 나무가 되었어요!' };
    if (level >= 4) return { emoji: '🌲🌳🌲', title: '울창한 숲', desc: '아름다운 우정의 숲이 완성되었어요!' };
    return { emoji: '🌱', title: '씨앗', desc: '정원을 가꾸어 볼까요?' };
  };

  const visual = getPlantVisuals(gardenData.plantLevel);
  const progress = calculateProgress();

  return (
    <div className="flex-grow flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-6">

      {/* 1. 타이틀 영역 */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          나의 소중한 추억이 담긴
        </h2>
        <h1 className="text-3xl font-bold text-teal-600 flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6" /> 함께정원 <Sparkles className="w-6 h-6" />
        </h1>
      </div>

      {/* 2. 나무 성장 시각화 영역 */}
      <div className="bg-gradient-to-b from-sky-100 to-teal-50 rounded-3xl border-2 border-teal-100 shadow-md p-8 flex flex-col items-center justify-center relative overflow-hidden min-h-[300px]">
        {/* 장식용 배경 요소 */}
        <div className="absolute top-4 left-4 text-4xl opacity-30 animate-pulse">☁️</div>
        <div className="absolute top-10 right-6 text-3xl opacity-30 animate-pulse delay-75">☁️</div>
        <div className="absolute bottom-0 w-full h-1/4 bg-teal-600/10 rounded-t-full blur-md"></div>

        <div className="relative z-10 flex flex-col items-center justify-center transform transition-transform duration-700 hover:scale-110 cursor-pointer">
          <div className="text-8xl mb-4 filter drop-shadow-xl animate-bounce">
            {visual.emoji}
          </div>
          <span className="bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full text-teal-800 font-bold shadow-sm border border-teal-200">
            레벨 {gardenData.plantLevel} : {visual.title}
          </span>
        </div>

        <p className="text-slate-600 font-medium text-center mt-6 z-10 break-keep leading-relaxed">
          {visual.desc}
        </p>
      </div>

      {/* 3. 경험치 프로그레스 바 영역 */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex justify-between items-end mb-3">
          <p className="font-bold text-slate-700 flex items-center gap-1">
            <Trophy className="w-5 h-5 text-amber-500" /> 다음 레벨까지
          </p>
          <p className="text-sm font-bold text-teal-600">
            {gardenData.currentExp} / {gardenData.requiredExp} XP
          </p>
        </div>

        {/* 거대하고 부드러운 프로그레스 바 */}
        <div className="w-full h-6 bg-slate-100 rounded-full overflow-hidden shadow-inner relative">
          <div
            className="h-full bg-gradient-to-r from-teal-400 to-teal-500 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2 relative overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            {/* 프로그레스 바 내부 빛 반사 효과 */}
            <div className="absolute inset-0 w-full h-full bg-white/20 skew-x-12 -translate-x-full animate-[shimmer_2s_infinite]"></div>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 font-medium mt-4">
          미션을 완료하거나 친구에게 편지를 보내면 나무가 자라나요!
        </p>
      </div>

    </div>
  );
}
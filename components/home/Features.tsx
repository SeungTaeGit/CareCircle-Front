'use client';

import React from 'react';
import { UserRound, Home, Building2, CheckCircle2 } from 'lucide-react';
import { useSettings } from '@/components/providers/SettingsProvider';

export default function Features() {
  const { t } = useSettings();

  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('누구를 위한 서비스인가요?', '誰のためのサービスですか？')}</h2>
        <p className="text-lg text-slate-500 mb-16">{t('세 가지 핵심 사용자를 위한 맞춤형 생태계를 제공합니다.', '3つのコアユーザーのためのカスタマイズされたエコシステムを提供します。')}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {/* 어르신 */}
          <div className="p-8 rounded-3xl bg-slate-50 hover:-translate-y-2 transition-transform duration-300 border border-slate-100">
            <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mb-6">
              <UserRound className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">{t('어르신', 'シニア')}</h3>
            <p className="text-slate-600 mb-6 leading-relaxed break-keep">
              {t('복잡한 입력 없이', '複雑な入力なしに')} <strong>{t('큰 마이크 버튼 하나', '大きなマイクボタン一つ')}</strong>{t('로 일상을 기록하고, 이웃 나라 친구와 목소리를 나눕니다.', 'で日常を記録し、隣国の友達と声を分かち合います。')}
            </p>
            <ul className="text-sm text-slate-500 space-y-3">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /> {t('매일 주어지는 쉬운 취미 미션', '毎日提供される簡単な趣味ミッション')}</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /> {t('성취감을 주는 \'함께정원\' 보상', '達成感を与える「ガーデン」報酬')}</li>
            </ul>
          </div>

          {/* 보호자 */}
          <div className="p-8 rounded-3xl bg-slate-50 hover:-translate-y-2 transition-transform duration-300 border border-slate-100">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
              <Home className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">{t('가족 (보호자)', '家族 (保護者)')}</h3>
            <p className="text-slate-600 mb-6 leading-relaxed break-keep">
              {t('부모님의 활동량과 정서 상태를 분석한', 'ご両親の活動量と感情状態を分析した')} <strong>{t('안심 리포트', '安心レポート')}</strong>{t('를 주간 단위로 받아보며 멀리서도 마음을 전합니다.', 'を週間で受け取り、遠くからでも心を伝えます。')}
            </p>
            <ul className="text-sm text-slate-500 space-y-3">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500" /> {t('정서 분석 기반 AI 요약 보고서', '感情分析ベースのAI要約レポート')}</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500" /> {t('음성 편지로 응원 메시지 전송', '音声メッセージで応援を送信')}</li>
            </ul>
          </div>

          {/* 기관 관리자 */}
          <div className="p-8 rounded-3xl bg-slate-50 hover:-translate-y-2 transition-transform duration-300 border border-slate-100">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">{t('복지관/지자체', '福祉施設/自治体')}</h3>
            <p className="text-slate-600 mb-6 leading-relaxed break-keep">
              {t('수십 명의 어르신 상태를 한눈에 파악하는', '数十名のシニアの状態を一目で把握できる')} <strong>{t('통합 대시보드', '統合ダッシュボード')}</strong>{t('로 돌봄 인력의 한계를 극복합니다.', 'で、ケア人材の限界を克服します。')}
            </p>
            <ul className="text-sm text-slate-500 space-y-3">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600" /> {t('부정적 발화 및 무응답 이상 탐지', '否定的な発言や無応答の異常検知')}</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600" /> {t('참여도 통계 기반 맞춤형 케어', '参加度統計に基づくカスタマイズケア')}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
import React from 'react';
import { Play, Image as ImageIcon, Mic } from 'lucide-react';

interface Activity {
  id: number;
  date: string;
  missionTitle: string;
  type: 'VOICE' | 'PHOTO';
  contentSummary: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="space-y-4 mb-24">
      <h3 className="font-bold text-slate-900 text-lg px-2">최근 활동 내역</h3>

      {activities.length === 0 ? (
        <div className="text-center py-10 text-slate-400 bg-white rounded-3xl border border-slate-100">
          아직 이번 주 활동 내역이 없습니다.
        </div>
      ) : (
        activities.map((act) => (
          <div key={act.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex gap-4">
            {/* 좌측 아이콘 및 타임라인 선 */}
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${act.type === 'VOICE' ? 'bg-teal-500' : 'bg-amber-500'}`}>
                {act.type === 'VOICE' ? <Mic className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
              </div>
              <div className="w-0.5 h-full bg-slate-100 mt-2"></div>
            </div>

            {/* 우측 내용 */}
            <div className="flex-1 pb-2">
              <p className="text-xs text-slate-400 font-medium mb-1">{act.date}</p>
              <h4 className="font-bold text-slate-800 mb-2">{act.missionTitle}</h4>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <div className="flex items-start gap-3">
                  {act.type === 'VOICE' && (
                    <button className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 hover:bg-teal-200 transition-colors">
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                  )}
                  <p className="text-sm text-slate-600 leading-relaxed">
                    <span className="font-bold text-slate-700">AI 요약:</span> "{act.contentSummary}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
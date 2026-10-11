import React from 'react';
import { KBOTeam } from '../types';
import { Percent } from 'lucide-react';

interface BaseballShoppingProps {
  favoriteTeam: KBOTeam;
}

export default function BaseballShopping({ favoriteTeam }: BaseballShoppingProps) {
  return (
    <div id="baseball-shopping-panel" className="space-y-5 animate-fadeIn text-left">
      {/* Hero promo card */}
      <div className="bg-gradient-to-tr from-zinc-900 via-zinc-800 to-zinc-950 text-white p-5 rounded-3xl relative overflow-hidden shrink-0 border border-zinc-800 shadow-md">
        <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-2">
          <Percent className="w-4 h-4" style={{ color: favoriteTeam?.primaryColor || '#ef4444' }} />
          <span className="text-[10px] font-bold uppercase tracking-widest font-mono" style={{ color: favoriteTeam?.primaryColor || '#ef4444' }}>
            MEMBERSHIP SPECIAL ADVANTAGE
          </span>
        </div>
        <h3 className="text-lg font-bold leading-tight mt-2 font-display">
          팬 구단 유니폼 & 야구장<br />
          프리 수령 교환 드롭!
        </h3>
        <p className="text-[10px] text-zinc-400 mt-2">
          마이구단 <strong className="text-white font-bold">{favoriteTeam?.shortName}</strong> 맞춤 딜 적용 중. 직관 기록이 늘수록 추가 시크릿 마일리지가 적립됩니다.
        </p>
      </div>

      <div className="bg-zinc-50 border border-zinc-150 rounded-[24px] p-6 text-center text-zinc-400">
        <p className="text-xs font-semibold leading-normal">공식 굿즈 상점 및 푸드 티켓 발급 시스템 점검 중입니다.</p>
      </div>
    </div>
  );
}

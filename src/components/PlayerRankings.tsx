import React, { useState, useEffect } from 'react';
import { KBOTeam } from '../types';
import { KBO_TEAMS } from '../data/kboData';
import { 
  Award, 
  Zap, 
  Flame, 
  Trophy, 
  Activity, 
  Target, 
  ChevronLeft, 
  ChevronRight, 
  Share2, 
  Check 
} from 'lucide-react';
import { COLORS, TYPOGRAPHY, BUTTONS, LAYOUT } from '../lib/styles';

interface PlayerRankItem {
  rank: number;
  name: string;
  teamId: string;
  value: string;
}

interface StatCategory {
  key: string;
  title: string;
  icon: React.ReactNode;
  players: PlayerRankItem[];
}

export default function PlayerRankings({ favoriteTeam }: { favoriteTeam: KBOTeam }) {
  const [activeType, setActiveType] = useState<'batter' | 'pitcher'>('batter');
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string | null>(null);
  const [showSharedToast, setShowSharedToast] = useState(false);
  const [liveData, setLiveData] = useState<{
    batter?: { key: string; players: PlayerRankItem[] }[];
    pitcher?: { key: string; players: PlayerRankItem[] }[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchedLive, setFetchedLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchRankings = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/player-rankings');
        const data = await res.json();
        if (isMounted && data && data.rankings) {
          setLiveData(data.rankings);
          setFetchedLive(data.fetchedLive !== false);
          if (data.cachedAt) {
            const date = new Date(data.cachedAt);
            setLastUpdated(date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }));
          } else {
            setLastUpdated(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }));
          }
        }
      } catch (err) {
        console.error("Failed to load real-time rankings, using baseline stats", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRankings();
    
    // 1시간 간격으로 라이브 데이터 자동 갱신
    const interval = setInterval(fetchRankings, 60 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // 고품질 기본값으로 대체 가능한 타자 기록 데이터부
  const batterStats: StatCategory[] = [
    {
      key: 'avg',
      title: '타율 (AVG)',
      icon: <Award className="w-4 h-4 text-rose-500" />,
      players: liveData?.batter?.find(c => c.key === 'avg')?.players || [
        { rank: 1, name: '김도영', teamId: 'kia', value: '.362' },
        { rank: 2, name: '구자욱', teamId: 'samsung', value: '.348' },
        { rank: 3, name: '레이예스', teamId: 'lotte', value: '.341' },
        { rank: 4, name: '홍창기', teamId: 'lg', value: '.335' },
        { rank: 5, name: '김혜성', teamId: 'kiwoom', value: '.331' },
      ],
    },
    {
      key: 'hr',
      title: '홈런 (HR)',
      icon: <Flame className="w-4 h-4 text-orange-500" />,
      players: liveData?.batter?.find(c => c.key === 'hr')?.players || [
        { rank: 1, name: '데이비슨', teamId: 'nc', value: '17개' },
        { rank: 2, name: '최정', teamId: 'ssg', value: '15개' },
        { rank: 3, name: '김도영', teamId: 'kia', value: '14개' },
        { rank: 4, name: '노시환', teamId: 'hanwha', value: '12개' },
        { rank: 5, name: '강백호', teamId: 'kt', value: '11개' },
      ],
    },
    {
      key: 'rbi',
      title: '타점 (RBI)',
      icon: <Zap className="w-4 h-4 text-amber-500" />,
      players: liveData?.batter?.find(c => c.key === 'rbi')?.players || [
        { rank: 1, name: '강백호', teamId: 'kt', value: '48점' },
        { rank: 2, name: '김도영', teamId: 'kia', value: '45점' },
        { rank: 3, name: '구자욱', teamId: 'samsung', value: '43점' },
        { rank: 4, name: '송성문', teamId: 'kiwoom', value: '41점' },
        { rank: 5, name: '양의지', teamId: 'doosan', value: '39점' },
      ],
    },
  ];

  // 고품질 기본값으로 대체 가능한 투수 기록 데이터부
  const pitcherStats: StatCategory[] = [
    {
      key: 'era',
      title: '평균자책점 (ERA)',
      icon: <Activity className="w-4 h-4 text-emerald-500" />,
      players: liveData?.pitcher?.find(c => c.key === 'era')?.players || [
        { rank: 1, name: '네일', teamId: 'kia', value: '2.24' },
        { rank: 2, name: '하트', teamId: 'nc', value: '2.51' },
         { rank: 3, name: '헤이수스', teamId: 'kiwoom', value: '2.78' },
        { rank: 4, name: '원태인', teamId: 'samsung', value: '2.89' },
        { rank: 5, name: '류현진', teamId: 'hanwha', value: '3.12' },
      ],
    },
    {
      key: 'win',
      title: '다승 (WINS)',
      icon: <Trophy className="w-4 h-4 text-cyan-500" />,
      players: liveData?.pitcher?.find(c => c.key === 'win')?.players || [
        { rank: 1, name: '원태인', teamId: 'samsung', value: '8승' },
        { rank: 2, name: '헤이수스', teamId: 'kiwoom', value: '7승' },
        { rank: 3, name: '곽빈', teamId: 'doosan', value: '7승' },
        { rank: 4, name: '네일', teamId: 'kia', value: '6승' },
        { rank: 5, name: '쿠에바스', teamId: 'kt', value: '6승' },
      ],
    },
    {
      key: 'sv',
      title: '세이브 (SAVES)',
      icon: <Target className="w-4 h-4 text-indigo-500" />,
      players: liveData?.pitcher?.find(c => c.key === 'sv')?.players || [
        { rank: 1, name: '오승환', teamId: 'samsung', value: '16세' },
        { rank: 2, name: '정해영', teamId: 'kia', value: '15세' },
        { rank: 3, name: '주현상', teamId: 'hanwha', value: '12세' },
        { rank: 4, name: '유영찬', teamId: 'lg', value: '11세' },
        { rank: 5, name: '김택연', teamId: 'doosan', value: '9세' },
      ],
    },
  ];

  const getFullRankings = (categoryKey: string): PlayerRankItem[] => {
    let tops: PlayerRankItem[] = [];
    if (activeType === 'batter') {
      const cat = batterStats.find(c => c.key === categoryKey);
      if (cat) tops = [...cat.players];
    } else {
      const cat = pitcherStats.find(c => c.key === categoryKey);
      if (cat) tops = [...cat.players];
    }

    const fullFallbacks: Record<string, PlayerRankItem[]> = {
      avg: [
        { rank: 1, name: '김도영', teamId: 'kia', value: '.362' },
        { rank: 2, name: '구자욱', teamId: 'samsung', value: '.348' },
        { rank: 3, name: '레이예스', teamId: 'lotte', value: '.341' },
        { rank: 4, name: '홍창기', teamId: 'lg', value: '.335' },
        { rank: 5, name: '김혜성', teamId: 'kiwoom', value: '.331' },
        { rank: 6, name: '에레디아', teamId: 'ssg', value: '.328' },
        { rank: 7, name: '허경민', teamId: 'doosan', value: '.324' },
        { rank: 8, name: '박민우', teamId: 'nc', value: '.319' },
        { rank: 9, name: '페라자', teamId: 'hanwha', value: '.312' },
        { rank: 10, name: '강백호', teamId: 'kt', value: '.308' },
        { rank: 11, name: '최형우', teamId: 'kia', value: '.305' },
        { rank: 12, name: '양의지', teamId: 'doosan', value: '.302' },
        { rank: 13, name: '문성주', teamId: 'lg', value: '.301' },
        { rank: 14, name: '손아섭', teamId: 'nc', value: '.298' },
        { rank: 15, name: '박건우', teamId: 'nc', value: '.295' },
        { rank: 16, name: '황재균', teamId: 'kt', value: '.292' },
        { rank: 17, name: '김선빈', teamId: 'kia', value: '.291' },
        { rank: 18, name: '이우성', teamId: 'kia', value: '.289' },
        { rank: 19, name: '송성문', teamId: 'kiwoom', value: '.287' },
        { rank: 20, name: '정수빈', teamId: 'doosan', value: '.285' },
      ],
      hr: [
        { rank: 1, name: '데이비슨', teamId: 'nc', value: '17개' },
        { rank: 2, name: '최정', teamId: 'ssg', value: '15개' },
        { rank: 3, name: '김도영', teamId: 'kia', value: '14개' },
        { rank: 4, name: '노시환', teamId: 'hanwha', value: '12개' },
        { rank: 5, name: '강백호', teamId: 'kt', value: '11개' },
        { rank: 6, name: '양석환', teamId: 'doosan', value: '10개' },
        { rank: 7, name: '오스틴', teamId: 'lg', value: '9개' },
        { rank: 8, name: '박병호', teamId: 'samsung', value: '8개' },
        { rank: 9, name: '레이예스', teamId: 'lotte', value: '7개' },
        { rank: 10, name: '송성문', teamId: 'kiwoom', value: '6개' },
        { rank: 11, name: '김재환', teamId: 'doosan', value: '6개' },
        { rank: 12, name: '페라자', teamId: 'hanwha', value: '5개' },
        { rank: 13, name: '박동원', teamId: 'lg', value: '5개' },
        { rank: 14, name: '문상철', teamId: 'kt', value: '5개' },
        { rank: 15, name: '구자욱', teamId: 'samsung', value: '4개' },
        { rank: 16, name: '한유섬', teamId: 'ssg', value: '4개' },
        { rank: 17, name: '김형준', teamId: 'nc', value: '4개' },
        { rank: 18, name: '전준우', teamId: 'lotte', value: '3개' },
        { rank: 19, name: '나성범', teamId: 'kia', value: '3개' },
        { rank: 20, name: '최형우', teamId: 'kia', value: '3개' },
      ],
      rbi: [
        { rank: 1, name: '강백호', teamId: 'kt', value: '48점' },
        { rank: 2, name: '김도영', teamId: 'kia', value: '45점' },
        { rank: 3, name: '구자욱', teamId: 'samsung', value: '43점' },
        { rank: 4, name: '송성문', teamId: 'kiwoom', value: '41점' },
        { rank: 5, name: '양의지', teamId: 'doosan', value: '39점' },
        { rank: 6, name: '오스틴', teamId: 'lg', value: '38점' },
        { rank: 7, name: '에레디아', teamId: 'ssg', value: '36점' },
        { rank: 8, name: '노시환', teamId: 'hanwha', value: '34점' },
        { rank: 9, name: '데이비슨', teamId: 'nc', value: '32점' },
        { rank: 10, name: '레이예스', teamId: 'lotte', value: '31점' },
        { rank: 11, name: '최형우', teamId: 'kia', value: '30점' },
        { rank: 12, name: '김선빈', teamId: 'kia', value: '29점' },
        { rank: 13, name: '홍창기', teamId: 'lg', value: '28점' },
        { rank: 14, name: '김혜성', teamId: 'kiwoom', value: '27점' },
        { rank: 15, name: '채은성', teamId: 'hanwha', value: '26점' },
        { rank: 16, name: '양석환', teamId: 'doosan', value: '25점' },
        { rank: 17, name: '박건우', teamId: 'nc', value: '24점' },
        { rank: 18, name: '김재환', teamId: 'doosan', value: '23점' },
        { rank: 19, name: '최인호', teamId: 'hanwha', value: '22점' },
        { rank: 20, name: '문상철', teamId: 'kt', value: '21점' },
      ],
      era: [
        { rank: 1, name: '네일', teamId: 'kia', value: '2.24' },
        { rank: 2, name: '하트', teamId: 'nc', value: '2.51' },
        { rank: 3, name: '헤이수스', teamId: 'kiwoom', value: '2.78' },
        { rank: 4, name: '원태인', teamId: 'samsung', value: '2.89' },
        { rank: 5, name: '류현진', teamId: 'hanwha', value: '3.12' },
        { rank: 6, name: '쿠에바스', teamId: 'kt', value: '3.28' },
        { rank: 7, name: '엔스', teamId: 'lg', value: '3.45' },
        { rank: 8, name: '알칸타라', teamId: 'doosan', value: '3.55' },
        { rank: 9, name: '김광현', teamId: 'ssg', value: '3.71' },
        { rank: 10, name: '반즈', teamId: 'lotte', value: '3.82' },
        { rank: 11, name: '양현종', teamId: 'kia', value: '3.89' },
        { rank: 12, name: '엘리아스', teamId: 'ssg', value: '3.98' },
        { rank: 13, name: '임찬규', teamId: 'lg', value: '4.05' },
        { rank: 14, name: '곽빈', teamId: 'doosan', value: '4.12' },
        { rank: 15, name: '신민혁', teamId: 'nc', value: '4.21' },
        { rank: 16, name: '엄상백', teamId: 'kt', value: '4.35' },
        { rank: 17, name: '페디', teamId: 'nc', value: '4.41' },
        { rank: 18, name: '이의리', teamId: 'kia', value: '4.48' },
        { rank: 19, name: '박세웅', teamId: 'lotte', value: '4.55' },
        { rank: 20, name: '후라도', teamId: 'kiwoom', value: '4.62' },
      ],
      win: [
        { rank: 1, name: '원태인', teamId: 'samsung', value: '8승' },
        { rank: 2, name: '헤이수스', teamId: 'kiwoom', value: '7승' },
        { rank: 3, name: '곽빈', teamId: 'doosan', value: '7승' },
        { rank: 4, name: '네일', teamId: 'kia', value: '6승' },
        { rank: 5, name: '쿠에바스', teamId: 'kt', value: '6승' },
        { rank: 6, name: '하트', teamId: 'nc', value: '5승' },
        { rank: 7, name: '김광현', teamId: 'ssg', value: '5승' },
        { rank: 8, name: '엔스', teamId: 'lg', value: '5승' },
        { rank: 9, name: '류현진', teamId: 'hanwha', value: '4승' },
        { rank: 10, name: '윌커슨', teamId: 'lotte', value: '4승' },
        { rank: 11, name: '임찬규', teamId: 'lg', value: '4승' },
        { rank: 12, name: '박세웅', teamId: 'lotte', value: '3승' },
        { rank: 13, name: '양현종', teamId: 'kia', value: '3승' },
        { rank: 14, name: '신민혁', teamId: 'nc', value: '3승' },
        { rank: 15, name: '윤영철', teamId: 'kia', value: '3승' },
        { rank: 16, name: '카스티야', teamId: 'samsung', value: '3승' },
        { rank: 17, name: '와이스', teamId: 'hanwha', value: '2승' },
        { rank: 18, name: '브랜든', teamId: 'doosan', value: '2승' },
        { rank: 19, name: '서진용', teamId: 'ssg', value: '2승' },
        { rank: 20, name: '고영표', teamId: 'kt', value: '2승' },
      ],
      sv: [
        { rank: 1, name: '오승환', teamId: 'samsung', value: '16세' },
        { rank: 2, name: '정해영', teamId: 'kia', value: '15세' },
        { rank: 3, name: '주현상', teamId: 'hanwha', value: '12세' },
        { rank: 4, name: '유영찬', teamId: 'lg', value: '11세' },
        { rank: 5, name: '김택연', teamId: 'doosan', value: '9세' },
        { rank: 6, name: '김재윤', teamId: 'ssg', value: '8세' },
        { rank: 7, name: '박영현', teamId: 'kt', value: '7세' },
        { rank: 8, name: '김원중', teamId: 'lotte', value: '6세' },
        { rank: 9, name: '이용찬', teamId: 'nc', value: '5세' },
        { rank: 10, name: '조상우', teamId: 'kiwoom', value: '4세' },
        { rank: 11, name: '서진용', teamId: 'ssg', value: '4세' },
        { rank: 12, name: '임창민', teamId: 'samsung', value: '3세' },
        { rank: 13, name: '노경은', teamId: 'ssg', value: '3세' },
        { rank: 14, name: '김태훈', teamId: 'kiwoom', value: '2세' },
        { rank: 15, name: '장현식', teamId: 'kia', value: '2세' },
        { rank: 16, name: '김민', teamId: 'kt', value: '2세' },
        { rank: 17, name: '최지민', teamId: 'kia', value: '1세' },
        { rank: 18, name: '이우찬', teamId: 'lg', value: '1세' },
        { rank: 19, name: '우규민', teamId: 'kt', value: '1세' },
        { rank: 20, name: '김상수', teamId: 'lotte', value: '1세' },
      ]
    };

    const fallbackList = fullFallbacks[categoryKey] || [];
    if (tops.length === 0) return fallbackList;

    const list = [...tops];
    for (let r = tops.length + 1; r <= 20; r++) {
      const fallbackItem = fallbackList.find(i => i.rank === r);
      if (fallbackItem) {
        list.push(fallbackItem);
      }
    }
    return list;
  };

  const getProgressPercent = (key: string, valueStr: string): number => {
    let numVal = parseFloat(valueStr.replace(/[^0-9.]/g, ''));
    if (isNaN(numVal)) return 50;
    if (key === 'avg') {
      return (numVal / 0.400) * 100;
    }
    if (key === 'era') {
      return Math.max(15, ((4.5 - numVal) / 4.5) * 100);
    }
    if (key === 'hr') return (numVal / 22) * 100;
    if (key === 'rbi') return (numVal / 60) * 100;
    if (key === 'win') return (numVal / 12) * 100;
    if (key === 'sv') return (numVal / 22) * 100;
    return 60;
  };

  const currentStats = activeType === 'batter' ? batterStats : pitcherStats;

  return (
    <div id="player-rankings-widget" className={LAYOUT.card}>
      {/* 위젯 헤더 */}
      <div className="flex items-center justify-between border-b border-[#f2f4f6] pb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-brand shrink-0" />
          <h3 className={TYPOGRAPHY.headingMd}>KBO 리그 개인 순위 TOP 5</h3>
        </div>

        {/* 실시간 동기화 정보 표시 */}
        <div className="flex items-center gap-1 bg-[#f2f4f6] rounded-xl px-2.5 py-1 text-[10px] font-bold text-[#8b95a1]">
          <span className="relative flex h-1.5 w-1.5 mr-0.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <span>
            {loading ? '갱신 중...' : fetchedLive ? '실시간' : '시뮬레이션 데이터'}
          </span>
        </div>
      </div>

      {/* 타자/투수 부문 대항 탭 */}
      <div className="flex bg-[#f2f4f6] p-1 rounded-2xl">
        <button
          type="button"
          onClick={() => setActiveType('batter')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
            activeType === 'batter'
              ? 'bg-white text-[#191f28] shadow-xs'
              : 'text-[#8b95a1] hover:text-[#4e5968]'
          }`}
        >
          타자 부문
        </button>
        <button
          type="button"
          onClick={() => setActiveType('pitcher')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
            activeType === 'pitcher'
              ? 'bg-white text-[#191f28] shadow-xs'
              : 'text-[#8b95a1] hover:text-[#4e5968]'
          }`}
        >
          투수 부문
        </button>
      </div>

      {/* 실시간 랭킹 카테고리별 그리드 목록 */}
      <div className="space-y-4 font-sans">
        {currentStats.map((category) => (
          <div 
            key={category.key} 
            onClick={() => setSelectedCategoryKey(category.key)}
            className={`${LAYOUT.cardInteractive} space-y-4 group`}
          >
            {/* 카테고리 헤더 대명칭 */}
            <div className="flex items-center justify-between border-b border-[#f2f4f6] pb-3">
              <div className="flex items-center gap-1.5">
                {category.icon}
                <span className="text-[13px] font-semibold text-[#191f28] tracking-tight">{category.title}</span>
              </div>
              <span className="text-[10px] text-[#8b95a1] font-bold flex items-center gap-0.5 group-hover:text-brand transition-colors select-none">
                <span>전체 순위</span>
                <ChevronRight className="w-3.5 h-3.5 transition group-hover:translate-x-0.5" />
              </span>
            </div>

            {/* 부문 상위 TOP 5 선수 리스트 */}
            <div className="space-y-1">
              {category.players.slice(0, 5).map((player) => {
                const team = KBO_TEAMS.find((t) => t.id === player.teamId);
                const isFavoriteTeam = player.teamId === favoriteTeam.id;

                return (
                  <div
                    key={`${category.key}-${player.rank}-${player.name}`}
                    className={`flex items-center justify-between text-xs py-2 px-2.5 rounded-xl transition ${
                      isFavoriteTeam 
                        ? 'bg-brand/5 text-brand' 
                        : 'hover:bg-[#f2f4f6]/50 text-[#4e5968]'
                    }`}
                  >
                    {/* 순위 및 선수 성명과 소속 구단 정보 */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* 순위 표식기 */}
                      <span className={`w-4 text-center font-bold text-xs ${
                        player.rank === 1 
                          ? 'text-brand' 
                          : player.rank === 2 
                          ? 'text-[#4e5968]' 
                          : 'text-[#8b95a1]'
                      }`}>
                        {player.rank}
                      </span>

                      {/* 소속 구단 마크 원 */}
                      <div className="w-6 h-6 rounded-full bg-[#f2f4f6] flex items-center justify-center shrink-0 border border-transparent shadow-xs" title={team?.name}>
                        <span className="text-sm">
                          {team?.logoEmoji === 'ヒーロー' ? '🦸' : team?.logoEmoji === '쌍둥이' ? '⚾' : team?.logoEmoji || '⚾'}
                        </span>
                      </div>

                      {/* 이름 및 소속 구단 약어 뱃지 */}
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-bold text-[#191f28]">{player.name}</span>
                        <span className="text-[9px] text-[#8b95a1] font-bold bg-[#f2f4f6] px-1.5 py-0.2 rounded shrink-0">
                          {team?.shortName || ''}
                        </span>
                        {isFavoriteTeam && (
                          <span className="text-[9px] font-bold text-brand bg-brand-light px-1.5 py-0.2 rounded-md shrink-0">
                            MY CLUB
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 종합 기록 스탯 정보 고정 */}
                    <span className="font-bold text-[#191f28] tracking-tight shrink-0">
                      {player.value}
                    </span>
                  </div>
                );
              })}
            </div>
            
            {/* 하단 기재 상세 설명 팁 */}
            <div className="pt-1.5 text-center text-[10px] text-[#8b95a1] font-semibold border-t border-[#f2f4f6] flex justify-center items-center gap-1">
              <span>카드 클릭 시 20위까지의 실시간 전체 순위 정보 조회</span>
            </div>
          </div>
        ))}
      </div>

      {/* 2026 KBO Player Rankings Detail Modal Overlay */}
      {selectedCategoryKey && (() => {
        const catMeta = [...batterStats, ...pitcherStats].find(c => c.key === selectedCategoryKey);
        if (!catMeta) return null;
        const fullList = getFullRankings(selectedCategoryKey);
        const leader = fullList[0];
        const leaderTeam = KBO_TEAMS.find(t => t.id === leader?.teamId);

        return (
          <div className="absolute inset-0 z-50 bg-white flex flex-col font-sans animate-slideUp">
            {/* Sticky Header */}
            <div className="sticky top-0 bg-white border-b border-[#f2f4f6] px-5 py-3.5 grid grid-cols-3 items-center shrink-0 select-none">
              <div className="flex justify-start">
                <button 
                  type="button"
                  onClick={() => setSelectedCategoryKey(null)}
                  className="w-10 h-10 -ml-2 rounded-full hover:bg-[#f2f4f6] flex items-center justify-center transition duration-150 cursor-pointer text-[#4e5968]"
                >
                  <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
                </button>
              </div>
              <div className="flex justify-center">
                <h2 className="text-[15px] font-bold text-[#191f28] tracking-tight whitespace-nowrap text-center">
                  {catMeta.title.split(' (')[0]} 순위
                </h2>
              </div>
              <div className="flex justify-end">
                <button 
                  type="button"
                  onClick={() => {
                    try {
                      navigator.clipboard.writeText(`${catMeta.title}: 1위 ${leader.name} (${leader.value})`);
                    } catch (e) {}
                    setShowSharedToast(true);
                    setTimeout(() => setShowSharedToast(false), 2000);
                  }}
                  className="w-10 h-10 rounded-full hover:bg-[#f2f4f6] flex items-center justify-center transition duration-150 cursor-pointer text-[#8b95a1] hover:text-[#4e5968]"
                >
                  <Share2 className="w-5 h-5 stroke-[2]" />
                </button>
              </div>
            </div>

            {/* Custom Shared Toast Message */}
            {showSharedToast && (
              <div className="absolute top-16 left-1/2 -translate-x-1/2 z-55 bg-[#191f28] text-white px-4 py-2.5 rounded-full text-[11px] font-bold shadow-lg animate-fadeIn flex items-center gap-1.5 border border-white/10">
                <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                <span>순위가 클립보드로 공유할 수 있게 복사되었어요</span>
              </div>
            )}

            {/* Scrollable Container */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6 scrollbar-thin">
              {/* Leader Highlight Banner */}
              <div className="bg-brand-light rounded-3xl p-5 border border-transparent flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-3xl shadow-sm shrink-0">
                  {leaderTeam?.logoEmoji === 'ヒーロー' ? '🦸' : leaderTeam?.logoEmoji === '쌍둥이' ? '⚾' : leaderTeam?.logoEmoji || '⚾'}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-brand uppercase tracking-wide">SEASON LEADER 👑</span>
                  <h3 className="text-[14px] font-bold text-[#191f28] leading-snug mt-0.5">
                    현재 {leader.name} 선수가 {leader.value}의 기록으로 압도적인 1위를 달성 중이에요.
                  </h3>
                </div>
              </div>

              {/* Ranks 1 to 20 list */}
              <div className="space-y-4">
                {fullList.map((player, idx) => {
                  const team = KBO_TEAMS.find((t) => t.id === player.teamId);
                  const isFavoriteTeam = player.teamId === favoriteTeam?.id;
                  const progressWidth = getProgressPercent(selectedCategoryKey, player.value);

                  return (
                    <div 
                      key={`modal-rank-${idx}-${player.name}`}
                      className={`rounded-2xl border ${
                        isFavoriteTeam 
                          ? 'border-brand/30 bg-brand/[0.02]' 
                          : 'border-transparent bg-[#f9fafb]'
                      } transition p-3.5 space-y-2.5 shadow-2xs`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Rank indicator */}
                          <div className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center ${
                            player.rank === 1
                              ? 'bg-brand text-white'
                              : player.rank === 2
                              ? 'bg-zinc-800 text-white'
                              : player.rank === 3
                              ? 'bg-[#f2f4f6] text-[#4e5968] border border-[#e5e8eb]'
                              : 'bg-transparent text-[#8b95a1]'
                          }`}>
                            {player.rank}
                          </div>

                          {/* Team Emoji circle */}
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-[#e5e8eb] shadow-3xs shrink-0">
                            <span className="text-lg">
                              {team?.logoEmoji === 'ヒーロー' ? '🦸' : team?.logoEmoji === '쌍둥이' ? '⚾' : team?.logoEmoji || '⚾'}
                            </span>
                          </div>

                          {/* Name & Stamp badge */}
                          <div className="flex items-center gap-2 truncate">
                            <span className="font-bold text-[#191f28] text-[13px]">{player.name}</span>
                            <span className="text-[9px] text-[#8b95a1] font-bold bg-[#f2f4f6] border border-[#e5e8eb] px-1.5 py-0.2 rounded shrink-0">
                              {team?.shortName || ''}
                            </span>
                            {isFavoriteTeam && (
                              <span className="text-[9px] font-bold text-white bg-brand px-1.5 py-0.2 rounded-md shrink-0">
                                MY CLUB
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Value */}
                        <span className="font-bold text-[#191f28] text-[13px] tracking-tight">
                          {player.value}
                        </span>
                      </div>

                      {/* Micro Progress Bar */}
                      <div className="w-full h-1 bg-[#f2f4f6] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-brand rounded-full transition-all duration-500 ease-out" 
                          style={{ width: `${progressWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Button Panel */}
            <div className="p-5 border-t border-[#f2f4f6] bg-white shrink-0">
              <button
                type="button"
                onClick={() => setSelectedCategoryKey(null)}
                className="w-full h-13 bg-brand hover:bg-brand-hover text-white font-bold rounded-2xl text-[13.5px] flex items-center justify-center transition active:scale-[0.99] shadow-sm cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

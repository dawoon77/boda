import React, { useState, useEffect, useRef } from 'react';
import { KBOTeam } from '../types';
import { Play, Pause, SkipForward, Volume2, Music, Sparkles, VolumeX, ListMusic, Heart, BookOpen, Quote } from 'lucide-react';

interface CheerSongsTabProps {
  favoriteTeam: KBOTeam;
}

interface Song {
  id: string;
  title: string;
  type: 'signature' | 'player' | 'general';
  desc: string;
  lyrics: string;
}

// 10개 구단 정통 리얼 응원가 DB 데이터셋 정의
const TEAM_CHANCE_SONGS: Record<string, Song[]> = {
  kia: [
    {
      id: 'kia-1',
      title: '남행열차 (시그니처 응원가)',
      type: 'signature',
      desc: '경기 후반부 8회말 타이거즈의 승리를 다지며 챔피언스 필드 전 관중이 떼창하는 고유 넘버.',
      lyrics: '비 내리는 호남선 남행열차에~\n흔들리는 차창 너머로~\n빗물이 흐르고 내 눈물도 흐르고~\n잃어버린 첫사랑도 흐르네~\n\n깜빡깜빡이는 희미한 기억 속에~\n그때 만난 그 사람은 어디로 갔을까~\n(KIA!) 타이거즈 승리하리라!\n오 최강 KIA 타이거즈!'
    },
    {
      id: 'kia-2',
      title: '김도영 응원가 (KIA의 김도영!)',
      type: 'player',
      desc: '신성 군단의 핵심 30-30 천재 타자 김도영의 시원시원한 연호 테마송.',
      lyrics: 'KIA의 김도영 오오오오~\nKIA의 김도영 오오오오~\n삼진도 두렵지 않아! 안타 날려라 김도영!\n(날려라!) KIA의 김도영~!'
    },
    {
      id: 'kia-3',
      title: '호랑이 기운송 (승리의 타이거즈)',
      type: 'general',
      desc: '호랑이 기운찬 기개로 상대 수비를 압도하는 힘찬 연호곡.',
      lyrics: '최~강 기아 타이거즈! 승리를 노래하자!\n뜨거운 열정으로 하나되어 외쳐라!\n워어어어 타이거즈 지치지 않는 영혼!\n오늘 우리는 반드시 승리하리라!'
    }
  ],
  samsung: [
    {
      id: 'sam-1',
      title: '엘도라도 (El Dorado)',
      type: 'signature',
      desc: '삼성 라이온즈 역사의 자부심이자 전율 돋는 푸른 피의 대합창 연호 상징송.',
      lyrics: '오오오오 최강 삼성! 오오오오 최강 삼성!\n오오오오 최강 삼성 라이온즈!\n자 승리를 향해 다 같이 외쳐라!\n우리는 영원한 최강 삼성 라이온즈!'
    },
    {
      id: 'sam-2',
      title: '구자욱 응원가 (치고 달려라 구자욱)',
      type: 'player',
      desc: '라이온즈의 주장이자 프렌차이즈 스타 구자욱의 대표 타석 응원곡.',
      lyrics: '구자욱~! 치고 달려라 구자욱! (안타 구자욱!)\n구자욱~! 시원하게 날려라 구자욱! (홈런 구자욱!)\n삼성의 승리 위해~ 구자욱 외치자 오오오~!'
    },
    {
      id: 'sam-3',
      title: '승리를 향해 외쳐라',
      type: 'general',
      desc: '투수진과 주자들이 힘을 모을 때 부르는 열띤 응원 멜로디.',
      lyrics: '최강 삼성 라이온즈! 승리를 위해 달려라!\n파란 물결 춤추는 대구 라이온즈 파크!\n끝까지 포기 않고 전진하는 사자들!\n오늘 밤 승리의 승전보가 울린다!'
    }
  ],
  lg: [
    {
      id: 'lg-1',
      title: '서울의 아리아',
      type: 'signature',
      desc: '잠실 야구장을 뒤흔드는 무적 LG 트윈스 팬들의 영혼의 승리 합창송.',
      lyrics: '승리의 이름! 무~적 LG!\n서울의 밤하늘 높이 날아 올라라!\n아름다운 우리의 노래가 잠실에 퍼질 때~\n무적 LG 트윈스 승리하리라!'
    },
    {
      id: 'lg-2',
      title: '박해민 응원가 (수비의 신 박해민)',
      type: 'player',
      desc: '종횡무진 그라운드를 가르는 중견수 박해민 등판 리듬.',
      lyrics: 'LG의 박해민~ 끝까지 달려라!\nLG의 박해민~ 승리를 날려라!\n안타 박해민! 도루 박해민! 무적 LG 박해민!'
    },
    {
      id: 'lg-3',
      title: '무적 LG 찬가',
      type: 'general',
      desc: '경기 시작 전 전의를 불태우는 전통 깊은 응원 멜로디.',
      lyrics: '사랑한다 트윈스! 무적 LG 트윈스!\n승리를 향한 불꽃 타오른다 오오오!\n서울의 자존심 트윈스여 달려라!\n워어어어 무적 LG!'
    }
  ],
  doosan: [
    {
      id: 'doo-1',
      title: '해야 해야 (두산 베어스의 태양)',
      type: 'signature',
      desc: '하늘 높이 솟구치는 곰들의 포효를 갈구하는 전율의 시그니처 떼창송.',
      lyrics: '날아라 머나먼 하늘 위로! 두산 베어스 승리를 위해!\n우리의 노래가 퍼지는 곳에 태양이 떠오른다!\n해야 해야~ 어두운 밤을 비추어라!\n오늘 우리는 반드시 승리한다 베어스!'
    },
    {
      id: 'doo-2',
      title: '정수빈 응원가 (날려라 정수빈)',
      type: 'player',
      desc: '두산의 심장이자 허슬두의 상징 정수빈 선수의 신나는 오리지널 테마.',
      lyrics: '날려라 날려라 날려라 두산의 정수빈!\n안타 정수빈! 홈런 정수빈! 승리를 위해 정수빈!\n라랄라라~ 곰들의 날쌘 발 정수빈!'
    }
  ],
  lotte: [
    {
      id: 'lot-1',
      title: '부산갈매기 (원조 야구 메카 넘버)',
      type: 'signature',
      desc: '부산 야구의 혼이자 사직 노래방을 지향하는 불멸의 자이언츠 킬러 튠.',
      lyrics: '부산갈매기~ 부산갈매기~\n너는 정녕 나를 잊었나~\n아아아아~ 오늘 떠나간 그 사람을~\n못 잊어 사직에서 외치네!'
    },
    {
      id: 'lot-2',
      title: '황성빈 응원가 (마황 테마송)',
      type: 'player',
      desc: '전력 질주로 상대 수비를 흔드는 자이언츠 마스코트 타자 황성빈 연호송.',
      lyrics: '롯데의 마황 황성빈! 달려라 황성빈!\n안타! 도루! 흔들어라 황성빈!\n오늘도 그라운드 지배자 자이언츠 황성빈!'
    }
  ],
  hanwha: [
    {
      id: 'han-1',
      title: '나는 행복합니다 (이글스 찬가)',
      type: 'signature',
      desc: '세상에서 가장 열정적이고 유쾌한 한화 이글스 해피 팬덤의 유쾌한 힐링송.',
      lyrics: '나는 행복합니다~ 나는 행복합니다~\n나는 행복합니다~ 이글스라 행복합니다!\n살아가며 한 번도 후회한 적 없어라~\n오늘도 오렌지 물결 속에서 행복합니다!'
    },
    {
      id: 'han-2',
      title: '노시환 응원가 (한화의 해결사)',
      type: 'player',
      desc: '이글스의 차세대 대형 홈런왕 노시환 타석 등장 임팩트 넘버.',
      lyrics: '한화의 해결사 노시환! (홈런 노시환!)\n시원하게 날려라 노시환! (워어어어 노시환!)\n최강 한화 노시환! 대전 이글스파크 노시환!'
    }
  ],
  kt: [
    {
      id: 'kt-1',
      title: '수원의 마법사들',
      type: 'signature',
      desc: '위즈 파크를 메우는 마법 같은 역전 드라마를 그리는 테마곡.',
      lyrics: '마법 같은 기적 kt wiz!\n승리를 향해 불꽃을 뿜어라 마술사들!\n수원의 자존심을 걸고 거침없이 돌진하라!'
    }
  ],
  ssg: [
    {
      id: 'ssg-1',
      title: '인천의 불꽃 (랜더스의 기적)',
      type: 'signature',
      desc: '인천 문학 구장에서 뜨겁고 찬란하게 쏘아 올리는 랜더스의 투혼 찬가.',
      lyrics: '인천의 불꽃이여 타올라라!\n랜더스의 심장을 부여잡고 외치자!\n우리는 정복자, 우리는 랜더스 오늘 밤 최후의 승자!'
    }
  ],
  nc: [
    {
      id: 'nc-1',
      title: '다이노스 단디송',
      type: 'signature',
      desc: '공룡 군단의 굳센 사투리 "단디 해라!" 정신을 모티브로 삼은 파워풀 찬가.',
      lyrics: '단디 해라 단디! 다이노스여 거침없이 가자!\n단디 해라 단디! 창원 마산의 푸른 긍지!\n단디 안타 날리고 단디 공룡을 깨워라!'
    }
  ],
  kiwoom: [
    {
      id: 'kiw-1',
      title: '영웅의 위상 (히어로즈 찬가)',
      type: 'signature',
      desc: '고척 돔구장을 전율이 도는 무대로 만드는 히어로즈 전사들의 강력 메탈송.',
      lyrics: '날려 버려라 영웅들이여!\n키움 히어로즈 승리 위해 뜨거운 탄환이 되자!\n워어어어 고척을 지배하는 기막힌 활공!'
    }
  ]
};

export default function CheerSongsTab({ favoriteTeam }: CheerSongsTabProps) {
  const songs = TEAM_CHANCE_SONGS[favoriteTeam.id] || TEAM_CHANCE_SONGS['kia'];
  
  const [currentSong, setCurrentSong] = useState<Song>(songs[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [duration] = useState(120); // 2분 가상 시간 가칭
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [lyricsExpanded, setLyricsExpanded] = useState(false);
  const [favoriteSongs, setFavoriteSongs] = useState<string[]>([]);
  
  // 가상 이퀄라이저 막대 값 생성용 타이머 레퍼런스
  const [eqHeights, setEqHeights] = useState<number[]>([15, 30, 20, 45, 10, 25, 40, 15, 35, 20]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // 로컬 보관함 좋아요 목록 가져오기
  useEffect(() => {
    const savedFavs = localStorage.getItem('kbo_fav_songs');
    if (savedFavs) {
      try {
        setFavoriteSongs(JSON.parse(savedFavs));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // 재생 상태 변경에 따른 사운드 에이전트 브릿지 (Web Audio Synth)
  useEffect(() => {
    if (isPlaying) {
      // 1. 가상 타임 진행
      timerRef.current = setInterval(() => {
        setCurrentTimeSec(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });

        // 2. 가상 이퀄라이저 바 실시간 춤추기
        setEqHeights(Array.from({ length: 12 }, () => Math.floor(Math.random() * 35) + 5));

        // 3. 소프트한 효과음 비프 (재생 피드백용 - 아주 작은 야구 응원풍 크리스탈 멜로디 시뮬레이션)
        playSoftSynthBeep();
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      stopSynth();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopSynth();
    };
  }, [isPlaying, currentSong]);

  // 가작용 비프 톤 재생기
  const playSoftSynthBeep = () => {
    if (isMuted) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // 오르간/야구장 응원 오르간 소리와 유사한 소프트 사인파
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // 멜로디 주파수를 가리키며 매끄럽게 흐르도록 시간대에 따라 다르게 배정
      const notes = [329.63, 392.00, 440.00, 523.25, 587.33]; // E, G, A, C, D
      const activeNote = notes[currentTimeSec % notes.length];
      osc.frequency.setValueAtTime(activeNote, ctx.currentTime);

      // 음량을 아주 최소한으로 설정하여 거슬리지 않도록 조절 (볼륨 슬라이더 값 배정)
      const targetVolume = isMuted ? 0 : (volume / 100) * 0.015; // 최대 1.5% 수준
      gain.gain.setValueAtTime(targetVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      // 오디오 콘텐트 제약 대응
    }
  };

  const stopSynth = () => {
    try {
      if (oscillatorRef.current) {
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
    } catch (err) {}
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNextSong = () => {
    const currentIndex = songs.findIndex(s => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    setCurrentSong(songs[nextIndex]);
    setCurrentTimeSec(0);
    setIsPlaying(true);
  };

  const handleSelectSong = (song: Song) => {
    setCurrentSong(song);
    setCurrentTimeSec(0);
    setIsPlaying(true);
  };

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated: string[];
    if (favoriteSongs.includes(id)) {
      updated = favoriteSongs.filter(item => item !== id);
    } else {
      updated = [...favoriteSongs, id];
    }
    setFavoriteSongs(updated);
    localStorage.setItem('kbo_fav_songs', JSON.stringify(updated));
  };

  // 시간 포맷 (mm:ss)
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div id="cheersongs-tab-container" className="space-y-4 animate-fadeIn select-none text-left">
      
      {/* 1. 현재 재생 중인 응원가 - 플랫 미디어 플레이어 데크 */}
      <div 
        id="cheersongs-nowplaying-card" 
        className="rounded-[28px] p-5.5 text-white relative overflow-hidden transition-all duration-300 shadow-md"
        style={{
          background: `linear-gradient(145deg, ${favoriteTeam.primaryColor || '#a181ff'} 20%, ${favoriteTeam.secondaryColor || '#111111'} 105%)`
        }}
      >
        {/* 상단 반짝 데코 레이어 */}
        <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
          <span>{favoriteTeam.shortName} STADIUM LIVE</span>
        </div>

        {/* 곡명 및 성격 정보 */}
        <div className="mt-4 space-y-1 select-none">
          <span className="text-[10px] font-bold text-white/70 block uppercase tracking-wider">
            {currentSong.type === 'signature' ? '구단 대표 시그니처 떼창' : currentSong.type === 'player' ? '타석 등장 선수 연호곡' : '공통 팀 연호'}
          </span>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <span>{currentSong.title}</span>
            <button 
              onClick={(e) => handleToggleFavorite(currentSong.id, e)}
              className="focus:outline-none hover:scale-110 active:scale-95 transition cursor-pointer"
            >
              <Heart className={`w-4.5 h-4.5 ${favoriteSongs.includes(currentSong.id) ? 'fill-rose-500 text-rose-500' : 'text-white/60'}`} />
            </button>
          </h2>
          <p className="text-[11px] text-white/70 font-medium leading-relaxed max-w-[280px]">
            {currentSong.desc}
          </p>
        </div>

        {/* 춤추는 이퀄라이저 바 그래픽 (재생 중에만 활달해짐) */}
        <div className="h-10.5 flex items-end gap-1 px-1 my-5.5 justify-center">
          {eqHeights.map((h, i) => (
            <span
              key={i}
              className="w-1.5 rounded-full bg-white transition-all duration-200"
              style={{
                height: `${isPlaying ? h : 4}px`,
                opacity: isPlaying ? 0.9 : 0.25
              }}
            />
          ))}
        </div>

        {/* 재생 타임라인 제어 슬라이드 바 */}
        <div className="space-y-1">
          <div className="relative w-full h-1 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-white transition-all duration-300"
              style={{ width: `${(currentTimeSec / duration) * 100}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-white/50">
            <span>{formatTime(currentTimeSec)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* 미디어 조작 버튼 트레이 */}
        <div className="flex items-center justify-between pt-3 mt-1.5 border-t border-white/10 select-none">
          {/* 음소거 / 볼륨 버튼 */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMuted(!isMuted)} 
              className="p-1 rounded-full hover:bg-white/10 active:scale-95 transition text-white/80 cursor-pointer"
              title={isMuted ? '음소거 해제' : '음소거'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-12 h-0.5 accent-white bg-white/20 rounded-lg cursor-pointer"
            />
          </div>

          {/* 중앙 주 제어 플랙스 */}
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePlayPause}
              style={{ color: favoriteTeam.primaryColor || '#a181ff' }}
              className="w-10.5 h-10.5 rounded-full bg-white hover:scale-105 active:scale-95 transition flex items-center justify-center shadow-lg cursor-pointer shrink-0"
            >
              {isPlaying ? <Pause className="w-4.5 h-4.5 fill-current" /> : <Play className="w-4.5 h-4.5 fill-current ml-0.5" />}
            </button>
            <button 
              onClick={handleNextSong}
              className="p-2 rounded-full hover:bg-white/10 active:scale-95 transition text-white/80 cursor-pointer"
              title="다음 응원가"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* 수화 가사 더 많은 가사 감상 여부 버튼 */}
          <button 
            onClick={() => setLyricsExpanded(!lyricsExpanded)}
            className={`px-3 py-1 bg-white/10 hover:bg-white/15 active:scale-95 text-[10px] font-black rounded-full transition flex items-center gap-1.5 cursor-pointer ${lyricsExpanded ? 'ring-1 ring-white/50' : ''}`}
          >
            <Quote className="w-3 h-3" />
            <span>가사보기</span>
          </button>
        </div>

        {/* 가사 박스 전용 슬라이드 서브패널 */}
        {lyricsExpanded && (
          <div className="mt-4 bg-black/20 rounded-2xl p-4 border border-white/5 text-xs text-stone-200 space-y-2 animate-fadeIn max-h-48 overflow-y-auto scrollbar-none select-text">
            <div className="flex items-center gap-1.5 border-b border-white/10 pb-1.5 mb-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#ffc666] shrink-0" />
              <span className="font-extrabold text-[10px] text-white/70">전 가창 가사 오리지널</span>
            </div>
            <p className="whitespace-pre-line leading-relaxed font-bold font-mono tracking-tight text-white/90 text-center">
              {currentSong.lyrics}
            </p>
          </div>
        )}

      </div>

      {/* 2. 구단 보유 응원가 목록 - 토스 스타일 화이트 바텀 카드 리스트 */}
      <div id="cheersongs-list-container" className="bg-white rounded-[28px] border border-[#e5e8eb] p-5 shadow-xs relative">
        <div id="cheersongs-list-headline" className="flex items-center justify-between pb-3.5 border-b border-[#f2f4f6] mb-3">
          <div className="flex items-center gap-1.5">
            <ListMusic className="w-4.5 h-4.5 text-brand shrink-0" />
            <span className="text-13px font-black text-[#191f28] tracking-tight">{favoriteTeam.name} 응원 멜로디북</span>
          </div>
          <span className="text-[10px] font-mono text-[#8b95a1] font-bold">{songs.length} Track(s)</span>
        </div>

        <div className="space-y-2">
          {songs.map((song) => {
            const isPlayingThis = currentSong.id === song.id;
            const isFav = favoriteSongs.includes(song.id);
            
            return (
              <div
                key={song.id}
                onClick={() => handleSelectSong(song)}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-left transition duration-150 cursor-pointer ${
                  isPlayingThis 
                    ? 'bg-[#eee8ff] border border-brand/10' 
                    : 'bg-zinc-50/50 hover:bg-zinc-50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* 곡 상태 지시 인디케이터 아이콘 디스크 */}
                  <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center shrink-0 ${isPlayingThis ? 'bg-brand text-white border-transparent' : 'bg-zinc-100 text-zinc-400'}`}>
                    {isPlayingThis && isPlaying ? (
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                      </span>
                    ) : (
                      <Music className="w-4 h-4" />
                    )}
                  </div>

                  {/* 텍스트 메타데이터 */}
                  <div className="min-w-0">
                    <p className={`text-[12px] font-black truncate leading-tight ${isPlayingThis ? 'text-brand' : 'text-[#191f28]'}`}>
                      {song.title}
                    </p>
                    <p className="text-[10px] text-[#8b95a1] leading-none mt-1 font-semibold truncate max-w-[180px]">
                      {song.desc}
                    </p>
                  </div>
                </div>

                {/* 우측 조작 피드 (좋아요 클릭 트리거 및 재생용 심플 뱃지) */}
                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    onClick={(e) => handleToggleFavorite(song.id, e)}
                    className="p-1 px-1.5 focus:outline-none hover:bg-zinc-200/50 rounded-lg transition shrink-0 cursor-pointer"
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-zinc-300'}`} />
                  </button>
                  <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded-md ${isPlayingThis ? 'bg-brand text-white' : 'bg-zinc-100 text-zinc-500'}`}>
                    {isPlayingThis ? '재생중' : '듣기'}
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* 3. 소셜 미디어 크루 & 매니저 안내 가이드북 */}
      <div id="cheering-stadium-guide" className="bg-[#f9fafb] border border-[#e5e8eb] rounded-[24px] p-4 flex items-start gap-3">
        <span className="text-xl shrink-0">📣</span>
        <div className="space-y-1">
          <p className="text-[11.5px] font-black text-[#191f28] tracking-tight">구단 응원단을 가이드해 보세요!</p>
          <p className="text-[10px] text-[#4e5968] font-bold leading-normal">
            원정 구장이든 홈 구장이든 가리지 않고 뜨거운 열기를 고양시킬 정통 사운드 오르간 재생 기능이 내장되어 있습니다. 스마트폰 스피커 볼륨을 높여 KBO 직관 관람의 사방 공간을 채우고 더 크게 응원해 주세요!
          </p>
        </div>
      </div>

    </div>
  );
}

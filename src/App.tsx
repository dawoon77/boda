import React, { useState, useEffect } from 'react';
import { UserProfile, Match, AttendanceRecord, Notice, Term, Inquiry, InquiryCategory, Player } from './types';
import { KBO_TEAMS, MATCHES_DATA, getTeamById } from './data/kboData';
import { NOTICES } from './data/notices';
import { TERMS } from './data/terms';
import { INQUIRIES } from './data/inquiries';
import { getPlayersByTeam } from './data/players';
import LoginScreen from './components/LoginScreen';
import TeamSelectScreen from './components/TeamSelectScreen';
import NextMatch from './components/NextMatch';
import MatchCalendar from './components/MatchCalendar';
import AttendanceForm from './components/AttendanceForm';
import StatsDashboard from './components/StatsDashboard';
import JournalFeed from './components/JournalFeed';
import TeamStandings, { SIMULATED_STANDINGS } from './components/TeamStandings';
import PlayerRankings from './components/PlayerRankings';
import BaseballShopping from './components/BaseballShopping';
import MyProfileTab from './components/MyProfileTab';
import CheerSongsTab from './components/CheerSongsTab';
import NoticeList from './components/NoticeList';
import NoticeDetail from './components/NoticeDetail';
import TermsList from './components/TermsList';
import TermsDetail from './components/TermsDetail';
import InquiryList from './components/InquiryList';
import InquiryForm from './components/InquiryForm';
import WithdrawScreen from './components/WithdrawScreen';
import FavoritePlayersScreen from './components/FavoritePlayersScreen';
import FavoritePlayersStats from './components/FavoritePlayersStats';
import { Calendar, Trophy, BarChart2, BookOpen, Clock, User, ShieldAlert, Home, FileText, ShoppingBag, Plus, Bell, ChevronDown, Check, Settings, ChevronLeft, ChevronRight, Dribbble } from 'lucide-react';

export default function App() {
  // 1. 앱 주요 최상위 반응형 상태 정의부
  const [profile, setProfile] = useState<UserProfile | null>(null); // 로그인한 사용자 프로필
  const [records, setRecords] = useState<AttendanceRecord[]>([]); // 내가 작성한 직관 기록 목록
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null); // 폼을 열 때 선택한 경기
  const [selectedRecordToEdit, setSelectedRecordToEdit] = useState<AttendanceRecord | undefined>(undefined); // 수정할 기존 기록
  const [isFormOpen, setIsFormOpen] = useState(false); // 직관 기록 작성 폼(팝업)이 열려 있는지 여부
  const [activeTab, setActiveTab] = useState<'home' | 'records' | 'cheer' | 'shopping' | 'my'>('home'); // 하단 탭 중 현재 선택된 탭
  const [recordsSubTab, setRecordsSubTab] = useState<'feed' | 'stats'>('feed'); // 직관기록 탭 안의 하위 탭
  const [currentTime, setCurrentTime] = useState(''); // 화면 맨 위 상태바에 표시하는 현재 시각 (HH:MM, 1분마다 갱신)
  const [isEditingProfile, setIsEditingProfile] = useState(false); // 프로필 수정 화면을 보여줄지 여부
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false); // 홈 상단 팀 이름을 눌렀을 때 나오는 응원팀 선택창(바텀시트)이 열려 있는지 여부
  const [showNotifications, setShowNotifications] = useState(false); // 종 아이콘을 눌렀을 때 나오는 알림 팝업이 열려 있는지 여부
  const [showMySettings, setShowMySettings] = useState(false); // 마이 탭에서 설정 화면을 보여줄지 여부
  const [yearlyGoal, setYearlyGoal] = useState<number>(10); // 올해 직관 목표 횟수
  const [mySubPage, setMySubPage] = useState<'notices' | 'terms' | 'inquiry' | 'withdraw' | 'favoritePlayers' | 'favoriteStats' | null>(null); // 마이 탭에서 열린 하위 화면 (null이면 마이페이지 기본 화면)
  const [favoritePlayers, setFavoritePlayers] = useState<Player[]>([]); // 좋아하는 선수 (새로고침 전까지 유지) 
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null); // 공지 목록에서 선택한 공지 (있으면 상세 화면 표시)
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null); // 약관 및 정책 목록에서 선택한 글 (있으면 상세 화면 표시)
  const [inquiries, setInquiries] = useState<Inquiry[]>(INQUIRIES); // 내 문의 목록
  const [isInquiryFormOpen, setIsInquiryFormOpen] = useState(false); // 문의 작성 화면이 열려 있는지 여부
  
  // 2. 마운트 시 브라우저 로컬 저장소로부터 저장 데이터 불러오기 및 초기 세팅
  useEffect(() => {
    // 실시간 로컬 시간 값 변경 동기화 (HH:MM 포맷)
    const updateTime = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hrs}:${mins}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000 * 60);

    // KBO 팬 프로필 정보 복구
    const savedProfile = localStorage.getItem('kbo_fan_profile');
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.error('Error parsing profile', e);
      }
    }

    // 작성한 나의 과거 직관 다이어리 목록 복구
    const savedRecords = localStorage.getItem('kbo_attendance_records');
    if (savedRecords) {
      try {
        setRecords(JSON.parse(savedRecords));
      } catch (e) {
        console.error('Error parsing records', e);
      }
    } else {
      // 신규 유저를 위해 데모 데이터를 생성하여 대시보드와 타임라인이 자연스럽게 연출되도록 지원
      const sampleRecord: AttendanceRecord = {
        id: 'sample-record-1',
        matchId: 'match-2026-05-15-kia-vs-samsung', // 기 완료된 실경기ID 매칭
        date: '2026-05-15',
        opponentTeamId: 'samsung',
        isHome: true,
        stadium: '광주-기아 챔피언스 필드',
        result: 'win', // 승리 결과 세팅
        ourScore: 6,
        oppScore: 2,
        seats: '3루 오렌지석 220블록 5열',
        ticketPrice: 15000,
        diaryContent: '김도영 선수의 시원한 3점 홈런 직관 성공! 크림새우가 비쌌지만 진짜 맛있었습니다. 경기 열기가 대단했어요! 🐯🔥',
        foods: ['광주 챔필 크림새우', '치맥 버킷'],
        satisfactionRating: 5,
        foodsRating: 5,
        cheerRating: 5,
        createdTime: new Date('2026-05-15T22:30:00Z').toISOString()
      };
      setRecords([sampleRecord]);
      localStorage.setItem('kbo_attendance_records', JSON.stringify([sampleRecord]));
    }

    return () => clearInterval(timer);
  }, []);

  // 3. 사용자 관련 기능 액션 핸들러
  const handleLoginSuccess = (loginVal: { email: string; provider: 'kakao' | 'naver' | 'google' }) => {
    // 프로필 정보 설정 화면으로 분기 유연하게 유도
    setProfile({
      nickname: '',
      favoriteTeamId: '',
      isLoggedIn: false, // 선호 구단 설정을 마쳐야 최종 true가 됨
      provider: loginVal.provider,
      email: loginVal.email
    });
  };

  const handleSetupComplete = (completeProfile: UserProfile) => {
    setProfile(completeProfile);
    localStorage.setItem('kbo_fan_profile', JSON.stringify(completeProfile));
    setIsEditingProfile(false);
  };

  const handleLogout = () => {
    if (window.confirm('응원 일지 데이터는 유지되지만 프로필이 초기화됩니다. 로그아웃 하시겠습니까?')) {
      localStorage.removeItem('kbo_fan_profile');
      setProfile(null);
    }
  };

  // 기록 데이터를 포함한 전체 공장 초기화 설정
  const handleFullReset = () => {
    if (window.confirm('경고: 로그아웃 및 작성된 모든 직관 기록, 먹거리 기록이 완전히 삭제됩니다. 초기화하시겠습니까?')) {
      localStorage.removeItem('kbo_fan_profile');
      localStorage.removeItem('kbo_attendance_records');
      setProfile(null);
      setRecords([]);
      setActiveTab('home');
    }
  };

  // 4. 직관 다이어리 기록 작성 및 다이어리 폼 수정 제어 핸들러
  const handleOpenFormWithMatch = (match: Match) => {
    const existing = records.find(r => r.id === match.id);
    setSelectedMatch(match);
    setSelectedRecordToEdit(existing);
    setIsFormOpen(true);
  };

  const handleOpenFormManual = () => {
    setSelectedMatch(null);
    setSelectedRecordToEdit(undefined);
    setIsFormOpen(true);
  };

  const handleOpenFormForEdit = (record: AttendanceRecord) => {
    const match = MATCHES_DATA.find(m => m.id === record.id);
    setSelectedMatch(match || null);
    setSelectedRecordToEdit(record);
    setIsFormOpen(true);
  };

  const handleSaveRecord = (savedRecord: AttendanceRecord) => {
    let updated: AttendanceRecord[];
    const exists = records.some(r => r.id === savedRecord.id);

    if (exists) {
      updated = records.map(r => r.id === savedRecord.id ? savedRecord : r);
    } else {
      updated = [savedRecord, ...records];
    }

    setRecords(updated);
    localStorage.setItem('kbo_attendance_records', JSON.stringify(updated));
    setIsFormOpen(false);
    setSelectedMatch(null);
    setSelectedRecordToEdit(undefined);
  };

  const handleDeleteRecord = (recordId: string) => {
    if (window.confirm('선택하신 직관 일기 기록을 정말 삭제하시겠습니까?')) {
      const updated = records.filter(r => r.id !== recordId);
      setRecords(updated);
      localStorage.setItem('kbo_attendance_records', JSON.stringify(updated));
      setIsFormOpen(false);
      setSelectedMatch(null);
      setSelectedRecordToEdit(undefined);
    }
  };

  // 1:1 문의 등록: 입력 내용에 id·작성일·상태를 붙여 목록 맨 앞에 추가
  const handleSubmitInquiry = (data: { category: InquiryCategory; title: string; content: string }) => {
    const now = new Date();
    // 한국 시간 기준 날짜 (toISOString은 UTC 기준이라 오전 9시 전에는 하루 전 날짜가 나옴)
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const newInquiry: Inquiry = {
      id: `inquiry-${now.getTime()}`,
      ...data,
      createdAt: today,
      status: 'waiting',
    };
    setInquiries((prev) => [newInquiry, ...prev]);
    setIsInquiryFormOpen(false);
  };

  // 회원 탈퇴: 저장된 데이터와 상태를 모두 지우고 로그인 화면으로 이동
  const handleWithdraw = (reason: string) => {
    // TODO: 서버 연결 후 회원 삭제 API 호출 + 탈퇴 사유 저장
    console.log('탈퇴 사유:', reason); // 개발 확인용 (브라우저 콘솔에서 확인)

    // 브라우저 저장소 데이터 삭제
    localStorage.removeItem('kbo_fan_profile');
    localStorage.removeItem('kbo_attendance_records');
    localStorage.removeItem('kbo_fav_songs');

    // 상태값 초기화
    setRecords([]);
    setYearlyGoal(10);
    setInquiries(INQUIRIES);
    setFavoritePlayers([]);
    setMySubPage(null);
    setShowMySettings(false);
    setFavoritePlayers([]);
    setActiveTab('home');
    setProfile(null); // 프로필이 없어지면 로그인 화면이 보임
  }  
  
  const resetMyTab = () => {
    setMySubPage(null);
    setSelectedNotice(null);
    setSelectedTerm(null);
    setIsInquiryFormOpen(false);
    setShowMySettings(false);
  };

  const hasRecord = (matchId: string) => {
    return records.some(r => r.id === matchId);
  };

  const favoriteTeamObj = profile && profile.favoriteTeamId ? getTeamById(profile.favoriteTeamId) : null;
  const myFavoritePlayers = favoritePlayers.filter((p) => p.teamId === favoriteTeamObj?.id); // 현재 응원팀 선수만 골라내기 (응원팀을 바꾸면 이전 팀 선수는 화면에 안 보임)
  const latestNotice = [...NOTICES].sort((a, b) => b.date.localeCompare(a.date))[0]; // 설정 화면 미리보기용 : 날짜가 가장 최근인 공지사항 1개

  return (
    <div className="min-h-screen bg-[#f2f4f6] flex items-center justify-center p-0 sm:p-4 md:p-6 text-[#191f28] font-sans selection:bg-brand/25 selection:text-[#191f28] relative overflow-hidden">
      
      {/* 장치 기기 프레임 및 메인 사이드바 구조 통합 플랙스 영역 */}
      <div className="relative z-10 flex items-center justify-center max-w-5xl w-full">
        
        {/* 📱 토스 감성의 세련된 스마트폰 가상 프레임 */}
        <div className="w-full sm:w-[412px] h-screen sm:h-[860px] bg-[#f2f4f6] sm:rounded-[40px] sm:border sm:border-[#e5e8eb] flex flex-col relative overflow-hidden sm:shadow-[0_32px_80px_rgba(0,0,0,0.06)] shrink-0">
          
          {/* 가상 스마트폰 스피커 및 카메라 베젤 수치형 홈 데코 (데스크톱 전용) */}
          <div className="hidden sm:block absolute top-[6px] left-1/2 -translate-x-1/2 w-28 h-4.5 bg-[#191f28] rounded-full z-50 flex items-center justify-center">
            <div className="w-10 h-0.5 bg-[#4e5968] rounded-full" />
          </div>

          {/* 다이내믹 스마트폰 상단 시간 배터리 데이터 정보 바 영역 */}
          <div className="h-11 bg-white px-6 flex items-center justify-between shrink-0 select-none z-30 pt-3 border-b border-[#f2f4f6]">
            <span className="text-[11px] font-bold text-[#191f28] tracking-wider font-mono">
              {currentTime || '9:41'}
            </span>
            <div className="flex items-center gap-1.5 text-[#191f28]">
              {/* 네트워크 전파 상태 신호 */}
              <div className="flex items-end gap-0.5 h-2.5">
                <div className="w-0.5 h-1 bg-zinc-200 rounded-full" />
                <div className="w-0.5 h-1.5 bg-zinc-200 rounded-full" />
                <div className="w-0.5 h-2 bg-zinc-400 rounded-full" />
                <div className="w-0.5 h-2.5 bg-zinc-800 rounded-full" />
              </div>
              <span className="text-[9px] font-bold bg-[#f2f4f6] text-[#4e5968] px-1.5 py-0.2 rounded">5G</span>
              {/* 배터리 잔량 막대 */}
              <div className="w-5 h-2.5 border border-zinc-250 rounded p-0.5 flex items-center">
                <div className="w-3.5 h-full bg-[#191f28] rounded-xs" />
              </div>
            </div>
          </div>

          {/* ── 가상 기기 내부 메인 모바일 라우팅 제어부 ── */}
          <div className="flex-1 overflow-hidden relative flex flex-col bg-white">
            
            {!profile || !profile.isLoggedIn || isEditingProfile ? (
              // 비회원 상태: 로그인 페이지 표출 혹은 프로필 세팅, 가입 수정 화면 분기
              !profile ? (
                <LoginScreen onLoginSuccess={handleLoginSuccess} />
              ) : (
                <TeamSelectScreen
                  userEmail={profile.email || 'fan@kbo.com'}
                  provider={profile.provider || 'kakao'}
                  onSetupComplete={handleSetupComplete}
                  initialNickname={profile.nickname || undefined}
                  initialTeamId={profile.favoriteTeamId || undefined}
                  onCancel={isEditingProfile ? () => setIsEditingProfile(false) : undefined}
                />
              )
            ) : (
              // 회원 가입 완료 정상 상태: 앱 메인 메이트 페이지 카드 표시
              <div className="flex flex-col h-full overflow-hidden relative">
                <div className="flex-1 flex flex-col min-h-0 relative">
                  {/* 1. 홈 탭이 활성화되었을 때의 깔끔한 브랜드 상단 헤더 */}
                  {activeTab === 'home' && favoriteTeamObj && (
                    <header id="top-bar-home" className="bg-white px-5 py-4 border-b border-[#f2f4f6] shrink-0 flex items-center justify-between shadow-xs sticky top-0 z-30">
                      <div>
                        {/* 타깃 구단을 빠르게 바꾸기 위한 상단 트리거 선택 단락 (바텀시트 오픈) */}
                        <button
                          id="top-home-team-trigger"
                          onClick={() => setIsTeamDropdownOpen(true)}
                          className="flex items-center gap-1 hover:bg-zinc-50 px-2.5 py-1.5 -ml-2.5 rounded-xl transition cursor-pointer select-none group"
                        >
                          <span className="text-base font-extrabold text-[#191f28] leading-none select-none tracking-tight">
                            {favoriteTeamObj.name}
                          </span>
                          <ChevronDown className="w-4 h-4 text-zinc-450 group-hover:text-zinc-600 transition-colors shrink-0 stroke-[2.5]" />
                        </button>
                      </div>

                      {/* 우측 종아이콘 및 알림 */}
                      <div className="flex items-center gap-1">
                        <div className="relative">
                          <button 
                            id="btn-alert-notifications"
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="p-2 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 rounded-xl transition relative cursor-pointer"
                            title="알림 피드"
                          >
                            <Bell className="w-5 h-5 stroke-[2.2]" />
                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand rounded-full" />
                          </button>

                        {/* 앱 내부 간편 소알림 팝오버 팝업 */}
                        {showNotifications && (
                          <>
                            <div className="fixed inset-0 z-40 bg-black/[0.01]" onClick={() => setShowNotifications(false)} />
                            <div id="home-notifications-popover" className="absolute right-0 top-11 z-50 w-64 bg-white border border-[#e5e8eb] rounded-2xl shadow-lg p-4 animate-fadeIn text-xs">
                              <div className="flex justify-between items-center pb-2 mb-2 border-b border-zinc-100">
                                <h4 className="font-bold text-zinc-900">알림 피드 🔔</h4>
                                <button onClick={() => setShowNotifications(false)} className="text-[10px] text-zinc-400 hover:text-[#4e5968] font-semibold cursor-pointer">닫기</button>
                              </div>
                              <div className="space-y-3">
                                <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-100 space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                                    <p className="font-bold text-zinc-700 text-[10px]">KBO 실시간 연동 완료</p>
                                  </div>
                                  <p className="text-zinc-500 text-[10px] leading-normal font-medium">KBO 리그 구단 경기 일정 및 실시간 순위 정보가 모두 업그레이드되었습니다.</p>
                                </div>
                                <p className="text-[10px] text-zinc-400 text-center py-0.5 font-medium">읽지 않은 알림이 더 이상 없습니다.</p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </header>
                )}

                  {/* 2. 기록 피드/통계 대시보드가 활성화되었을 때 노출하는 상부 스티키 피드-리포트 변환 서브 탭 헤더 */}
                  {activeTab === 'records' && favoriteTeamObj && (
                    <header id="top-bar-records" className="bg-white px-5 py-4 border-b border-[#f2f4f6]" style={{ flexShrink: 0 }}>
                      <div className="grid grid-cols-2 gap-1 bg-zinc-100 p-1 rounded-full border border-zinc-200/50">
                        <button
                          id="btn-subtab-feed"
                          onClick={() => setRecordsSubTab('feed')}
                          className={`py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                            recordsSubTab === 'feed'
                              ? 'bg-brand text-white shadow-sm border border-transparent'
                              : 'text-zinc-500 hover:text-zinc-800'
                          }`}
                        >
                          직관 일지 피드
                        </button>
                        <button
                          id="btn-subtab-stats"
                          onClick={() => setRecordsSubTab('stats')}
                          className={`py-2 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
                            recordsSubTab === 'stats'
                              ? 'bg-brand text-white shadow-sm border border-transparent'
                              : 'text-zinc-500 hover:text-zinc-800'
                          }`}
                        >
                          나의 응원 보고서
                        </button>
                      </div>
                    </header>
                  )}

                  {/* 2.5 응원가 탭이 활성화되었을 때의 상단 프로필 헤더 style (왼쪽에 응원가, 오른쪽에 알림 아이콘) */}
                  {activeTab === 'cheer' && favoriteTeamObj && (
                    <header id="top-bar-cheer" className="bg-white px-5 py-4 border-b border-[#f2f4f6] shrink-0 flex items-center justify-between sticky top-0 z-35 animate-fadeIn">
                      <div>
                        <span className="text-lg font-black text-[#191f28] tracking-tight">
                          응원가
                        </span>
                      </div>

                      {/* 우측 종아이콘 알림 영역 */}
                      <div className="flex items-center gap-1">
                        <div className="relative">
                          <button 
                            id="btn-alert-notifications-cheer"
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="p-2 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 rounded-xl transition relative cursor-pointer"
                            title="알림 피드"
                          >
                            <Bell className="w-5 h-5 stroke-[2.2]" />
                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand rounded-full" />
                          </button>

                          {/* 앱 내부 간편 소알림 팝오버 팝업 */}
                          {showNotifications && (
                            <>
                              <div className="fixed inset-0 z-40 bg-black/[0.01]" onClick={() => setShowNotifications(false)} />
                              <div id="cheer-notifications-popover" className="absolute right-0 top-11 z-50 w-64 bg-white border border-[#e5e8eb] rounded-2xl shadow-lg p-4 animate-fadeIn text-xs text-left font-normal select-none">
                                <div className="flex justify-between items-center pb-2 mb-2 border-b border-zinc-100">
                                  <h4 className="font-bold text-zinc-900">알림 피드 🔔</h4>
                                  <button onClick={() => setShowNotifications(false)} className="text-[10px] text-zinc-400 hover:text-[#4e5968] font-semibold cursor-pointer">닫기</button>
                                </div>
                                <div className="space-y-3">
                                  <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-100 space-y-1">
                                    <div className="flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                                      <p className="font-bold text-zinc-700 text-[10px]">KBO 실시간 연동 완료</p>
                                    </div>
                                    <p className="text-zinc-500 text-[10px] leading-normal font-medium">KBO 리그 구단 경기 일정 및 실시간 순위 정보가 모두 업그레이드되었습니다.</p>
                                  </div>
                                  <p className="text-[10px] text-zinc-400 text-center py-0.5 font-medium">읽지 않은 알림이 더 이상 없습니다.</p>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </header>
                  )}

                  {/* 3. 마이 탭이 활성화되었을 때의 상단 프로필 헤더 혹은 설정 헤더 */}
                  {activeTab === 'my' && favoriteTeamObj && (
                    !showMySettings ? (
                      <header id="top-bar-my-profile" className="bg-white px-5 py-4 border-b border-[#f2f4f6] shrink-0 flex items-center justify-between sticky top-0 z-35 animate-fadeIn">
                        <div>
                          <span className="text-lg font-black text-[#191f28] tracking-tight">
                            마이 직관
                          </span>
                        </div>
                        <div>
                          <button
                            id="btn-settings-toggle"
                            onClick={() => setShowMySettings(true)}
                            className="p-2 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 rounded-xl transition cursor-pointer"
                            title="설정"
                          >
                            <Settings className="w-5.5 h-5.5 stroke-[2.2]" />
                          </button>
                        </div>
                      </header>
                    ) : (
                      <header id="top-bar-settings" className="bg-white px-6 py-4 border-b border-zinc-100 shrink-0 grid grid-cols-3 items-center sticky top-0 z-35 animate-fadeIn">
                        <div className="flex justify-start">
                          <button
                            id="btn-back-settings"
                            onClick={() => setShowMySettings(false)}
                            className="text-[#8b95a1] hover:text-[#4e5968] hover:bg-[#f2f4f6] p-1.5 rounded-full transition cursor-pointer"
                            aria-label="뒤로가기"
                          >
                            <ChevronLeft className="w-5.5 h-5.5 stroke-[2.5]" />
                          </button>
                        </div>
                        <div className="flex justify-center">
                          <h2 className="text-[16px] font-bold text-[#191f28] whitespace-nowrap">
                            설정
                          </h2>
                        </div>
                        <div className="flex justify-end">
                          {/* 밸런스 매칭을 위한 플레이스홀더 */}
                        </div>
                      </header>
                    )
                  )}

                  {/* 스마트폰 기기 프레임 스크롤 대시보드 콘텐츠 영역 메인 컨테이너 */}
                  <main className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                    
                    {activeTab === 'home' && favoriteTeamObj && (() => {
                      const teamMatches = MATCHES_DATA.filter(
                        m => m.homeTeamId === favoriteTeamObj.id || m.awayTeamId === favoriteTeamObj.id
                      );
                      const sortedDocs = [...teamMatches].sort((a, b) => a.date.localeCompare(b.date));
                      const nextOrLiveMatch = sortedDocs.find(m => m.status === 'live' || m.status === 'scheduled') || (sortedDocs.length > 0 ? sortedDocs[sortedDocs.length - 1] : null);
                      const isMatchLive = nextOrLiveMatch && nextOrLiveMatch.status === 'live';

                      return (
                        <>
                          {/* 2. 마이팀 순위 간략 대시보드 */}
                          <TeamStandings favoriteTeam={favoriteTeamObj} onlyMyTeam={true} />

                          {/* 3. 직전 또는 현재 진행 경기/오늘의 예정 실시간 중계 패널 */}
                          <NextMatch
                            favoriteTeam={favoriteTeamObj}
                            matches={MATCHES_DATA}
                            onAttendanceClick={handleOpenFormWithMatch}
                            hasRecord={hasRecord}
                          />

                          {/* 4. 경기 일정을 파악할 수 있는 매치 직관 달력 캘린더 위젯 */}
                          <MatchCalendar
                            favoriteTeam={favoriteTeamObj}
                            matches={MATCHES_DATA}
                            attendanceRecords={records}
                            onMatchSelect={handleOpenFormWithMatch}
                            onAddCustomRecord={handleOpenFormManual}
                          />

                          {/* 5. 10개 구단 전체 종합 순위표 */}
                          <TeamStandings favoriteTeam={favoriteTeamObj} />

                          {/* 6. 이번 시즌 주요 타자/투수 개인 랭킹 */}
                          <PlayerRankings favoriteTeam={favoriteTeamObj} />
                        </>
                      );
                    })()}

                    {activeTab === 'records' && favoriteTeamObj && (
                      <div className="space-y-4">
                        {/* 내부 라우트 전환 탭 구조에 따른 저널 피드 혹은 리포트 통계 래퍼 */}
                        {recordsSubTab === 'feed' ? (
                          <JournalFeed
                            favoriteTeam={favoriteTeamObj}
                            records={records}
                            onEditRecord={handleOpenFormForEdit}
                            onDeleteRecord={handleDeleteRecord}
                          />
                        ) : (
                          <StatsDashboard
                            favoriteTeam={favoriteTeamObj}
                            records={records}
                          />
                        )}
                      </div>
                    )}

                    {activeTab === 'cheer' && favoriteTeamObj && (
                      /* 응원가 가사 및 사운드 오르간 메들리 보드 */
                      <CheerSongsTab favoriteTeam={favoriteTeamObj} />
                    )}

                    {activeTab === 'shopping' && favoriteTeamObj && (
                      /* 야구장 굿즈 딜 전용 쇼핑몰 상품 목록 탭 */
                      <BaseballShopping favoriteTeam={favoriteTeamObj} />
                    )}

                    {activeTab === 'my' && favoriteTeamObj && (
                      !showMySettings ? (
                        /* 마이페이지 프로필 상태 정보 및 미션 목표 성취 탭 */
                        <MyProfileTab
                          profile={profile}
                          records={records}
                          yearlyGoal={yearlyGoal}
                          favoritePlayers={myFavoritePlayers}
                          onChangeGoal={setYearlyGoal} 
                          onEditProfile={() => setIsEditingProfile(true)}
                          onOpenFavoritePlayers={() => setMySubPage('favoritePlayers')}
                          onOpenFavoriteStats={() => setMySubPage('favoriteStats')}
                          onMenuSelect={(key) => {
                            if (key === 'settings') setShowMySettings(true);
                            if (key === 'notices') setMySubPage('notices');
                            if (key === 'terms') setMySubPage('terms');
                            if (key === 'inquiry') setMySubPage('inquiry');
                            if (key === 'withdraw') setMySubPage('withdraw');
                          }}
                        />
                      ) : (
                        /* 설정 화면 */
                        <div className="space-y-4 animate-fadeIn">
                          {/* 설정 카테고리 카드 */}
                          <div id="settings-options-container" className="bg-white rounded-[28px] border border-[#e5e8eb] p-5.5 space-y-5 shadow-xs">
                            {/* 1. 내 계정 */}
                            <div id="settings-group-account" className="flex items-center justify-between pb-3.5 border-b border-[#f2f4f6]">
                              <div className="space-y-0.5">
                                <span className="text-[13px] font-black text-[#191f28]">내 계정</span>
                                <p className="text-[10px] text-[#8b95a1] font-bold">인증 및 소셜 계정 정보</p>
                              </div>
                              <div className="text-right">
                                <span className="text-[12px] font-black text-brand block">{profile?.nickname}</span>
                                <span className="text-[10px] text-[#8b95a1] -mt-0.5 font-semibold block">{profile?.email || 'fan@kbo.com'} ({profile?.provider || 'kakao'})</span>
                              </div>
                            </div>

                            {/* 2. 알림 설정 */}
                            <div id="settings-group-notifications" className="flex items-center justify-between pb-3.5 border-b border-[#f2f4f6]">
                              <div className="space-y-0.5">
                                <span className="text-[13px] font-black text-[#191f28]">알림설정</span>
                                <p className="text-[10px] text-[#8b95a1] font-bold">Push 알림 및 KBO 실시간 속보</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer select-none">
                                <input id="toggle-push-notifs" type="checkbox" defaultChecked className="sr-only peer" />
                                <div className="w-11 h-6 bg-[#e5e8eb] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
                              </label>
                            </div>

                            {/* 3. 공지사항 - 누르면 공지 목록으로 이동 */}
                            <button
                              id="settings-group-announcements"
                              onClick={() => setMySubPage('notices')}
                              className="w-full text-left space-y-2 pb-3.5 border-b border-[#f2f4f6] cursor-pointer group"
                            >
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <span className="text-[13px] font-black text-[#191f28]">공지사항</span>
                                  <p className="text-[10px] text-[#8b95a1] font-bold">새로운 소식 및 기능 정보</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                              </div>
                              {/* 최신 공지 1개 미리보기 (날짜가 가장 최근인 공지) */}
                              {latestNotice && (
                                <div className="bg-[#f9fafb] p-3.5 rounded-2xl border border-[#e5e8eb] space-y-1">
                                  <p className="text-[11px] font-black text-[#333d4b]">📢 {latestNotice.title}</p>
                                  <p className="text-[10px] text-[#4e5968] font-bold leading-normal line-clamp-2">
                                    {latestNotice.content}
                                  </p>
                                </div>
                              )}
                            </button>

                            {/* 4. 버전 정보 */}
                            <div id="settings-group-version" className="flex items-center justify-between pt-1">
                              <div className="space-y-0.5">
                                <span className="text-[13px] font-black text-[#191f28]">버전정보</span>
                                <p className="text-[10px] text-[#8b95a1] font-bold">현 기기의 어플리케이션 버전</p>
                              </div>
                              <span className="text-[10px] font-black text-[#4e5968] bg-[#f2f4f6] px-3 py-1 rounded-full">v1.2.0 (최신 버전)</span>
                            </div>
                          </div>

                          {/* 로그아웃 액션 버튼 */}
                          <div className="pt-3 text-center">
                            <button
                              id="btn-settings-logout"
                              onClick={() => {
                                if (confirm('KBO:LOG 서비스에서 로그아웃 하시겠습니까?')) {
                                  localStorage.removeItem('kbo_fan_profile');
                                  window.location.reload();
                                }
                              }}
                              className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline transition cursor-pointer"
                            >
                              로그아웃
                            </button>
                          </div>
                        </div>
                      )
                    )}
                  </main>

                  {/* 공지사항: 목록은 계속 띄워두고, 상세는 그 위에 겹쳐서 표시 */}
                  {activeTab === 'my' && mySubPage === 'notices' && (
                    <>
                      <NoticeList
                        notices={NOTICES}
                        onSelect={(notice) => setSelectedNotice(notice)}   // 목록 → 상세
                        onBack={() => setMySubPage(null)}                  // 목록 → 마이페이지
                      />
                      {selectedNotice && (
                        <NoticeDetail
                          notice={selectedNotice}
                          onBack={() => setSelectedNotice(null)}           // 상세 → 목록
                        />
                      )}
                    </>
                  )}

                  {/* 약관 및 정책: 목록은 계속 띄워두고, 상세는 그 위에 겹쳐서 표시 */}
                  {activeTab === 'my' && mySubPage === 'terms' && (
                    <>
                      <TermsList
                        terms={TERMS}
                        onSelect={(term) => setSelectedTerm(term)}   // 목록 → 상세
                        onBack={() => setMySubPage(null)}            // 목록 → 마이페이지
                      />
                      {selectedTerm && (
                        <TermsDetail
                          term={selectedTerm}
                          onBack={() => setSelectedTerm(null)}       // 상세 → 목록
                        />
                      )}
                    </>
                  )}

                  {/* 1:1 문의: 목록은 계속 띄워두고, 작성 화면은 그 위에 겹쳐서 표시 */}
                  {activeTab === 'my' && mySubPage === 'inquiry' && (
                    <>
                      <InquiryList
                        inquiries={inquiries}
                        onWrite={() => setIsInquiryFormOpen(true)}   // 목록 → 작성
                        onBack={() => setMySubPage(null)}            // 목록 → 마이페이지
                      />
                      {isInquiryFormOpen && (
                        <InquiryForm
                          onSubmit={handleSubmitInquiry}             // 등록 → 목록 맨 위에 추가
                          onBack={() => setIsInquiryFormOpen(false)} // 작성 → 목록
                        />
                      )}
                    </>
                  )}   

                  {/* 회원 탈퇴 */}
                  {activeTab === 'my' && mySubPage === 'withdraw' && (
                    <WithdrawScreen
                      nickname={profile.nickname}
                      recordCount={records.length}
                      onWithdraw={handleWithdraw}
                      onBack={() => setMySubPage(null)}   // 취소 → 마이페이지
                    />
                  )}  

                  {/* 좋아하는 선수 선택 */}
                  {activeTab === 'my' && mySubPage === 'favoritePlayers' && favoriteTeamObj && (
                    <FavoritePlayersScreen
                      team={favoriteTeamObj}
                      players={getPlayersByTeam(favoriteTeamObj.id)}
                      initialSelected={myFavoritePlayers}
                      onSave={(selected) => {
                        setFavoritePlayers(selected);   // 저장
                        setMySubPage(null);             // 마이페이지로
                      }}
                      onBack={() => setMySubPage(null)}  // 저장 없이 나가기
                    />
                  )} 
                  
                  {/* 좋아하는 선수 기록 */}
                  {activeTab === 'my' && mySubPage === 'favoriteStats' && favoriteTeamObj && (
                    <FavoritePlayersStats
                      team={favoriteTeamObj}
                      players={myFavoritePlayers}
                      onEdit={() => setMySubPage('favoritePlayers')}   // 기록 → 편집
                      onBack={() => setMySubPage(null)}               // 기록 → 마이페이지
                    />
                  )}                 
                </div>  
                
                {/* 스마트폰 하단 고정 토스 스타일 내비게이션 바 */}
                <nav className="h-18 bg-white border-t border-[#f2f4f6] px-4 flex justify-around items-center shrink-0 select-none z-10 sticky bottom-0 shadow-[0_-8px_24px_rgba(0,0,0,0.02)]">
                  {/* 1. 홈 탭 영역 */}
                  <button
                    id="tab-btn-home"
                    onClick={() => { setActiveTab('home'); setShowMySettings(false); }}
                    className={`flex flex-col items-center gap-1 cursor-pointer transition ${
                      activeTab === 'home' ? 'text-brand scale-[1.02] font-semibold' : 'text-[#b0b8c1] hover:text-[#4e5968]'
                    }`}
                  >
                    <Home className="w-5.5 h-5.5 stroke-[2.0]" />
                    <span className="text-[10px] font-bold tracking-tight">홈</span>
                  </button>

                  {/* 2. 직관기록 일지 및 통계 보고서 탭 영역 */}
                  <button
                    id="tab-btn-records"
                    onClick={() => { setActiveTab('records'); setShowMySettings(false); }}
                    className={`flex flex-col items-center gap-1 cursor-pointer transition relative ${
                      activeTab === 'records' ? 'text-brand scale-[1.02] font-semibold' : 'text-[#b0b8c1] hover:text-[#4e5968]'
                    }`}
                  >
                    <FileText className="w-5.5 h-5.5 stroke-[2.0]" />
                    <span className="text-[10px] font-bold tracking-tight">직관기록</span>
                    {records.length > 0 && (
                      <span className="absolute -top-1 -right-2.5 bg-[#f04452] text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center leading-none">
                        {records.length}
                      </span>
                    )}
                  </button>

                  {/* 중간: 야구공 응원가 탭 영역 */}
                  <button
                    id="tab-btn-cheer"
                    onClick={() => { setActiveTab('cheer'); setShowMySettings(false); }}
                    className={`flex flex-col items-center gap-1 cursor-pointer transition ${
                      activeTab === 'cheer' ? 'text-brand scale-[1.02] font-semibold' : 'text-[#b0b8c1] hover:text-[#4e5968]'
                    }`}
                  >
                    <Dribbble className="w-5.5 h-5.5 stroke-[2.0] animate-pulse" />
                    <span className="text-[10px] font-bold tracking-tight">응원가</span>
                  </button>

                  {/* 3. 굿즈 쇼핑 탭 영역 */}
                  <button
                    id="tab-btn-shopping"
                    onClick={() => { setActiveTab('shopping'); setShowMySettings(false); }}
                    className={`flex flex-col items-center gap-1 cursor-pointer transition ${
                      activeTab === 'shopping' ? 'text-brand scale-[1.02] font-semibold' : 'text-[#b0b8c1] hover:text-[#4e5968]'
                    }`}
                  >
                    <ShoppingBag className="w-5.5 h-5.5 stroke-[2.0]" />
                    <span className="text-[10px] font-bold tracking-tight">야구 쇼핑</span>
                  </button>

                  {/* 4. 마이페이지 프로필 변경 탭 영역 */}
                  <button
                    id="tab-btn-my"
                    onClick={() => { setActiveTab('my'); resetMyTab(); }}
                    className={`flex flex-col items-center gap-1 cursor-pointer transition ${
                      activeTab === 'my' ? 'text-brand scale-[1.02] font-semibold' : 'text-[#b0b8c1] hover:text-[#4e5968]'
                    }`}
                  >
                    <User className="w-5.5 h-5.5 stroke-[2.0]" />
                    <span className="text-[10px] font-bold tracking-tight">마이</span>
                  </button>
                </nav>

                {/* 우측 하단 고정 직관기록 작성 플로팅 버튼 */}
                {(activeTab === 'home' || activeTab === 'records') && (
                  <button
                    id="btn-floating-write"
                    onClick={handleOpenFormManual}
                    className="absolute bottom-22 right-5 z-40 w-12 h-12 bg-brand text-white shadow-md hover:bg-[#4314c4] active:scale-95 rounded-full flex items-center justify-center transition-all duration-200 select-none cursor-pointer group"
                    title="직관기록 작성"
                  >
                    <Plus className="w-6 h-6 stroke-[2.5]" />
                  </button>
                )}

                {/* 플로팅된 활성화 직관 기입 폼 컴포넌트 */}
                {isFormOpen && favoriteTeamObj && (
                  <AttendanceForm
                    favoriteTeam={favoriteTeamObj}
                    selectedMatch={selectedMatch}
                    existingRecord={selectedRecordToEdit}
                    onSave={handleSaveRecord}
                    onDelete={handleDeleteRecord}
                    onClose={() => {
                      setIsFormOpen(false);
                      setSelectedMatch(null);
                      setSelectedRecordToEdit(undefined);
                    }}
                  />
                )}

                {/* 응원 구단 선택 바텀시트 */}
                {isTeamDropdownOpen && favoriteTeamObj && (
                  <>
                    {/* 반투명 블랙 아웃포커스 배경막 */}
                    <div 
                      className="absolute inset-0 z-45 bg-[#191f28]/40 backdrop-blur-3xs transition-opacity duration-300 animate-fadeIn" 
                      onClick={() => setIsTeamDropdownOpen(false)}
                    />
                    
                    {/* 슬라이드 업 바텀 플레이트 */}
                    <div 
                      id="home-team-bottom-sheet" 
                      className="absolute bottom-0 left-0 right-0 z-50 bg-white rounded-t-[32px] p-6 pb-8 shadow-[0_-10px_32px_rgba(0,0,0,0.12)] flex flex-col max-h-[75%] animate-sheetUp select-none"
                    >
                      {/* 드래그 유도 바 핸들 */}
                      <div 
                        className="w-12 h-1.5 bg-[#e5e8eb] rounded-full mx-auto mb-5 cursor-pointer hover:bg-zinc-300 transition duration-150" 
                        onClick={() => setIsTeamDropdownOpen(false)}
                      />
                      
                      {/* 타이틀 및 명세 내용 */}
                      <div className="mb-4 text-left">
                        <h3 className="text-base font-black text-[#191f28] tracking-tight">구단 설정</h3>
                      </div>

                      {/* 구단 목록 리스트 */}
                      <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 py-1">
                        {KBO_TEAMS.map(team => {
                          const isCurrent = favoriteTeamObj.id === team.id;
                          return (
                            <button
                              key={team.id}
                              onClick={() => {
                                const updatedProfile = { ...profile!, favoriteTeamId: team.id };
                                setProfile(updatedProfile);
                                localStorage.setItem('kbo_fan_profile', JSON.stringify(updatedProfile));
                                setIsTeamDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-left transition duration-150 cursor-pointer ${
                                isCurrent 
                                  ? 'bg-[#eee8ff] text-[#531ded] font-bold' 
                                  : 'hover:bg-[#f2f4f6] text-[#4e5968] font-bold'
                              }`}
                            >
                              <div className="flex items-center">
                                <span className="text-[12px] tracking-tight font-extrabold">{team.name}</span>
                              </div>
                              {isCurrent && (
                                <div className="w-5 h-5 rounded-full bg-brand flex items-center justify-center shrink-0">
                                  <Check className="w-3 h-3 text-white stroke-[3.5]" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}                       
              </div>
            )}
            
          </div>

          {/* 데스크톱 전용 스마트폰 하단 홈 인디케이터 라인 바 */}
          <div className="hidden sm:block h-6 bg-white flex items-center justify-center shrink-0 border-t border-[#f2f4f6]">
            <div className="w-24 h-1 bg-zinc-300 rounded-full hover:bg-zinc-400 transition duration-150 cursor-pointer" />
          </div>

        </div>

        {/* Design Context Sidebar (placed next to the phone frame on desktop screens) */}
        <div className="hidden lg:flex flex-col ml-16 max-w-sm text-left justify-center animate-fadeIn select-none">
          <p className="text-brand font-bold text-xs tracking-[0.1em] uppercase mb-2">toss bank visual sandbox</p>
          <h3 className="text-4xl font-black tracking-tight mb-5 leading-[1.1] text-[#191f28]">
            KBO:LOG<br/>Toss-Inspired.
          </h3>
          <p className="text-[13px] text-[#4e5968] mb-6 leading-relaxed font-medium">
            토스뱅크의 군더더기 없는 미니멀리즘과 직관적인 UX를 그대로 녹여낸 샌드박스입니다. 금융 서비스 수준의 정갈하고 정돈된 화면 구조, 넉넉한 여백, 소프트 쉐도우 카드로 소중한 KBO 직관 추억과 영수증 소비지출, 먹거리 선호 통계를 일목요연하게 트래킹해 보세요.
          </p>
          <ul className="space-y-4 border-t border-[#e5e8eb] pt-6 text-[12px] font-semibold text-[#8b95a1]">
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-brand"></div>
              <span className="text-[#4e5968]">실시간 KBO 데이터 연동 및 가상 현황판</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-brand"></div>
              <span className="text-[#4e5968]">토스 금융 비서 느낌의 먹거리 승률 상관 분석 보고서</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-brand"></div>
              <span className="text-[#4e5968]">원클릭 간편 로그인 및 직관 캘린더</span>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { UserProfile } from '../types';
import { LogIn, Sparkles, AlertCircle, Check } from 'lucide-react';
import { COLORS, TYPOGRAPHY, BUTTONS } from '../lib/styles';

interface LoginScreenProps {
  onLoginSuccess: (profile: UserProfileObj) => void;
}

interface UserProfileObj {
  nickname: string;
  favoriteTeamId: string;
  isLoggedIn: boolean;
  provider: 'kakao' | 'naver' | 'google';
  email: string;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [selectedProvider, setSelectedProvider] = useState<'kakao' | 'naver' | 'google' | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  const startAuthSimulation = (provider: 'kakao' | 'naver' | 'google') => {
    setSelectedProvider(provider);
    setIsSimulating(true);
    
    // 실제 로그인처럼 작동하도록 제공 방식에 따른 가상 이메일 주소 주입
    if (provider === 'google') setAuthEmail('baseball.fan@gmail.com');
    else if (provider === 'kakao') setAuthEmail('kbo_homerun@kakao.com');
    else setAuthEmail('stadium_scream@naver.com');
  };

  const handleSimulatedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail) return;

    onLoginSuccess({
      nickname: '', // 최초 신규 가입 로그인일 시 메인 화면 진입 전 닉네임 설정창으로 우선 분기시킴
      favoriteTeamId: '',
      isLoggedIn: true,
      provider: selectedProvider || 'google',
      email: authEmail
    });
  };

  return (
    <div id="login-container" className={`flex flex-col justify-between h-full bg-white p-7 font-sans ${COLORS.textMain}`}>
      {/* 상단 브랜딩 타이틀 영역 - 토스 레이아웃 차용: 깔끔하고 볼드한 타이틀 구문 */}
      <div id="login-header-group" className="flex flex-col items-start mt-10 space-y-6">
        <div id="login-ball-decorator" className="w-12 h-12 bg-brand-light rounded-2xl flex items-center justify-center text-2xl shadow-xs">
          ⚾
        </div>
        
        <div className="space-y-2">
          <span className={TYPOGRAPHY.caption + " text-brand uppercase tracking-wide"}>KBO:LOG Onboarding</span>
          <h1 id="login-title" className={TYPOGRAPHY.display}>
            프로야구 직관 전적,<br />
            클릭 한 번으로<br />
            정교하게 시작하세요
          </h1>
          <p id="login-subtitle" className={`${TYPOGRAPHY.bodyMedium} opacity-90 pt-1`}>
            토스뱅크 감성의 정갈하고 미니멀한 가계부 겸 전적 일기 시스템. 구단 일정부터 맛있는 구장 푸드 승률 리포트까지 투명하게 정리해 드려요.
          </p>
        </div>
      </div>

      {/* 간편 소셜 로그인 선택 단락 */}
      <div id="login-button-group" className="space-y-3 mb-4">
        <p className={`${TYPOGRAPHY.caption} text-center mb-2`}>간편하게 3초 만에 로그인 완료</p>
        
        {/* 카카오 계정 로그인 버튼 */}
        <button
          id="btn-kakao-login"
          onClick={() => startAuthSimulation('kakao')}
          className="w-full h-13 bg-[#FEE500] text-[#191919] font-bold rounded-2xl flex items-center justify-between px-5 transition-all active:scale-[0.99] cursor-pointer"
        >
          <span className="text-lg">💬</span>
          <span className="flex-1 text-center text-[13px] font-bold tracking-tight">카카오계정으로 연결하기</span>
          <span className="w-4"></span>
        </button>

        {/* 네이버 계정 로그인 버튼 */}
        <button
          id="btn-naver-login"
          onClick={() => startAuthSimulation('naver')}
          className="w-full h-13 bg-[#03C75A] text-white font-bold rounded-2xl flex items-center justify-between px-5 transition-all active:scale-[0.99] cursor-pointer"
        >
          <span className="text-xs font-black bg-white text-[#03C75A] px-1.5 py-0.5 rounded-sm">N</span>
          <span className="flex-1 text-center text-[13px] font-bold tracking-tight">네이버 아이디로 연결하기</span>
          <span className="w-4"></span>
        </button>

        {/* 구글 계정 로그인 버튼 */}
        <button
          id="btn-google-login"
          onClick={() => startAuthSimulation('google')}
          className="w-full h-13 bg-white text-[#191f28] font-bold rounded-2xl flex items-center justify-between px-5 transition-all border border-[#e5e8eb] active:scale-[0.99] cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span className="flex-1 text-center text-[13px] font-bold tracking-tight">Google 계정으로 연결하기</span>
          <span className="w-4"></span>
        </button>

        <div className={`pt-2 text-center leading-relaxed font-semibold ${TYPOGRAPHY.captionMuted}`}>
          로그인 버튼을 클릭하면 구장 입장료 정산 및 직관 통계 기록 약관에 동의하는 것으로 처리됩니다.
        </div>
      </div>

      {/* 가상 OAuth 승인 권한 모의 테스트 다이얼로그 모달 */}
      {isSimulating && (
        <div id="auth-simulation-overlay" className="absolute inset-0 z-50 bg-[#191f28]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div id="auth-simulator-modal" className="w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl border border-[#e5e8eb] p-6 space-y-6 shadow-xl relative overflow-hidden animate-slideUp">
            {/* 모바일 뷰 상단 조절용 핑거 노치 핸들 */}
            <div className="w-12 h-1 bg-[#e5e8eb] rounded-full mx-auto sm:hidden -mt-2 mb-4" />
            
            <div className="flex items-center gap-2">
              <span className="text-xl">🔒</span>
              <span className={`uppercase tracking-wider font-extrabold font-mono ${TYPOGRAPHY.captionMuted}`}>가상 연동 시스템</span>
            </div>

            <div className="space-y-2">
              <h3 id="sim-prompt-title" className={`text-[17px] font-bold flex items-center gap-2 ${COLORS.textMain}`}>
                {selectedProvider === 'kakao' && '💬 Kakao 간편 로그인 요청'}
                {selectedProvider === 'naver' && '💚 Naver 간편 프로필 연동'}
                {selectedProvider === 'google' && '🌐 Google Auth 자격 연결'}
              </h3>
              <p className={`leading-relaxed font-medium ${TYPOGRAPHY.bodyRegular}`}>
                KBO:LOG 직관 일기에서 회원정보(이메일 식별 주소) 조회를 1회 요청합니다. 암호 입력 없이 검증 단계를 안전하게 모의 수행합니다.
              </p>
            </div>

            <form onSubmit={handleSimulatedSubmit} className="space-y-5">
              <div>
                <label className={`block mb-1.5 ${TYPOGRAPHY.caption} ${COLORS.textMuted}`}>이메일 주소</label>
                <input
                  id="simulated-email-input"
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="w-full bg-[#f2f4f6] border border-transparent rounded-2xl px-4 py-3 text-xs font-bold text-[#191f28] focus:outline-none focus:border-brand focus:bg-white transition"
                />
              </div>

              <div id="security-notice" className="bg-brand-light p-3 rounded-2xl border border-transparent flex gap-2.5 items-start">
                <AlertCircle className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <span className="text-[11px] text-brand leading-normal font-semibold">
                  본 화면은 로컬 보안 샌드박스의 안전한 모의 승인 절차입니다. 안심하고 동의하셔도 좋습니다.
                </span>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  id="btn-sim-cancel"
                  type="button"
                  onClick={() => setIsSimulating(false)}
                  className="flex-1 bg-[#f2f4f6] hover:bg-[#e5e8eb] font-bold text-[#4e5968] py-3.5 rounded-2xl text-[13px] transition cursor-pointer"
                >
                  다음에 하기
                </button>
                <button
                  id="btn-sim-confirm"
                  type="submit"
                  className="flex-1 bg-brand hover:bg-brand-hover text-white font-bold py-3.5 rounded-2xl text-[13px] transition cursor-pointer shadow-sm"
                >
                  동의하고 계속하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

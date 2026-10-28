export interface KBOYouTubeChannel {
  teamId: string;
  channelName: string;
  handle: string;
  url: string;
  subscribers: string;
  description: string;
  videoTags: string[];
  popularVideoTitle?: string;
}

export interface KBOGoodsItem {
  id: string;
  name: string;
  price: string;
  category: '유니폼' | '모자' | '응원용품' | '잡화' | '의류';
  tag?: string;
  emoji: string;
}

export interface KBOShopInfo {
  teamId: string;
  storeName: string;
  storeSubtitle: string;
  storeUrl: string;
  stadiumShop: string;
  featuredCategories: string[];
  bestItems: KBOGoodsItem[];
}

export const KBO_YOUTUBE_CHANNELS: KBOYouTubeChannel[] = [
  {
    teamId: 'kia',
    channelName: 'KIA타이거즈_KIA TIGERS (갸티비)',
    handle: '@kiatigers',
    url: 'https://www.youtube.com/@kiatigers',
    subscribers: '32.4만명',
    description: 'KIA 타이거즈 공식 유튜브 갸티비! 선수단 비하인드, 덕아웃캠, 퇴근길 직캠, 하이라이트',
    videoTags: ['경기 하이라이트', '덕아웃캠', '퇴근길 직캠', '호걸이 브이로그'],
    popularVideoTitle: '2026 시즌 개막전 덕아웃 비하인드 & 승리 퇴근길 라이브'
  },
  {
    teamId: 'samsung',
    channelName: 'LionsTV_라이온즈tv',
    handle: '@LionsTV_Samsung',
    url: 'https://www.youtube.com/@LionsTV_Samsung',
    subscribers: '29.8만명',
    description: '삼성 라이온즈 공식 유튜브 채널! 락커룸 토크와 훈련 영상, 블레오 패밀리 스토리',
    videoTags: ['퇴근길 라이브', '블레오패밀리', '훈련 캠', '하이라이트'],
    popularVideoTitle: '라팍의 푸른 함성! 끝내기 승리 순간의 더그아웃 직캠'
  },
  {
    teamId: 'lg',
    channelName: 'LGTWINSTV_엘지트윈스TV',
    handle: '@LGTWINSTV',
    url: 'https://www.youtube.com/@LGTWINSTV',
    subscribers: '30.1만명',
    description: 'LG 트윈스 공식 유튜브 채널! 무적LG 경기 직캠, 팬터뷰, 덕아웃 1열 스토리',
    videoTags: ['무적LG 직캠', '팬터뷰', '더그아웃 1열', '주간 MVP'],
    popularVideoTitle: '잠실더비 승리! 선수단 전체 락커룸 샴페인 토크'
  },
  {
    teamId: 'doosan',
    channelName: 'BEARS TV_베어스포티비',
    handle: '@doosanbears1982',
    url: 'https://www.youtube.com/@doosanbears1982',
    subscribers: '28.5만명',
    description: '두산 베어스 공식 유튜브 채널 베어스티비! 잠실의 승리 함성과 철웅이 스토리',
    videoTags: ['승리 직캠', '철웅스토리', '베어스 토크', '덕아웃 현장'],
    popularVideoTitle: '허슬두 본능! 9회말 대역전 드라마와 승리 세리머니'
  },
  {
    teamId: 'kt',
    channelName: 'kt wiz_위즈tv',
    handle: '@ktwiz',
    url: 'https://www.youtube.com/@ktwiz',
    subscribers: '16.9만명',
    description: 'kt wiz 프로야구단 공식 유튜브 채널! 마법 같은 경기 하이라이트와 선수 인터뷰',
    videoTags: ['위즈 인터뷰', '매직 모먼트', '빅또리 캠', '락커룸 비하인드'],
    popularVideoTitle: '마법 같은 끝내기 홈런! 위즈파크 현장 풀캠 비하인드'
  },
  {
    teamId: 'ssg',
    channelName: '쓱튜브_SSG LANDERS',
    handle: '@ssglanders',
    url: 'https://www.youtube.com/@ssglanders',
    subscribers: '21.2만명',
    description: 'SSG 랜더스 공식 유튜브 쓱튜브! 랜더스필드 현장 스케치와 으쓱이들을 위한 콘텐츠',
    videoTags: ['랜디의 하루', '으쓱 직캠', '인천 홈경기 비하인드', '선수단 밀착'],
    popularVideoTitle: '빅토리 랜더스! 랜디와 함께하는 경기 후 그라운드 페스티벌'
  },
  {
    teamId: 'lotte',
    channelName: '자이언츠TV_Giants TV',
    handle: '@giantstv',
    url: 'https://www.youtube.com/@giantstv',
    subscribers: '31.5만명',
    description: '롯데 자이언츠 공식 유튜브 채널! 사직구장의 뜨거운 열기와 거인들의 승리 스토리',
    videoTags: ['사직의 열기', '자이언츠 직캠', '거인들의 훈련', '응원가 떼창'],
    popularVideoTitle: '사직노래방 폭발! 2만 3천 팬들의 떼창과 승리의 하이파이브'
  },
  {
    teamId: 'hanwha',
    channelName: 'Eagles TV_이글스TV',
    handle: '@EaglesTV',
    url: 'https://www.youtube.com/@EaglesTV',
    subscribers: '35.8만명',
    description: '한화 이글스 공식 유튜브 이글스TV! 불꽃한화 경기 하이라이트와 수리마스코트 이야기',
    videoTags: ['불꽃 모먼트', '수리의 방', '대전 직캠', '선수단 밀착캠'],
    popularVideoTitle: '수리도 울고 갈 감동의 승리! 선수단 퇴근길 인터뷰 전격 공개'
  },
  {
    teamId: 'nc',
    channelName: 'NC 다이노스_NC Dinos',
    handle: '@ncdinos',
    url: 'https://www.youtube.com/@ncdinos',
    subscribers: '14.2만명',
    description: 'NC 다이노스 공식 유튜브 채널! 창원NC파크 거침없는 공룡들의 그라운드 리포트',
    videoTags: ['공룡 리포트', '창원파크 캠', '단디쎄리', '선수 인터뷰'],
    popularVideoTitle: '엔팍의 밤을 수놓은 승리 세리머니 & 단디의 깜짝 습격'
  },
  {
    teamId: 'kiwoom',
    channelName: '히어로즈TV_Heroes TV',
    handle: '@heroesbaseballclub',
    url: 'https://www.youtube.com/@heroesbaseballclub',
    subscribers: '17.8만명',
    description: '키움 히어로즈 공식 유튜브 채널 히어로즈TV! 고척스카이돔 훈련과 영웅들의 도전',
    videoTags: ['영웅들의 순간', '고척돔 직캠', '더그아웃 톡', '경기 클립'],
    popularVideoTitle: '고척돔을 뒤흔든 캡틴의 결승타! 덕아웃 캠에 담긴 전율'
  }
];

export const KBO_SHOPS_DATA: Record<string, KBOShopInfo> = {
  kia: {
    teamId: 'kia',
    storeName: 'KIA 타이거즈 공식 팀스토어',
    storeSubtitle: 'KIA Tigers Official Team Store',
    storeUrl: 'https://teamstore.kiatigers.co.kr/',
    stadiumShop: '광주-기아 챔피언스 필드 3루 및 중앙 출입구 메인 팀스토어 (경기 시작 2시간 30분 전 오픈)',
    featuredCategories: ['2026 어센틱 유니폼', '선수 마킹지', '온필드 캡', '호걸이 굿즈', '응원도구'],
    bestItems: [
      { id: 'kia-1', name: '2026 어센틱 홈/원정 유니폼', price: '139,000원', category: '유니폼', tag: 'BEST', emoji: '👕' },
      { id: 'kia-2', name: '프로페셔널 온필드 캡', price: '39,000원', category: '모자', tag: '인기', emoji: '🧢' },
      { id: 'kia-3', name: '호걸이 마스코트 봉제인형', price: '28,000원', category: '잡화', tag: '추천', emoji: '🐯' },
      { id: 'kia-4', name: 'LED 호랑이 응원봉 세트', price: '18,000원', category: '응원용품', tag: '필수', emoji: '🪄' },
      { id: 'kia-5', name: '선수 배번 자수 마킹 패치', price: '20,000원', category: '잡화', tag: '선택', emoji: '🏷️' },
      { id: 'kia-6', name: '챔피언스필드 그래픽 슬로건 타올', price: '12,000원', category: '응원용품', tag: '인기', emoji: '🧣' }
    ]
  },
  samsung: {
    teamId: 'samsung',
    storeName: '삼성 라이온즈 온라인 몰',
    storeSubtitle: 'Samsung Lions Official Online Mall',
    storeUrl: 'https://samsunglionsmall.com/',
    stadiumShop: '대구 삼성 라이온즈 파크 3루 전면 라이온즈 메인 팀스토어',
    featuredCategories: ['블루클래식 유니폼', '블레오 패밀리', '스냅백', '응원타올', '야구공'],
    bestItems: [
      { id: 'samsung-1', name: '블루클래식 어센틱 유니폼', price: '135,000원', category: '유니폼', tag: 'BEST', emoji: '👕' },
      { id: 'samsung-2', name: '블레오 마스코트 키링', price: '15,000원', category: '잡화', tag: '인기', emoji: '🦁' },
      { id: 'samsung-3', name: '사자후 블루 응원 타올', price: '12,000원', category: '응원용품', tag: '필수', emoji: '🧣' },
      { id: 'samsung-4', name: '라이온즈 클래식 SL 볼캡', price: '37,000원', category: '모자', tag: '추천', emoji: '🧢' },
      { id: 'samsung-5', name: '라팍 미니 마스코트 인형 세트', price: '32,000원', category: '잡화', tag: '한정', emoji: '🦁' },
      { id: 'samsung-6', name: '선동열/이승엽 레전드 기념구', price: '19,000원', category: '잡화', tag: '소장', emoji: '⚾' }
    ]
  },
  lg: {
    teamId: 'lg',
    storeName: 'LG 트윈스 팀스토어 (트윈스로커)',
    storeSubtitle: 'LG Twins Official Store',
    storeUrl: 'https://twinslocker.co.kr/',
    stadiumShop: '서울 잠실야구장 1루 내야 출입구 및 중앙 트윈스샵',
    featuredCategories: ['스트라이프 유니폼', '프로스펙스 콜라보', '트윈스 볼캡', '응원도구'],
    bestItems: [
      { id: 'lg-1', name: '무적LG 스트라이프 어센틱 유니폼', price: '142,000원', category: '유니폼', tag: 'BEST', emoji: '👕' },
      { id: 'lg-2', name: '프로스펙스 트윈스 트랙탑 자켓', price: '89,000원', category: '의류', tag: '인기', emoji: '🧥' },
      { id: 'lg-3', name: '무적LG 트윈스 LED 응원봉', price: '20,000원', category: '응원용품', tag: '필수', emoji: '🪄' },
      { id: 'lg-4', name: '럭키스타 캐릭터 미니 인형', price: '25,000원', category: '잡화', tag: '추천', emoji: '⭐' },
      { id: 'lg-5', name: '잠실 홈경기 클래식 로고 캡', price: '39,000원', category: '모자', tag: '인기', emoji: '🧢' },
      { id: 'lg-6', name: '서울의 자존심 유니폼 키링', price: '11,000원', category: '잡화', tag: '선물', emoji: '🔑' }
    ]
  },
  doosan: {
    teamId: 'doosan',
    storeName: '두산 베어스 위팬 (WeFan) 공식몰',
    storeSubtitle: 'Doosan Bears Official WeFan Store',
    storeUrl: 'https://wefan.co.kr/',
    stadiumShop: '서울 잠실야구장 1루 베어스하우스 및 위팬 전용 스토어',
    featuredCategories: ['허슬두 어센틱 유니폼', '올드 레트로', '철웅이 굿즈', '뉴에라 캡'],
    bestItems: [
      { id: 'doosan-1', name: '팀 두산 어센틱 홈 유니폼', price: '139,000원', category: '유니폼', tag: 'BEST', emoji: '👕' },
      { id: 'doosan-2', name: '두산 올드 클래식 레트로 유니폼', price: '129,000원', category: '유니폼', tag: '레트로', emoji: '👕' },
      { id: 'doosan-3', name: '철웅이 페이스 쿠션', price: '26,000원', category: '잡화', tag: '인기', emoji: '🐻' },
      { id: 'doosan-4', name: '허슬두 V 응원배트 세트', price: '9,000원', category: '응원용품', tag: '필수', emoji: '🏏' },
      { id: 'doosan-5', name: '네이비 오리지널 매치데이 볼캡', price: '38,000원', category: '모자', tag: '추천', emoji: '🧢' },
      { id: 'doosan-6', name: '두산 베어스 로고 에코백', price: '18,000원', category: '잡화', tag: '인기', emoji: '👜' }
    ]
  },
  kt: {
    teamId: 'kt',
    storeName: 'kt wiz 공식 온라인 스토어',
    storeSubtitle: 'kt wiz Official Store',
    storeUrl: 'https://www.ktwizstore.co.kr/',
    stadiumShop: '수원 kt 위즈 파크 1루 위즈샵 및 외야 게이트 매장',
    featuredCategories: ['빅또리 매직 유니폼', '어센틱 캡', '마법사 굿즈', '응원도구'],
    bestItems: [
      { id: 'kt-1', name: '2026 kt wiz 정규 어센틱 유니폼', price: '130,000원', category: '유니폼', tag: 'BEST', emoji: '👕' },
      { id: 'kt-2', name: '빅&또리 마스코트 인형 세트', price: '32,000원', category: '잡화', tag: '인기', emoji: '🧙' },
      { id: 'kt-3', name: '위즈파크 응원 깃발', price: '12,000원', category: '응원용품', tag: '추천', emoji: '🚩' },
      { id: 'kt-4', name: '위즈 심볼 어센틱 온필드 캡', price: '38,000원', category: '모자', tag: '필수', emoji: '🧢' },
      { id: 'kt-5', name: '마법사 매직 슬로건 머플러', price: '15,000원', category: '응원용품', tag: '인기', emoji: '🧣' },
      { id: 'kt-6', name: '빅&또리 스마트폰 그립톡', price: '14,000원', category: '잡화', tag: '귀염', emoji: '📱' }
    ]
  },
  ssg: {
    teamId: 'ssg',
    storeName: 'SSG 랜더스 공식 온라인 샵 (SSG.COM)',
    storeSubtitle: 'SSG Landers Official Store',
    storeUrl: 'https://www.ssglanders.com/',
    stadiumShop: '인천 SSG 랜더스필드 1루 및 3루 랜더스샵 메인 스토어',
    featuredCategories: ['레드 랜더스 어센틱 유니폼', '랜디 굿즈', '스타벅스 에디션', '응원타올'],
    bestItems: [
      { id: 'ssg-1', name: '어센틱 홈 화이트/레드 유니폼', price: '140,000원', category: '유니폼', tag: 'BEST', emoji: '👕' },
      { id: 'ssg-2', name: '랜디 대형 마스코트 인형', price: '29,000원', category: '잡화', tag: '인기', emoji: '🐶' },
      { id: 'ssg-3', name: 'SSG 랜더스 클래식 볼캡', price: '39,000원', category: '모자', tag: '추천', emoji: '🧢' },
      { id: 'ssg-4', name: '랜더스 응원 머플러 타올', price: '16,000원', category: '응원용품', tag: '필수', emoji: '🧣' },
      { id: 'ssg-5', name: '랜디 실리콘 에어팟 케이스', price: '15,000원', category: '잡화', tag: '인기', emoji: '🎧' },
      { id: 'ssg-6', name: '인천 랜더스필드 기념 엠블럼볼', price: '18,000원', category: '잡화', tag: '소장', emoji: '⚾' }
    ]
  },
  lotte: {
    teamId: 'lotte',
    storeName: '롯데 자이언츠 공식 온라인 몰',
    storeSubtitle: 'Lotte Giants Official Online Mall',
    storeUrl: 'https://www.giantsclub.com/',
    stadiumShop: '부산 사직야구장 광장 자이언츠 메인샵 (경기 3시간 전 오픈)',
    featuredCategories: ['동백 유니폼', '챔피언 홈 유니폼', '사직 굿즈', '짝짝이 응원봉'],
    bestItems: [
      { id: 'lotte-1', name: '자이언츠 동백 스페셜 유니폼', price: '139,000원', category: '유니폼', tag: 'BEST', emoji: '👕' },
      { id: 'lotte-2', name: '챔피언 정규 홈 유니폼', price: '135,000원', category: '유니폼', tag: '인기', emoji: '👕' },
      { id: 'lotte-3', name: '사직 클래식 짝짝이 응원봉', price: '8,000원', category: '응원용품', tag: '필수', emoji: '👏' },
      { id: 'lotte-4', name: '자이언츠 심볼 네이비 온필드 캡', price: '38,000원', category: '모자', tag: '추천', emoji: '🧢' },
      { id: 'lotte-5', name: '누리 마스코트 헤어밴드 머리띠', price: '13,000원', category: '응원용품', tag: '인기', emoji: '🎀' },
      { id: 'lotte-6', name: '부산갈매기 클래식 응원 타올', price: '12,000원', category: '응원용품', tag: '추천', emoji: '🧣' }
    ]
  },
  hanwha: {
    teamId: 'hanwha',
    storeName: '한화 이글스샵 (Eagles Shop)',
    storeSubtitle: 'Hanwha Eagles Official Online Shop',
    storeUrl: 'https://eaglesshop.kr/',
    stadiumShop: '대전 한화생명 이글스파크 1루 내야 및 외야 이글스샵',
    featuredCategories: ['오렌지/다크그레이 유니폼', '수리 캐릭터 굿즈', '스냅백', '불꽃 응원봉'],
    bestItems: [
      { id: 'hanwha-1', name: '어센틱 오렌지/다크그레이 유니폼', price: '135,000원', category: '유니폼', tag: 'BEST', emoji: '👕' },
      { id: 'hanwha-2', name: '수리 대형 봉제인형', price: '30,000원', category: '잡화', tag: '인기', emoji: '🦅' },
      { id: 'hanwha-3', name: '불꽃한화 오렌지 응원타올', price: '13,000원', category: '응원용품', tag: '필수', emoji: '🧣' },
      { id: 'hanwha-4', name: '이글스 레터링 온필드 캡', price: '37,000원', category: '모자', tag: '추천', emoji: '🧢' },
      { id: 'hanwha-5', name: '수리 아크릴 스탠드 키링', price: '9,000원', category: '잡화', tag: '귀염', emoji: '🔑' },
      { id: 'hanwha-6', name: '최강한화 LED 응원스틱 세트', price: '15,000원', category: '응원용품', tag: '인기', emoji: '🪄' }
    ]
  },
  nc: {
    teamId: 'nc',
    storeName: 'NC 다이노스 라커디움 샵',
    storeSubtitle: 'NC Dinos Official Online Store',
    storeUrl: 'https://www.ncdinos.com/',
    stadiumShop: '창원NC파크 1루 다이노스 팀스토어 메인 매장',
    featuredCategories: ['골드/네이비 어센틱 유니폼', '단디&쎄리 인형', '다이노스 캡', '응원단디봉'],
    bestItems: [
      { id: 'nc-1', name: '2026 어센틱 정규 유니폼', price: '135,000원', category: '유니폼', tag: 'BEST', emoji: '👕' },
      { id: 'nc-2', name: '단디 마스코트 가방고리 키링', price: '14,000원', category: '잡화', tag: '인기', emoji: '🦕' },
      { id: 'nc-3', name: 'NC 심볼 어센틱 매치 캡', price: '38,000원', category: '모자', tag: '추천', emoji: '🧢' },
      { id: 'nc-4', name: '거침없는 공룡 단디 응원봉', price: '15,000원', category: '응원용품', tag: '필수', emoji: '🪄' },
      { id: 'nc-5', name: '엔팍 다이노스 레터링 후드티', price: '79,000원', category: '의류', tag: '인기', emoji: '🧥' },
      { id: 'nc-6', name: '창원NC파크 기념 포토카드 바인더', price: '19,000원', category: '잡화', tag: '추천', emoji: '📒' }
    ]
  },
  kiwoom: {
    teamId: 'kiwoom',
    storeName: '키움 히어로즈 인터파크 공식샵',
    storeSubtitle: 'Kiwoom Heroes Official Shop',
    storeUrl: 'https://ticket.interpark.com/',
    stadiumShop: '서울 고척스카이돔 2층 내야 히어로즈 샵',
    featuredCategories: ['버건디 어센틱 유니폼', '턱돌이/동글이 굿즈', '히어로즈 캡', '응원스틱'],
    bestItems: [
      { id: 'kiwoom-1', name: '어센틱 버건디 홈 유니폼', price: '135,000원', category: '유니폼', tag: 'BEST', emoji: '👕' },
      { id: 'kiwoom-2', name: '동글이 마스코트 봉제 키링', price: '13,000원', category: '잡화', tag: '인기', emoji: '🦸' },
      { id: 'kiwoom-3', name: '히어로즈 버건디 온필드 볼캡', price: '36,000원', category: '모자', tag: '추천', emoji: '🧢' },
      { id: 'kiwoom-4', name: '영웅의 응원 슬로건 타올', price: '12,000원', category: '응원용품', tag: '필수', emoji: '🧣' },
      { id: 'kiwoom-5', name: '고척돔 영웅의 V 응원배트', price: '8,000원', category: '응원용품', tag: '필수', emoji: '🏏' },
      { id: 'kiwoom-6', name: '히어로즈 플레이어 메탈 뱃지 세트', price: '16,000원', category: '잡화', tag: '소장', emoji: '🎖️' }
    ]
  }
};

export interface TeamStoreLink {
  title: string;
  url: string;
  category: string;
  description: string;
}

export const TEAM_STORE_LINKS: Record<string, TeamStoreLink[]> = {
  lg: [
    {
      title: '엘지 트윈스 어패럴샵',
      url: 'https://www.lgtwins.com/shop',
      category: '어패럴',
      description: '어센틱 유니폼 & 공식 어패럴 컬렉션'
    },
    {
      title: '엘지 트윈스 팀스토어',
      url: 'https://interparkmdshop.com/category/LG%ED%8A%B8%EC%9C%88%EC%8A%A4/31/',
      category: '팀스토어',
      description: '인터파크 공식 MD 팀스토어'
    },
    {
      title: '엘지 트윈스 콜랩샵',
      url: 'https://www.twinscorestore.co.kr/',
      category: '콜랩샵',
      description: '트윈스 코어 스토어 & 단독 콜라보레이션'
    },
    {
      title: '엘지 트윈스 야구용품샵',
      url: 'https://www.goldballpark.co.kr/',
      category: '야구용품',
      description: '골드볼파크 공식 야구용품관'
    },
    {
      title: '엘지 트윈스 1993스튜디오 콜라보샵',
      url: 'https://1993studio.com/product/list.html?cate_no=186',
      category: '콜라보',
      description: '1993스튜디오 X LG 트윈스 빈티지 패션'
    },
    {
      title: '엘지 트윈스 키니키니 콜라보샵',
      url: 'https://kinikini.co.kr/category/%ED%82%A4%EB%8B%88%ED%82%A4%EB%8B%88-x-lg-%ED%8A%B8%EC%9C%88%EC%8A%A4/93/',
      category: '콜라보',
      description: '키니키니 X LG 트윈스 라이프스타일 굿즈'
    }
  ],
  doosan: [
    {
      title: '두산 베어스 공식 온라인 스토어 (위팬)',
      url: 'https://doosanbearswefan.shop/',
      category: '공식샵',
      description: '위팬 공식 온라인 스토어 (어센틱 유니폼 & 마킹)'
    },
    {
      title: '두산 베어스 놀샵',
      url: 'https://interparkmdshop.com/category/%EB%91%90%EC%82%B0%EB%B2%A0%EC%96%B4%EC%8A%A4/30/',
      category: '놀샵',
      description: '인터파크 MD 놀샵 (레플리카 유니폼 & 철웅이 굿즈)'
    }
  ],
  kia: [
    {
      title: '기아 타이거즈 팀 스토어',
      url: 'https://teamstore.tigers.co.kr/',
      category: '팀스토어',
      description: 'KIA 타이거즈 공식 팀스토어'
    }
  ],
  samsung: [
    {
      title: '삼성 라이온즈 어패럴샵',
      url: 'https://www.samsunglionsauthentic.shop/',
      category: '어패럴',
      description: '삼성 라이온즈 공식 온필드 어센틱 어패럴'
    },
    {
      title: '삼성 라이온즈 팀 스토어',
      url: 'https://shop.berriz.in/ko/samsunglions?t_ch=internal&t_obj=260220_SL_H&t_src=infomail',
      category: '팀스토어',
      description: '베리즈 공식 라이온즈 팀스토어'
    }
  ],
  lotte: [
    {
      title: '롯데 자이언츠 팀 스토어',
      url: 'https://www.lotteon.com/p/display/seller/sellerShop/lottegiants?ch_no=101509&ch_dtl_no=1049592',
      category: '팀스토어',
      description: '롯데ON 자이언츠 공식 셀러샵'
    }
  ],
  ssg: [
    {
      title: 'SSG 랜더스 팀 스토어',
      url: 'https://landers.family.ssg.com/',
      category: '팀스토어',
      description: 'SSG.COM 공식 패밀리 랜더스 스토어'
    }
  ],
  nc: [
    {
      title: 'NC 다이노스 팀 스토어',
      url: 'https://store.ncdinos.com/',
      category: '팀스토어',
      description: 'NC 다이노스 공식 팀스토어'
    }
  ],
  hanwha: [
    {
      title: '한화 이글스 공식샵',
      url: 'https://www.hanwhaeagles.co.kr/SH/PCSH01.do',
      category: '공식샵',
      description: '한화 이글스 공식 온라인 샵'
    }
  ],
  kt: [
    {
      title: 'KT 위즈 공식샵',
      url: 'https://www.ktwizstore.co.kr/',
      category: '공식샵',
      description: 'KT 위즈 공식 온라인 스토어'
    }
  ],
  kiwoom: [
    {
      title: '키움 히어로즈 공식샵',
      url: 'https://ticket.interpark.com/',
      category: '공식샵',
      description: '인터파크 공식 키움 히어로즈 MD 샵'
    }
  ]
};


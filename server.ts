import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import * as cheerio from "cheerio";
import { 
  initializeDatabase, 
  saveTeamStandings, 
  getTeamStandingsFromDb, 
  savePlayerRankings, 
  getPlayerRankingsFromDb 
} from "./server-db";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // MySQL 설정이 되어 있다면 데이터베이스 테이블 초기화
  await initializeDatabase();

  // 메모리 캐시
  let rankingsCache: any = null;
  let cacheTime: number = 0;
  let teamCache: any[] | null = null;
  let teamCacheTime: number = 0;
  const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes cache for aggressive accuracy but low server load
  const LONG_CACHE_DURATION = 60 * 60 * 1000; 

  // Baseline database backup
  const fallbackRankings = {
    batter: [
      {
        key: "avg",
        players: [
          { rank: 1, name: "김도영", teamId: "kia", value: ".362" },
          { rank: 2, name: "구자욱", teamId: "samsung", value: ".348" },
          { rank: 3, name: "레이예스", teamId: "lotte", value: ".341" },
          { rank: 4, name: "홍창기", teamId: "lg", value: ".335" },
          { rank: 5, name: "김혜성", teamId: "kiwoom", value: ".331" },
          { rank: 6, name: "에레디아", teamId: "ssg", value: ".328" },
          { rank: 7, name: "허경민", teamId: "doosan", value: ".324" },
          { rank: 8, name: "박민우", teamId: "nc", value: ".319" },
          { rank: 9, name: "페라자", teamId: "hanwha", value: ".312" },
          { rank: 10, name: "강백호", teamId: "kt", value: ".308" },
          { rank: 11, name: "최형우", teamId: "kia", value: ".305" },
          { rank: 12, name: "양의지", teamId: "doosan", value: ".302" },
          { rank: 13, name: "문성주", teamId: "lg", value: ".301" },
          { rank: 14, name: "손아섭", teamId: "nc", value: ".298" },
          { rank: 15, name: "박건우", teamId: "nc", value: ".295" },
          { rank: 16, name: "황재균", teamId: "kt", value: ".292" },
          { rank: 17, name: "김선빈", teamId: "kia", value: ".291" },
          { rank: 18, name: "이우성", teamId: "kia", value: ".289" },
          { rank: 19, name: "송성문", teamId: "kiwoom", value: ".287" },
          { rank: 20, name: "정수빈", teamId: "doosan", value: ".285" },
        ],
      },
      {
        key: "hr",
        players: [
          { rank: 1, name: "데이비슨", teamId: "nc", value: "17개" },
          { rank: 2, name: "최정", teamId: "ssg", value: "15개" },
          { rank: 3, name: "김도영", teamId: "kia", value: "14개" },
          { rank: 4, name: "노시환", teamId: "hanwha", value: "12개" },
          { rank: 5, name: "강백호", teamId: "kt", value: "11개" },
          { rank: 6, name: "양석환", teamId: "doosan", value: "10개" },
          { rank: 7, name: "오스틴", teamId: "lg", value: "9개" },
          { rank: 8, name: "박병호", teamId: "samsung", value: "8개" },
          { rank: 9, name: "레이예스", teamId: "lotte", value: "7개" },
          { rank: 10, name: "송성문", teamId: "kiwoom", value: "6개" },
          { rank: 11, name: "김재환", teamId: "doosan", value: "6개" },
          { rank: 12, name: "페라자", teamId: "hanwha", value: "5개" },
          { rank: 13, name: "박동원", teamId: "lg", value: "5개" },
          { rank: 14, name: "문상철", teamId: "kt", value: "5개" },
          { rank: 15, name: "구자욱", teamId: "samsung", value: "4개" },
          { rank: 16, name: "한유섬", teamId: "ssg", value: "4개" },
          { rank: 17, name: "김형준", teamId: "nc", value: "4개" },
          { rank: 18, name: "전준우", teamId: "lotte", value: "3개" },
          { rank: 19, name: "나성범", teamId: "kia", value: "3개" },
          { rank: 20, name: "최형우", teamId: "kia", value: "3개" },
        ],
      },
      {
        key: "rbi",
        players: [
          { rank: 1, name: "강백호", teamId: "kt", value: "48점" },
          { rank: 2, name: "김도영", teamId: "kia", value: "45점" },
          { rank: 3, name: "구자욱", teamId: "samsung", value: "43점" },
          { rank: 4, name: "송성문", teamId: "kiwoom", value: "41점" },
          { rank: 5, name: "양의지", teamId: "doosan", value: "39점" },
          { rank: 6, name: "오스틴", teamId: "lg", value: "38점" },
          { rank: 7, name: "에레디아", teamId: "ssg", value: "36점" },
          { rank: 8, name: "노시환", teamId: "hanwha", value: "34점" },
          { rank: 9, name: "데이비슨", teamId: "nc", value: "32점" },
          { rank: 10, name: "레이예스", teamId: "lotte", value: "31점" },
          { rank: 11, name: "최형우", teamId: "kia", value: "30점" },
          { rank: 12, name: "김선빈", teamId: "kia", value: "29점" },
          { rank: 13, name: "홍창기", teamId: "lg", value: "28점" },
          { rank: 14, name: "김혜성", teamId: "kiwoom", value: "27점" },
          { rank: 15, name: "채은성", teamId: "hanwha", value: "26점" },
          { rank: 16, name: "양석환", teamId: "doosan", value: "25점" },
          { rank: 17, name: "박건우", teamId: "nc", value: "24점" },
          { rank: 18, name: "김재환", teamId: "doosan", value: "23점" },
          { rank: 19, name: "최인호", teamId: "hanwha", value: "22점" },
          { rank: 20, name: "문상철", teamId: "kt", value: "21점" },
        ],
      },
    ],
    pitcher: [
      {
        key: "era",
        players: [
          { rank: 1, name: "네일", teamId: "kia", value: "2.24" },
          { rank: 2, name: "하트", teamId: "nc", value: "2.51" },
          { rank: 3, name: "헤이수스", teamId: "kiwoom", value: "2.78" },
          { rank: 4, name: "원태인", teamId: "samsung", value: "2.89" },
          { rank: 5, name: "류현진", teamId: "hanwha", value: "3.12" },
          { rank: 6, name: "쿠에바스", teamId: "kt", value: "3.28" },
          { rank: 7, name: "엔스", teamId: "lg", value: "3.45" },
          { rank: 8, name: "알칸타라", teamId: "doosan", value: "3.55" },
          { rank: 9, name: "김광현", teamId: "ssg", value: "3.71" },
          { rank: 10, name: "반즈", teamId: "lotte", value: "3.82" },
          { rank: 11, name: "양현종", teamId: "kia", value: "3.89" },
          { rank: 12, name: "엘리아스", teamId: "ssg", value: "3.98" },
          { rank: 13, name: "임찬규", teamId: "lg", value: "4.05" },
          { rank: 14, name: "곽빈", teamId: "doosan", value: "4.12" },
          { rank: 15, name: "신민혁", teamId: "nc", value: "4.21" },
          { rank: 16, name: "엄상백", teamId: "kt", value: "4.35" },
          { rank: 17, name: "페디", teamId: "nc", value: "4.41" },
          { rank: 18, name: "이의리", teamId: "kia", value: "4.48" },
          { rank: 19, name: "박세웅", teamId: "lotte", value: "4.55" },
          { rank: 20, name: "후라도", teamId: "kiwoom", value: "4.62" },
        ],
      },
      {
        key: "win",
        players: [
          { rank: 1, name: "원태인", teamId: "samsung", value: "8승" },
          { rank: 2, name: "헤이수스", teamId: "kiwoom", value: "7승" },
          { rank: 3, name: "곽빈", teamId: "doosan", value: "7승" },
          { rank: 4, name: "네일", teamId: "kia", value: "6승" },
          { rank: 5, name: "쿠에바스", teamId: "kt", value: "6승" },
          { rank: 6, name: "하트", teamId: "nc", value: "5승" },
          { rank: 7, name: "김광현", teamId: "ssg", value: "5승" },
          { rank: 8, name: "엔스", teamId: "lg", value: "5승" },
          { rank: 9, name: "류현진", teamId: "hanwha", value: "4승" },
          { rank: 10, name: "윌커슨", teamId: "lotte", value: "4승" },
          { rank: 11, name: "임찬규", teamId: "lg", value: "4승" },
          { rank: 12, name: "박세웅", teamId: "lotte", value: "3승" },
          { rank: 13, name: "양현종", teamId: "kia", value: "3승" },
          { rank: 14, name: "신민혁", teamId: "nc", value: "3승" },
          { rank: 15, name: "윤영철", teamId: "kia", value: "3승" },
          { rank: 16, name: "카스티야", teamId: "samsung", value: "3승" },
          { rank: 17, name: "와이스", teamId: "hanwha", value: "2승" },
          { rank: 18, name: "브랜든", teamId: "doosan", value: "2승" },
          { rank: 19, name: "서진용", teamId: "ssg", value: "2승" },
          { rank: 20, name: "고영표", teamId: "kt", value: "2승" },
        ],
      },
      {
        key: "sv",
        players: [
          { rank: 1, name: "오승환", teamId: "samsung", value: "16세" },
          { rank: 2, name: "정해영", teamId: "kia", value: "15세" },
          { rank: 3, name: "주현상", teamId: "hanwha", value: "12세" },
          { rank: 4, name: "유영찬", teamId: "lg", value: "11세" },
          { rank: 5, name: "김택연", teamId: "doosan", value: "9세" },
          { rank: 6, name: "김재윤", teamId: "ssg", value: "8세" },
          { rank: 7, name: "박영현", teamId: "kt", value: "7세" },
          { rank: 8, name: "김원중", teamId: "lotte", value: "6세" },
          { rank: 9, name: "이용찬", teamId: "nc", value: "5세" },
          { rank: 10, name: "조상우", teamId: "kiwoom", value: "4세" },
          { rank: 11, name: "서진용", teamId: "ssg", value: "4세" },
          { rank: 12, name: "임창민", teamId: "samsung", value: "3세" },
          { rank: 13, name: "노경은", teamId: "ssg", value: "3세" },
          { rank: 14, name: "김태훈", teamId: "kiwoom", value: "2세" },
          { rank: 15, name: "장현식", teamId: "kia", value: "2세" },
          { rank: 16, name: "김민", teamId: "kt", value: "2세" },
          { rank: 17, name: "최지민", teamId: "kia", value: "1세" },
          { rank: 18, name: "이우찬", teamId: "lg", value: "1세" },
          { rank: 19, name: "우규민", teamId: "kt", value: "1세" },
          { rank: 20, name: "김상수", teamId: "lotte", value: "1세" },
        ],
      },
    ],
  };

  // ----------------------------------------------------
  // KBO 공식 홈페이지 실시간 직접 크롤러
  // ----------------------------------------------------
  const mapTeamId = (kName: string): string => {
    const k = kName.trim();
    if (k.includes("삼성")) return "samsung";
    if (k.includes("KIA") || k.includes("기아") || k.toUpperCase().includes("KIA")) return "kia";
    if (k.includes("LG") || k.includes("엘지") || k.toUpperCase().includes("LG")) return "lg";
    if (k.includes("두산")) return "doosan";
    if (k.includes("KT") || k.includes("케이티") || k.toUpperCase().includes("KT")) return "kt";
    if (k.includes("SSG") || k.includes("에스에스지") || k.toUpperCase().includes("SSG")) return "ssg";
    if (k.includes("롯데")) return "lotte";
    if (k.includes("한화")) return "hanwha";
    if (k.includes("NC") || k.includes("엔씨") || k.toUpperCase().includes("NC")) return "nc";
    if (k.includes("키움")) return "kiwoom";
    return "samsung";
  };

  async function crawlKboRankings() {
    console.log("Crawling real-time KBO player rankings from Top5.aspx...");
    const url = "https://www.koreabaseball.com/Record/Ranking/Top5.aspx";
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://www.koreabaseball.com/",
      }
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error fetching Top5.aspx! status: ${res.status}`);
    }
    const html = await res.text();
    const $ = cheerio.load(html);

    const result: {
      batter: { key: string; players: any[] }[];
      pitcher: { key: string; players: any[] }[];
    } = {
      batter: [
        { key: "avg", players: [] },
        { key: "hr", players: [] },
        { key: "rbi", players: [] }
      ],
      pitcher: [
        { key: "era", players: [] },
        { key: "win", players: [] },
        { key: "sv", players: [] }
      ]
    };

    const blocks = $('div.record_list');
    if (blocks.length < 2) {
      throw new Error("Could not locate hitter/pitcher blocks on KBO ranking page");
    }

    // 1. 타자 처리 (블록 0)
    const hitterBlock = blocks.eq(0);
    const hitterLists = hitterBlock.find('.list');
    
    // 타율 (인덱스 0)
    if (hitterLists.length > 0) {
      hitterLists.eq(0).find('ol.rankList li').each((idx, li) => {
        const name = $(li).find('.name').text().trim();
        const team = $(li).find('.team').text().trim();
        const value = $(li).find('.record').text().trim();
        if (name) {
          result.batter[0].players.push({
            rank: idx + 1,
            name,
            teamId: mapTeamId(team),
            value
          });
        }
      });
    }

    // 홈런 (인덱스 1)
    if (hitterLists.length > 1) {
      hitterLists.eq(1).find('ol.rankList li').each((idx, li) => {
        const name = $(li).find('.name').text().trim();
        const team = $(li).find('.team').text().trim();
        const value = $(li).find('.record').text().trim();
        if (name) {
          result.batter[1].players.push({
            rank: idx + 1,
            name,
            teamId: mapTeamId(team),
            value: value.includes('개') ? value : `${value}개`
          });
        }
      });
    }

    // 타점 (인덱스 2)
    if (hitterLists.length > 2) {
      hitterLists.eq(2).find('ol.rankList li').each((idx, li) => {
        const name = $(li).find('.name').text().trim();
        const team = $(li).find('.team').text().trim();
        const value = $(li).find('.record').text().trim();
        if (name) {
          result.batter[2].players.push({
            rank: idx + 1,
            name,
            teamId: mapTeamId(team),
            value: value.includes('점') ? value : `${value}점`
          });
        }
      });
    }

    // 2. 투수 처리 (블록 1)
    const pitcherBlock = blocks.eq(1);
    const pitcherLists = pitcherBlock.find('.list');

    // 평균자책점 (인덱스 0)
    if (pitcherLists.length > 0) {
      pitcherLists.eq(0).find('ol.rankList li').each((idx, li) => {
        const name = $(li).find('.name').text().trim();
        const team = $(li).find('.team').text().trim();
        const value = $(li).find('.record').text().trim();
        if (name) {
          result.pitcher[0].players.push({
            rank: idx + 1,
            name,
            teamId: mapTeamId(team),
            value
          });
        }
      });
    }

    // 다승 (인덱스 1)
    if (pitcherLists.length > 1) {
      pitcherLists.eq(1).find('ol.rankList li').each((idx, li) => {
        const name = $(li).find('.name').text().trim();
        const team = $(li).find('.team').text().trim();
        const value = $(li).find('.record').text().trim();
        if (name) {
          result.pitcher[1].players.push({
            rank: idx + 1,
            name,
            teamId: mapTeamId(team),
            value: value.includes('승') ? value : `${value}승`
          });
        }
      });
    }

    // 세이브 (인덱스 2)
    if (pitcherLists.length > 2) {
      pitcherLists.eq(2).find('ol.rankList li').each((idx, li) => {
        const name = $(li).find('.name').text().trim();
        const team = $(li).find('.team').text().trim();
        const value = $(li).find('.record').text().trim();
        if (name) {
          result.pitcher[2].players.push({
            rank: idx + 1,
            name,
            teamId: mapTeamId(team),
            value: value.includes('세') ? value : `${value}세`
          });
        }
      });
    }

    return result;
  }

  async function crawlKboTeamStandings() {
    console.log("Crawling real-time KBO team standings from WebService GetTeamRank...");
    const res = await fetch("https://www.koreabaseball.com/ws/Main.asmx/GetTeamRank", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://www.koreabaseball.com/",
        "Origin": "https://www.koreabaseball.com"
      },
      body: "{}"
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error fetching team standings! status: ${res.status}`);
    }

    let text = await res.text();
    if (text.includes("<!DOCTYPE")) {
      text = text.split("<!DOCTYPE")[0].trim();
    }

    const parsed = JSON.parse(text);
    if (!parsed.rows || !Array.isArray(parsed.rows)) {
      throw new Error("Invalid team standings response layout inside WebService returned JSON");
    }

    const standings = parsed.rows.map((rObj: any) => {
      const cells = rObj.row;
      const rank = parseInt(cells[0].Text.trim(), 10) || 0;
      
      const teamSpanHtml = cells[1].Text;
      const $ = cheerio.load(teamSpanHtml);
      const rawTeamName = $.text().trim();
      const teamId = mapTeamId(rawTeamName);

      const games = parseInt(cells[2].Text.trim(), 10) || 0;
      const wins = parseInt(cells[3].Text.trim(), 10) || 0;
      const losses = parseInt(cells[4].Text.trim(), 10) || 0;
      const draws = parseInt(cells[5].Text.trim(), 10) || 0;
      const winRate = parseFloat(cells[6].Text.trim()) || 0;
      const gameBehind = cells[7].Text.trim();
      const streak = cells[8].Text.trim();

      return {
        rank,
        teamId,
        games,
        wins,
        losses,
        draws,
        winRate,
        gameBehind,
        streak
      };
    });

    return standings;
  }

  // 실시간 선수 랭킹을 제공하는 API 라우트 (메모리 -> DB -> 실시간 크롤링 순서로 우선 가동)
  app.get("/api/player-rankings", async (req, res) => {
    const now = Date.now();
    try {
      // 1. 메모리 캐시에서 제공 시도
      if (rankingsCache && now - cacheTime < CACHE_DURATION) {
        console.log("Serving player rankings from live-crawler memory cache");
        return res.json({ rankings: rankingsCache, cachedAt: cacheTime, fetchedLive: true, source: "memory" });
      }

      // 2. MySQL 영구 데이터베이스 캐시에서 제공 시도
      try {
        const dbRankings = await getPlayerRankingsFromDb();
        if (dbRankings && dbRankings.batter && dbRankings.batter[0].players.length > 0) {
          rankingsCache = dbRankings;
          cacheTime = now;
          console.log("Serving player rankings from MySQL database cache");
          return res.json({ rankings: dbRankings, cachedAt: cacheTime, fetchedLive: true, source: "mysql" });
        }
      } catch (dbErr) {
        console.warn("Could not read player rankings from MySQL:", dbErr);
      }

      // 3. 메모리 및 데이터베이스 모두 빈 경우 실시간 직접 크롤링(cheerio)으로 정보 제공 시도
      try {
        const liveRankings = await crawlKboRankings();
        if (liveRankings && liveRankings.batter && liveRankings.batter[0].players.length > 0) {
          rankingsCache = liveRankings;
          cacheTime = now;
          console.log("Player stats successfully crawled. Persisting to MySQL & memory cache.");
          
          // 데이터 유실 및 속도 방지를 위해 데이터베이스에 백그라운드 형태로 비동기 저장
          await savePlayerRankings(liveRankings);

          return res.json({ rankings: liveRankings, cachedAt: cacheTime, fetchedLive: true, source: "live_crawler" });
        }
      } catch (crawlErr) {
        console.warn("Direct KBO player rankings crawl failed, trying Gemini grounding fallback...", crawlErr);
      }

      // 4. 모든 시도가 실패 시 제미나이 웹 검색(Search Grounding)을 통한 실시간 최신 정보 조회 fallback 기동
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn("GEMINI_API_KEY missing. Serving offline KBO baseline.");
        return res.json({ rankings: fallbackRankings, cachedAt: now, fetchedLive: false, reason: "API key missing" });
      }

      console.log("Fetching player rankings using Gemini Search Grounding...");
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } },
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: "Find the current 2026 KBO Player leadership statistics for regular season. Provide top 5 rankings (name, team name lowercase abbreviation like kia, samsung, values) for avg, hr, rbi, era, win, sv. Response must be JSON layout matching standard database keys.",
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");
      if (parsed && (parsed.batter || parsed.pitcher)) {
        rankingsCache = parsed;
        cacheTime = now;
        
        // 제미나이 구동 결과를 로컬 캐싱 복구를 위해 데이터베이스에 저장
        await savePlayerRankings(parsed);

        return res.json({ rankings: parsed, cachedAt: cacheTime, fetchedLive: true, source: "gemini" });
      }

      throw new Error("Gemini returned invalid rankings layout");
    } catch (err: any) {
      console.error("Player rankings fallback failed. Serving hardcoded baseline:", err?.message || err);
      return res.json({ rankings: fallbackRankings, cachedAt: now, fetchedLive: false, reason: "all_fetch_methods_failed" });
    }
  });

  // 실시간 구단 순위표를 제공하는 API 라우트
  app.get("/api/team-standings", async (req, res) => {
    const now = Date.now();
    try {
      // 1. 메모리 캐시에서 제공 시도
      if (teamCache && now - teamCacheTime < CACHE_DURATION) {
        console.log("Serving team standings from live-crawler memory cache");
        return res.json({ standings: teamCache, cachedAt: teamCacheTime, fetchedLive: true, source: "memory" });
      }

      // 2. MySQL 영구 데이터베이스 캐시에서 제공 시도
      try {
        const dbStandings = await getTeamStandingsFromDb();
        if (dbStandings && dbStandings.length > 0) {
          teamCache = dbStandings;
          teamCacheTime = now;
          console.log("Serving team standings from MySQL database cache");
          return res.json({ standings: dbStandings, cachedAt: teamCacheTime, fetchedLive: true, source: "mysql" });
        }
      } catch (dbErr) {
        console.warn("Could not read team standings from MySQL:", dbErr);
      }

      // 3. 캐시가 빈 상태인 경우 기상 상황 및 경기 결과 반영을 위해 직접 실시간 크롤링 수행
      const liveStandings = await crawlKboTeamStandings();
      if (liveStandings && liveStandings.length > 0) {
        teamCache = liveStandings;
        teamCacheTime = now;
        console.log("Team standings successfully crawled. Persisting to MySQL & memory cache.");
        
        // 속도 및 다중성 확보를 위해 MySQL 데이터베이스에 영구 보존 저장
        await saveTeamStandings(liveStandings);

        return res.json({ standings: liveStandings, cachedAt: teamCacheTime, fetchedLive: true, source: "live_crawler" });
      }

      throw new Error("Crawled standings array is empty");
    } catch (err: any) {
      console.error("Team standings crawl failed, serving baseline:", err?.message || err);
      // 크롤러가 만약 실패할 경우 사전에 준비된 오프라인 시뮬레이션 고정 데이터 반환
      const simulatedStandings = [
        { rank: 1, teamId: "kia", games: 50, wins: 33, losses: 16, draws: 1, winRate: 0.673, gameBehind: "0.0", streak: "3승" },
        { rank: 2, teamId: "samsung", games: 51, wins: 31, losses: 19, draws: 1, winRate: 0.620, gameBehind: "2.5", streak: "1패" },
        { rank: 3, teamId: "lg", games: 50, wins: 29, losses: 20, draws: 1, winRate: 0.592, gameBehind: "4.0", streak: "2승" },
        { rank: 4, teamId: "doosan", games: 50, wins: 27, losses: 22, draws: 1, winRate: 0.551, gameBehind: "6.0", streak: "1승" },
        { rank: 5, teamId: "ssg", games: 51, wins: 25, losses: 25, draws: 1, winRate: 0.500, gameBehind: "8.5", streak: "4패" },
        { rank: 6, teamId: "kt", games: 50, wins: 24, losses: 25, draws: 1, winRate: 0.490, gameBehind: "9.0", streak: "2승" },
        { rank: 7, teamId: "lotte", games: 50, wins: 22, losses: 27, draws: 1, winRate: 0.449, gameBehind: "11.0", streak: "2패" },
        { rank: 8, teamId: "hanwha", games: 51, wins: 22, losses: 28, draws: 1, winRate: 0.440, gameBehind: "11.5", streak: "1패" },
        { rank: 9, teamId: "nc", games: 51, wins: 21, losses: 29, draws: 1, winRate: 0.420, gameBehind: "12.5", streak: "3패" },
        { rank: 10, teamId: "kiwoom", games: 50, wins: 18, losses: 31, draws: 1, winRate: 0.367, gameBehind: "15.0", streak: "2승" }
      ];
      return res.json({ standings: simulatedStandings, cachedAt: now, fetchedLive: false, reason: "crawl_failed" });
    }
  });


  // 개발 환경용 Vite 미들웨어 설정
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// 지연 초기화(Lazy initialization)되는 커넥션 풀 헬퍼
let pool: mysql.Pool | null = null;
let isDbEnabled = false;

// 환경 변수를 기반으로 데이터베이스 활성화 여부 확인 및 설정 처리
const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "3306", 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

// in-memory mock fallback store (when MySQL is not connected or in local mode)
let memoryTeamStandings: any[] | null = null;
let memoryPlayerRankings: any | null = null;

if (dbConfig.host && dbConfig.database) {
  isDbEnabled = true;
} else {
  console.log("MySQL environment variables (DB_HOST, DB_DATABASE) are missing. Running in standard local mode with in-memory store.");
}

export function getDbPool(): mysql.Pool | null {
  if (!isDbEnabled) return null;
  if (!pool) {
    try {
      pool = mysql.createPool({
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.database,
        waitForConnections: true,
        connectionLimit: 5,
        connectTimeout: 2000,
        queueLimit: 0,
      });
      console.log(`MySQL connection pool created for host: ${dbConfig.host}`);
    } catch (err) {
      console.warn("Failed to initialize MySQL Connection Pool, falling back to in-memory store:", err);
      pool = null;
      isDbEnabled = false;
    }
  }
  return pool;
}

/**
 * KBO 테이블이 존재하지 않는 경우 테이블을 자동으로 생성합니다.
 */
export async function initializeDatabase() {
  const activePool = getDbPool();
  if (!activePool) return;

  try {
    console.log("Checking and initializing MySQL database tables...");

    // 팀 순위(Team Standings) 테이블 생성
    await activePool.query(`
      CREATE TABLE IF NOT EXISTS kbo_team_standings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        team_id VARCHAR(50) UNIQUE NOT NULL,
        \`rank\` INT NOT NULL,
        games INT DEFAULT 0,
        wins INT DEFAULT 0,
        losses INT DEFAULT 0,
        draws INT DEFAULT 0,
        win_rate DECIMAL(5,3) DEFAULT 0.000,
        game_behind VARCHAR(20) DEFAULT '0.0',
        streak VARCHAR(20) DEFAULT '',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 선수 랭킹(Player Rankings) 테이블 생성
    await activePool.query(`
      CREATE TABLE IF NOT EXISTS kbo_player_rankings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        player_type VARCHAR(25) NOT NULL,
        category VARCHAR(25) NOT NULL,
        \`rank\` INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        team_id VARCHAR(50) NOT NULL,
        \`value\` VARCHAR(50) NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (player_type, category)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log("MySQL Database Tables Initialized Successfully.");
  } catch (err) {
    console.error("Database connection/migration failed. Disabling MySQL fallback.", err);
    isDbEnabled = false;
  }
}

/**
 * 크롤링된 구단 순위 데이터를 MySQL에 저장하거나 업데이트합니다.
 */
export async function saveTeamStandings(standings: any[]) {
  // Always update in-memory cache
  memoryTeamStandings = standings;

  const activePool = getDbPool();
  if (!activePool) return;

  try {
    console.log("Saving crawled KBO team standings to MySQL...");
    for (const row of standings) {
      await activePool.query(`
        INSERT INTO kbo_team_standings (team_id, \`rank\`, games, wins, losses, draws, win_rate, game_behind, streak)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          \`rank\` = VALUES(\`rank\`),
          games = VALUES(games),
          wins = VALUES(wins),
          losses = VALUES(losses),
          draws = VALUES(draws),
          win_rate = VALUES(win_rate),
          game_behind = VALUES(game_behind),
          streak = VALUES(streak)
      `, [
        row.teamId,
        row.rank,
        row.games,
        row.wins,
        row.losses,
        row.draws,
        row.winRate,
        row.gameBehind,
        row.streak
      ]);
    }
    console.log("KBO team standings successfully written to MySQL");
  } catch (err) {
    console.warn("Failed to insert/update team standings in MySQL, continuing with in-memory:", err);
  }
}

/**
 * MySQL에서 최신 구단 순위 데이터를 가져옵니다.
 */
export async function getTeamStandingsFromDb(): Promise<any[] | null> {
  const activePool = getDbPool();
  if (!activePool) return memoryTeamStandings;

  try {
    const [rows]: any = await activePool.query(`
      SELECT team_id as teamId, \`rank\`, games, wins, losses, draws, CAST(win_rate AS DOUBLE) as winRate, game_behind as gameBehind, streak
      FROM kbo_team_standings
      ORDER BY \`rank\` ASC
    `);

    if (rows && rows.length > 0) {
      return rows;
    }
  } catch (err) {
    console.warn("Failed to fetch KBO team standings from MySQL, returning in-memory:", err);
  }
  return memoryTeamStandings;
}

/**
 * 크롤링된 선수 랭킹 데이터를 MySQL에 저장합니다.
 */
export async function savePlayerRankings(rankings: any) {
  // Always update in-memory cache
  memoryPlayerRankings = rankings;

  const activePool = getDbPool();
  if (!activePool) return;

  try {
    console.log("Saving crawled KBO player rankings to MySQL...");
    
    // 트랜잭션 내부에서 안전하게 데이터를 동기화하기 위해 이전 기록을 삭제 후 새 인서트를 수행합니다.
    const connection = await activePool.getConnection();
    try {
      await connection.beginTransaction();

      // 이전 기록 삭제
      await connection.query("DELETE FROM kbo_player_rankings");

      // 타자 랭킹 저장
      if (rankings.batter && Array.isArray(rankings.batter)) {
        for (const categoryBlock of rankings.batter) {
          const category = categoryBlock.key;
          for (const p of categoryBlock.players) {
            await connection.query(`
              INSERT INTO kbo_player_rankings (player_type, category, \`rank\`, name, team_id, \`value\`)
              VALUES ('batter', ?, ?, ?, ?, ?)
            `, [category, p.rank, p.name, p.teamId, p.value]);
          }
        }
      }

      // 투수 랭킹 저장
      if (rankings.pitcher && Array.isArray(rankings.pitcher)) {
        for (const categoryBlock of rankings.pitcher) {
          const category = categoryBlock.key;
          for (const p of categoryBlock.players) {
            await connection.query(`
              INSERT INTO kbo_player_rankings (player_type, category, \`rank\`, name, team_id, \`value\`)
              VALUES ('pitcher', ?, ?, ?, ?, ?)
            `, [category, p.rank, p.name, p.teamId, p.value]);
          }
        }
      }

      await connection.commit();
      console.log("KBO player rankings saved successfully to MySQL database");
    } catch (txErr) {
      await connection.rollback();
      throw txErr;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.warn("Failed to bulk save player rankings in MySQL, continuing with in-memory:", err);
  }
}

/**
 * MySQL에서 KBO 선수 랭킹 데이터를 가져와 클라이언트 포맷에 맞게 재구성합니다.
 */
export async function getPlayerRankingsFromDb(): Promise<any | null> {
  const activePool = getDbPool();
  if (!activePool) return memoryPlayerRankings;

  try {
    const [rows]: any = await activePool.query(`
      SELECT player_type as playerType, category, \`rank\`, name, team_id as teamId, \`value\`
      FROM kbo_player_rankings
      ORDER BY player_type ASC, category ASC, \`rank\` ASC
    `);

    if (!rows || rows.length === 0) {
      return memoryPlayerRankings;
    }

    // 응답할 스키마 기본 구조 생성
    const data: any = {
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

    for (const r of rows) {
      const typeKey = r.playerType === "batter" ? "batter" : "pitcher";
      const catBlock = data[typeKey].find((c: any) => c.key === r.category);
      if (catBlock) {
        catBlock.players.push({
          rank: r.rank,
          name: r.name,
          teamId: r.teamId,
          value: r.value
        });
      }
    }

    return data;
  } catch (err) {
    console.warn("Failed to fetch KBO player rankings from MySQL, returning in-memory:", err);
  }
  return memoryPlayerRankings;
}

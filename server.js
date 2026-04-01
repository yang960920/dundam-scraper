const express = require("express");
const { searchAdventure } = require("./lib/scraper");

const app = express();
const PORT = 3000;

// CORS 허용
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// 모험단 검색 API
app.get("/api/adventure", async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({
      success: false,
      error: "모험단명(name)을 입력해주세요. 예: /api/adventure?name=EXSystem",
    });
  }

  console.log(`[요청] 모험단 검색: ${name}`);

  try {
    const result = await searchAdventure(name);
    console.log(`[완료] ${result.count || 0}개 캐릭터 조회`);
    res.json(result);
  } catch (error) {
    console.error(`[에러] ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n던담 스크래핑 API 서버 실행 중`);
  console.log(`http://localhost:${PORT}\n`);
  console.log(`테스트: http://localhost:${PORT}/api/adventure?name=EXSystem\n`);
});

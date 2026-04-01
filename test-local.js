/**
 * 로컬 테스트: node test-local.js [모험단명]
 */
const { searchAdventure } = require("./lib/scraper");

const adventureName = process.argv[2] || "EXSystem";

console.log(`\n던담에서 모험단 "${adventureName}" 검색 중...\n`);

searchAdventure(adventureName)
  .then((result) => {
    if (!result.success) {
      console.log(`에러: ${result.error}`);
      return;
    }

    console.log(`모험단: ${result.adventureName}`);
    console.log(`캐릭터 수: ${result.count}\n`);

    result.characters.forEach((c, i) => {
      const spec = c.isSupport
        ? `버프점수: ${(c.buffScore || 0).toLocaleString()}`
        : `딜량: ${c.damage ? (c.damage / 100000000).toFixed(1) + "억" : "없음"}`;

      console.log(
        `[${i + 1}] ${c.charName} | ${c.server} | ${c.job} | ${spec} | 명성: ${c.fame}`
      );
    });
  })
  .catch((err) => console.error("에러:", err.message));

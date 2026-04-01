const { getBrowser } = require("./browser");

/**
 * 던담에서 모험단명으로 캐릭터 목록 + 딜량/버프력을 한번에 가져옵니다.
 * @param {string} adventureName - 모험단명
 * @returns {Promise<Object>} 캐릭터 목록 (딜량/버프력 포함)
 */
async function searchAdventure(adventureName) {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    const url = `https://dundam.xyz/search?server=adven&name=${encodeURIComponent(adventureName)}`;
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    // 검색 결과 로드 대기
    await page
      .waitForSelector(".scon", { timeout: 30000 })
      .catch(() => {});

    // 추가 렌더링 대기
    await new Promise((r) => setTimeout(r, 2000));

    // 캐릭터 데이터 파싱
    const characters = await page.evaluate(() => {
      const results = [];
      const cards = document.querySelectorAll(".scon");

      cards.forEach((card) => {
        // 서버
        const serverEl = card.querySelector(".seh_sever .sev");
        const server = serverEl ? serverEl.textContent.trim() : "";

        // 직업
        const jobEl = card.querySelector(".seh_job .sev");
        const job = jobEl ? jobEl.textContent.trim() : "";

        // 캐릭터명
        const nameEl = card.querySelector(".seh_name .name");
        let charName = "";
        if (nameEl) {
          // .name 안에 .introd 자식이 있으므로 첫 번째 텍스트 노드만 추출
          const textNode = nameEl.childNodes[0];
          charName = textNode ? textNode.textContent.trim() : "";
        }

        // 모험단명
        const adventureEl = card.querySelector(".seh_name .introd.server");
        const adventure = adventureEl ? adventureEl.textContent.trim() : "";

        // 캐릭터 이미지에서 characterId 추출
        const imgEl = card.querySelector(".seh_abata img");
        const imgSrc = imgEl ? imgEl.getAttribute("src") : "";
        // URL 형식: https://img-api.neople.co.kr/df/servers/prey/characters/50c52cf3f3c7e7135589c637e85654de?zoom=1
        let characterId = "";
        let serverId = "";
        const match = imgSrc.match(/servers\/(\w+)\/characters\/(\w+)/);
        if (match) {
          serverId = match[1];
          characterId = match[2];
        }

        // 명성 (level 내 val)
        const levelEl = card.querySelector(".seh_name .level .val");
        const fame = levelEl ? parseInt(levelEl.textContent.trim().replace(/,/g, ""), 10) : 0;

        // 딜량 또는 버프력 판별
        let damage = null;
        let buffScore = null;
        let isSupport = false;

        // .stat_b 영역에서 버프/딜 정보 추출
        const statBEls = card.querySelectorAll(".stat_b .statc");
        statBEls.forEach((statEl) => {
          const label = statEl.querySelector(".tl");
          const val = statEl.querySelector(".val");
          if (!label || !val) return;

          const labelText = label.textContent.trim();
          const valText = val.textContent.trim();
          if (!valText) return;

          if (labelText === "버프점수") {
            // 크루세이더, 뮤즈 등: "버프점수" 라벨
            buffScore = parseInt(valText.replace(/,/g, ""), 10) || 0;
            isSupport = true;
          } else if (labelText === "4인" || labelText === "3인" || labelText === "2인") {
            const numVal = parseInt(valText.replace(/,/g, ""), 10) || 0;
            // 억/만 단위가 없으면 버프 수치 (인챈트리스/패러메딕 등)
            if (!valText.includes("억") && !valText.includes("만")) {
              // 4인 버프점수 우선, 없으면 3인, 2인 순
              if (!buffScore || labelText === "4인") {
                buffScore = numVal;
                isSupport = true;
              }
            }
          }
        });

        // 딜러 캐릭터: 랭킹 딜량 또는 4인 딜량 (억/만 단위)
        if (!isSupport) {
          const allStatEls = card.querySelectorAll(".seh_stat .statc");
          allStatEls.forEach((statEl) => {
            const label = statEl.querySelector(".tl");
            const val = statEl.querySelector(".val");
            if (!label || !val) return;

            const labelText = label.textContent.trim();
            const valText = val.textContent.trim();

            if (labelText === "4인" && valText.includes("억")) {
              damage = parseDamageText(valText);
            }
            if (labelText === "랭킹" && valText && !damage) {
              damage = parseDamageText(valText);
            }
          });
        }

        results.push({
          charName,
          server,
          serverId,
          characterId,
          job,
          adventure,
          fame,
          isSupport,
          damage,
          buffScore,
        });
      });

      // 억/만 텍스트를 숫자로 변환
      function parseDamageText(text) {
        // "257억 749만" → 25700000000 + 7490000 = 25707490000
        // "335 억 3944 만" → 33539440000
        let total = 0;
        const eokMatch = text.match(/([\d,]+)\s*억/);
        const manMatch = text.match(/([\d,]+)\s*만/);

        if (eokMatch) {
          total += parseInt(eokMatch[1].replace(/,/g, ""), 10) * 100000000;
        }
        if (manMatch) {
          total += parseInt(manMatch[1].replace(/,/g, ""), 10) * 10000;
        }
        return total || null;
      }

      return results;
    });

    return {
      success: true,
      adventureName,
      count: characters.length,
      characters,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  } finally {
    await browser.close();
  }
}

module.exports = { searchAdventure };

const puppeteer = require("puppeteer-core");

async function getBrowser() {
  if (process.env.VERCEL) {
    // Vercel 서버리스 환경
    const chromium = require("@sparticuz/chromium");
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  } else {
    // 로컬 개발 환경 - 설치된 Chrome 사용
    const possiblePaths = [
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      process.env.CHROME_PATH,
    ].filter(Boolean);

    let executablePath = null;
    for (const p of possiblePaths) {
      try {
        require("fs").accessSync(p);
        executablePath = p;
        break;
      } catch {}
    }

    if (!executablePath) {
      throw new Error(
        "Chrome을 찾을 수 없습니다. CHROME_PATH 환경변수를 설정해주세요."
      );
    }

    return puppeteer.launch({
      headless: "new", // 브라우저 창 없이 백그라운드 실행
      executablePath,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
}

module.exports = { getBrowser };

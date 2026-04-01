const puppeteer = require("puppeteer-core");

const CHROMIUM_PACK_URL =
  "https://github.com/nicholasgasior/chromium-binaries/releases/download/v131.0.0/chromium-v131.0.0-pack.tar";

async function getBrowser() {
  if (process.env.VERCEL) {
    // Vercel 서버리스 환경 — chromium-min + 원격 바이너리
    const chromium = require("@sparticuz/chromium-min");
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1280, height: 720 },
      executablePath: await chromium.executablePath(CHROMIUM_PACK_URL),
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
      headless: "new",
      executablePath,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
}

module.exports = { getBrowser };

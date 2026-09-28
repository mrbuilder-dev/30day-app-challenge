import puppeteer from 'puppeteer-core';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const URL = process.argv[2] || 'http://localhost:3000/30day-app-challenge/';
const BASE_PATH = '/Users/arshiamajidi/.gemini/antigravity-ide/brain/ba90bfe6-3c31-4cd8-92f9-dbe852ffad38/';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  try {
    await page.goto(URL, { waitUntil: 'networkidle2', timeout: 15000 });

    // Directly click 'شروع انتقال' on a fresh clean page
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.innerText.includes('شروع انتقال'));
      if (btn) btn.click();
    });

    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: `${BASE_PATH}inspect_4_transfer_radar.png` });
    console.log('[Success] Transfer Radar screen captured.');

  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
}

run();

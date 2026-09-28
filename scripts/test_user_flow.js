import puppeteer from 'puppeteer-core';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const URL = 'http://localhost:3000/30day-app-challenge/';
const BASE_PATH = '/Users/arshiamajidi/.gemini/antigravity-ide/brain/ba90bfe6-3c31-4cd8-92f9-dbe852ffad38/';

async function run() {
  console.log(`[User Flow Test] Connecting to Chrome...`);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const logs = [];
  page.on('console', msg => logs.push(`[${msg.type().toUpperCase()}] ${msg.text()}`));
  page.on('pageerror', err => console.error(`[PAGE_ERROR] ${err}`));

  try {
    // 1. Initial Page: Landing / Guide
    await page.goto(URL, { waitUntil: 'networkidle2', timeout: 15000 });
    console.log('Step 1: Landing page loaded');
    await page.screenshot({ path: `${BASE_PATH}user_flow_1_landing.png` });

    // 2. Click "شروع انتقال فایل"
    const clickedStart = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const startBtn = btns.find(b => b.innerText.includes('انتقال داده') || b.innerText.includes('شروع انتقال فایل') || b.innerText.includes('Start'));
      if (startBtn) {
        startBtn.click();
        return true;
      }
      return false;
    });

    if (!clickedStart) {
      throw new Error("Could not find 'شروع انتقال فایل' button!");
    }
    console.log('Step 2: Clicked "شروع انتقال فایل"');
    await new Promise(r => setTimeout(r, 1200));

    // Capture the new Stitch Option B Transfer Hub
    await page.screenshot({ path: `${BASE_PATH}user_flow_2_transfer_room.png` });
    console.log('Step 3: Transfer Room (Stitch Option B) captured');

    // 3. Test clicking "صفحه اصلی 🏠"
    const clickedBack = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const backBtn = btns.find(b => b.innerText.includes('صفحه اصلی') || b.innerText.includes('Home'));
      if (backBtn) {
        backBtn.click();
        return true;
      }
      return false;
    });

    if (clickedBack) {
      console.log('Step 4: Clicked "صفحه اصلی 🏠"');
      await new Promise(r => setTimeout(r, 800));
      await page.screenshot({ path: `${BASE_PATH}user_flow_3_back_to_landing.png` });
      console.log('Step 5: Returned to landing page successfully');
    } else {
      console.warn("Could not find 'صفحه اصلی' back button");
    }

    console.log('\n--- Console Logs ---');
    logs.forEach(l => console.log(l));
    console.log('--------------------\n');

  } catch (err) {
    console.error('[Test Error]', err);
  } finally {
    await browser.close();
  }
}

run();

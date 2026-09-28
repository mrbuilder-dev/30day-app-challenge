import puppeteer from 'puppeteer-core';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const URL = process.argv[2] || 'http://localhost:3000/30day-app-challenge/';
const BASE_PATH = '/Users/arshiamajidi/.gemini/antigravity-ide/brain/ba90bfe6-3c31-4cd8-92f9-dbe852ffad38/';

async function run() {
  console.log(`[Inspector] Connecting to Chrome at: ${CHROME_PATH}`);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const logs = [];
  page.on('console', msg => logs.push(`[${msg.type().toUpperCase()}] ${msg.text()}`));
  page.on('pageerror', err => console.error(`[PAGE_ERROR] ${err}`));

  try {
    await page.goto(URL, { waitUntil: 'networkidle2', timeout: 15000 });
    console.log('[1/4] Main Page Loaded.');
    await page.screenshot({ path: `${BASE_PATH}inspect_1_main.png` });

    // Click 'راهنمای فنی آفلاین'
    const clickedGuide = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.innerText.includes('راهنمای فنی'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (clickedGuide) {
      await new Promise(r => setTimeout(r, 600));
      await page.screenshot({ path: `${BASE_PATH}inspect_2_guide_modal.png` });
      console.log('[2/4] Guide Modal Opened & Captured.');
      
      // Close modal
      await page.evaluate(() => {
        const closeBtn = document.querySelector('.modal-close, button[aria-label="Close"], button.close, .nb-modal-header button');
        if (closeBtn) closeBtn.click();
      });
      await new Promise(r => setTimeout(r, 400));
    }

    // Click 'نصب و دانلود اپ'
    const clickedPwa = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.innerText.includes('نصب'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (clickedPwa) {
      await new Promise(r => setTimeout(r, 600));
      await page.screenshot({ path: `${BASE_PATH}inspect_3_pwa_modal.png` });
      console.log('[3/4] PWA Install Modal Opened & Captured.');
    }

    // Click 'شروع انتقال فایل'
    const clickedStart = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.innerText.includes('شروع انتقال'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (clickedStart) {
      await new Promise(r => setTimeout(r, 1000));
      await page.screenshot({ path: `${BASE_PATH}inspect_4_transfer_room.png` });
      console.log('[4/4] Transfer Radar / Room Opened & Captured.');
    }

    console.log('\n--- Captured Console Logs ---');
    logs.forEach(l => console.log(l));
    console.log('-----------------------------\n');

  } catch (err) {
    console.error('[Inspector Error]', err);
  } finally {
    await browser.close();
  }
}

run();

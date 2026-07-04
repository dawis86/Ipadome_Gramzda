/**
 * Puppeteer skripts automātiskiem screenshotiem
 * Palaišana: npm run screenshot
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const pages = [
  { file: 'index.html',       name: 'sakums' },
  { file: 'aptauja.html',     name: 'aptauja' },
  { file: 'aktualitates.html', name: 'aktualitates' },
  { file: 'karte.html',       name: 'karte' },
  { file: 'idejas.html',      name: 'idejas' },
  { file: 'darbi.html',       name: 'darbi' },
  { file: 'arhivs.html',      name: 'arhivs' },
  { file: 'kontakti.html',    name: 'kontakti' },
  { file: 'prezentacijas/2026-marts/prezentacija2.html', name: 'prezentacija2' }
];

async function capture() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const outputDir = path.join(__dirname, '..', 'screenshots');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const page of pages) {
    const filePath = path.join(__dirname, '..', page.file);
    const fileUrl = 'file:///' + filePath.replace(/\\/g, '/');

    const tab = await browser.newPage();
    await tab.setViewport({ width: 1920, height: 1080 });

    try {
      await tab.goto(fileUrl, { waitUntil: 'networkidle0' });
      await tab.evaluateHandle('document.fonts.ready');

      // Pilna lapas izmērs
      const scrollHeight = await tab.evaluate(() => document.body.scrollHeight);
      await tab.setViewport({ width: 1920, height: Math.max(1080, scrollHeight) });

      await tab.screenshot({ path: `${outputDir}/${page.name}-full.png`, fullPage: true });

      // Kartītes/elemenți
      const cards = await tab.$$('.card, .gateway-card, .presentation-card, .stat-card, .kpi-card, .goal-card, .contact-card, .skeleton-card, .wish-item');
      for (let i = 0; i < cards.length; i++) {
        const box = await cards[i].boundingBox();
        if (box) {
          await tab.screenshot({
            path: `${outputDir}/${page.name}-card${i + 1}.png`,
            clip: box
          });
        }
      }

      // Chart.js grafiki
      const charts = await tab.$$('canvas');
      for (let i = 0; i < charts.length; i++) {
        const box = await charts[i].boundingBox();
        if (box) {
          await tab.screenshot({
            path: `${outputDir}/${page.name}-chart${i + 1}.png`,
            clip: box
          });
        }
      }

      console.log(`✓ ${page.name} - ${cards.length} kartītes, ${charts.length} grafiki`);
    } catch (err) {
      console.error(`✗ Kļūda ${page.name}:`, err.message);
    }

    await tab.close();
  }

  await browser.close();
  console.log('Gatavs! Screenshots saglabāti /screenshots/');
}

capture();
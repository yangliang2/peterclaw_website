const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const htmlPath = path.resolve(__dirname, 'generate-whitepaper.html');
  const outputPath = path.resolve(__dirname, '../public/downloads/ai-tool-selection-whitepaper-2026.pdf');

  if (!fs.existsSync(htmlPath)) {
    console.error('HTML template not found:', htmlPath);
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const fileUrl = 'file://' + htmlPath;
  await page.goto(fileUrl, { waitUntil: 'networkidle' });

  // Wait for fonts to load
  await page.waitForTimeout(2000);

  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: '18mm', right: '20mm', bottom: '22mm', left: '20mm' },
  });

  await browser.close();

  const stats = fs.statSync(outputPath);
  console.log(`PDF generated: ${outputPath}`);
  console.log(`Size: ${(stats.size / 1024).toFixed(1)} KB`);
})();

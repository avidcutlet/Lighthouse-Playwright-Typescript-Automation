import path from 'path';
import fs from 'fs';
import { chromium } from 'playwright';


export async function screenshotDiagnosticsBlock(outputDir: string, htmlReportPath: string, label: string): Promise<string> {

  const screenshotDir = path.join(outputDir, 'screenshot');
  fs.mkdirSync(screenshotDir, { recursive: true });

  const screenshotFile = `diagnostics-${label}.png`
  const screenshotPath = path.join(screenshotDir, screenshotFile);

  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log(`------------ screenshot location: ${screenshotPath}`);
  await page.goto(`file://${htmlReportPath}`, { waitUntil: 'domcontentloaded' });

  // Click the "Show audits" button
  const toggleButton = await page.waitForSelector(`xpath=//button[@class="lh-button lh-button-insight-toggle"]`, {
    timeout: 3000,
  });
  if (toggleButton) { await toggleButton.click(); }

  // Click the "Diagnostic section" dropdown
  const diagnosticDropdown = await page.waitForSelector(`xpath=//div[@class='lh-chevron-container']`, {
    timeout: 3000,
  });
  if (diagnosticDropdown) { await diagnosticDropdown.click(); }

  // Locate the diagnostics section
  const diagnosticsBlock = await page.waitForSelector(`xpath=//div[@class='lh-audit-group lh-audit-group--diagnostics']/child::div[2]`, {
    timeout: 5000,
  });

  if (diagnosticsBlock) {
    await diagnosticsBlock.screenshot({ path: screenshotPath });
    console.log(`📸 Screenshot saved: ${screenshotPath}`);

  } else {
    console.warn('⚠️ Diagnostics block not found.');
  }

  await browser.close();
  return screenshotDir;
}
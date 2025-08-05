import path from 'path';
import fs from 'fs';

import { chromium } from 'playwright';
import { sanitizeUrl } from '@utils/report-path-util';
import { shouldTakeScreenshot } from '@utils/user-input-util';

export type DeviceType = 'Mobile' | 'Desktop';

  let currentOutputDir: string;
  let currentHtmlReportPath: string; 
  let currentLabel: string; 
  let currentUrl: string;
  let currentDevice: DeviceType;
  let currentIsIncognito: boolean;
  let currentScreenshotOption: number;

export async function screenshotDiagnosticsBlock(
  outputDir: string, 
  htmlReportPath: string, 
  label: string, 
  url: string,
  device: DeviceType,
  isIncognito: boolean,
  screenshotOption: number
): Promise<{
  diagnosticsAuditTitleTxt: string,
  diagnosticsAuditDisplayTxt: string,
  redirectTxt: string,
  redirectLinkTxt: string }> {
    
  let diagnosticsAuditTitleTxt: string = '';
  let diagnosticsAuditDisplayTxt: string = '';
  let redirectTxt: string = '';
  let redirectLinkTxt: string = '';

 currentOutputDir = outputDir;
 currentHtmlReportPath = htmlReportPath; 
 currentLabel = label; 
 currentUrl = url;
 currentDevice = device;
 currentIsIncognito = isIncognito;
 currentScreenshotOption = screenshotOption;

  try {
    const screenshotDir = path.join(outputDir, 'screenshot');
    fs.mkdirSync(screenshotDir, { recursive: true });
    
    const screenshotFile = `diagnostics-${sanitizeUrl(url)}-${label}.png`
    const screenshotPath = path.join(screenshotDir, screenshotFile);

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.goto(`file://${htmlReportPath}`, { waitUntil: 'domcontentloaded' });
    
    const timer: number = 20000;
    // Click the "Show audits" button
    const toggleButton = await page.waitForSelector(`xpath=//button[@class="lh-button lh-button-insight-toggle"]`, {
      timeout: timer,
    });
    if (toggleButton) await toggleButton.click();
    
    // Click the "Diagnostic section" dropdown
    const diagnosticsDropdown = await page.waitForSelector(`xpath=//div[@class='lh-chevron-container']`, {
      timeout: timer,
    });
    if (diagnosticsDropdown) await diagnosticsDropdown.click();
    
    // Locate the diagnostics section
    const diagnosticsBlock = await page.waitForSelector(`xpath=//div[@class='lh-audit-group lh-audit-group--diagnostics']/child::div[2]`, {
      timeout: timer,
    });
    
    // Get diagnostics audit title
    const diagnosticsAuditTitle = await page.waitForSelector(`xpath=//div[@class='lh-audit-group lh-audit-group--diagnostics']/child::div[2]/descendant::span[not(@class)][1]`, {
      timeout: timer,
    });
    if (diagnosticsAuditTitle) {
      diagnosticsAuditTitleTxt = (await diagnosticsAuditTitle.textContent()) ?? '';
    }
    
    // Get diagnostics audit display text
    const diagnosticsAuditDisplay = await page.waitForSelector(`xpath=//div[@class='lh-audit-group lh-audit-group--diagnostics']/child::div[2]/descendant::span[@class='lh-audit__display-text']`, {
      timeout: timer,
      state: 'attached',
    });
    const tempText = await diagnosticsAuditDisplay?.textContent();

    if (tempText && tempText.trim() !== '') {
      diagnosticsAuditDisplayTxt = tempText.trim();

    } else {
      diagnosticsAuditDisplayTxt = '[No diagnostic details shown]';
    }
    
    // Get redirects
    const redirect = await page.waitForSelector(`xpath=//div[@class='lh-audit-group lh-audit-group--diagnostics']/child::div[2]/descendant::a[1]`, {
      timeout: timer,
    });
    if (redirect) {
      redirectTxt = (await redirect.textContent()) ?? '';
      redirectLinkTxt = (await redirect.getAttribute('href')) ?? '';
    }
    
    if (diagnosticsBlock && shouldTakeScreenshot(device, isIncognito, screenshotOption)) {
      await diagnosticsBlock.screenshot({ path: screenshotPath });
      console.log(`\n📸 Screenshot saved: ${screenshotPath}`);
      
    } else if(diagnosticsBlock) {
      console.log(`\n📷 Screenshot skipped for [${label}] on ${url}`);
      
    } else {
      console.warn('\n⚠️ Diagnostics block not found.');
    }
    
    await browser.close();
    
  } catch (error) {
    console.error("\n⚠️Screenshot error!", error);
    console.error(`\n🔧 Trying to rerun screenshot...`);
    screenshotDiagnosticsBlock(
      outputDir, 
      htmlReportPath, 
      label, 
      url,
      device,
      isIncognito,
      screenshotOption
    );
  }
  return { diagnosticsAuditTitleTxt, diagnosticsAuditDisplayTxt, redirectTxt, redirectLinkTxt };
}
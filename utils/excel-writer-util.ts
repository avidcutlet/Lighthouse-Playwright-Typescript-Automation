import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import { resolve } from 'path'; 
import { readFile } from 'fs/promises';

const TEMPLATE_PATH = path.resolve('template', 'CheQ_Website_Production_PageSpeedInsights_Template_07232025.xlsx');

export function prepareExcelCopy(outputDir: string): string {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputFileName = `CheQ_Website_Insights_${timestamp}.xlsx`;
  const excelPath = path.join(outputDir, outputFileName);

  fs.copyFileSync(TEMPLATE_PATH, excelPath);
  return excelPath;
}

interface LighthouseRunData {
  logTimestamp: string;
  url: string;
  label: string;
  performanceScore: number;
  diagnosticsAuditTitleTxt: string;
  diagnosticsAuditDisplayTxt: string;
  redirectTxt: string;
  redirectLinkTxt: string;
  screenshotPathTxt: string;
}

async function parseTxtLogFile(filePath: string): Promise<LighthouseRunData[]> {
  const content: string = await readFile(filePath, 'utf-8');
  const blocks: string[] = content.trim().split('\n\n');

  const data: LighthouseRunData[] = blocks.map(block => {
    const lines = block.split('\n');

    const timestampMatch = lines[0].match(/^\[(.+?)\] (.+?) - (.+):$/);
    const scoreMatch = lines[1]?.match(/Score: (\d+)/);
    const diagTitleMatch = lines[3]?.match(/Diagnostics Audit Title Text: (.+)/);
    const diagDisplayMatch = lines[4]?.match(/Diagnostics Audit Display Text: (.+)/);
    const redirectTextMatch = lines[5]?.match(/Redirect Text: (.+)/);
    const redirectLinkMatch = lines[6]?.match(/Redirect Link Text: (.+)/);
    const screenshotMatch = lines[7]?.match(/Screenshot Path: (.+)/);

    return {
      logTimestamp: timestampMatch?.[1] ?? '',
      url: timestampMatch?.[2] ?? '',
      label: timestampMatch?.[3] ?? '',
      performanceScore: parseInt(scoreMatch?.[1] ?? '0'),
      diagnosticsAuditTitleTxt: diagTitleMatch?.[1] ?? '',
      diagnosticsAuditDisplayTxt: diagDisplayMatch?.[1] ?? '',
      redirectTxt: redirectTextMatch?.[1] ?? '',
      redirectLinkTxt: redirectLinkMatch?.[1] ?? '',
      screenshotPathTxt: screenshotMatch?.[1] ?? '',
    };
  });

  return data;
}

export async function writeAllToExcel(
  outputDir: string,
  txtPath: string,
  excelPath: string
) {
  const data = await parseTxtLogFile(txtPath);

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(excelPath);
  const worksheet = workbook.worksheets[0];

  data.forEach((entry, i) => {
    const label = entry.label;
    const url = entry.url;

    // Determine column based on label
    const column = label.includes("Incognito") ? 'E' : 'D';

    // Mapping of URL substrings to row numbers for Desktop and Mobile
    const urls: Record<string, { Desktop: number; Mobile: number, Sheet: number }> = {
      "testing-services": { Desktop: 11, Mobile: 12, Sheet: 2 },
      "about":            { Desktop: 15, Mobile: 16, Sheet: 3 },
      "news":             { Desktop: 19, Mobile: 20, Sheet: 4 },
      "careers":          { Desktop: 23, Mobile: 24, Sheet: 5 },
      "contact":          { Desktop: 27, Mobile: 28, Sheet: 6 },
      "privacy-policy":   { Desktop: 31, Mobile: 32, Sheet: 7 },
      "game-testing":     { Desktop: 35, Mobile: 36, Sheet: 8 },
    };

    let row: number | undefined;
    let timelogRow: number | undefined;
    let sheet: number | undefined;

    for (const key in urls) {
      if (url.includes(key)) {
        const isMobile = label.includes("Mobile");
        const device = isMobile ? "Mobile" : "Desktop";

        row = urls[key][device];
        timelogRow = row - (isMobile ? 2 : 1);

        sheet = urls[key]["Sheet"];

        break;
      }
    }
    
    // Fallback rows if no match
    if (!row) {
      const isMobile = label.includes("Mobile");
      row = isMobile ? 8 : 7;
      timelogRow = isMobile ? 6 : 6; // Adjust here if needed
    }

    
    // Assign values to the worksheet
    if (timelogRow! > 0) worksheet.getCell(`${column}${timelogRow}`).value = entry.logTimestamp;
    worksheet.getCell(`${column}${row}`).value = entry.performanceScore;
    
    if (fs.existsSync(entry.screenshotPathTxt)) {
      const imageId = workbook.addImage({
        filename: entry.screenshotPathTxt,
        extension: 'png',
      });
      
      if (!sheet) sheet = 1;
      const secondSheet = workbook.worksheets[sheet]; // Access dynamic sheet
      secondSheet.addImage(imageId, {
        tl: { col: 2, row: 28 }, // C29 = col: 2 (C), row: 28 (zero-based)
        ext: { width: 921.6, height: 518.4 }, // Adjust size as needed
      });
    }
  
    ////////////////////// Other Sheets
    // worksheet.getCell(`F${row!}`).value = entry.diagnosticsAuditTitleTxt;
    // worksheet.getCell(`G${row!}`).value = entry.diagnosticsAuditDisplayTxt;
    // worksheet.getCell(`H${row!}`).value = entry.redirectTxt;
    // worksheet.getCell(`I${row!}`).value = entry.redirectLinkTxt;

    // Insert image only once after writing all data
    // const imagePath = entry.screenshotPathTxt; // <-- adjust filename dynamically if needed
  
  });

  await workbook.xlsx.writeFile(excelPath);
}

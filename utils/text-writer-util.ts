import fs from 'fs';

export function textWriterUtil(
  logPath: string,
  logTimestamp: string,
  url: string,
  label: string,
  performanceScore: number,
  diagnosticsAuditTitleTxt: string,
  diagnosticsAuditDisplayTxt: string,
  redirectTxt: string,
  redirectLinkTxt: string,
  screenshotPath: string,
  htmlReportFile: string,
  outputDir: string
) {
  fs.appendFileSync(logPath, `\n[${logTimestamp}] ${url} - ${label}:`+
    `\nScore: ${performanceScore}`+
    `\nTime: ${logTimestamp}`+
    `\nDiagnostics Audit Title Text: ${diagnosticsAuditTitleTxt}` +
    `\nDiagnostics Audit Display Text: ${diagnosticsAuditDisplayTxt}`+
    `\nRedirect Text: ${redirectTxt}`+
    `\nRedirect Link Text: ${redirectLinkTxt}`+
    `\nScreenshot Path: ${screenshotPath}`+
    `\nHtml Report Path: ${htmlReportFile}.report.html`+
    `\nOutput Report Path: ${outputDir}\n`
  );
}
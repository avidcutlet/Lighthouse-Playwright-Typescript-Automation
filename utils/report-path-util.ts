import path from 'path';
import fs from 'fs';

/**
 * Creates and returns all output paths for a Lighthouse report.
 * Automatically creates the directory.
 */
export async function getLighthouseOutputPaths(folderTimestamp: string, label: string): Promise<{outputDir: string, reportPath: string, logPath: string}> {
  const outputDir = path.join(__dirname, '..', 'reports', `lighthouse-${folderTimestamp}`);
  const reportPath = path.join(outputDir, `lighthouse-${label}`);
  const logPath = path.join(outputDir, 'lighthouse-simplified-data.txt');
  
  // Ensure directory exists
  fs.mkdirSync(outputDir, { recursive: true });
  
  
  return { outputDir, reportPath, logPath };
}

// Arrange files to their designated folders
export async function arrangeFiles(outputDir: string){
  const jsonDir = path.join(outputDir, 'json');
  const htmlDir = path.join(outputDir, 'html');

  // Create Json and Html folder
  fs.mkdirSync(jsonDir, { recursive: true });
  fs.mkdirSync(htmlDir, { recursive: true });

  const files = fs.readdirSync(outputDir);

  // Look for a single .report.json and .report.html
  const jsonFile = files.find(f => f.endsWith('.report.json'));
  const htmlFile = files.find(f => f.endsWith('.report.html'));

  if (jsonFile) {
    fs.renameSync(
      path.join(outputDir, jsonFile),
      path.join(jsonDir, jsonFile)
    );
  }

  if (htmlFile) {
    fs.renameSync(
      path.join(outputDir, htmlFile),
      path.join(htmlDir, htmlFile)
    );
  }
}
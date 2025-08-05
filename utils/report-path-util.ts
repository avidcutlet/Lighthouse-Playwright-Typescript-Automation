import path from 'path';
import fs from 'fs';

/**
 * Creates and returns all output paths for a Lighthouse report.
 * Automatically creates the directory.
 */
export async function getLighthouseOutputPaths(folderTimestamp: string, label: string, url: string): Promise<{outputDir: string, reportPath: string, logPath: string}> {
  const outputDir = path.join(__dirname, '..', 'reports', `lighthouse-${folderTimestamp}`);
  const sanitized = sanitizeUrl(url);
  const reportPath = path.join(outputDir, `${sanitized}-${label}`);
  const logPath = path.join(outputDir, 'lighthouse-simplified-data.txt');
  
  // Ensure directory exists
  fs.mkdirSync(outputDir, { recursive: true });
  
  
  return { outputDir, reportPath, logPath };
}

// raw link: https://www.youtube.com/watch?v=HLdPwUrtGH0')
// output link "www_youtube_com_watch_v_HLdPwUrtGH0"
export function sanitizeUrl(url: string): string {
  return url
    .replace(/^https?:\/\//, '')     // remove protocol
    .replace(/[\/:?&=.]+/g, '_')     // replace symbols (added dot `.` here too)
    .replace(/[^a-zA-Z0-9_-]/g, ''); // remove anything else
}


// Arrange files to their designated folders
export async function arrangeFiles(outputDir: string){
  const jsonDir = path.join(outputDir, 'json');
  const htmlDir = path.join(outputDir, 'html');

  // Create Json and Html folder
  fs.mkdirSync(jsonDir, { recursive: true });
  fs.mkdirSync(htmlDir, { recursive: true });

  const files = fs.readdirSync(outputDir);

  // Look for .report.json, and .report.html then move to designated folder
   files.forEach(file => {
    const fullPath = path.join(outputDir, file);

    if (file.endsWith('.report.json')) {
      fs.renameSync(fullPath, path.join(jsonDir, file));

    } else if (file.endsWith('.report.html')) {
      fs.renameSync(fullPath, path.join(htmlDir, file));

    }
  });
}
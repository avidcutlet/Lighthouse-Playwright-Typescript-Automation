export const TARGET_URL = 'https://www.cheqsystems.com/';

export const folderTimestamp = new Date().toLocaleString('en-US', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
})
  .replace(/[/, ]/g, '-')
  .replace(/:/g, '-')
  .replace('--', '-')
  .toUpperCase();

export function formatFetchTimestamp(fetchTime: string): string {
  return new Date(fetchTime).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

// config/lighthouse-options.ts or utils/lighthouse-options.ts

export function getChromeFlags(isIncognito: boolean): string {
  return [
    '--headless',
    isIncognito ? '--incognito' : ''
  ].filter(Boolean).join(' ');
}

export function getLighthousePreset(device: 'Mobile' | 'Desktop'): string {
  return device === 'Desktop' ? '--preset=desktop' : '';
}
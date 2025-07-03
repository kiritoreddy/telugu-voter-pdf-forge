import { AppSettings } from '@/types/voter';

const SETTINGS_KEY = 'voter-app-settings';

export const getStoredSettings = (): AppSettings => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        pdfHeader: parsed.pdfHeader || 'Dharmasagar Cooperative Housing Society Limited, Nizamabad',
        pdfSubHeader: parsed.pdfSubHeader || 'For the year 2025',
        pdfPageTitle: parsed.pdfPageTitle || 'Voters Register',
        pdfPaperSize: parsed.pdfPaperSize || 'legal',
        startSerial: parsed.startSerial || 1,
        footerLeft: parsed.footerLeft || ['', '', '', ''],
        footerRight: parsed.footerRight || ['', '', '', '']
      };
    }
  } catch (error) {
    console.error('Error loading settings from localStorage:', error);
  }
  
  return {
    pdfHeader: 'Dharmasagar Cooperative Housing Society Limited, Nizamabad',
    pdfSubHeader: 'For the year 2025',
    pdfPageTitle: 'Voters Register',
    pdfPaperSize: 'legal',
    startSerial: 1,
    footerLeft: ['', '', '', ''],
    footerRight: ['', '', '', '']
  };
};

export const storeSettings = (settings: AppSettings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings to localStorage:', error);
  }
};
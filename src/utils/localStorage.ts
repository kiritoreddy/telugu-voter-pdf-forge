import { AppSettings } from '@/types/voter';

const SETTINGS_KEY = 'voter-app-settings';

export const getStoredSettings = (): AppSettings => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        pdfHeader: parsed.pdfHeader || '',
        pdfSubHeader: parsed.pdfSubHeader || '______________District, Registration No:',
        pdfPageTitle: parsed.pdfPageTitle || 'Voters list of_____________________________________________Society,___________Village,__________Mandal,',
        pdfPaperSize: parsed.pdfPaperSize || 'legal',
        startSerial: parsed.startSerial || 1,
        script: parsed.script || 'latin', // Always default to latin to ensure clean state
        footerLeft: parsed.footerLeft || ['', '','Signature of the President of Incumbent Managing', 'Committee/PIC/Official Administrator/Adhoc Committee'],
        footerRight: parsed.footerRight || ['', '', 'Signature of the Registrar', '']
      };
    }
  } catch (error) {
    console.error('Error loading settings from localStorage:', error);
  }
  
  // Return clean default settings
  return {
    pdfHeader: '',
    pdfSubHeader: '______________District, Registration No:',
    pdfPageTitle: 'Voters list of_____________________________________________Society,___________Village,__________Mandal,',
    pdfPaperSize: 'legal',
    startSerial: 1,
    script: 'latin', // Always default to latin for clean state
    footerLeft: ['', '','Signature of the President of Incumbent Managing', 'Committee/PIC/Official Administrator/Adhoc Committee'],
    footerRight: ['', '', 'Signature of the Registrar', '']
  };
};

export const storeSettings = (settings: AppSettings): void => {
  try {
    // Ensure clean storage of settings
    const cleanSettings = {
      ...settings,
      // Ensure script is properly set
      script: settings.script || 'latin'
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(cleanSettings));
  } catch (error) {
    console.error('Error saving settings to localStorage:', error);
  }
};
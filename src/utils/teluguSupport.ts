/**
 * Telugu language detection and font utilities
 */

// Telugu Unicode range: U+0C00–U+0C7F
const TELUGU_UNICODE_RANGE = /[\u0C00-\u0C7F]/;

/**
 * Detect if text contains Telugu characters
 */
export const containsTelugu = (text: string): boolean => {
  return TELUGU_UNICODE_RANGE.test(text);
};

/**
 * Detect if any voter record contains Telugu text
 */
export const detectTeluguInVoters = (voters: any[]): boolean => {
  return voters.some(voter => {
    const fieldsToCheck = [
      voter.name,
      voter.fatherHusbandName,
      voter.village,
      voter.caste
    ];
    
    return fieldsToCheck.some(field => 
      field && typeof field === 'string' && containsTelugu(field)
    );
  });
};

/**
 * Get appropriate font family based on script
 */
export const getFontFamily = (script: 'latin' | 'telugu'): string => {
  return script === 'telugu' 
    ? "'Noto Sans Telugu', 'Noto Sans', sans-serif"
    : "'Inter', sans-serif";
};

/**
 * Get CSS class for Telugu text styling
 */
export const getTextClass = (script: 'latin' | 'telugu'): string => {
  return script === 'telugu' ? 'font-telugu' : 'font-inter';
};
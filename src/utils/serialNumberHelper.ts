/**
 * Shared helper for consistent serial number calculation
 * Used by both Preview and PDF generation
 */
export const getSerialNumber = (index: number, startSerial: number): number => {
  return index + startSerial;
};

/**
 * Apply photos-first sorting to voter list
 * Used by both Preview and PDF generation to ensure consistent ordering
 */
export const applyPhotosFirstSorting = <T extends { photo: string | null }>(items: T[]): T[] => {
  return [
    ...items.filter(item => item.photo),     // with photo
    ...items.filter(item => !item.photo),   // without photo
  ];
};
export interface Voter {
  id: string;
  entryNumber: string;
  entryDate: string;
  name: string;
  fatherHusbandName: string;
  village: string;
  caste: string;
  age: string;
  gender: 'Male' | 'Female';
  photo: string | null;
}

export interface VoterFormData {
  entryNumber: string;
  entryDate: string;
  name: string;
  fatherHusbandName: string;
  village: string;
  caste: string;
  age: string;
  gender: 'Male' | 'Female';
  photo: File | null;
}

export interface AppSettings {
  pdfHeader: string;
  pdfSubHeader: string;
  pdfPageTitle: string;
  pdfPaperSize: 'a4' | 'legal';
  startSerial: number;
  script: 'latin' | 'telugu';
  footerLeft: [string, string, string, string];
  footerRight: [string, string, string, string];
}

export interface BulkUploadError {
  row: number;
  field: string;
  message: string;
  value?: string;
}

export interface ParsedVoter extends Omit<Voter, 'id'> {
  rowNumber: number;
  errors: string[];
}
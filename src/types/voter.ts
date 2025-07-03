
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
}

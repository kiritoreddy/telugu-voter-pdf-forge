
export interface Voter {
  id: string;
  entryNumber: string;
  entryDate: string;
  name: string;
  fatherHusbandName: string;
  village: string;
  caste: string;
  age: string;
  gender: 'పురుషుడు' | 'స్త్రీ';
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
  gender: 'పురుషుడు' | 'స్త్రీ';
  photo: File | null;
}

import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { ParsedVoter, BulkUploadError, Voter } from '@/types/voter';

export const downloadTemplate = () => {
  const headers = [
    'entryNumber',
    'entryDate',
    'name',
    'fatherHusbandName',
    'village',
    'caste',
    'age',
    'gender'
  ];

  const sampleData = [
    {
      entryNumber: '001',
      entryDate: '01-01-2025',
      name: 'John Doe',
      fatherHusbandName: 'Robert Doe',
      village: 'Sample Village',
      caste: 'General',
      age: '25',
      gender: 'Male'
    }
  ];

  const ws = XLSX.utils.json_to_sheet([headers, ...sampleData], { skipHeader: true });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Voters');
  
  XLSX.writeFile(wb, 'voters_template.xlsx');
};

export const parseExcelFile = async (
  file: File,
  onProgress: (progress: number) => void
): Promise<ParsedVoter[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Remove header row
        const rows = jsonData.slice(1) as any[][];
        const totalRows = rows.length;
        const chunkSize = 500;
        const parsedVoters: ParsedVoter[] = [];
        
        for (let i = 0; i < totalRows; i += chunkSize) {
          const chunk = rows.slice(i, Math.min(i + chunkSize, totalRows));
          
          chunk.forEach((row, index) => {
            const rowNumber = i + index + 2; // +2 for header and 0-based index
            const voter = parseVoterRow(row, rowNumber);
            parsedVoters.push(voter);
          });
          
          // Update progress
          const progress = Math.min(((i + chunkSize) / totalRows) * 100, 100);
          onProgress(progress);
          
          // Allow UI to update
          await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        resolve(parsedVoters);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

export const parsePhotosZip = async (
  file: File,
  onProgress: (progress: number) => void
): Promise<Map<string, string>> => {
  const zip = new JSZip();
  const photoMap = new Map<string, string>();
  
  try {
    const zipData = await zip.loadAsync(file);
    const files = Object.keys(zipData.files);
    const totalFiles = files.length;
    
    for (let i = 0; i < totalFiles; i++) {
      const fileName = files[i];
      const zipFile = zipData.files[fileName];
      
      if (!zipFile.dir && isImageFile(fileName)) {
        const entryNumber = getEntryNumberFromFileName(fileName);
        if (entryNumber) {
          const blob = await zipFile.async('blob');
          const base64 = await blobToBase64(blob);
          photoMap.set(entryNumber, base64);
        }
      }
      
      // Update progress
      const progress = ((i + 1) / totalFiles) * 100;
      onProgress(progress);
      
      // Allow UI to update
      if (i % 50 === 0) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    
    return photoMap;
  } catch (error) {
    throw new Error('Failed to parse photos ZIP file');
  }
};

export const validateVoters = (voters: ParsedVoter[]): BulkUploadError[] => {
  const errors: BulkUploadError[] = [];
  const entryNumbers = new Set<string>();
  
  voters.forEach((voter) => {
    // Check for duplicate entry numbers
    if (entryNumbers.has(voter.entryNumber)) {
      errors.push({
        row: voter.rowNumber,
        field: 'entryNumber',
        message: 'Duplicate entry number',
        value: voter.entryNumber
      });
    } else {
      entryNumbers.add(voter.entryNumber);
    }
    
    // Add voter-specific errors
    voter.errors.forEach(error => {
      errors.push({
        row: voter.rowNumber,
        field: 'general',
        message: error
      });
    });
  });
  
  return errors;
};

export const generateErrorReport = (errors: BulkUploadError[]): void => {
  const reportData = errors.map(error => ({
    Row: error.row,
    Field: error.field,
    Error: error.message,
    Value: error.value || ''
  }));
  
  const ws = XLSX.utils.json_to_sheet(reportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Errors');
  
  XLSX.writeFile(wb, 'bulk_upload_errors.xlsx');
};

export const mergePhotosWithVoters = (
  voters: ParsedVoter[],
  photoMap: Map<string, string>
): ParsedVoter[] => {
  return voters.map(voter => ({
    ...voter,
    photo: photoMap.get(voter.entryNumber) || null
  }));
};

export const convertToVoters = (parsedVoters: ParsedVoter[]): Voter[] => {
  return parsedVoters.map(voter => ({
    id: `bulk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    entryNumber: voter.entryNumber,
    entryDate: voter.entryDate,
    name: voter.name,
    fatherHusbandName: voter.fatherHusbandName,
    village: voter.village,
    caste: voter.caste,
    age: voter.age,
    gender: voter.gender,
    photo: voter.photo
  }));
};

// Helper functions
const parseVoterRow = (row: any[], rowNumber: number): ParsedVoter => {
  const errors: string[] = [];
  
  const entryNumber = String(row[0] || '').trim();
  const entryDate = String(row[1] || '').trim();
  const name = String(row[2] || '').trim();
  const fatherHusbandName = String(row[3] || '').trim();
  const village = String(row[4] || '').trim();
  const caste = String(row[5] || '').trim();
  const age = String(row[6] || '').trim();
  const gender = String(row[7] || '').trim();
  
  // Validation
  if (!entryNumber) errors.push('Entry number is required');
  if (!entryDate) errors.push('Entry date is required');
  if (!name) errors.push('Name is required');
  if (!fatherHusbandName) errors.push('Father/Husband name is required');
  if (!village) errors.push('Village is required');
  if (!caste) errors.push('Caste is required');
  if (!age) errors.push('Age is required');
  if (!gender) errors.push('Gender is required');
  
  // Validate gender
  if (gender && !['Male', 'Female'].includes(gender)) {
    errors.push('Gender must be "Male" or "Female"');
  }
  
  // Validate age
  if (age && (isNaN(Number(age)) || Number(age) < 18 || Number(age) > 120)) {
    errors.push('Age must be a number between 18 and 120');
  }
  
  // Validate date format (DD-MM-YYYY)
  if (entryDate && !isValidDate(entryDate)) {
    errors.push('Entry date must be in DD-MM-YYYY format');
  }
  
  return {
    entryNumber,
    entryDate,
    name,
    fatherHusbandName,
    village,
    caste,
    age,
    gender: gender as 'Male' | 'Female',
    photo: null,
    rowNumber,
    errors
  };
};

const isValidDate = (dateString: string): boolean => {
  const regex = /^\d{2}-\d{2}-\d{4}$/;
  if (!regex.test(dateString)) return false;
  
  const [day, month, year] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  return date.getFullYear() === year &&
         date.getMonth() === month - 1 &&
         date.getDate() === day;
};

const isImageFile = (fileName: string): boolean => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  return imageExtensions.includes(extension);
};

const getEntryNumberFromFileName = (fileName: string): string | null => {
  const baseName = fileName.substring(fileName.lastIndexOf('/') + 1);
  const entryNumber = baseName.substring(0, baseName.lastIndexOf('.'));
  return entryNumber || null;
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
/* ------------------------------------------------------------------
   bulkUpload.ts – Excel + ZIP parser / validator / converter
   ------------------------------------------------------------------ */

   import * as XLSX from 'xlsx';
   import JSZip from 'jszip';
   import { ParsedVoter, BulkUploadError, Voter } from '@/types/voter';
   
   /* ================================================================
      1. TEMPLATE DOWNLOAD
      ================================================================ */
   export const downloadTemplate = (): void => {
     const headers = [
       'entryNumber',
       'entryDate',
       'name',
       'fatherHusbandName',
       'village',
       'caste',
       'age',
       'gender',
     ];
   
     const sampleData = [
       {
         entryNumber: '001',
         entryDate: '01-01-2025',
         name: 'Ravi Kumar',
         fatherHusbandName: 'Raju Kumar',
         village: 'Warangal',
         caste: 'General',
         age: '25',
         gender: 'Male',
       },
     ];
   
     /* Create sheet with explicit header row (skipHeader = true) */
     const ws = XLSX.utils.json_to_sheet([headers, ...sampleData], {
       skipHeader: true,
     });
     const wb = XLSX.utils.book_new();
     XLSX.utils.book_append_sheet(wb, ws, 'Voters');
     XLSX.writeFile(wb, 'voters_template.xlsx');
   };
   
   /* ================================================================
      2. EXCEL PARSER  (chunked for 10k rows)
      ================================================================ */
   export const parseExcelFile = async (
     file: File,
     onProgress: (p: number) => void
   ): Promise<ParsedVoter[]> =>
     new Promise((resolve, reject) => {
       const reader = new FileReader();
   
       reader.onload = async (e) => {
         try {
           const data = new Uint8Array(e.target?.result as ArrayBuffer);
           const wb = XLSX.read(data, { type: 'array' });
           const sheet = wb.Sheets[wb.SheetNames[0]];
           const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
   
           const rows = json.slice(1); // remove header
           const total = rows.length;
           const chunk = 500;
           const parsed: ParsedVoter[] = [];
   
           for (let i = 0; i < total; i += chunk) {
             const slice = rows.slice(i, i + chunk);
             slice.forEach((row, idx) =>
               parsed.push(parseVoterRow(row, i + idx + 2))
             );
   
             onProgress(Math.min(((i + chunk) / total) * 100, 100));
             await new Promise((r) => setTimeout(r, 10)); // let UI breathe
           }
   
           resolve(parsed);
         } catch (err) {
           reject(err);
         }
       };
   
       reader.onerror = () => reject(new Error('Failed to read file'));
       reader.readAsArrayBuffer(file);
     });
   
   /* ================================================================
      3. ZIP PHOTO PARSER
      ================================================================ */
   export const parsePhotosZip = async (
     file: File,
     onProgress: (p: number) => void
   ): Promise<Map<string, string>> => {
     const zip = new JSZip();
     const map = new Map<string, string>();
   
     try {
       const z = await zip.loadAsync(file);
       const fileNames = Object.keys(z.files);
       const total = fileNames.length;
   
       for (let i = 0; i < total; i++) {
         const fname = fileNames[i];
         const zFile = z.files[fname];
         if (zFile.dir) continue;
   
         if (isImageFile(fname)) {
           const entry = getEntryNumberFromFileName(fname);
           if (entry) {
             const blob = await zFile.async('blob');
             map.set(entry, await blobToBase64(blob));
           }
         }
   
         onProgress(((i + 1) / total) * 100);
         if (i % 50 === 0) await new Promise((r) => setTimeout(r, 10));
       }
   
       return map;
     } catch {
       throw new Error('Failed to parse photos ZIP file');
     }
   };
   
   /* ================================================================
      4. VALIDATION + ERROR REPORT
      ================================================================ */
   export const validateVoters = (voters: ParsedVoter[]): BulkUploadError[] => {
     const errs: BulkUploadError[] = [];
     const seen = new Set<string>();
   
     voters.forEach((v) => {
       if (seen.has(v.entryNumber)) {
         errs.push({
           row: v.rowNumber,
           field: 'entryNumber',
           message: 'Duplicate entry number',
           value: v.entryNumber,
         });
       } else seen.add(v.entryNumber);
   
       v.errors.forEach((msg) =>
         errs.push({ row: v.rowNumber, field: 'general', message: msg })
       );
     });
   
     return errs;
   };
   
   export const generateErrorReport = (errors: BulkUploadError[]): void => {
     const data = errors.map((e) => ({
       Row: e.row,
       Field: e.field,
       Error: e.message,
       Value: e.value ?? '',
     }));
   
     const ws = XLSX.utils.json_to_sheet(data);
     const wb = XLSX.utils.book_new();
     XLSX.utils.book_append_sheet(wb, ws, 'Errors');
     XLSX.writeFile(wb, 'bulk_upload_errors.xlsx');
   };
   
   /* ================================================================
      5. MERGE + CONVERT
      ================================================================ */
   export const mergePhotosWithVoters = (
     voters: ParsedVoter[],
     photoMap: Map<string, string>
   ): ParsedVoter[] =>
     voters.map((v) => ({ ...v, photo: photoMap.get(v.entryNumber) || null }));
   
   export const convertToVoters = (list: ParsedVoter[]): Voter[] =>
     list.map((v) => ({
       id: `bulk_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
       ...v,
     }));
   
   /* ================================================================
      6. CORE: parseVoterRow  (with robust date logic!)
      ================================================================ */
   const parseVoterRow = (row: any[], rowNumber: number): ParsedVoter => {
     const errors: string[] = [];
   
     const entryNumber = String(row[0] ?? '').trim();
   
     /* --- date normalisation ------------------------------------ */
     let raw = row[1];
     let entryDate = '';
   
     if (raw instanceof Date) {
       entryDate = formatDate(raw);
     } else if (typeof raw === 'number') {
       // Excel serial → JS Date via SSF helper
       const d = XLSX.SSF.parse_date_code(raw);
       if (d) entryDate = formatDate(new Date(d.y, d.m - 1, d.d));
     } else {
       entryDate = String(raw ?? '').trim();
     }
     /* ------------------------------------------------------------ */
   
     const name              = String(row[2] ?? '').trim();
     const fatherHusbandName = String(row[3] ?? '').trim();
     const village           = String(row[4] ?? '').trim();
     const caste             = String(row[5] ?? '').trim();
     const age               = String(row[6] ?? '').trim();
     const gender            = String(row[7] ?? '').trim();
   
     /* --- validation rules -------------------------------------- */
     if (!entryNumber)           errors.push('Entry number is required');
     if (!entryDate)             errors.push('Entry date is required');
     if (!name)                  errors.push('Name is required');
     if (!fatherHusbandName)     errors.push('Father/Husband name is required');
     if (!village)               errors.push('Village is required');
     if (!caste)                 errors.push('Caste is required');
     if (!age)                   errors.push('Age is required');
     if (!gender)                errors.push('Gender is required');
   
     if (gender && !['Male', 'Female'].includes(gender))
       errors.push('Gender must be "Male" or "Female"');
   
     if (age && (isNaN(+age) || +age < 18 || +age > 120))
       errors.push('Age must be a number between 18 and 120');
   
     if (entryDate && !isValidDate(entryDate))
       errors.push('Entry date must be in DD-MM-YYYY format');
     /* ------------------------------------------------------------ */
   
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
       errors,
     };
   };
   
   /* ================================================================
      7. UTILITY HELPERS
      ================================================================ */
   const formatDate = (d: Date): string =>
     `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(
       2,
       '0'
     )}-${d.getFullYear()}`;
   
   const isValidDate = (s: string): boolean => {
     const re = /^\d{2}-\d{2}-\d{4}$/;
     if (!re.test(s)) return false;
     const [dd, mm, yyyy] = s.split('-').map(Number);
     const dt = new Date(yyyy, mm - 1, dd);
     return (
       dt.getFullYear() === yyyy &&
       dt.getMonth() === mm - 1 &&
       dt.getDate() === dd
     );
   };
   
   const isImageFile = (name: string): boolean => {
     const ext = name.toLowerCase().slice(name.lastIndexOf('.'));
     return ['.jpg', '.jpeg', '.png', '.gif', '.bmp'].includes(ext);
   };
   
   const getEntryNumberFromFileName = (name: string): string | null => {
     const base = name.substring(name.lastIndexOf('/') + 1);
     const withoutExt = base.slice(0, base.lastIndexOf('.'));
     return withoutExt || null;
   };
   
   const blobToBase64 = (b: Blob): Promise<string> =>
     new Promise((res, rej) => {
       const r = new FileReader();
       r.onload = () => res(r.result as string);
       r.onerror = rej;
       r.readAsDataURL(b);
     });
   
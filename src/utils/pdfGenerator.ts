import jsPDF from 'jspdf';
import { Voter, AppSettings } from '@/types/voter';
import { getSerialNumber, applyPhotosFirstSorting } from './serialNumberHelper';

/* ---------- 1 · Baseline metrics (LEGAL reference) ---------- */
const BASE_WIDTH  = 216;   // mm
const BASE_HEIGHT = 356;   // mm
const BASE_ROW_HEIGHT = 28.1;           // Legal row height when 10 rows/page
const BASE_FONT = {
  header:     13,
  subHeader:  10,
  pageTitle:  10,
  label:       8,
  body:        8,
  name:        8,
  footer:      8,
  pageNum:     8,
  photo:       7,
};
const MIN_FONT = 7;

/* ---------- 2 · Telugu Font Support ---------- */
let teluguFontLoaded = false;

const loadTeluguFont = async (pdf: jsPDF): Promise<void> => {
  if (teluguFontLoaded) return;
  
  try {
    // Load Noto Sans Telugu font from Google Fonts
    const fontUrl = 'https://fonts.gstatic.com/s/notosanstelugu/v25/0FlxVOGZlE2Rrtr-HmgkaMBBjAIJANOgZgPtfA.woff2';
    const response = await fetch(fontUrl);
    const fontData = await response.arrayBuffer();
    
    // Convert to base64 for jsPDF
    const fontBase64 = btoa(String.fromCharCode(...new Uint8Array(fontData)));
    
    // Add font to jsPDF
    pdf.addFileToVFS('NotoSansTelugu.ttf', fontBase64);
    pdf.addFont('NotoSansTelugu.ttf', 'NotoSansTelugu', 'normal');
    
    teluguFontLoaded = true;
  } catch (error) {
    console.warn('Failed to load Telugu font, falling back to default:', error);
  }
};

const setFont = (pdf: jsPDF, script: 'latin' | 'telugu', style: 'normal' | 'bold' = 'normal'): void => {
  if (script === 'telugu' && teluguFontLoaded) {
    pdf.setFont('NotoSansTelugu', style);
  } else {
    pdf.setFont('helvetica', style);
  }
};

/* ---------- 3 · Generate PDF with photos-first ordering ---------- */
export const generatePDF = async (
  voters: Voter[],
  settings: AppSettings
): Promise<void> => {
  if (!voters.length) throw new Error('No voters to export');

  /* 3-A. Apply photos-first sorting (same as Preview) */
  const sortedVoters = applyPhotosFirstSorting(voters);

  /* 3-B. Paper & scale */
  const paperDim = settings.pdfPaperSize === 'a4'
    ? { width: 210, height: 297 }
    : { width: 216, height: 356 };
  const pdf   = new jsPDF('p', 'mm', [paperDim.width, paperDim.height]);
  const scale = settings.pdfPaperSize === 'legal'
    ? 1
    : paperDim.height / BASE_HEIGHT;

  /* 3-C. Load Telugu font if needed */
  if (settings.script === 'telugu') {
    await loadTeluguFont(pdf);
  }

  /* 3-D. Layout constants */
  const margin        = 10;
  const headerHeight  = 30 * scale;
  const footerHeight  = 25 * scale;
  const VOTERS_PER_ROW = 2;
  const ROWS_PER_PAGE  = 10;                 // 🔒 fixed
  const VOTERS_PER_PAGE = VOTERS_PER_ROW * ROWS_PER_PAGE;

  const contentHeight = paperDim.height - headerHeight - footerHeight - margin * 2;
  const rowHeight     = contentHeight / ROWS_PER_PAGE;               // auto-fit
  const columnWidth   = (paperDim.width - margin * 2) / VOTERS_PER_ROW;
  const lineHeight    = rowHeight / 6;                               // 5 lines + padding

  /* 3-E. Scaled fonts */
  const fontScale = rowHeight / BASE_ROW_HEIGHT;
  const font = Object.fromEntries(
    (Object.entries(BASE_FONT) as [keyof typeof BASE_FONT, number][])
      .map(([k, v]) => [k, Math.max(MIN_FONT, v * fontScale)])
  ) as Record<keyof typeof BASE_FONT, number>;

  /* 3-F. Pagination with column-major ordering */
  const totalPages = Math.ceil(sortedVoters.length / VOTERS_PER_PAGE);
  for (let p = 0; p < totalPages; p++) {
    if (p) pdf.addPage();
    addHeader(pdf, settings, paperDim.width, font);

    const startY = 5 + headerHeight;
    for (let row = 0; row < ROWS_PER_PAGE; row++) {
      for (let col = 0; col < VOTERS_PER_ROW; col++) {
        // Column-major index calculation
        const idx = p * VOTERS_PER_PAGE + row + col * ROWS_PER_PAGE;
        if (idx >= sortedVoters.length) continue;
        
        // Use shared helper for consistent serial numbering
        const serialNumber = getSerialNumber(idx, settings.startSerial);
        
        await addBox(
          pdf,
          sortedVoters[idx],
          margin + col * columnWidth,
          startY + row * rowHeight,
          columnWidth,
          rowHeight,
          serialNumber,
          font,
          lineHeight,
          settings.script
        );
      }
    }

    addFooter(pdf, settings, paperDim, p + 1, totalPages, font);
  }

  pdf.save(`voter-list-${settings.pdfPaperSize}-${settings.script}.pdf`);
};

/* ---------- 4 · Helpers ---------- */
const addHeader = (
  pdf: jsPDF,
  settings: AppSettings,
  pageWidth: number,
  f: Record<string, number>
) => {
  setFont(pdf, settings.script, 'bold');
  pdf.setFontSize(f.header);
  pdf.text(settings.pdfHeader, pageWidth / 2, 12, { align: 'center' });

  pdf.setFontSize(f.pageTitle);
  pdf.text(settings.pdfPageTitle, pageWidth / 2, 18, { align: 'center' });

  if (settings.pdfSubHeader?.trim()) {
    pdf.setFontSize(f.subHeader);
    pdf.text(settings.pdfSubHeader, pageWidth / 2, 24, { align: 'center' });
  }
};

const addFooter = (
  pdf: jsPDF,
  settings: AppSettings,
  dim: { width: number; height: number },
  pageNo: number,
  total: number,
  f: Record<string, number>
) => {
  const y0 = dim.height - 30;
  setFont(pdf, settings.script, 'normal');
  pdf.setFontSize(f.footer);

  settings.footerLeft.forEach((txt, i) =>
    txt?.trim() && pdf.text(txt, 10, y0 + i * 4)
  );
  settings.footerRight.forEach((txt, i) =>
    txt?.trim() &&
    pdf.text(txt, dim.width - 10, y0 + i * 4, { align: 'right' })
  );

  pdf.setFontSize(f.pageNum);
  pdf.text(`Page ${pageNo} of ${total}`, dim.width / 2, dim.height - 5, {
    align: 'center',
  });
};

const addBox = async (
  pdf: jsPDF,
  v: Voter,
  x: number,
  y: number,
  w: number,
  h: number,
  slNo: number,
  f: Record<string, number>,
  lh: number,
  script: 'latin' | 'telugu'
) => {
  /* borders */
  const snoW = w * 0.1,
    photoW = w * 0.25,
    textW = w - snoW - photoW - 6;
  pdf.setLineWidth(0.3).rect(x, y, w, h).rect(x, y, snoW, h);

  /* serial */
  setFont(pdf, script, 'bold');
  pdf.setFontSize(f.label);
  pdf.text(String(slNo), x + snoW / 2, y + h / 2, { align: 'center' });

  /* photo */
  const pX = x + w - photoW - 2,
    pY = y + 2,
    pH = h - 4;
  pdf.rect(pX, pY, photoW, pH);
  if (v.photo) {
    try {
      pdf.addImage(v.photo, 'JPEG', pX + 1, pY + 1, photoW - 2, pH - 2);
    } catch {
      pdf.setFontSize(f.photo);
      pdf.text('Photo', pX + photoW / 2, pY + pH / 2, {
        align: 'center',
      });
    }
  } else {
    pdf.setFontSize(f.photo);
    pdf.text('Photo', pX + photoW / 2, pY + pH / 2, {
      align: 'center',
    });
  }

  /* text */
  let tY = y + 5;
  const tX = x + snoW + 2;
  setFont(pdf, script, 'bold');
  pdf.setFontSize(f.body);

  pdf.text(`Admn. No: ${v.entryNumber}`, tX, tY);
  pdf.text(`Admn. Date: ${v.entryDate}`, tX + textW, tY, { align: 'right' });
  tY += lh;

  setFont(pdf, script, 'bold');
  pdf.setFontSize(f.name);
  pdf.text(`Name: ${v.name}`, tX, tY);
  tY += lh;

  setFont(pdf, script, 'normal');
  pdf.setFontSize(f.body);
  pdf.text(`Father/Husband Name: ${v.fatherHusbandName}`, tX, tY);
  tY += lh;

  pdf.text(`Village: ${v.village}`, tX, tY);
  tY += lh;

  pdf.text(
    `Caste: ${v.caste}  Age: ${v.age}  Gender: ${v.gender}`,
    tX,
    tY
  );
};
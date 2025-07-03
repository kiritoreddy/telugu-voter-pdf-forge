import jsPDF from 'jspdf';
import { Voter, AppSettings } from '@/types/voter';

// Base reference dimensions and font sizes (Legal paper as baseline)
const BASE_WIDTH = 216;   // mm
const BASE_HEIGHT = 356;  // mm
const BASE_FONT = {
  header: 13,
  subHeader: 10,
  pageTitle: 10,
  label: 8,
  body: 8,
  name: 8,
  pageNum: 8,
  footer: 8,
  photo: 7
};

const MIN_FONT = 7; // Minimum readable font size

export const generatePDF = async (voters: Voter[], settings: AppSettings): Promise<void> => {
  if (voters.length === 0) {
    throw new Error('No voters to export');
  }

  const pdf = new jsPDF('p', 'mm', settings.pdfPaperSize);
  
  // Paper dimensions
  const dimensions = {
    a4: { width: 210, height: 297 },
    legal: { width: 216, height: 356 }
  };
  
  const { width: pageWidth, height: pageHeight } = dimensions[settings.pdfPaperSize];
  
  // Calculate scaling factor based on height (more restrictive dimension)
  const scale = settings.pdfPaperSize === 'legal' ? 1 : (pageHeight / BASE_HEIGHT);
  
  // Apply scaling to all font sizes with minimum font clamping
  const font = {
    header: Math.max(MIN_FONT, BASE_FONT.header * scale),
    subHeader: Math.max(MIN_FONT, BASE_FONT.subHeader * scale),
    pageTitle: Math.max(MIN_FONT, BASE_FONT.pageTitle * scale),
    label: Math.max(MIN_FONT, BASE_FONT.label * scale),
    body: Math.max(MIN_FONT, BASE_FONT.body * scale),
    name: Math.max(MIN_FONT, BASE_FONT.name * scale),
    pageNum: Math.max(MIN_FONT, BASE_FONT.pageNum * scale),
    footer: Math.max(MIN_FONT, BASE_FONT.footer * scale),
    photo: Math.max(MIN_FONT, BASE_FONT.photo * scale)
  };
  
  const margin = 10;
  const contentWidth = pageWidth - (margin * 2);
  
  // Layout configuration - scale line heights proportionally
  const VOTERS_PER_ROW = 2;
  const headerHeight = 30 * scale;
  const footerHeight = 25 * scale;
  const availableHeight = pageHeight - headerHeight - footerHeight - (margin * 2);
  const rowHeight = 42 * scale;
  const ROWS_PER_PAGE = Math.floor(availableHeight / rowHeight);
  const VOTERS_PER_PAGE = VOTERS_PER_ROW * ROWS_PER_PAGE;
  
  const totalPages = Math.ceil(voters.length / VOTERS_PER_PAGE);
  let currentPage = 1;

  for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
    if (pageIndex > 0) {
      pdf.addPage();
    }

    // Add header
    addHeader(pdf, settings, pageWidth, font);
    
    // Layout settings
    const startY = headerHeight;
    const columnWidth = contentWidth / VOTERS_PER_ROW;
    
    // Draw voters in column-major order
    for (let row = 0; row < ROWS_PER_PAGE; row++) {
      for (let col = 0; col < VOTERS_PER_ROW; col++) {
        // Calculate global voter index using column-major ordering
        const index = pageIndex * VOTERS_PER_PAGE + row + col * ROWS_PER_PAGE;
        
        // Skip if we've run out of voters
        if (index >= voters.length) {
          break;
        }
        
        const voter = voters[index];
        const x = margin + (col * columnWidth);
        const y = startY + (row * rowHeight);
        
        // Serial number = index + startSerial
        const serialNo = index + settings.startSerial;
        
        await addVoterToGrid(pdf, voter, x, y, columnWidth, rowHeight, serialNo, font, scale);
      }
      
      // Break outer loop if we've run out of voters
      if (pageIndex * VOTERS_PER_PAGE + row + ROWS_PER_PAGE >= voters.length) {
        break;
      }
    }
    
    // Add footer with custom blocks
    addFooter(pdf, settings, pageWidth, pageHeight, currentPage, totalPages, font);
    currentPage++;
  }

  pdf.save(`voter-list-${settings.pdfPaperSize}.pdf`);
};

const addHeader = (pdf: jsPDF, settings: AppSettings, pageWidth: number, font: any) => {
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(font.header);
  pdf.text(settings.pdfHeader, pageWidth / 2, 12, { align: 'center' });

  pdf.setFontSize(font.pageTitle);
  pdf.text(settings.pdfPageTitle, pageWidth / 2, 18, { align: 'center' });
  
  if (settings.pdfSubHeader) {
    pdf.setFontSize(font.subHeader);
    pdf.text(settings.pdfSubHeader, pageWidth / 2, 24, { align: 'center' });
  }
};

const addFooter = (pdf: jsPDF, settings: AppSettings, pageWidth: number, pageHeight: number, currentPage: number, totalPages: number, font: any) => {
  const margin = 10;
  const footerStartY = pageHeight - margin - 20;
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(font.footer);
  
  // Left footer block (4 lines)
  settings.footerLeft.forEach((txt, i) => {
    if (txt && txt.trim()) {
      pdf.text(txt, margin, footerStartY + i * 4);
    }
  });
  
  // Right footer block (4 lines)
  settings.footerRight.forEach((txt, i) => {
    if (txt && txt.trim()) {
      pdf.text(txt, pageWidth - margin, footerStartY + i * 4, { align: 'right' });
    }
  });
  
  // Page number centered below footer blocks
  pdf.setFontSize(font.pageNum);
  pdf.text(`Page ${currentPage} of ${totalPages}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
};

const addVoterToGrid = async (pdf: jsPDF, voter: Voter, x: number, y: number, width: number, height: number, serialNo: number, font: any, scale: number) => {
  const snoWidth = width * 0.1;
  const photoWidth = width * 0.25;
  const textWidth = width - snoWidth - photoWidth - 6;

  // Draw borders
  pdf.setLineWidth(0.3);
  pdf.rect(x, y, width, height);
  pdf.rect(x, y, snoWidth, height);

  // Serial number
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(font.label);
  pdf.text(serialNo.toString(), x + snoWidth / 2, y + height / 2, { align: 'center' });

  // Photo section
  const photoHeight = height - 4;
  const photoX = x + width - photoWidth - 2;
  const photoY = y + 2;
  pdf.rect(photoX, photoY, photoWidth, photoHeight);

  if (voter.photo) {
    try {
      pdf.addImage(voter.photo, 'JPEG', photoX + 0.5, photoY + 0.5, photoWidth - 1, photoHeight - 1);
    } catch {
      pdf.setFontSize(font.photo);
      pdf.text('Photo', photoX + photoWidth / 2, photoY + photoHeight / 2, { align: 'center' });
    }
  } else {
    pdf.setFontSize(font.photo);
    pdf.text('Photo', photoX + photoWidth / 2, photoY + photoHeight / 2, { align: 'center' });
  }

  // Text content with scaled line height
  const textX = x + snoWidth + 2;
  let textY = y + 5;
  const lineHeight = 3.5 * scale;

  pdf.setFontSize(font.body);
  pdf.setFont('helvetica', 'normal');

  // Line 1: Entry No. and Entry Date
  pdf.text(`Entry No.: ${voter.entryNumber}`, textX, textY);
  pdf.text(`Entry Date: ${voter.entryDate}`, textX + textWidth, textY, { align: 'right' });
  textY += lineHeight;

  // Line 2: Name
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(font.name);
  pdf.text(`Name: ${voter.name}`, textX, textY);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(font.body);
  textY += lineHeight;

  // Line 3: Father/Husband Name
  pdf.text(`Father/Husband Name: ${voter.fatherHusbandName}`, textX, textY);
  textY += lineHeight;

  // Line 4: Village
  pdf.text(`Village: ${voter.village}`, textX, textY);
  textY += lineHeight;

  // Line 5: Caste, Age, Gender on one line
  const casteAgeGender = `Caste: ${voter.caste} | Age: ${voter.age} | Gender: ${voter.gender}`;
  pdf.text(casteAgeGender, textX, textY);
};
import jsPDF from 'jspdf';
import { Voter, AppSettings } from '@/types/voter';

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
  const margin = 10;
  const contentWidth = pageWidth - (margin * 2);
  
  // Layout configuration
  const VOTERS_PER_ROW = 2;
  const headerHeight = 30;
  const footerHeight = 20;
  const availableHeight = pageHeight - headerHeight - footerHeight - (margin * 2);
  const rowHeight = 42;
  const ROWS_PER_PAGE = Math.floor(availableHeight / rowHeight);
  const VOTERS_PER_PAGE = VOTERS_PER_ROW * ROWS_PER_PAGE;
  
  const totalPages = Math.ceil(voters.length / VOTERS_PER_PAGE);
  let currentPage = 1;

  for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
    if (pageIndex > 0) {
      pdf.addPage();
    }

    // Add header
    addHeader(pdf, settings, pageWidth);
    
    // Get voters for this page
    const startIndex = pageIndex * VOTERS_PER_PAGE;
    const endIndex = Math.min(startIndex + VOTERS_PER_PAGE, voters.length);
    const pageVoters = voters.slice(startIndex, endIndex);
    
    // Layout settings
    const startY = headerHeight;
    const columnWidth = contentWidth / VOTERS_PER_ROW;
    
    // Draw voters in grid layout with vertical serial numbering
    for (let i = 0; i < pageVoters.length; i++) {
      const voter = pageVoters[i];
      const row = Math.floor(i / VOTERS_PER_ROW);
      const col = i % VOTERS_PER_ROW;
      
      const x = margin + (col * columnWidth);
      const y = startY + (row * rowHeight);
      
      // Calculate serial number (vertical ordering)
      const serialNo = settings.startSerial + startIndex + (col * ROWS_PER_PAGE) + row;
      
      await addVoterToGrid(pdf, voter, x, y, columnWidth, rowHeight, serialNo);
    }
    
    // Add footer
    addFooter(pdf, settings, pageWidth, pageHeight, currentPage, totalPages);
    currentPage++;
  }

  pdf.save(`voter-list-${settings.pdfPaperSize}.pdf`);
};

const addHeader = (pdf: jsPDF, settings: AppSettings, pageWidth: number) => {
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text(settings.pdfHeader, pageWidth / 2, 12, { align: 'center' });

  pdf.setFontSize(10);
  pdf.text(settings.pdfPageTitle, pageWidth / 2, 18, { align: 'center' });
  
  if (settings.pdfSubHeader) {
    pdf.setFontSize(10);
    pdf.text(settings.pdfSubHeader, pageWidth / 2, 24, { align: 'center' });
  }
};

const addFooter = (pdf: jsPDF, settings: AppSettings, pageWidth: number, pageHeight: number, currentPage: number, totalPages: number) => {
  const footerY = pageHeight - 15;
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  
  // Left footer
  let leftY = footerY;
  settings.footerLeft.forEach((line, index) => {
    if (line.trim()) {
      pdf.text(line, 10, leftY + (index * 3));
    }
  });
  
  // Right footer
  let rightY = footerY;
  settings.footerRight.forEach((line, index) => {
    if (line.trim()) {
      pdf.text(line, pageWidth - 10, rightY + (index * 3), { align: 'right' });
    }
  });
  
  // Page number (center)
  pdf.text(`Page ${currentPage} of ${totalPages}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
};

const addVoterToGrid = async (pdf: jsPDF, voter: Voter, x: number, y: number, width: number, height: number, serialNo: number) => {
  const snoWidth = width * 0.1;
  const photoWidth = width * 0.25;
  const textWidth = width - snoWidth - photoWidth - 6;

  // Draw borders
  pdf.setLineWidth(0.3);
  pdf.rect(x, y, width, height);
  pdf.rect(x, y, snoWidth, height);

  // Serial number
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
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
      pdf.setFontSize(7);
      pdf.text('Photo', photoX + photoWidth / 2, photoY + photoHeight / 2, { align: 'center' });
    }
  } else {
    pdf.setFontSize(7);
    pdf.text('Photo', photoX + photoWidth / 2, photoY + photoHeight / 2, { align: 'center' });
  }

  // Text content
  const textX = x + snoWidth + 2;
  let textY = y + 5;
  const lineHeight = 3.5;

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');

  // Line 1: Entry No. and Entry Date
  pdf.text(`Entry No.: ${voter.entryNumber}`, textX, textY);
  pdf.text(`Entry Date: ${voter.entryDate}`, textX + textWidth, textY, { align: 'right' });
  textY += lineHeight;

  // Line 2: Name
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Name: ${voter.name}`, textX, textY);
  pdf.setFont('helvetica', 'normal');
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
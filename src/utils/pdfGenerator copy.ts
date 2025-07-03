import jsPDF from 'jspdf';
import { Voter } from '@/types/voter';

export const generatePDF = async (voters: Voter[], headerText: string) => {
  if (voters.length === 0) {
    alert('No voters to export');
    return;
  }

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const contentWidth = pageWidth - (margin * 2);
  
  // 2 voters per row, multiple rows per page
  const VOTERS_PER_ROW = 2;
  const ROWS_PER_PAGE = 10;
  const VOTERS_PER_PAGE = VOTERS_PER_ROW * ROWS_PER_PAGE;
  const totalPages = Math.ceil(voters.length / VOTERS_PER_PAGE);
  
  let currentPage = 1;

  for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
    if (pageIndex > 0) {
      pdf.addPage();
    }

    // Add header
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text(headerText, pageWidth / 2, 15, { align: 'center' });
    pdf.setFontSize(10);
    pdf.text('Members List', pageWidth / 2, 22, { align: 'center' });
    
    // Get voters for this page
    const startIndex = pageIndex * VOTERS_PER_PAGE;
    const endIndex = Math.min(startIndex + VOTERS_PER_PAGE, voters.length);
    const pageVoters = voters.slice(startIndex, endIndex);
    
    // Layout settings
    const startY = 30;
    const columnWidth = contentWidth / 2;
    const rowHeight = 42;
    
    // Draw voters in grid layout
    for (let i = 0; i < pageVoters.length; i++) {
      const voter = pageVoters[i];
      const row = Math.floor(i / VOTERS_PER_ROW);
      const col = i % VOTERS_PER_ROW;
      
      const x = margin + (col * columnWidth);
      const y = startY + (row * rowHeight);
      
      await addVoterToGrid(pdf, voter, x, y, columnWidth, rowHeight, startIndex + i + 1);
    }
    
    // Add page footer
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.text(`Page ${currentPage} of ${totalPages}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
    currentPage++;
  }

  pdf.save('voter-list.pdf');
};

const addVoterToGrid = async (pdf: jsPDF, voter: Voter, x: number, y: number, width: number, height: number, serialNo: number) => {
  // Draw outer border
  pdf.setLineWidth(0.3);
  pdf.rect(x, y, width, height);
  
  // Serial number column (left side) - 10% of width
  const snoWidth = width * 0.1;
  pdf.rect(x, y, snoWidth, height);
  
  // Add serial number
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text(serialNo.toString(), x + snoWidth/2, y + height/2, { align: 'center' });
  
  // Photo section (right side) - 25% of width
  const photoWidth = width * 0.25;
  const photoHeight = height - 4;
  const photoX = x + width - photoWidth - 1;
  const photoY = y + 2;
  
  // Draw photo border
  pdf.setLineWidth(0.2);
  pdf.rect(photoX, photoY, photoWidth, photoHeight);
  
  // Add photo if available
  if (voter.photo) {
    try {
      pdf.addImage(voter.photo, 'JPEG', photoX + 0.5, photoY + 0.5, photoWidth - 1, photoHeight - 1);
    } catch (error) {
      console.log('Error adding photo:', error);
      // Add placeholder text
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.text('Photo', photoX + photoWidth/2, photoY + photoHeight/2, { align: 'center' });
    }
  } else {
    // Add placeholder
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.text('Photo', photoX + photoWidth/2, photoY + photoHeight/2, { align: 'center' });
  }
  
  // Text content area (middle section) - 65% of width
  const textX = x + snoWidth + 1;
  const textWidth = width - snoWidth - photoWidth - 3;
  let textY = y + 4;
  const lineHeight = 4;
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  
  // Line 1: Entry No. and Entry Date
  const line1Left = `Entry No.: ${voter.entryNumber}`;
  const line1Right = `Entry Date: ${voter.entryDate}`;
  pdf.text(line1Left, textX, textY);
  pdf.text(line1Right, textX + textWidth, textY, { align: 'right' });
  textY += lineHeight;
  
  // Line 2: Name (bold)
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Name: ${voter.name}`, textX, textY);
  pdf.setFont('helvetica', 'normal');
  textY += lineHeight;
  
  // Line 3: Father/Husband Name
  const line3 = `Father/Husband Name: ${voter.fatherHusbandName}`;
  const line3Lines = pdf.splitTextToSize(line3, textWidth);
  line3Lines.forEach((line: string) => {
    if (textY < y + height - 2) {
      pdf.text(line, textX, textY);
      textY += lineHeight;
    }
  });
  
  // Line 4: Village
  const line4 = `Village: ${voter.village}`;
  const line4Lines = pdf.splitTextToSize(line4, textWidth);
  line4Lines.forEach((line: string) => {
    if (textY < y + height - 2) {
      pdf.text(line, textX, textY);
      textY += lineHeight;
    }
  });
  
  // Line 5: Caste and Age
  if (textY < y + height - 2) {
    const line5Left = `Caste: ${voter.caste}`;
    const line5Right = `Age: ${voter.age}`;
    pdf.text(line5Left, textX, textY);
    pdf.text(line5Right, textX + textWidth, textY, { align: 'right' });
    textY += lineHeight;
  }
  
  // Line 6: Gender
  if (textY < y + height - 2) {
    pdf.text(`Gender: ${voter.gender}`, textX, textY);
  }
};

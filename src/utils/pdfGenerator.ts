
import jsPDF from 'jspdf';
import { Voter } from '@/types/voter';

export const generatePDF = async (voters: Voter[]) => {
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
  const ROWS_PER_PAGE = 6;
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
    pdf.text('ధర్మసాగర్ కో-ఆపరేటివ్ హౌసింగ్ సొసైటీ లిమిటెడ్, నిజామాబాద్', pageWidth / 2, 15, { align: 'center' });
    pdf.setFontSize(10);
    pdf.text('సభ్యుల జాబితా', pageWidth / 2, 22, { align: 'center' });
    
    // Get voters for this page
    const startIndex = pageIndex * VOTERS_PER_PAGE;
    const endIndex = Math.min(startIndex + VOTERS_PER_PAGE, voters.length);
    const pageVoters = voters.slice(startIndex, endIndex);
    
    // Layout settings
    const startY = 30;
    const columnWidth = contentWidth / 2;
    const rowHeight = 40;
    
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

  pdf.save('dharmasagar-voter-list.pdf');
};

const addVoterToGrid = async (pdf: jsPDF, voter: Voter, x: number, y: number, width: number, height: number, serialNo: number) => {
  // Draw outer border
  pdf.setLineWidth(0.3);
  pdf.rect(x, y, width, height);
  
  // Serial number column (left side)
  const snoWidth = 8;
  pdf.rect(x, y, snoWidth, height);
  
  // Add serial number
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.text(serialNo.toString(), x + snoWidth/2, y + height/2, { align: 'center' });
  
  // Photo section (right side)
  const photoWidth = 22;
  const photoHeight = 28;
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
      pdf.setFontSize(7);
      pdf.text('ఫోటో', photoX + photoWidth/2, photoY + photoHeight/2, { align: 'center' });
    }
  } else {
    // Add placeholder
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.text('ఫోటో', photoX + photoWidth/2, photoY + photoHeight/2, { align: 'center' });
  }
  
  // Text content area (middle section)
  const textX = x + snoWidth + 1;
  const textWidth = width - snoWidth - photoWidth - 3;
  let textY = y + 4;
  const lineHeight = 3.2;
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  
  // Voter details in proper order
  const details = [
    `ప్రవేశ సంఖ్యా: ${voter.entryNumber}`,
    `ప్రవేశ తేది: ${voter.entryDate}`,
    `పేరు: ${voter.name}`,
    `తండ్రి/భర్త పేరు: ${voter.fatherHusbandName}`,
    `గ్రామం: ${voter.village}`,
    `కులం: ${voter.caste}`,
    `వయస్సు: ${voter.age}`,
    `లింగం: ${voter.gender}`
  ];
  
  details.forEach((detail) => {
    if (textY < y + height - 2) {
      // Split long text if needed
      const textLines = pdf.splitTextToSize(detail, textWidth);
      textLines.forEach((line: string) => {
        if (textY < y + height - 2) {
          pdf.text(line, textX, textY);
          textY += lineHeight;
        }
      });
    }
  });
};

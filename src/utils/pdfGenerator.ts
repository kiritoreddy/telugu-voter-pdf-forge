
import jsPDF from 'jspdf';
import { Voter } from '@/types/voter';

// Add Telugu font support
const addTeluguFont = (pdf: jsPDF) => {
  // This will use the browser's Telugu font rendering
  pdf.setFont('helvetica');
};

export const generatePDF = async (voters: Voter[]) => {
  if (voters.length === 0) {
    alert('No voters to export');
    return;
  }

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  
  // Voters per page (2 columns, 6 rows = 12 voters per page)
  const VOTERS_PER_PAGE = 12;
  const totalPages = Math.ceil(voters.length / VOTERS_PER_PAGE);
  
  let currentPage = 1;

  for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
    if (pageIndex > 0) {
      pdf.addPage();
    }

    // Add header
    pdf.setFontSize(14);
    pdf.text('ధర్మసాగర్ కో-ఆపరేటివ్ హౌసింగ్ సొసైటీ లిమిటెడ్, నిజామాబాద్', pageWidth / 2, 20, { align: 'center' });
    pdf.setFontSize(12);
    pdf.text('సభ్యుల జాబితా', pageWidth / 2, 28, { align: 'center' });
    
    // Column headers
    const startY = 40;
    const columnWidth = contentWidth / 2;
    const rowHeight = 35;
    
    // Get voters for this page
    const startIndex = pageIndex * VOTERS_PER_PAGE;
    const endIndex = Math.min(startIndex + VOTERS_PER_PAGE, voters.length);
    const pageVoters = voters.slice(startIndex, endIndex);
    
    // Arrange voters in 2 columns, 6 rows
    for (let i = 0; i < pageVoters.length; i++) {
      const voter = pageVoters[i];
      const row = Math.floor(i / 2);
      const col = i % 2;
      
      const x = margin + (col * columnWidth);
      const y = startY + (row * rowHeight);
      
      await addVoterToTable(pdf, voter, x, y, columnWidth, rowHeight, startIndex + i + 1);
    }
    
    // Add page footer
    pdf.setFontSize(10);
    pdf.text(`Page ${currentPage} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    currentPage++;
  }

  pdf.save('dharmasagar-voter-list.pdf');
};

const addVoterToTable = async (pdf: jsPDF, voter: Voter, x: number, y: number, width: number, height: number, serialNo: number) => {
  // Draw outer border
  pdf.setLineWidth(0.5);
  pdf.rect(x, y, width, height);
  
  // Photo section (right side)
  const photoWidth = 25;
  const photoHeight = 30;
  const photoX = x + width - photoWidth - 2;
  const photoY = y + 2;
  
  // Draw photo border
  pdf.rect(photoX, photoY, photoWidth, photoHeight);
  
  // Add photo if available
  if (voter.photo) {
    try {
      pdf.addImage(voter.photo, 'JPEG', photoX + 1, photoY + 1, photoWidth - 2, photoHeight - 2);
    } catch (error) {
      console.log('Error adding photo:', error);
      // Add placeholder text
      pdf.setFontSize(8);
      pdf.text('Photo', photoX + photoWidth/2, photoY + photoHeight/2, { align: 'center' });
    }
  } else {
    // Add placeholder
    pdf.setFontSize(8);
    pdf.text('ఫోటో', photoX + photoWidth/2, photoY + photoHeight/2, { align: 'center' });
  }
  
  // Text content area (left side)
  const textX = x + 2;
  const textWidth = width - photoWidth - 6;
  let textY = y + 5;
  const lineHeight = 3.5;
  
  pdf.setFontSize(8);
  
  // Serial number
  pdf.text(`${serialNo}.`, textX, textY);
  textY += lineHeight;
  
  // Voter details
  const details = [
    `ప్రవేశ సంఖ్యా: ${voter.entryNumber}`,
    `తేది: ${voter.entryDate}`,
    `పేరు: ${voter.name}`,
    `తండ్రి/భర్త: ${voter.fatherHusbandName}`,
    `గ్రామం: ${voter.village}`,
    `కులం: ${voter.caste}`,
    `వయస్సు: ${voter.age}`,
    `లింగం: ${voter.gender}`
  ];
  
  details.forEach((detail, index) => {
    // Wrap text if too long
    const maxWidth = textWidth;
    const textLines = pdf.splitTextToSize(detail, maxWidth);
    
    textLines.forEach((line: string) => {
      if (textY < y + height - 2) {
        pdf.text(line, textX, textY);
        textY += lineHeight;
      }
    });
  });
};

import jsPDF from 'jspdf';
import { Voter } from '@/types/voter';

export const generatePDF = async (voters: Voter[], headerText: string, subHeaderText: string,pageTitle: string) => {
  if (voters.length === 0) {
    alert('No voters to export');
    return;
  }

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const contentWidth = pageWidth - (margin * 2);

  const VOTERS_PER_ROW = 2;
  const ROWS_PER_PAGE = 10;
  const VOTERS_PER_PAGE = VOTERS_PER_ROW * ROWS_PER_PAGE;
  const totalPages = Math.ceil(voters.length / VOTERS_PER_PAGE);

  let currentPage = 1;

  for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
    if (pageIndex > 0) {
      pdf.addPage();
    }

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text(headerText, pageWidth / 2, 12, { align: 'center' });

    pdf.setFontSize(10);
    pdf.text(pageTitle, pageWidth / 2, 18, { align: 'center' });
    subHeaderText
    pdf.setFontSize(10);
    pdf.text(subHeaderText, pageWidth / 2, 23, { align: 'center' });

    const startIndex = pageIndex * VOTERS_PER_PAGE;
    const endIndex = Math.min(startIndex + VOTERS_PER_PAGE, voters.length);
    const pageVoters = voters.slice(startIndex, endIndex);

    const startY = 25;
    const columnWidth = contentWidth / VOTERS_PER_ROW;
    const rowHeight = (pageHeight - startY - margin - 10) / ROWS_PER_PAGE;

    for (let i = 0; i < pageVoters.length; i++) {
      const voter = pageVoters[i];
      const row = Math.floor(i / VOTERS_PER_ROW);
      const col = i % VOTERS_PER_ROW;

      const x = margin + (col * columnWidth);
      const y = startY + (row * rowHeight);

      await addVoterToGrid(pdf, voter, x, y, columnWidth, rowHeight, startIndex + i + 1);
    }

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.text(`Page ${currentPage} of ${totalPages}`, pageWidth / 2, pageHeight - 5, { align: 'center' });

    currentPage++;
  }

  pdf.save('voter-list.pdf');
};

const addVoterToGrid = async (pdf, voter, x, y, width, height, serialNo) => {
  const snoWidth = width * 0.1;
  const photoWidth = width * 0.25;
  const textWidth = width - snoWidth - photoWidth - 6;

  pdf.setLineWidth(0.3);
  pdf.rect(x, y, width, height);
  pdf.rect(x, y, snoWidth, height);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.text(serialNo.toString(), x + snoWidth / 2, y + height / 2, { align: 'center' });

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

  const textX = x + snoWidth + 2;
  let textY = y + 5;
  const lineHeight = 3.5;

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');

  pdf.text(`Entry No.: ${voter.entryNumber}`, textX, textY);
  pdf.text(`Entry Date: ${voter.entryDate}`, textX + textWidth, textY, { align: 'right' });
  textY += lineHeight;

  pdf.setFont('helvetica', 'normal');
  pdf.text(`Name: ${voter.name}`, textX, textY);
  pdf.setFont('helvetica', 'normal');
  textY += lineHeight;

  pdf.text(`Father/Husband Name: ${voter.fatherHusbandName}`, textX, textY);
  textY += lineHeight;

  pdf.text(`Village: ${voter.village}`, textX, textY);
  textY += lineHeight;

  pdf.text(`Caste: ${voter.caste}`, textX, textY);
  pdf.text(`Age: ${voter.age}`, textX + textWidth, textY, { align: 'right' });
  textY += lineHeight;

  pdf.text(`Gender: ${voter.gender}`, textX, textY);
};

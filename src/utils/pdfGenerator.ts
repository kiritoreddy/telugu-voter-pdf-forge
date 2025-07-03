
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Voter } from '@/types/voter';

export const generatePDF = async (voters: Voter[]) => {
  if (voters.length === 0) {
    alert('No voters to export');
    return;
  }

  const VOTERS_PER_PAGE = 10;
  const MARGIN = 20;
  const A4_WIDTH = 210;
  const A4_HEIGHT = 297;

  // Create PDF
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  // Calculate total pages
  const totalPages = Math.ceil(voters.length / VOTERS_PER_PAGE);
  let currentPage = 1;

  for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
    if (pageIndex > 0) {
      pdf.addPage();
    }

    // Add header
    pdf.setFontSize(16);
    pdf.text('ధర్మసాగర్ కోఆపరేటివ్ సొసైటీ', A4_WIDTH / 2, 20, { align: 'center' });
    pdf.setFontSize(12);
    pdf.text('ఓటర్ల జాబితా', A4_WIDTH / 2, 30, { align: 'center' });

    // Add voters for this page
    const startIndex = pageIndex * VOTERS_PER_PAGE;
    const endIndex = Math.min(startIndex + VOTERS_PER_PAGE, voters.length);
    const pageVoters = voters.slice(startIndex, endIndex);

    let yPosition = 50;
    const voterHeight = 24;

    for (let i = 0; i < pageVoters.length; i++) {
      const voter = pageVoters[i];
      const globalIndex = startIndex + i;
      const isPhotoLeft = globalIndex % 2 === 0;

      // Create voter entry
      await addVoterToPDF(pdf, voter, yPosition, isPhotoLeft);
      yPosition += voterHeight;
    }

    // Add page number
    pdf.setFontSize(10);
    pdf.text(`Page ${currentPage} of ${totalPages}`, A4_WIDTH / 2, A4_HEIGHT - 10, { align: 'center' });
    currentPage++;
  }

  // Save the PDF
  pdf.save('voter-list.pdf');
};

const addVoterToPDF = async (pdf: jsPDF, voter: Voter, yPosition: number, isPhotoLeft: boolean) => {
  const photoWidth = 15;
  const photoHeight = 18;
  const textStartX = isPhotoLeft ? 35 : 20;
  const photoX = isPhotoLeft ? 20 : 175;

  // Add photo placeholder or actual photo
  if (voter.photo) {
    try {
      pdf.addImage(voter.photo, 'JPEG', photoX, yPosition, photoWidth, photoHeight);
    } catch (error) {
      console.log('Error adding photo:', error);
      pdf.rect(photoX, yPosition, photoWidth, photoHeight);
    }
  } else {
    pdf.rect(photoX, yPosition, photoWidth, photoHeight);
  }

  // Add voter details
  pdf.setFontSize(8);
  let textY = yPosition + 4;
  const lineHeight = 2.5;

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

  details.forEach((detail) => {
    pdf.text(detail, textStartX, textY);
    textY += lineHeight;
  });

  // Add border around the voter entry
  pdf.rect(15, yPosition - 2, 180, 22);
};

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { Voter, AppSettings } from '@/types/voter';
import { getSerialNumber, applyPhotosFirstSorting } from './serialNumberHelper';

// Function to generate Excel with photo availability information
export const generateExcel = async (voters: Voter[], settings: AppSettings): Promise<void> => {
    if (!voters.length) throw new Error('No voters to export');

    // Adding a column for photo availability
    const votersWithPhotosInfo = voters.map(voter => ({
        entryNumber: voter.entryNumber,
        entryDate: voter.entryDate,
        name: voter.name,
        fatherHusbandName: voter.fatherHusbandName,
        village: voter.village,
        caste: voter.caste,
        age: voter.age,
        gender: voter.gender,
        photoAvailable: voter.photo ? 'Yes' : 'No', // Add photo availability info
    }));

    // Convert the data to a sheet
    const ws = XLSX.utils.json_to_sheet(votersWithPhotosInfo);

    // Create a workbook and append the sheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Voters');

    // Save the file as Excel
    XLSX.writeFile(wb, `voter-list-${settings.pdfPaperSize}-${settings.script}.xlsx`);
};

/* ---------- 1 · Baseline metrics (LEGAL reference) ---------- */
const BASE_WIDTH = 216;   // mm
const BASE_HEIGHT = 356;   // mm
const BASE_ROW_HEIGHT = 28.1;           // Legal row height when 10 rows/page
const BASE_FONT = {
    header: 13,
    subHeader: 10,
    pageTitle: 10,
    label: 8,
    body: 8,
    name: 8,
    footer: 8,
    pageNum: 8,
    photo: 7,
};
const MIN_FONT = 7;

/* ---------- 2 · Telugu Font Support with Proper Embedding ---------- */
let teluguFontLoaded = false;
let teluguFontData: string | null = null;

const loadTeluguFont = async (pdf: jsPDF): Promise<void> => {
    if (teluguFontLoaded && teluguFontData) {
        // Re-add the font to this PDF instance
        pdf.addFileToVFS('NotoSansTelugu-Regular.ttf', teluguFontData);
        pdf.addFont('NotoSansTelugu-Regular.ttf', 'NotoSansTelugu', 'normal');
        return;
    }

    try {
        // Fetch the Telugu font file from the public directory
        const fontUrl = '/static/NotoSansTelugu-Regular.ttf';
        const response = await fetch(fontUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch font: ${response.status}`);
        }

        const fontData = await response.arrayBuffer();

        // Convert ArrayBuffer to base64 string for jsPDF
        teluguFontData = btoa(
            new Uint8Array(fontData).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );

        // Add the font to jsPDF's virtual file system with proper embedding
        pdf.addFileToVFS('NotoSansTelugu-Regular.ttf', teluguFontData);

        // Register the font with jsPDF - this ensures proper embedding
        pdf.addFont('NotoSansTelugu-Regular.ttf', 'NotoSansTelugu', 'normal');

        // Force font embedding by setting it as the current font
        pdf.setFont('NotoSansTelugu', 'normal');

        teluguFontLoaded = true;
        console.log('Telugu font loaded and embedded successfully');
    } catch (error) {
        console.warn('Failed to load Telugu font, falling back to default:', error);
        teluguFontLoaded = false;
        teluguFontData = null;
    }
};

const setFont = (pdf: jsPDF, script: 'latin' | 'telugu', style: 'normal' | 'bold' = 'normal'): void => {
    try {
        if (script === 'telugu' && teluguFontLoaded) {
            // Use Telugu font for Telugu text - always use normal weight as Telugu font doesn't have bold
            pdf.setFont('NotoSansTelugu', 'normal');
        } else {
            // Use Helvetica for Latin text or fallback
            pdf.setFont('helvetica', style);
        }
    } catch (error) {
        console.warn('Font setting failed, using default:', error);
        pdf.setFont('helvetica', 'normal');
    }
};

/* ---------- 3 · Helper: Create PDF for Voters Group ---------- */
async function createPdfForGroup(
    group: Voter[],
    settings: AppSettings,
    filename: string
): Promise<void> {
    const paperDim = settings.pdfPaperSize === 'a4'
        ? { width: 210, height: 297 }
        : { width: 216, height: 356 };
    const pdf = new jsPDF('p', 'mm', [paperDim.width, paperDim.height]);
    const scale = settings.pdfPaperSize === 'legal'
        ? 1
        : paperDim.height / BASE_HEIGHT;

    // fonts & layout
    if (settings.script === 'telugu') {
        await loadTeluguFont(pdf);
        if (teluguFontLoaded) {
            pdf.setFont('NotoSansTelugu', 'normal');
            pdf.setTextColor(255, 255, 255); // White text (invisible)
            pdf.setFontSize(1);
            pdf.text('తెలుగు', 0, 0); // Telugu text to force embedding
            pdf.setTextColor(0, 0, 0); // Reset to black
        }
    }

    const margin = 10;
    const headerHeight = 30 * scale;
    const footerHeight = 25 * scale;
    const rowsPerPage = 10;
    const colsPerPage = 2;
    const perPage = rowsPerPage * colsPerPage;
    const contentHeight = paperDim.height - headerHeight - footerHeight - margin * 2;
    const rowHeight = contentHeight / rowsPerPage;
    const colWidth = (paperDim.width - margin * 2) / colsPerPage;
    const lineHeight = rowHeight / 6;

    const fontScale = rowHeight / BASE_ROW_HEIGHT;
    const font = Object.fromEntries(
        (Object.entries(BASE_FONT) as [keyof typeof BASE_FONT, number][]).map(([k, v]) => [
            k,
            Math.max(MIN_FONT, v * fontScale),
        ])
    ) as Record<keyof typeof BASE_FONT, number>;

    const totalPages = Math.ceil(group.length / perPage);
    let serial = 1;

    for (let p = 0; p < totalPages; p++) {
        if (p > 0) pdf.addPage();
        addHeader(pdf, settings, paperDim.width, font);

        const y0 = 5 + headerHeight;
        for (let c = 0; c < colsPerPage; c++) {
            for (let r = 0; r < rowsPerPage; r++) {
                const idx = p * perPage + r + c * rowsPerPage;
                if (idx >= group.length) continue;
                await addBox(
                    pdf,
                    group[idx],
                    margin + c * colWidth,
                    y0 + r * rowHeight,
                    colWidth,
                    rowHeight,
                    serial++,
                    font,
                    lineHeight,
                    settings.script
                );
            }
        }

        addFooter(pdf, settings, paperDim, p + 1, totalPages, font);
    }

    pdf.save(filename);
}

/* ---------- 4 · Main PDF Splitter Function ---------- */
export const generatePDF = async (
    voters: Voter[],
    settings: AppSettings
): Promise<void> => {
    if (!voters.length) throw new Error('No voters to export');

    // Apply your existing photo-first sort so the two groups preserve that ordering
    const sorted = applyPhotosFirstSorting(voters);

    const withPhotos = sorted.filter(v => !!v.photo);
    const withoutPhotos = sorted.filter(v => !v.photo);

    // Create PDFs for each group
    await createPdfForGroup(
        withPhotos,
        settings,
        `voter-list-with-photos-${settings.pdfPaperSize}-${settings.script}.pdf`
    );

    await createPdfForGroup(
        withoutPhotos,
        settings,
        `voter-list-without-photos-${settings.pdfPaperSize}-${settings.script}.pdf`
    );

    await generateExcel(voters, settings);
};

/* Helper functions (addHeader, addFooter, addBox, etc.) remain the same */

/* Helper functions (addHeader, addFooter, addBox, etc.) remain the same */

/* ---------- 4 · Helpers ---------- */
const addHeader = (
    pdf: jsPDF,
    settings: AppSettings,
    pageWidth: number,
    f: Record<string, number>
) => {
    try {
        setFont(pdf, settings.script, 'bold');
        pdf.setFontSize(f.header);
        pdf.text(settings.pdfHeader, pageWidth / 2, 12, { align: 'center' });

        pdf.setFontSize(f.pageTitle);
        pdf.text(settings.pdfPageTitle, pageWidth / 2, 18, { align: 'center' });

        if (settings.pdfSubHeader?.trim()) {
            pdf.setFontSize(f.subHeader);
            pdf.text(settings.pdfSubHeader, pageWidth / 2, 24, { align: 'center' });
        }
    } catch (error) {
        console.warn('Header rendering failed:', error);
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
    try {
        const y0 = dim.height - 30;
        setFont(pdf, settings.script, 'normal');
        pdf.setFontSize(f.footer);

        settings.footerLeft.forEach((txt, i) => {
            if (txt?.trim()) {
                try {
                    pdf.text(txt, 10, y0 + i * 4);
                } catch (error) {
                    console.warn('Footer left text rendering failed:', error);
                }
            }
        });

        settings.footerRight.forEach((txt, i) => {
            if (txt?.trim()) {
                try {
                    pdf.text(txt, dim.width - 10, y0 + i * 4, { align: 'right' });
                } catch (error) {
                    console.warn('Footer right text rendering failed:', error);
                }
            }
        });

        // Use Latin font for page numbers to ensure consistency
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(f.pageNum);
        pdf.text(`Page ${pageNo} of ${total}`, dim.width / 2, dim.height - 5, {
            align: 'center',
        });
    } catch (error) {
        console.warn('Footer rendering failed:', error);
    }
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
    try {
        /* borders */
        const snoW = w * 0.1,
            photoW = w * 0.25,
            textW = w - snoW - photoW - 6;
        pdf.setLineWidth(0.3).rect(x, y, w, h).rect(x, y, snoW, h);

        /* serial - always use Latin font for numbers */
        pdf.setFont('helvetica', 'bold');
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
            } catch (imageError) {
                console.warn('Image rendering failed:', imageError);
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(f.photo);
                pdf.text('Photo', pX + photoW / 2, pY + pH / 2, {
                    align: 'center',
                });
            }
        } else {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(f.photo);
            pdf.text('Photo', pX + photoW / 2, pY + pH / 2, {
                align: 'center',
            });
        }

        /* text content with proper font selection */
        let tY = y + 5;
        const tX = x + snoW + 2;

        // Entry number and date (always Latin)
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(f.body);
        pdf.text(`Admn. No: ${v.entryNumber}`, tX, tY);
        pdf.text(`Admn. Date: ${v.entryDate}`, tX + textW, tY, { align: 'right' });
        tY += lh;

        // Name (use appropriate script)
        setFont(pdf, script, 'bold');
        pdf.setFontSize(f.name);
        pdf.text(`Name: ${v.name}`, tX, tY);
        tY += lh;

        // Father/Husband name (use appropriate script)
        setFont(pdf, script, 'normal');
        pdf.setFontSize(f.body);
        pdf.setFontSize(7);
        pdf.text(`F / H Name: ${v.fatherHusbandName}`, tX, tY);
        tY += lh;

        // Village (use appropriate script and split if long)
        setFont(pdf, script, 'normal');
        const villageMaxWidth = textW;  // Max width for village name
        const villageLines = pdf.splitTextToSize(`Village: ${v.village}`, villageMaxWidth);

        // Add the village in multiple lines with reduced line height for the second line
        for (let i = 0; i < villageLines.length; i++) {
            pdf.text(villageLines[i], tX, tY);
            // If it's not the last line, reduce line height
            tY += i === villageLines.length - 1 ? lh : lh / 2;
        }

        // Adjust caste position to move it down if village took multiple lines
        pdf.setFontSize(f.body);
        setFont(pdf, script, 'normal');
        pdf.text(`Caste: ${v.caste}`, tX, tY);

        // Use Latin font for age and gender
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Age: ${v.age}  Gender: ${v.gender}`, tX + 20, tY);
    } catch (error) {
        console.warn('Box rendering failed:', error);
    }
};

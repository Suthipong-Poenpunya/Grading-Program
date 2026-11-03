import { CourseInfo } from '../types/grading';

declare module 'html2pdf.js';

export async function exportReportToPdf(
  element: HTMLElement,
  courseInfo: CourseInfo
): Promise<void> {
  // Dynamically import html2pdf.js so it works cleanly in browser environments
  const html2pdfModule = await import('html2pdf.js');
  const html2pdf = html2pdfModule.default || html2pdfModule;

  const safeCode = (courseInfo.courseCode || 'Course').replace(
    /[^a-zA-Z0-9ก-๙_-]/g,
    '_'
  );
  const filename = `รายงานผลการเรียน_${safeCode}.pdf`;

  const opt = {
    margin: [8, 8, 8, 8],
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      backgroundColor: '#ffffff',
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'landscape',
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
  };

  await html2pdf().set(opt).from(element).save();
}


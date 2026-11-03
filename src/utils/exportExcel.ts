import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import {
  AssessmentItem,
  CalculatedStudentResult,
  CourseInfo,
  CourseStatistics,
} from '../types/grading';
import {
  getGradeFormatNameThai,
  getGradeLabelList,
  getGradingSystemNameThai,
} from './gradingCalculations';

const THAI_FONT_NAME = 'THSarabunPSK';

const thinBorder: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FF000000' } },
  left: { style: 'thin', color: { argb: 'FF000000' } },
  bottom: { style: 'thin', color: { argb: 'FF000000' } },
  right: { style: 'thin', color: { argb: 'FF000000' } },
};

export async function exportGradingToExcel(
  courseInfo: CourseInfo,
  assessmentItems: AssessmentItem[],
  results: CalculatedStudentResult[],
  statistics: CourseStatistics
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = courseInfo.instructorName || 'ระบบตัดเกรดตามสัดส่วน';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('รายงานผลการเรียน', {
    pageSetup: {
      paperSize: 9, // A4
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: 0.4,
        right: 0.4,
        top: 0.5,
        bottom: 0.5,
        header: 0.3,
        footer: 0.3,
      },
    },
  });

  // Determine active students (or all rows if none active)
  const activeResults = results.filter((r) => r.isActive);
  const rowsToExport = activeResults.length > 0 ? activeResults : results;

  const isGrowth = courseInfo.gradingSystem === 'growth';
  const isNorm = courseInfo.gradingSystem === 'norm';

  // Total columns:
  // 1: ลำดับที่
  // 2: รหัสประจำตัว
  // 3: ชื่อ-นามสกุล
  // For each assessment item: 2 columns -> คะแนนดิบ (เต็ม X) and ตามสัดส่วน (Y%)
  // Plus: คะแนนรวมสุทธิ (100%)
  // If growth: อัตราพัฒนาการ (%) & คะแนนถ่วงน้ำหนักพัฒนาการ
  // If norm: ค่า Z-Score
  // Final column: ผลการเรียน (เกรด)

  const extraColsCount = isGrowth ? 2 : isNorm ? 1 : 0;
  const totalCols = 3 + assessmentItems.length * 2 + 1 + extraColsCount + 1;

  // Row 1: Main Title (18pt Bold)
  const titleRow = sheet.addRow([
    'รายงานผลการวัดและประเมินผลการเรียนตามสัดส่วน (Proportional Student Grading Report)',
  ]);
  sheet.mergeCells(1, 1, 1, totalCols);
  titleRow.height = 28;
  titleRow.getCell(1).font = {
    name: THAI_FONT_NAME,
    size: 18,
    bold: true,
  };
  titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

  // Row 2: Course Info Line 1 (16pt Bold/Regular)
  const infoRow1 = sheet.addRow([
    `รายวิชา: ${courseInfo.courseName || '-'}   |   รหัสวิชา: ${courseInfo.courseCode || '-'}   |   ระดับชั้น: ${courseInfo.classLevel || '-'}   |   ครูผู้สอน: ${courseInfo.instructorName || '-'}`,
  ]);
  sheet.mergeCells(2, 1, 2, totalCols);
  infoRow1.height = 24;
  infoRow1.getCell(1).font = {
    name: THAI_FONT_NAME,
    size: 16,
    bold: true,
  };
  infoRow1.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

  // Row 3: Grading System & Statistics Summary (16pt)
  const infoRow2 = sheet.addRow([
    `ระบบการตัดเกรด: ${getGradingSystemNameThai(courseInfo.gradingSystem)}   |   รูปแบบเกรด: ${getGradeFormatNameThai(courseInfo.gradeFormat)}   |   จำนวนผู้เรียน: ${statistics.activeStudentCount} คน   |   ค่าเฉลี่ย (Mean): ${statistics.mean.toFixed(2)}   |   S.D.: ${statistics.sd.toFixed(2)}`,
  ]);
  sheet.mergeCells(3, 1, 3, totalCols);
  infoRow2.height = 24;
  infoRow2.getCell(1).font = {
    name: THAI_FONT_NAME,
    size: 16,
  };
  infoRow2.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

  // Row 4: Blank spacer
  sheet.addRow([]);

  // Row 5 & Row 6: Two-tier Table Header (18pt Bold as requested for table headers)
  const headerRow1Values: string[] = ['ลำดับที่', 'รหัสนักเรียน', 'ชื่อ - นามสกุล'];
  const headerRow2Values: string[] = ['', '', ''];

  assessmentItems.forEach((item, idx) => {
    const title = item.title.trim() || `รายการที่ ${idx + 1}`;
    headerRow1Values.push(title, '');
    headerRow2Values.push(
      `ดิบ (เต็ม ${item.maxRawScore})`,
      `สัดส่วน (${item.weight}%)`
    );
  });

  headerRow1Values.push('คะแนนรวมสุทธิ');
  headerRow2Values.push('(เต็ม 100%)');

  if (isGrowth) {
    headerRow1Values.push('อัตราพัฒนาการ', 'คะแนนรวมพัฒนาการ');
    headerRow2Values.push('Relative Gain (%)', '(เต็ม 100)');
  } else if (isNorm) {
    headerRow1Values.push('คะแนนมาตรฐาน');
    headerRow2Values.push('(Z-Score)');
  }

  headerRow1Values.push('ผลการเรียน');
  headerRow2Values.push('(เกรด)');

  const hRow1 = sheet.addRow(headerRow1Values);
  const hRow2 = sheet.addRow(headerRow2Values);
  hRow1.height = 26;
  hRow2.height = 24;

  const r1Idx = hRow1.number;
  const r2Idx = hRow2.number;

  // Merge fixed columns vertically
  sheet.mergeCells(r1Idx, 1, r2Idx, 1);
  sheet.mergeCells(r1Idx, 2, r2Idx, 2);
  sheet.mergeCells(r1Idx, 3, r2Idx, 3);

  // Merge each assessment item horizontally across 2 columns in headerRow1
  assessmentItems.forEach((_, idx) => {
    const startCol = 4 + idx * 2;
    sheet.mergeCells(r1Idx, startCol, r1Idx, startCol + 1);
  });

  // Format all header cells in hRow1 & hRow2
  for (let c = 1; c <= totalCols; c++) {
    const cell1 = hRow1.getCell(c);
    const cell2 = hRow2.getCell(c);

    [cell1, cell2].forEach((cell) => {
      cell.font = {
        name: THAI_FONT_NAME,
        size: 16,
        bold: true,
        color: { argb: 'FF0F172A' },
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE2E8F0' },
      };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };
      cell.border = thinBorder;
    });
  }
  // Specifically set main header row 1 font size 18pt bold as specified in prompt
  for (let c = 1; c <= totalCols; c++) {
    hRow1.getCell(c).font = {
      name: THAI_FONT_NAME,
      size: 18,
      bold: true,
      color: { argb: 'FF0F172A' },
    };
  }

  // Add Student Data Rows (16pt THSarabunPSK)
  rowsToExport.forEach((res, idx) => {
    const rowValues: (string | number)[] = [
      idx + 1,
      res.student.studentId || '-',
      res.student.fullName || '-',
    ];

    assessmentItems.forEach((item) => {
      const rawVal = res.student.rawScores[item.id];
      const rawNum =
        rawVal === '' || rawVal === undefined ? 0 : Number(rawVal);
      const weightedNum = Number(
        (res.weightedScores[item.id] ?? 0).toFixed(2)
      );
      rowValues.push(rawNum, weightedNum);
    });

    rowValues.push(Number(res.proportionalTotalScore.toFixed(2)));

    if (isGrowth) {
      rowValues.push(
        Number(res.relativeGainScore.toFixed(2)),
        Number(res.growthAdjustedScore.toFixed(2))
      );
    } else if (isNorm) {
      rowValues.push(Number(res.zScore.toFixed(2)));
    }

    rowValues.push(res.finalGrade);

    const dataRow = sheet.addRow(rowValues);
    dataRow.height = 22;

    for (let c = 1; c <= totalCols; c++) {
      const cell = dataRow.getCell(c);
      const isFinalGradeCol = c === totalCols;
      const isTotalCol = c === 4 + assessmentItems.length * 2;

      cell.font = {
        name: THAI_FONT_NAME,
        size: 16,
        bold: isFinalGradeCol || isTotalCol,
      };
      cell.border = thinBorder;

      if (c === 3) {
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
      } else {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      }

      // Number formatting for weighted/total decimals
      if (c > 3 && c < totalCols) {
        const offsetFromAssessments = c - 4;
        const isRawCol =
          offsetFromAssessments < assessmentItems.length * 2 &&
          offsetFromAssessments % 2 === 0;
        if (!isRawCol) {
          cell.numFmt = '0.00';
        }
      }
    }
  });

  // Blank row after table
  sheet.addRow([]);

  // Summary Statistics Section at the bottom
  const statHeaderRow = sheet.addRow(['สรุปค่าสถิติและจำนวนผู้เรียนแยกตามระดับผลการเรียน']);
  sheet.mergeCells(statHeaderRow.number, 1, statHeaderRow.number, totalCols);
  statHeaderRow.height = 25;
  statHeaderRow.getCell(1).font = {
    name: THAI_FONT_NAME,
    size: 18,
    bold: true,
  };

  const statSummaryRow = sheet.addRow([
    'ค่าสถิติภาพรวม',
    `คะแนนเฉลี่ย (Mean): ${statistics.mean.toFixed(2)}`,
    `ส่วนเบี่ยงเบนมาตรฐาน (S.D.): ${statistics.sd.toFixed(2)}`,
    `คะแนนสูงสุด (Max): ${statistics.maxScore.toFixed(2)}`,
    `คะแนนต่ำสุด (Min): ${statistics.minScore.toFixed(2)}`,
  ]);
  statSummaryRow.height = 22;
  statSummaryRow.eachCell((cell) => {
    cell.font = { name: THAI_FONT_NAME, size: 16, bold: true };
  });

  // Grade Distribution Table
  const labels = getGradeLabelList(courseInfo.gradeFormat);
  const distHeader = sheet.addRow(['ระดับเกรด', ...labels, 'รวมทั้งหมด']);
  const distCounts = sheet.addRow([
    'จำนวน (คน)',
    ...labels.map((l) => statistics.gradeDistribution[l] ?? 0),
    statistics.activeStudentCount,
  ]);
  const distPercents = sheet.addRow([
    'ร้อยละ (%)',
    ...labels.map((l) =>
      statistics.activeStudentCount > 0
        ? `${(((statistics.gradeDistribution[l] ?? 0) / statistics.activeStudentCount) * 100).toFixed(1)}%`
        : '0.0%'
    ),
    '100.0%',
  ]);

  [distHeader, distCounts, distPercents].forEach((r, idx) => {
    r.height = 22;
    for (let c = 1; c <= labels.length + 2; c++) {
      const cell = r.getCell(c);
      cell.font = {
        name: THAI_FONT_NAME,
        size: idx === 0 ? 18 : 16,
        bold: idx === 0 || c === 1 || c === labels.length + 2,
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = thinBorder;
      if (idx === 0) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE2E8F0' },
        };
      }
    }
  });

  // Signature block at bottom
  sheet.addRow([]);
  const sigRow1 = sheet.addRow([
    '',
    '',
    `ลงชื่อ ............................................................ ครูผู้สอน`,
  ]);
  const sigRow2 = sheet.addRow([
    '',
    '',
    `      (${courseInfo.instructorName || '............................................................'})`,
  ]);
  [sigRow1, sigRow2].forEach((r) => {
    r.height = 22;
    r.getCell(3).font = { name: THAI_FONT_NAME, size: 16 };
  });

  // Set column widths neatly
  sheet.getColumn(1).width = 10;
  sheet.getColumn(2).width = 16;
  sheet.getColumn(3).width = 30;
  for (let c = 4; c <= totalCols; c++) {
    sheet.getColumn(c).width = 14;
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const safeCode = (courseInfo.courseCode || 'Course').replace(/[^a-zA-Z0-9ก-๙_-]/g, '_');
  saveAs(blob, `รายงานผลการเรียน_${safeCode}.xlsx`);
}


import React, { useRef, useState } from 'react';
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  RotateCcw,
  Sliders,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  AssessmentItem,
  CalculatedStudentResult,
  CourseInfo,
  CourseStatistics,
  CriterionCutoffs,
  GradeFormatType,
  GradingSystemType,
} from '../types/grading';
import {
  DEFAULT_CUTOFFS,
  getGradeFormatNameThai,
  getGradeLabelList,
  getGradingSystemNameThai,
} from '../utils/gradingCalculations';
import { exportGradingToExcel } from '../utils/exportExcel';
import { exportReportToPdf } from '../utils/exportPdf';

interface Step3GradingReportProps {
  courseInfo: CourseInfo;
  setCourseInfo: React.Dispatch<React.SetStateAction<CourseInfo>>;
  assessmentItems: AssessmentItem[];
  results: CalculatedStudentResult[];
  statistics: CourseStatistics;
  cutoffs: CriterionCutoffs;
  setCutoffs: React.Dispatch<React.SetStateAction<CriterionCutoffs>>;
  onPrevStep: () => void;
}

export const Step3GradingReport: React.FC<Step3GradingReportProps> = ({
  courseInfo,
  setCourseInfo,
  assessmentItems,
  results,
  statistics,
  cutoffs,
  setCutoffs,
  onPrevStep,
}) => {
  const reportContainerRef = useRef<HTMLDivElement>(null);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [showCutoffSettings, setShowCutoffSettings] = useState(false);

  const activeResults = results.filter((r) => r.isActive);
  const displayResults = activeResults.length > 0 ? activeResults : results.slice(0, 10);

  const isGrowth = courseInfo.gradingSystem === 'growth';
  const isNorm = courseInfo.gradingSystem === 'norm';
  const gradeLabels = getGradeLabelList(courseInfo.gradeFormat);

  const handleExcelDownload = async () => {
    try {
      setIsExportingExcel(true);
      await exportGradingToExcel(
        courseInfo,
        assessmentItems,
        results,
        statistics
      );
    } catch (error) {
      console.error('Excel export failed:', error);
      alert('เกิดข้อผิดพลาดในการสร้างไฟล์ Excel (.xlsx)');
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handlePdfDownload = async () => {
    if (!reportContainerRef.current) return;
    try {
      setIsExportingPdf(true);
      await exportReportToPdf(reportContainerRef.current, courseInfo);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('เกิดข้อผิดพลาดในการสร้างไฟล์ PDF กรุณาลองใช้ปุ่มพิมพ์รายงานแทน');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrintWindow = () => {
    window.print();
  };

  const getGradeBadgeStyle = (grade: string) => {
    if (grade === 'A' || grade === '4' || grade === 'S') {
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
    if (grade === 'B+' || grade === '3.5' || grade === 'B' || grade === '3') {
      return 'bg-blue-100 text-blue-800 border-blue-300';
    }
    if (grade === 'C+' || grade === '2.5' || grade === 'C' || grade === '2') {
      return 'bg-amber-100 text-amber-800 border-amber-300';
    }
    if (grade === 'D+' || grade === '1.5' || grade === 'D' || grade === '1') {
      return 'bg-orange-100 text-orange-800 border-orange-300';
    }
    if (grade === 'F' || grade === '0' || grade === 'U') {
      return 'bg-rose-100 text-rose-800 border-rose-300';
    }
    return 'bg-slate-100 text-slate-700 border-slate-300';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Control & Export Action Bar (Hidden when printing) */}
      <div className="no-print bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onPrevStep}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              กลับไปแก้ไขคะแนน
            </button>

            <button
              type="button"
              onClick={() => setShowCutoffSettings((v) => !v)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-sm transition cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
              {showCutoffSettings ? 'ซ่อนแผงปรับเกณฑ์/ระบบตัดเกรด' : 'ปรับเปลี่ยนระบบตัดเกรด / เกณฑ์คะแนน'}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleExcelDownload}
              disabled={isExportingExcel}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition cursor-pointer disabled:opacity-60"
            >
              <FileSpreadsheet className="w-4 h-4" />
              {isExportingExcel
                ? 'กำลังสร้างไฟล์ Excel...'
                : 'ดาวน์โหลด Excel (.xlsx ฟอนต์ THSarabunPSK)'}
            </button>

            <button
              type="button"
              onClick={handlePdfDownload}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-sm transition cursor-pointer disabled:opacity-60"
            >
              <FileText className="w-4 h-4" />
              {isExportingPdf
                ? 'กำลังสร้างไฟล์ PDF...'
                : 'ดาวน์โหลด PDF (.pdf)'}
            </button>

            <button
              type="button"
              onClick={handlePrintWindow}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-sm shadow-sm transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              สั่งพิมพ์ / บันทึก PDF (Print A4)
            </button>
          </div>
        </div>

        {/* Quick Switcher & Custom Cutoffs Panel */}
        {showCutoffSettings && (
          <div className="pt-4 border-t border-slate-200 grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-50/70 p-4 rounded-xl">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                สลับเปรียบเทียบระบบการตัดเกรดและรูปแบบเกรดทันที
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    ระบบการตัดเกรด:
                  </label>
                  <select
                    value={courseInfo.gradingSystem}
                    onChange={(e) =>
                      setCourseInfo((prev) => ({
                        ...prev,
                        gradingSystem: e.target.value as GradingSystemType,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-800"
                  >
                    <option value="criterion">อิงเกณฑ์ (Criterion-Referenced)</option>
                    <option value="norm">อิงกลุ่ม (Norm-Referenced Z-Score)</option>
                    <option value="growth">อิงพัฒนาการ (Growth-Referenced)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    รูปแบบเกรดที่แสดง:
                  </label>
                  <select
                    value={courseInfo.gradeFormat}
                    onChange={(e) =>
                      setCourseInfo((prev) => ({
                        ...prev,
                        gradeFormat: e.target.value as GradeFormatType,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-800"
                  >
                    <option value="number_8">Number Grade (4, 3.5, 3, 2.5, 2, 1.5, 1, 0)</option>
                    <option value="letter_8">Letter Grade 8 ระดับ (A, B+, B, C+, C, D+, D, F)</option>
                    <option value="letter_5">Letter Grade 5 ระดับ (A, B, C, D, F)</option>
                    <option value="pass_fail">ผ่าน/ไม่ผ่าน (S, U)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">
                  เกณฑ์จุดตัดคะแนนขั้นต่ำ (สำหรับระบบอิงเกณฑ์ & อิงพัฒนาการ)
                </h3>
                <button
                  type="button"
                  onClick={() => setCutoffs(DEFAULT_CUTOFFS)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  คืนค่ามาตรฐาน (80-50)
                </button>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {[
                  { key: 'grade4_A', label: '4 / A' },
                  { key: 'grade3_5_Bp', label: '3.5 / B+' },
                  { key: 'grade3_B', label: '3 / B' },
                  { key: 'grade2_5_Cp', label: '2.5 / C+' },
                  { key: 'grade2_C', label: '2 / C' },
                  { key: 'grade1_5_Dp', label: '1.5 / D+' },
                  { key: 'grade1_D', label: '1 / D' },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="bg-white p-2 rounded-lg border border-slate-200 text-center"
                  >
                    <div className="text-[11px] font-bold text-indigo-700 mb-1">
                      {item.label} ≥
                    </div>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={cutoffs[item.key as keyof CriterionCutoffs]}
                      onChange={(e) =>
                        setCutoffs((prev) => ({
                          ...prev,
                          [item.key]: Number(e.target.value) || 0,
                        }))
                      }
                      className="w-full text-center font-bold text-xs border border-slate-300 rounded py-1"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Statistics Dashboard Cards (Hidden on Print so Print is purely official A4 document) */}
      <div className="no-print grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">จำนวนผู้เรียนทั้งหมด</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {statistics.activeStudentCount}{' '}
            <span className="text-xs font-normal text-slate-500">คน</span>
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">คะแนนเฉลี่ย (Mean)</p>
          <p className="text-2xl font-extrabold text-indigo-600 mt-1">
            {statistics.mean.toFixed(2)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">ส่วนเบี่ยงเบน (S.D.)</p>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">
            {statistics.sd.toFixed(2)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">คะแนนสูงสุด (Max)</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">
            {statistics.maxScore.toFixed(2)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">คะแนนต่ำสุด (Min)</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">
            {statistics.minScore.toFixed(2)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">พัฒนาการเฉลี่ย (Gain)</p>
          <p className="text-2xl font-extrabold text-purple-600 mt-1">
            {statistics.meanGrowth >= 0 ? '+' : ''}
            {statistics.meanGrowth.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Official Document Container (Used for On-Screen Report, HTML2PDF, and Print A4) */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-300 p-6 sm:p-10 print-only-container overflow-x-auto">
        <div
          ref={reportContainerRef}
          className="report-document font-thsarabun min-w-[820px] bg-white text-black"
        >
          {/* Official Report Header */}
          <div className="text-center border-b-2 border-slate-800 pb-4 mb-5">
            <h1 className="text-[24px] font-bold tracking-tight leading-snug">
              รายงานผลการวัดและประเมินผลการเรียนตามสัดส่วน (แบบรายงานผลการเรียนประจำรายวิชา)
            </h1>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[18px] text-left bg-slate-50 p-3 rounded border border-slate-300">
              <div>
                <span className="font-bold">ชื่อรายวิชา:</span>{' '}
                {courseInfo.courseName || '-'}
              </div>
              <div>
                <span className="font-bold">รหัสวิชา:</span>{' '}
                {courseInfo.courseCode || '-'}
              </div>
              <div>
                <span className="font-bold">ระดับชั้น:</span>{' '}
                {courseInfo.classLevel || '-'}
              </div>
              <div>
                <span className="font-bold">ครูผู้สอน:</span>{' '}
                {courseInfo.instructorName || '-'}
              </div>
              <div className="sm:col-span-2">
                <span className="font-bold">ระบบการตัดเกรด:</span>{' '}
                {getGradingSystemNameThai(courseInfo.gradingSystem)}
              </div>
              <div className="sm:col-span-2">
                <span className="font-bold">รูปแบบผลการเรียน:</span>{' '}
                {getGradeFormatNameThai(courseInfo.gradeFormat)}
              </div>
            </div>
          </div>

          {/* Summary Statistics & Grade Distribution Table inside Official Report */}
          <div className="mb-5 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            <div className="lg:col-span-5 border border-slate-800 p-3 rounded">
              <div className="text-[18px] font-bold border-b border-slate-300 pb-1 mb-2">
                สรุปค่าสถิติผลการเรียนประจำรายวิชา
              </div>
              <div className="grid grid-cols-2 gap-y-1 text-[16px]">
                <div>
                  <span className="font-bold">จำนวนผู้เรียน:</span>{' '}
                  {statistics.activeStudentCount} คน
                </div>
                <div>
                  <span className="font-bold">คะแนนเฉลี่ย (Mean):</span>{' '}
                  {statistics.mean.toFixed(2)}
                </div>
                <div>
                  <span className="font-bold">ส่วนเบี่ยงเบน (S.D.):</span>{' '}
                  {statistics.sd.toFixed(2)}
                </div>
                <div>
                  <span className="font-bold">คะแนนสูงสุด - ต่ำสุด:</span>{' '}
                  {statistics.maxScore.toFixed(2)} / {statistics.minScore.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 border border-slate-800 p-3 rounded">
              <div className="text-[18px] font-bold border-b border-slate-300 pb-1 mb-2">
                จำนวนผู้เรียนแยกตามระดับผลการเรียน (Grade Distribution)
              </div>
              <table className="w-full text-center text-[16px]">
                <thead>
                  <tr className="bg-slate-100 font-bold">
                    <th className="py-1 px-2">ระดับเกรด</th>
                    {gradeLabels.map((label) => (
                      <th key={label} className="py-1 px-2">
                        {label}
                      </th>
                    ))}
                    <th className="py-1 px-2 bg-slate-200">รวม</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-1 px-2 font-bold">จำนวน (คน)</td>
                    {gradeLabels.map((label) => (
                      <td key={label} className="py-1 px-2 font-bold">
                        {statistics.gradeDistribution[label] ?? 0}
                      </td>
                    ))}
                    <td className="py-1 px-2 font-bold bg-slate-50">
                      {statistics.activeStudentCount}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 px-2 font-bold">ร้อยละ (%)</td>
                    {gradeLabels.map((label) => {
                      const count = statistics.gradeDistribution[label] ?? 0;
                      const pct =
                        statistics.activeStudentCount > 0
                          ? ((count / statistics.activeStudentCount) * 100).toFixed(1)
                          : '0.0';
                      return (
                        <td key={label} className="py-1 px-2">
                          {pct}%
                        </td>
                      );
                    })}
                    <td className="py-1 px-2 font-bold bg-slate-50">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Main Student Grading Table */}
          <table className="w-full text-[16px] border-collapse">
            <thead>
              <tr className="bg-slate-200 text-slate-900 font-bold text-[17px]">
                <th rowSpan={2} className="w-12 text-center">
                  ลำดับ
                </th>
                <th rowSpan={2} className="w-28 text-center">
                  รหัสนักเรียน
                </th>
                <th rowSpan={2} className="text-left min-w-[180px]">
                  ชื่อ - นามสกุล
                </th>
                {assessmentItems.map((item, idx) => (
                  <th
                    key={item.id}
                    colSpan={2}
                    className="text-center px-1.5 py-1"
                  >
                    {item.title || `รายการที่ ${idx + 1}`}
                  </th>
                ))}
                <th rowSpan={2} className="w-24 text-center bg-slate-100">
                  คะแนนรวมสุทธิ
                  <br />
                  <span className="text-[14px] font-normal">(100%)</span>
                </th>
                {isGrowth && (
                  <>
                    <th rowSpan={2} className="w-24 text-center bg-amber-50">
                      อัตราพัฒนาการ
                      <br />
                      <span className="text-[14px] font-normal">(Gain %)</span>
                    </th>
                    <th rowSpan={2} className="w-24 text-center bg-amber-100/70">
                      คะแนนถ่วงน้ำหนัก
                      <br />
                      <span className="text-[14px] font-normal">พัฒนาการ</span>
                    </th>
                  </>
                )}
                {isNorm && (
                  <th rowSpan={2} className="w-20 text-center bg-emerald-50">
                    ค่ามาตรฐาน
                    <br />
                    <span className="text-[14px] font-normal">(Z-Score)</span>
                  </th>
                )}
                <th rowSpan={2} className="w-20 text-center bg-indigo-100">
                  เกรดที่ได้
                </th>
              </tr>
              <tr className="bg-slate-100 text-slate-800 font-bold text-[14px]">
                {assessmentItems.map((item) => (
                  <React.Fragment key={`${item.id}-sub`}>
                    <th className="text-center py-1 px-1">
                      ดิบ ({item.maxRawScore})
                    </th>
                    <th className="text-center py-1 px-1 bg-slate-50">
                      สัดส่วน ({item.weight}%)
                    </th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>

            <tbody>
              {displayResults.map((res, idx) => (
                <tr
                  key={res.student.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="text-center">{idx + 1}</td>
                  <td className="text-center font-medium">
                    {res.student.studentId || '-'}
                  </td>
                  <td className="text-left font-medium px-2">
                    {res.student.fullName || '-'}
                  </td>

                  {assessmentItems.map((item) => {
                    const raw = res.rawScoresNumeric[item.id] ?? 0;
                    const weighted = res.weightedScores[item.id] ?? 0;
                    return (
                      <React.Fragment key={`${res.student.id}-${item.id}`}>
                        <td className="text-center">{raw}</td>
                        <td className="text-center bg-slate-50/60 font-medium text-slate-700">
                          {weighted.toFixed(2)}
                        </td>
                      </React.Fragment>
                    );
                  })}

                  <td className="text-center font-bold bg-slate-50 text-[17px]">
                    {res.proportionalTotalScore.toFixed(2)}
                  </td>

                  {isGrowth && (
                    <>
                      <td className="text-center font-semibold bg-amber-50/40">
                        {res.relativeGainScore >= 0 ? '+' : ''}
                        {res.relativeGainScore.toFixed(1)}%
                      </td>
                      <td className="text-center font-bold bg-amber-50/80">
                        {res.growthAdjustedScore.toFixed(2)}
                      </td>
                    </>
                  )}

                  {isNorm && (
                    <td className="text-center font-semibold bg-emerald-50/40">
                      {res.zScore >= 0 ? '+' : ''}
                      {res.zScore.toFixed(2)}
                    </td>
                  )}

                  <td className="text-center font-bold text-[18px]">
                    <span
                      className={`inline-block min-w-[36px] px-2 py-0.5 rounded border ${getGradeBadgeStyle(
                        res.finalGrade
                      )}`}
                    >
                      {res.finalGrade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Official Signature Block at the bottom of the A4 Report */}
          <div className="mt-10 pt-4 grid grid-cols-2 gap-8 text-[18px] page-break-inside-avoid">
            <div className="text-center space-y-2">
              <p>
                ลงชื่อ ........................................................................... ครูผู้สอน
              </p>
              <p className="font-bold">
                ({courseInfo.instructorName || '...........................................................................'})
              </p>
              <p className="text-[16px] text-slate-600">
                วันที่ .......... เดือน ............................ พ.ศ. ..............
              </p>
            </div>

            <div className="text-center space-y-2">
              <p>
                ลงชื่อ ........................................................................... หัวหน้ากลุ่มสาระฯ / ผู้บริหาร
              </p>
              <p className="font-bold">
                (...........................................................................)
              </p>
              <p className="text-[16px] text-slate-600">
                วันที่ .......... เดือน ............................ พ.ศ. ..............
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


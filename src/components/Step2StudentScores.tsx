import React from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Award,
  Calculator,
  CheckCircle2,
  Eraser,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  AssessmentItem,
  CalculatedStudentResult,
  CourseInfo,
  GradeFormatType,
  StudentRecord,
} from '../types/grading';
import { createEmptyStudents } from '../utils/sampleData';

interface Step2StudentScoresProps {
  courseInfo: CourseInfo;
  setCourseInfo: React.Dispatch<React.SetStateAction<CourseInfo>>;
  assessmentItems: AssessmentItem[];
  students: StudentRecord[];
  setStudents: React.Dispatch<React.SetStateAction<StudentRecord[]>>;
  calculatedResults: CalculatedStudentResult[];
  onPrevStep: () => void;
  onCalculateAndNext: () => void;
}

export const Step2StudentScores: React.FC<Step2StudentScoresProps> = ({
  courseInfo,
  setCourseInfo,
  assessmentItems,
  students,
  setStudents,
  calculatedResults,
  onPrevStep,
  onCalculateAndNext,
}) => {
  const handleStudentTextChange = (
    studentRowId: string,
    field: 'studentId' | 'fullName',
    value: string
  ) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentRowId ? { ...s, [field]: value } : s))
    );
  };

  const handleScoreChange = (
    studentRowId: string,
    itemId: string,
    rawInput: string
  ) => {
    const parsedVal: number | '' =
      rawInput === '' ? '' : Number(rawInput);

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentRowId) return s;
        return {
          ...s,
          rawScores: {
            ...s.rawScores,
            [itemId]: parsedVal,
          },
        };
      })
    );
  };

  const handleAddStudents = (count: number) => {
    setStudents((prev) => [
      ...prev,
      ...createEmptyStudents(count, prev.length),
    ]);
  };

  const handleDeleteStudent = (studentRowId: string) => {
    if (students.length <= 1) return;
    setStudents((prev) => prev.filter((s) => s.id !== studentRowId));
  };

  const handleClearEmptyRows = () => {
    const activeOnly = students.filter((s) => {
      const hasNameOrId = s.studentId.trim() !== '' || s.fullName.trim() !== '';
      const hasScore = Object.values(s.rawScores).some(
        (v) => v !== '' && v !== undefined && v !== null
      );
      return hasNameOrId || hasScore;
    });
    if (activeOnly.length === 0) {
      setStudents(createEmptyStudents(5, 0));
    } else {
      setStudents(activeOnly);
    }
  };

  const totalOverflowErrors = calculatedResults.filter(
    (r) => r.hasOverflowError
  ).length;
  const activeCount = calculatedResults.filter((r) => r.isActive).length;

  const gradeFormatCards: Array<{
    format: GradeFormatType;
    title: string;
    subtitle: string;
    badges: string[];
  }> = [
    {
      format: 'letter_8',
      title: '1) Letter Grade (8 ระดับ)',
      subtitle: 'เกรดตัวอักษรแบบมีประจุ (+)',
      badges: ['A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F'],
    },
    {
      format: 'letter_5',
      title: '1) Letter Grade (5 ระดับ)',
      subtitle: 'เกรดตัวอักษรมาตรฐาน ไม่มีประจุ',
      badges: ['A', 'B', 'C', 'D', 'F'],
    },
    {
      format: 'pass_fail',
      title: '2) Letter Grade ผ่าน/ไม่ผ่าน (S / U)',
      subtitle: `เกณฑ์ผ่านตั้งแต่ ${courseInfo.passingThreshold ?? 50}% ขึ้นไป`,
      badges: ['S (ผ่านเกณฑ์)', 'U (ไม่ผ่านเกณฑ์)'],
    },
    {
      format: 'number_8',
      title: '3) Number Grade (8 ระดับ)',
      subtitle: 'ระดับผลการเรียนระบบตัวเลข (ปพ.5)',
      badges: ['4', '3.5', '3', '2.5', '2', '1.5', '1', '0'],
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Toolbar & Summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-white">
            <Users className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-bold">
                1. ตารางกรอกรายชื่อผู้เรียนและคะแนนดิบ (Student Roster & Raw Score Entry)
              </h2>
              <p className="text-xs text-indigo-100">
                วิชา {courseInfo.courseName || '(ยังไม่ระบุชื่อวิชา)'} ({courseInfo.courseCode || '-'}) • ระบบคำนวณคะแนนตามสัดส่วนให้อัตโนมัติแบบเรียลไทม์
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleAddStudents(1)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs shadow-sm transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              + เพิ่มรายชื่อผู้เรียน (1 คน)
            </button>
            <button
              type="button"
              onClick={() => handleAddStudents(5)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-800/80 text-white hover:bg-indigo-900 font-bold text-xs shadow-sm transition cursor-pointer border border-indigo-400/30"
            >
              <UserPlus className="w-4 h-4" />
              + เพิ่มทีละ 5 คน
            </button>
            <button
              type="button"
              onClick={handleClearEmptyRows}
              title="ซ่อนหรือลบแถวว่างที่ไม่ได้กรอกข้อมูล"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 text-white hover:bg-white/25 font-medium text-xs transition cursor-pointer"
            >
              <Eraser className="w-4 h-4" />
              ล้างแถวว่าง
            </button>
          </div>
        </div>

        {/* Validation Warning if any raw score exceeds maxRawScore */}
        {totalOverflowErrors > 0 && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-3 flex items-center gap-3 text-rose-800">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <p className="text-xs sm:text-sm font-semibold">
              แจ้งเตือน: พบการกรอกคะแนนดิบเกินคะแนนเต็ม หรือติดลบ จำนวน{' '}
              <span className="underline font-extrabold">{totalOverflowErrors} แถว</span>{' '}
              (ไฮไลท์สีแดงในตาราง) กรุณาตรวจสอบและแก้ไขให้ไม่เกินคะแนนเต็มของรายการนั้น
            </p>
          </div>
        )}

        {/* Info bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-4">
            <span>
              จำนวนแถวทั้งหมด: <strong className="text-slate-900">{students.length} แถว</strong>
            </span>
            <span>
              ผู้เรียนที่มีข้อมูลแล้ว: <strong className="text-indigo-600">{activeCount} คน</strong>
            </span>
          </div>
          <div className="text-slate-500">
            สูตรคำนวณ: <code className="bg-white px-2 py-0.5 rounded border border-slate-200 text-indigo-700 font-semibold">(คะแนนดิบที่ได้ ÷ คะแนนดิบเต็ม) × ค่าน้ำหนัก %</code>
          </div>
        </div>

        {/* Scrollable Score Entry Table */}
        <div className="overflow-x-auto max-h-[640px]">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-100 text-slate-700 sticky top-0 z-10 shadow-sm">
              <tr className="border-b border-slate-200">
                <th className="py-3 px-3 text-center font-bold w-14 border-r border-slate-200">
                  ลำดับที่
                </th>
                <th className="py-3 px-3 font-bold w-36 min-w-[130px] border-r border-slate-200">
                  รหัสนักเรียน
                </th>
                <th className="py-3 px-3 font-bold min-w-[210px] border-r border-slate-200">
                  ชื่อ - นามสกุล
                </th>
                {assessmentItems.map((item, idx) => (
                  <th
                    key={item.id}
                    className="py-2.5 px-3 text-center border-r border-slate-200 min-w-[145px] bg-indigo-50/50"
                  >
                    <div className="font-bold text-slate-800 line-clamp-1" title={item.title || `รายการที่ ${idx + 1}`}>
                      {item.title || `รายการที่ ${idx + 1}`}
                    </div>
                    <div className="mt-1 flex items-center justify-center gap-1.5 text-[11px]">
                      <span className="px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200 font-semibold">
                        เต็ม {item.maxRawScore}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">
                        น้ำหนัก {item.weight}%
                      </span>
                    </div>
                  </th>
                ))}
                <th className="py-3 px-4 text-center font-bold w-36 min-w-[130px] bg-emerald-50 text-emerald-900 border-r border-slate-200">
                  <div>คะแนนรวมสุทธิ</div>
                  <div className="text-[11px] font-semibold text-emerald-700">
                    (เต็ม 100%)
                  </div>
                </th>
                <th className="py-3 px-2 text-center font-bold w-12">ลบ</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {students.map((student, rowIdx) => {
                const calc = calculatedResults[rowIdx];
                return (
                  <tr
                    key={student.id}
                    className={`transition-colors ${
                      calc?.hasOverflowError
                        ? 'bg-rose-50/70'
                        : calc?.isActive
                        ? 'bg-white hover:bg-slate-50/80'
                        : 'bg-slate-50/30 hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-2 px-3 text-center font-semibold text-slate-500 border-r border-slate-200">
                      {rowIdx + 1}
                    </td>

                    <td className="py-2 px-2.5 border-r border-slate-200">
                      <input
                        type="text"
                        value={student.studentId}
                        onChange={(e) =>
                          handleStudentTextChange(
                            student.id,
                            'studentId',
                            e.target.value
                          )
                        }
                        placeholder="รหัสประจำตัว"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs sm:text-sm font-medium"
                      />
                    </td>

                    <td className="py-2 px-2.5 border-r border-slate-200">
                      <input
                        type="text"
                        value={student.fullName}
                        onChange={(e) =>
                          handleStudentTextChange(
                            student.id,
                            'fullName',
                            e.target.value
                          )
                        }
                        placeholder="ชื่อ - นามสกุลผู้เรียน"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs sm:text-sm"
                      />
                    </td>

                    {assessmentItems.map((item) => {
                      const rawValue = student.rawScores[item.id] ?? '';
                      const numericVal =
                        rawValue === '' ? 0 : Number(rawValue);
                      const isOverMax =
                        rawValue !== '' &&
                        (numericVal > item.maxRawScore || numericVal < 0);
                      const weightedVal = calc?.weightedScores[item.id] ?? 0;

                      return (
                        <td
                          key={item.id}
                          className="py-2 px-2.5 border-r border-slate-200 align-top"
                        >
                          <div className="flex flex-col gap-1">
                            <input
                              type="number"
                              min={0}
                              max={item.maxRawScore}
                              step="any"
                              value={rawValue}
                              onChange={(e) =>
                                handleScoreChange(
                                  student.id,
                                  item.id,
                                  e.target.value
                                )
                              }
                              placeholder={`0 - ${item.maxRawScore}`}
                              className={`w-full px-2 py-1.5 rounded-lg border text-center font-semibold text-sm transition ${
                                isOverMax
                                  ? 'border-rose-500 bg-rose-100 text-rose-900 ring-2 ring-rose-400'
                                  : rawValue !== ''
                                  ? 'border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                                  : 'border-slate-200 bg-slate-50/60 text-slate-500 focus:bg-white focus:border-indigo-500'
                              }`}
                            />
                            <div className="flex items-center justify-between px-1 text-[11px]">
                              {isOverMax ? (
                                <span className="text-rose-600 font-bold flex items-center gap-0.5">
                                  เกินเต็ม {item.maxRawScore}!
                                </span>
                              ) : (
                                <span className="text-slate-400">สัดส่วน:</span>
                              )}
                              <span
                                className={`font-bold ${
                                  isOverMax
                                    ? 'text-rose-700'
                                    : 'text-indigo-600'
                                }`}
                              >
                                {weightedVal.toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        </td>
                      );
                    })}

                    <td className="py-2 px-3 text-center border-r border-slate-200 bg-emerald-50/40">
                      <div className="inline-flex flex-col items-center">
                        <span
                          className={`text-base font-extrabold ${
                            calc?.hasOverflowError
                              ? 'text-rose-600'
                              : calc?.isActive
                              ? 'text-emerald-700'
                              : 'text-slate-400'
                          }`}
                        >
                          {(calc?.proportionalTotalScore ?? 0).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          / 100 คะแนน
                        </span>
                      </div>
                    </td>

                    <td className="py-2 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteStudent(student.id)}
                        disabled={students.length <= 1}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="ลบแถวผู้เรียนนี้"
                      >
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Grade Output Format Selection before calculating */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-800 px-6 py-4 flex items-center gap-3 text-white">
          <Award className="w-6 h-6 text-amber-400" />
          <div>
            <h2 className="text-lg font-bold">
              2. ตัวเลือกรูปแบบเกรดก่อนประมวลผล (Grade Output Format Selection)
            </h2>
            <p className="text-xs text-slate-300">
              เลือกรูปแบบสัญลักษณ์ผลการเรียนที่ต้องการให้ระบบตัดเกรดและแสดงในรายงาน
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {gradeFormatCards.map((card) => {
              const isSelected = courseInfo.gradeFormat === card.format;
              return (
                <button
                  key={card.format}
                  type="button"
                  onClick={() =>
                    setCourseInfo((prev) => ({
                      ...prev,
                      gradeFormat: card.format,
                    }))
                  }
                  className={`text-left p-4 rounded-xl border-2 transition-all flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {card.title}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mb-3">
                      {card.subtitle}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-200/80">
                    {card.badges.map((b) => (
                      <span
                        key={b}
                        className={`px-2 py-0.5 rounded text-xs font-bold ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {courseInfo.gradeFormat === 'pass_fail' && (
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs sm:text-sm text-indigo-950">
                <strong>เกณฑ์การตัดสินผ่าน/ไม่ผ่าน (S / U):</strong> ค่าเริ่มต้นคือตั้งแต่{' '}
                <strong>50% ขึ้นไปได้ S (ผ่าน)</strong> และต่ำกว่า 50% ได้ U (ไม่ผ่าน)
              </div>
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-indigo-200">
                <label className="text-xs font-semibold text-slate-700">
                  เกณฑ์ผ่าน (%):
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={courseInfo.passingThreshold ?? 50}
                  onChange={(e) =>
                    setCourseInfo((prev) => ({
                      ...prev,
                      passingThreshold: Number(e.target.value) || 50,
                    }))
                  }
                  className="w-16 px-2 py-1 text-center font-bold text-indigo-700 border border-indigo-300 rounded text-sm"
                />
              </div>
            </div>
          )}

          {/* Bottom Navigation Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onPrevStep}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              ย้อนกลับไปตั้งค่ารายวิชา
            </button>

            <button
              type="button"
              onClick={onCalculateAndNext}
              disabled={totalOverflowErrors > 0}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl font-bold text-sm shadow-md transition ${
                totalOverflowErrors > 0
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white cursor-pointer shadow-indigo-200'
              }`}
            >
              <Calculator className="w-5 h-5" />
              คำนวณเกรดและแสดงผล (ไปขั้นตอนที่ 3)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


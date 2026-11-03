import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Database,
  FileSpreadsheet,
  GraduationCap,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  AssessmentItem,
  CourseInfo,
  CriterionCutoffs,
  StudentRecord,
} from './types/grading';
import {
  calculateAllStudentGrades,
  DEFAULT_CUTOFFS,
} from './utils/gradingCalculations';
import {
  createEmptyStudents,
  createInitialAssessmentItems,
  getSampleCourseData,
} from './utils/sampleData';
import { Step1CourseSetup } from './components/Step1CourseSetup';
import { Step2StudentScores } from './components/Step2StudentScores';
import { Step3GradingReport } from './components/Step3GradingReport';

const STORAGE_KEY = 'proportional_student_grading_state_v1';

const initialCourseInfo: CourseInfo = {
  courseName: '',
  courseCode: '',
  classLevel: '',
  instructorName: '',
  gradingSystem: 'criterion',
  gradeFormat: 'number_8',
  passingThreshold: 50,
  growthWeightPercent: 30,
};

export function App() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [courseInfo, setCourseInfo] = useState<CourseInfo>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.courseInfo) return parsed.courseInfo;
      }
    } catch (e) {
      console.error(e);
    }
    return initialCourseInfo;
  });

  const [assessmentItems, setAssessmentItems] = useState<AssessmentItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          Array.isArray(parsed.assessmentItems) &&
          parsed.assessmentItems.length > 0
        ) {
          return parsed.assessmentItems;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return createInitialAssessmentItems();
  });

  const [students, setStudents] = useState<StudentRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.students) && parsed.students.length > 0) {
          return parsed.students;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return createEmptyStudents(30, 0);
  });

  const [cutoffs, setCutoffs] = useState<CriterionCutoffs>(DEFAULT_CUTOFFS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          courseInfo,
          assessmentItems,
          students,
        })
      );
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [courseInfo, assessmentItems, students]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const totalWeight = useMemo(
    () =>
      assessmentItems.reduce((sum, item) => sum + (Number(item.weight) || 0), 0),
    [assessmentItems]
  );

  const isStep1Valid =
    Math.abs(totalWeight - 100) < 0.001 &&
    assessmentItems.length > 0 &&
    assessmentItems.every((i) => i.maxRawScore > 0);

  const { results, statistics } = useMemo(
    () =>
      calculateAllStudentGrades(
        courseInfo,
        assessmentItems,
        students,
        cutoffs
      ),
    [courseInfo, assessmentItems, students, cutoffs]
  );

  const handleLoadSampleData = () => {
    const sample = getSampleCourseData();
    setCourseInfo(sample.courseInfo);
    setAssessmentItems(sample.assessmentItems);
    setStudents(sample.students);
    setCutoffs(DEFAULT_CUTOFFS);
    showToast(
      'โหลดข้อมูลตัวอย่างสำเร็จ! (รายวิชาวิทยาการคำนวณ 5 รายการวัดผล พร้อมรายชื่อและคะแนนผู้เรียน 30 คน)'
    );
  };

  const handleResetAll = () => {
    if (
      !window.confirm(
        'ต้องการล้างข้อมูลทั้งหมดเพื่อเริ่มต้นใหม่ใช่หรือไม่? (จะรีเซ็ตเป็นตารางรายการวัดผล 5 แถว และตารางผู้เรียน 30 คน)'
      )
    ) {
      return;
    }
    setCourseInfo(initialCourseInfo);
    setAssessmentItems(createInitialAssessmentItems());
    setStudents(createEmptyStudents(30, 0));
    setCutoffs(DEFAULT_CUTOFFS);
    setCurrentStep(1);
    localStorage.removeItem(STORAGE_KEY);
    showToast('รีเซ็ตข้อมูลเริ่มต้นเรียบร้อยแล้ว');
  };

  const steps = [
    {
      step: 1 as const,
      title: 'ขั้นตอนที่ 1: ตั้งค่ารายวิชาและรายการวัดผล',
      subtitle: 'ข้อมูลวิชา ระบบตัดเกรด และค่าน้ำหนัก 100%',
    },
    {
      step: 2 as const,
      title: 'ขั้นตอนที่ 2: กรอกรายชื่อผู้เรียนและคะแนนดิบ',
      subtitle: 'คำนวณคะแนนตามสัดส่วน & เลือกรูปแบบเกรด',
    },
    {
      step: 3 as const,
      title: 'ขั้นตอนที่ 3: ประมวลผลเกรดและดาวน์โหลดไฟล์',
      subtitle: 'สรุปสถิติ ตารางรายงาน .xlsx และ .pdf (THSarabunPSK)',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Application Header */}
      <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  ระบบตัดเกรดและวัดประเมินผลผู้เรียนตามสัดส่วน
                </h1>
                <span className="hidden lg:inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Proportional Grading System
                </span>
              </div>
              <p className="text-xs text-slate-500">
                รองรับการตัดเกรดแบบอิงเกณฑ์ • อิงกลุ่ม (Z-Score) • อิงพัฒนาการ (Relative Gain) พร้อมส่งออก Excel และ PDF ฟอนต์ THSarabunPSK
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleLoadSampleData}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm shadow-sm transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              โหลดข้อมูลตัวอย่าง (ทดสอบระบบทันที)
            </button>

            <button
              type="button"
              onClick={handleResetAll}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              ล้างข้อมูลเริ่มต้นใหม่
            </button>
          </div>
        </div>

        {/* 3-Step Wizard Progress Bar */}
        <div className="bg-slate-50 border-t border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {steps.map((item) => {
                const isActive = currentStep === item.step;
                const isCompleted = currentStep > item.step;
                const isDisabled = item.step > 1 && !isStep1Valid;

                return (
                  <button
                    key={item.step}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => {
                      if (!isDisabled) setCurrentStep(item.step);
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : isCompleted
                        ? 'bg-white text-slate-800 border-indigo-200 hover:border-indigo-400 cursor-pointer'
                        : isDisabled
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-70'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 cursor-pointer'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-sm shrink-0 ${
                        isActive
                          ? 'bg-white text-indigo-700'
                          : isCompleted
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4" /> : item.step}
                    </div>
                    <div className="min-w-0">
                      <div
                        className={`text-xs sm:text-sm font-bold truncate ${
                          isActive ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {item.title}
                      </div>
                      <div
                        className={`text-[11px] truncate ${
                          isActive ? 'text-indigo-100' : 'text-slate-500'
                        }`}
                      >
                        {item.subtitle}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="no-print fixed bottom-5 right-5 z-50 max-w-md bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center gap-3 animate-bounce">
          <Database className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentStep === 1 && (
          <Step1CourseSetup
            courseInfo={courseInfo}
            setCourseInfo={setCourseInfo}
            assessmentItems={assessmentItems}
            setAssessmentItems={setAssessmentItems}
            onNextStep={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 2 && (
          <Step2StudentScores
            courseInfo={courseInfo}
            setCourseInfo={setCourseInfo}
            assessmentItems={assessmentItems}
            students={students}
            setStudents={setStudents}
            calculatedResults={results}
            onPrevStep={() => setCurrentStep(1)}
            onCalculateAndNext={() => setCurrentStep(3)}
          />
        )}

        {currentStep === 3 && (
          <Step3GradingReport
            courseInfo={courseInfo}
            setCourseInfo={setCourseInfo}
            assessmentItems={assessmentItems}
            results={results}
            statistics={statistics}
            cutoffs={cutoffs}
            setCutoffs={setCutoffs}
            onPrevStep={() => setCurrentStep(2)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-4 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            ระบบตัดเกรดและวัดประเมินผลผู้เรียนตามสัดส่วน (Proportional Student Grading System) • บันทึกข้อมูลอัตโนมัติในเบราว์เซอร์
          </div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>รองรับการส่งออกไฟล์ราชการฟอนต์ THSarabunPSK (.xlsx / .pdf)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;


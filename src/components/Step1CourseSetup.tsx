import React from 'react';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  HelpCircle,
  Layers,
  Plus,
  Scale,
  Trash2,
  TrendingUp,
  Users,
  ArrowRight,
} from 'lucide-react';
import { AssessmentItem, CourseInfo, GradingSystemType } from '../types/grading';

interface Step1CourseSetupProps {
  courseInfo: CourseInfo;
  setCourseInfo: React.Dispatch<React.SetStateAction<CourseInfo>>;
  assessmentItems: AssessmentItem[];
  setAssessmentItems: React.Dispatch<React.SetStateAction<AssessmentItem[]>>;
  onNextStep: () => void;
}

export const Step1CourseSetup: React.FC<Step1CourseSetupProps> = ({
  courseInfo,
  setCourseInfo,
  assessmentItems,
  setAssessmentItems,
  onNextStep,
}) => {
  const totalWeight = assessmentItems.reduce(
    (sum, item) => sum + (Number(item.weight) || 0),
    0
  );
  const totalMaxRaw = assessmentItems.reduce(
    (sum, item) => sum + (Number(item.maxRawScore) || 0),
    0
  );

  const isWeightValid = Math.abs(totalWeight - 100) < 0.001;
  const hasInvalidMaxScore = assessmentItems.some(
    (item) => !item.maxRawScore || item.maxRawScore <= 0
  );
  const canProceed = isWeightValid && !hasInvalidMaxScore && assessmentItems.length > 0;

  const handleCourseChange = (
    field: keyof CourseInfo,
    value: string | number | GradingSystemType
  ) => {
    setCourseInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleItemChange = (
    id: string,
    field: keyof AssessmentItem,
    value: string | number
  ) => {
    setAssessmentItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          [field]: value,
        };
      })
    );
  };

  const handleAddRow = () => {
    const remainingWeight = Math.max(0, 100 - totalWeight);
    const defaultWeight = remainingWeight > 0 ? remainingWeight : 10;
    const newItem: AssessmentItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: '',
      method: '',
      maxRawScore: defaultWeight,
      weight: defaultWeight,
    };
    setAssessmentItems((prev) => [...prev, newItem]);
  };

  const handleDeleteRow = (id: string) => {
    if (assessmentItems.length <= 1) return;
    setAssessmentItems((prev) => prev.filter((item) => item.id !== id));
  };

  const gradingOptions: Array<{
    type: GradingSystemType;
    title: string;
    subtitle: string;
    description: string;
    formulaHint: string;
    icon: React.ReactNode;
    badgeColor: string;
  }> = [
    {
      type: 'criterion',
      title: 'อิงเกณฑ์ (Criterion-Referenced)',
      subtitle: 'เทียบกับเกณฑ์มาตรฐานที่กำหนดไว้ล่วงหน้า',
      description:
        'ประเมินความสามารถของผู้เรียนเทียบกับเกณฑ์มาตรฐาน (เช่น 80 คะแนนขึ้นไปได้เกรด 4 หรือ A) ไม่ขึ้นอยู่กับคะแนนของเพื่อนร่วมชั้น',
      formulaHint: 'ใช้ช่วงคะแนนรวมสุทธิ 100% เทียบจุดตัดเกรดโดยตรง',
      icon: <Scale className="w-6 h-6 text-indigo-600" />,
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      type: 'norm',
      title: 'อิงกลุ่ม (Norm-Referenced)',
      subtitle: 'เปรียบเทียบความสามารถสัมพัทธ์ในกลุ่มเรียน',
      description:
        'คำนวณค่าเฉลี่ย (Mean) และส่วนเบี่ยงเบนมาตรฐาน (S.D.) ของผู้เรียนทั้งหมด แล้วแปลงเป็นคะแนนมาตรฐาน (Z-Score) ตามการแจกแจงปกติ',
      formulaHint: 'Z = (X - Mean) / S.D. แบ่งช่วงเกรดตามตำแหน่งของกลุ่ม',
      icon: <Users className="w-6 h-6 text-emerald-600" />,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      type: 'growth',
      title: 'อิงพัฒนาการ (Growth-Referenced)',
      subtitle: 'ประเมินจากความก้าวหน้าและอัตราพัฒนาการ',
      description:
        'เปรียบเทียบเปอร์เซ็นต์คะแนนของรายการวัดผลแรกกับรายการวัดผลสุดท้าย เพื่อคำนวณอัตราพัฒนาการสัมพัทธ์ (Relative Gain Score) ถ่วงน้ำหนักร่วมกับคะแนนรวม',
      formulaHint: 'G = ((Post% - Pre%) / (100 - Pre%)) × 100 ถ่วงน้ำหนักร่วมกับคะแนนรวม',
      icon: <TrendingUp className="w-6 h-6 text-amber-600" />,
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Section 1: Course Metadata Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <BookOpen className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-bold">
                1. ข้อมูลรายวิชาและระบบการตัดเกรด (Course Metadata & Grading System)
              </h2>
              <p className="text-xs text-indigo-100">
                กรอกรายละเอียดของรายวิชาเพื่อนำไปแสดงบนหัวกระดาษรายงานผลการเรียน (.xlsx และ .pdf)
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
            ขั้นตอนที่ 1 จาก 3
          </span>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                ชื่อรายวิชา <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={courseInfo.courseName}
                onChange={(e) => handleCourseChange('courseName', e.target.value)}
                placeholder="เช่น วิทยาการคำนวณ, คณิตศาสตร์พื้นฐาน"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                รหัสวิชา <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={courseInfo.courseCode}
                onChange={(e) => handleCourseChange('courseCode', e.target.value)}
                placeholder="เช่น ว31181, ค21101"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                ระดับชั้น <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={courseInfo.classLevel}
                onChange={(e) => handleCourseChange('classLevel', e.target.value)}
                placeholder="เช่น มัธยมศึกษาปีที่ 4/1"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                ครูผู้สอน <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={courseInfo.instructorName}
                onChange={(e) => handleCourseChange('instructorName', e.target.value)}
                placeholder="เช่น อาจารย์สมชาย ใจดี"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition"
              />
            </div>
          </div>

          {/* Grading Philosophy Selection */}
          <div className="pt-2">
            <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              เลือกระบบการตัดเกรด (Grading Philosophy)
            </label>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {gradingOptions.map((option) => {
                const isSelected = courseInfo.gradingSystem === option.type;
                return (
                  <button
                    key={option.type}
                    type="button"
                    onClick={() => handleCourseChange('gradingSystem', option.type)}
                    className={`text-left p-4 rounded-xl border-2 transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 shadow-sm ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="p-2 rounded-lg bg-white shadow-sm border border-slate-100">
                          {option.icon}
                        </div>
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {isSelected ? 'เลือกใช้งานอยู่' : 'คลิกเพื่อเลือก'}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base">
                        {option.title}
                      </h3>
                      <p className="text-xs font-medium text-indigo-600 mb-2">
                        {option.subtitle}
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed mb-3">
                        {option.description}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-slate-200/80 text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{option.formulaHint}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Growth-referenced extra configuration */}
            {courseInfo.gradingSystem === 'growth' && (
              <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="text-xs text-amber-900 space-y-1">
                  <p className="font-bold text-sm flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-amber-700" />
                    ตั้งค่าการถ่วงน้ำหนักพัฒนาการ (Growth-Referenced Configuration)
                  </p>
                  <p>
                    ระบบจะเปรียบเทียบเปอร์เซ็นต์คะแนนของ <strong>รายการวัดผลแรก</strong> กับ{' '}
                    <strong>รายการวัดผลสุดท้าย</strong> เพื่อคำนวณอัตราพัฒนาการสัมพัทธ์ (Relative Gain Score)
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0 bg-white px-3.5 py-2 rounded-lg border border-amber-200">
                  <label className="text-xs font-semibold text-slate-700">
                    สัดส่วนน้ำหนักพัฒนาการ (%):
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={50}
                    value={courseInfo.growthWeightPercent}
                    onChange={(e) =>
                      handleCourseChange(
                        'growthWeightPercent',
                        Math.min(50, Math.max(5, Number(e.target.value) || 30))
                      )
                    }
                    className="w-16 px-2 py-1 text-center font-bold text-amber-700 border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                  <span className="text-xs text-slate-500">
                    (คะแนนรวม {100 - (courseInfo.growthWeightPercent || 30)}%)
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Assessment Configuration Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-800 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-white">
            <Layers className="w-6 h-6 text-indigo-400" />
            <div>
              <h2 className="text-lg font-bold">
                2. ตารางกำหนดรายการวัดผลและสัดส่วนคะแนน (Assessment Configuration)
              </h2>
              <p className="text-xs text-slate-300">
                กำหนดรายการเก็บคะแนน คะแนนดิบเต็ม และค่าน้ำหนัก (%) โดยผลรวมค่าน้ำหนักต้องเท่ากับ 100%
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddRow}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            + เพิ่มรายการวัดผล
          </button>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 text-center font-bold w-16">ลำดับที่</th>
                  <th className="py-3.5 px-4 font-bold min-w-[220px]">
                    รายการวัดผล (Assessment Title)
                  </th>
                  <th className="py-3.5 px-4 font-bold min-w-[200px]">
                    วิธีการวัดผล (Assessment Method)
                  </th>
                  <th className="py-3.5 px-4 text-center font-bold w-44">
                    คะแนนดิบเต็ม (Max Score)
                  </th>
                  <th className="py-3.5 px-4 text-center font-bold w-44">
                    ค่าน้ำหนัก % (Weight)
                  </th>
                  <th className="py-3.5 px-4 text-center font-bold w-20">ลบ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {assessmentItems.map((item, index) => {
                  const isMaxInvalid = !item.maxRawScore || item.maxRawScore <= 0;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3 px-4 text-center font-semibold text-slate-600">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) =>
                            handleItemChange(item.id, 'title', e.target.value)
                          }
                          placeholder={`เช่น เก็บคะแนนครั้งที่ ${index + 1}, สอบกลางภาค`}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={item.method}
                          onChange={(e) =>
                            handleItemChange(item.id, 'method', e.target.value)
                          }
                          placeholder="เช่น แบบทดสอบปรนัย, ตรวจชิ้นงาน"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min={1}
                          step="any"
                          value={item.maxRawScore}
                          onChange={(e) =>
                            handleItemChange(
                              item.id,
                              'maxRawScore',
                              e.target.value === '' ? 0 : Number(e.target.value)
                            )
                          }
                          className={`w-full px-3 py-2 rounded-lg border text-center font-semibold text-sm focus:ring-2 ${
                            isMaxInvalid
                              ? 'border-rose-400 bg-rose-50 text-rose-700 focus:ring-rose-500'
                              : 'border-slate-300 text-slate-800 focus:ring-indigo-500'
                          }`}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="relative flex items-center">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            step="any"
                            value={item.weight}
                            onChange={(e) =>
                              handleItemChange(
                                item.id,
                                'weight',
                                e.target.value === '' ? 0 : Number(e.target.value)
                              )
                            }
                            className="w-full px-3 py-2 pr-8 rounded-lg border border-slate-300 text-center font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-500 text-sm"
                          />
                          <span className="absolute right-3 text-xs font-bold text-slate-400">
                            %
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(item.id)}
                          disabled={assessmentItems.length <= 1}
                          title="ลบรายการวัดผลนี้"
                          className={`p-2 rounded-lg transition ${
                            assessmentItems.length <= 1
                              ? 'text-slate-300 cursor-not-allowed'
                              : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer'
                          }`}
                        >
                          <Trash2 className="w-4 h-4 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-bold text-slate-800">
                <tr>
                  <td colSpan={3} className="py-3.5 px-4 text-right text-sm">
                    ผลรวมทั้งหมด ({assessmentItems.length} รายการวัดผล):
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-700">
                    รวมคะแนนดิบ {totalMaxRaw} คะแนน
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-extrabold ${
                        isWeightValid
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {Number(totalWeight.toFixed(2))}% / 100%
                    </span>
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Real-time Weight Validation Banner & Next Button */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border bg-slate-50 border-slate-200">
            <div className="flex items-center gap-3">
              {isWeightValid && !hasInvalidMaxScore ? (
                <div className="flex items-center gap-2.5 text-emerald-700">
                  <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-600" />
                  <div>
                    <p className="font-bold text-sm">
                      สัดส่วนค่าน้ำหนักรวมครบ 100% สมบูรณ์พร้อมใช้งาน
                    </p>
                    <p className="text-xs text-emerald-600">
                      ระบบจะคำนวณคะแนนตามสัดส่วนจากสูตร (คะแนนดิบที่ได้ ÷ คะแนนดิบเต็ม) × ค่าน้ำหนัก % โดยอัตโนมัติ
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 text-rose-700">
                  <AlertCircle className="w-6 h-6 shrink-0 text-rose-600" />
                  <div>
                    <p className="font-bold text-sm">
                      {!isWeightValid
                        ? `ผลรวมค่าน้ำหนักปัจจุบันคือ ${Number(totalWeight.toFixed(2))}% (ต้องรวมได้ครบ 100% พอดีจึงจะไปขั้นตอนถัดไปได้)`
                        : 'กรุณาระบุคะแนนดิบเต็มให้มากกว่า 0 ทุกแถว'}
                    </p>
                    <p className="text-xs text-rose-600">
                      {totalWeight < 100
                        ? `ยังขาดอีก ${Number((100 - totalWeight).toFixed(2))}% จึงจะครบ 100%`
                        : totalWeight > 100
                        ? `เกินมา ${Number((totalWeight - 100).toFixed(2))}% กรุณาปรับลดค่าน้ำหนัก`
                        : 'ตรวจสอบช่องคะแนนดิบเต็ม'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={!canProceed}
              onClick={onNextStep}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-sm transition ${
                canProceed
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-indigo-200'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>ถัดไป: กรอกรายชื่อและคะแนนดิบ</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


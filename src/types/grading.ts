export type GradingSystemType = 'criterion' | 'norm' | 'growth';

export type GradeFormatType =
  | 'letter_8' // A, B+, B, C+, C, D+, D, F
  | 'letter_5' // A, B, C, D, F
  | 'pass_fail' // S, U
  | 'number_8'; // 4, 3.5, 3, 2.5, 2, 1.5, 1, 0

export interface CourseInfo {
  courseName: string;
  courseCode: string;
  classLevel: string;
  instructorName: string;
  semester?: string;
  academicYear?: string;
  schoolName?: string;
  gradingSystem: GradingSystemType;
  gradeFormat: GradeFormatType;
  passingThreshold: number; // Default 50% for S/U
  growthWeightPercent: number; // Default 30% weight for growth index in growth-referenced mode (or bonus mode)
  growthBaselineItemId?: string; // Default first item
  growthTargetItemId?: string; // Default last item
}

export interface AssessmentItem {
  id: string;
  title: string;
  method: string;
  maxRawScore: number;
  weight: number;
}

export interface StudentRecord {
  id: string;
  studentId: string;
  fullName: string;
  rawScores: Record<string, number | ''>;
}

export interface CriterionCutoffs {
  grade4_A: number;     // default 80
  grade3_5_Bp: number;  // default 75
  grade3_B: number;     // default 70
  grade2_5_Cp: number;  // default 65
  grade2_C: number;     // default 60
  grade1_5_Dp: number;  // default 55
  grade1_D: number;     // default 50
}

export interface CalculatedStudentResult {
  student: StudentRecord;
  rowIndex: number;
  isActive: boolean; // Has name, ID, or at least one score
  weightedScores: Record<string, number>;
  rawScoresNumeric: Record<string, number>;
  proportionalTotalScore: number; // Sum of weighted scores (0 - 100)
  // Growth metrics
  prePercent: number;
  postPercent: number;
  relativeGainScore: number; // G = ((Y - X) / (100 - X)) * 100 or change rate
  growthAdjustedScore: number; // Final score used when gradingSystem === 'growth'
  // Norm metrics
  zScore: number;
  tScore: number;
  // Final evaluated score & grade
  effectiveScore: number;
  finalGrade: string;
  gradePoint?: number;
  hasOverflowError: boolean;
}

export interface CourseStatistics {
  activeStudentCount: number;
  mean: number;
  sd: number;
  maxScore: number;
  minScore: number;
  meanGrowth: number;
  gradeDistribution: Record<string, number>;
}


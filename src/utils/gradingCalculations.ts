import {
  AssessmentItem,
  CalculatedStudentResult,
  CourseInfo,
  CourseStatistics,
  CriterionCutoffs,
  GradeFormatType,
  StudentRecord,
} from '../types/grading';

export const DEFAULT_CUTOFFS: CriterionCutoffs = {
  grade4_A: 80,
  grade3_5_Bp: 75,
  grade3_B: 70,
  grade2_5_Cp: 65,
  grade2_C: 60,
  grade1_5_Dp: 55,
  grade1_D: 50,
};

export function getGradeLabelList(format: GradeFormatType): string[] {
  switch (format) {
    case 'letter_8':
      return ['A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F'];
    case 'letter_5':
      return ['A', 'B', 'C', 'D', 'F'];
    case 'pass_fail':
      return ['S', 'U'];
    case 'number_8':
      return ['4', '3.5', '3', '2.5', '2', '1.5', '1', '0'];
  }
}

export function getGradingSystemNameThai(system: CourseInfo['gradingSystem']): string {
  switch (system) {
    case 'criterion':
      return 'อิงเกณฑ์ (Criterion-Referenced)';
    case 'norm':
      return 'อิงกลุ่ม (Norm-Referenced)';
    case 'growth':
      return 'อิงพัฒนาการ (Growth-Referenced)';
  }
}

export function getGradeFormatNameThai(format: GradeFormatType): string {
  switch (format) {
    case 'letter_8':
      return 'ตัวอักษร 8 ระดับ (A, B+, B, C+, C, D+, D, F)';
    case 'letter_5':
      return 'ตัวอักษร 5 ระดับ (A, B, C, D, F)';
    case 'pass_fail':
      return 'ผ่าน / ไม่ผ่าน (S, U)';
    case 'number_8':
      return 'ตัวเลข 8 ระดับ (4, 3.5, 3, 2.5, 2, 1.5, 1, 0)';
  }
}

/**
 * Evaluate grade by score (0-100) using Criterion-Referenced or Growth-Adjusted score
 */
export function assignGradeByScore(
  score: number,
  format: GradeFormatType,
  cutoffs: CriterionCutoffs = DEFAULT_CUTOFFS,
  passingThreshold = 50
): string {
  const roundedScore = Math.round((score + Number.EPSILON) * 100) / 100;
  // Often schools round 79.5 to 80 or compare exact score; let's use exact >= or rounded to 2 decimals
  if (format === 'pass_fail') {
    return roundedScore >= passingThreshold ? 'S' : 'U';
  }

  if (format === 'letter_5') {
    if (roundedScore >= cutoffs.grade4_A) return 'A';
    if (roundedScore >= cutoffs.grade3_B) return 'B';
    if (roundedScore >= cutoffs.grade2_C) return 'C';
    if (roundedScore >= cutoffs.grade1_D) return 'D';
    return 'F';
  }

  if (format === 'letter_8') {
    if (roundedScore >= cutoffs.grade4_A) return 'A';
    if (roundedScore >= cutoffs.grade3_5_Bp) return 'B+';
    if (roundedScore >= cutoffs.grade3_B) return 'B';
    if (roundedScore >= cutoffs.grade2_5_Cp) return 'C+';
    if (roundedScore >= cutoffs.grade2_C) return 'C';
    if (roundedScore >= cutoffs.grade1_5_Dp) return 'D+';
    if (roundedScore >= cutoffs.grade1_D) return 'D';
    return 'F';
  }

  // number_8
  if (roundedScore >= cutoffs.grade4_A) return '4';
  if (roundedScore >= cutoffs.grade3_5_Bp) return '3.5';
  if (roundedScore >= cutoffs.grade3_B) return '3';
  if (roundedScore >= cutoffs.grade2_5_Cp) return '2.5';
  if (roundedScore >= cutoffs.grade2_C) return '2';
  if (roundedScore >= cutoffs.grade1_5_Dp) return '1.5';
  if (roundedScore >= cutoffs.grade1_D) return '1';
  return '0';
}

/**
 * Evaluate grade by Z-score for Norm-Referenced grading
 */
export function assignGradeByZScore(
  zScore: number,
  totalScore: number,
  format: GradeFormatType,
  passingThreshold = 50
): string {
  if (format === 'pass_fail') {
    // Pass if Z >= -1.0 or totalScore >= passingThreshold
    return zScore >= -1.0 || totalScore >= passingThreshold ? 'S' : 'U';
  }

  if (format === 'letter_5') {
    if (zScore >= 1.2) return 'A';
    if (zScore >= 0.4) return 'B';
    if (zScore >= -0.4) return 'C';
    if (zScore >= -1.2) return 'D';
    return 'F';
  }

  if (format === 'letter_8') {
    if (zScore >= 1.5) return 'A';
    if (zScore >= 1.0) return 'B+';
    if (zScore >= 0.5) return 'B';
    if (zScore >= 0.0) return 'C+';
    if (zScore >= -0.5) return 'C';
    if (zScore >= -1.0) return 'D+';
    if (zScore >= -1.5) return 'D';
    return 'F';
  }

  // number_8
  if (zScore >= 1.5) return '4';
  if (zScore >= 1.0) return '3.5';
  if (zScore >= 0.5) return '3';
  if (zScore >= 0.0) return '2.5';
  if (zScore >= -0.5) return '2';
  if (zScore >= -1.0) return '1.5';
  if (zScore >= -1.5) return '1';
  return '0';
}

/**
 * Main calculation engine for all students and summary statistics
 */
export function calculateAllStudentGrades(
  courseInfo: CourseInfo,
  assessmentItems: AssessmentItem[],
  students: StudentRecord[],
  cutoffs: CriterionCutoffs = DEFAULT_CUTOFFS
): {
  results: CalculatedStudentResult[];
  statistics: CourseStatistics;
} {
  const validItems = assessmentItems.filter((item) => item.maxRawScore > 0);
  const firstItem =
    validItems.find((i) => i.id === courseInfo.growthBaselineItemId) || validItems[0];
  const lastItem =
    validItems.find((i) => i.id === courseInfo.growthTargetItemId) ||
    validItems[validItems.length - 1];

  // First pass: calculate proportional scores and growth metrics per student
  const preliminaryResults: CalculatedStudentResult[] = students.map((student, idx) => {
    const hasNameOrId =
      student.studentId.trim() !== '' || student.fullName.trim() !== '';
    const hasAnyScore = Object.values(student.rawScores).some(
      (v) => v !== '' && v !== undefined && v !== null
    );
    const isActive = hasNameOrId || hasAnyScore;

    const weightedScores: Record<string, number> = {};
    const rawScoresNumeric: Record<string, number> = {};
    let proportionalTotalScore = 0;
    let hasOverflowError = false;

    for (const item of assessmentItems) {
      const rawVal = student.rawScores[item.id];
      const numericRaw =
        rawVal === '' || rawVal === undefined || rawVal === null || isNaN(Number(rawVal))
          ? 0
          : Number(rawVal);

      rawScoresNumeric[item.id] = numericRaw;

      if (numericRaw > item.maxRawScore || numericRaw < 0) {
        hasOverflowError = true;
      }

      const maxRaw = item.maxRawScore > 0 ? item.maxRawScore : 1;
      const weighted = (numericRaw / maxRaw) * item.weight;
      weightedScores[item.id] = weighted;
      proportionalTotalScore += weighted;
    }

    // Growth calculation between firstItem and lastItem
    let prePercent = 0;
    let postPercent = 0;
    let relativeGainScore = 0;

    if (firstItem && lastItem) {
      const preRaw = rawScoresNumeric[firstItem.id] || 0;
      const postRaw = rawScoresNumeric[lastItem.id] || 0;
      prePercent =
        firstItem.maxRawScore > 0 ? (preRaw / firstItem.maxRawScore) * 100 : 0;
      postPercent =
        lastItem.maxRawScore > 0 ? (postRaw / lastItem.maxRawScore) * 100 : 0;

      // Relative Gain Score formula:
      // If postPercent >= prePercent: G = ((postPercent - prePercent) / (100 - prePercent)) * 100
      // If prePercent == 100 and postPercent == 100: G = 100
      // If postPercent < prePercent (decline): G = ((postPercent - prePercent) / prePercent) * 100 (or proportional)
      if (postPercent >= prePercent) {
        if (prePercent >= 100) {
          relativeGainScore = 100;
        } else {
          relativeGainScore = ((postPercent - prePercent) / (100 - prePercent)) * 100;
        }
      } else {
        // Negative growth
        relativeGainScore = postPercent - prePercent;
      }
    }

    // For Growth-Referenced grading:
    // Combine cumulative proportional score with growth score based on growthWeightPercent (default 30% or bonus)
    // Wait: if someone gets 85% cumulative and positive growth, weighting 70% cumulative + 30% relativeGain might lower a top student's score if their pre-test was already high (e.g. 80% -> 90%, relative gain = 10/20 = 50%).
    // Let's make sure the growth-adjusted score is fair and transparent according to educational assessment theory:
    // Method: Weighted combination where Relative Achievement & Growth Index = (postPercent + relativeGainScore clamp) or
    // Cumulative Score (70%) + Growth Achievement Score (30% where Growth Score = max(postPercent, min(100, proportionalTotalScore + relativeGainScore * 0.25)))
    // Let's check the prompt:
    // "แบบอิงพัฒนาการ: เปรียบเทียบเปอร์เซ็นต์คะแนนของรายการวัดผลแรกกับรายการวัดผลสุดท้ายเพื่อคำนวณอัตราพัฒนาการ (Relative Gain Score) แล้วนำมาถ่วงน้ำหนักร่วมกับคะแนนรวมเพื่อตัดเกรด"
    // And in Gemini Plan.md:
    // "Calculate Growth Index by comparing the percentage score of the earliest assessment item (P_1) and the latest assessment item (P_n). Add a growth bonus (up to +10 points capped at 100) or weight 70% cumulative score + 30% relative gain score before mapping to grade thresholds, and display the student's Growth Rate (%) in the result table."
    // Let's support configurable growth weight (e.g. 70% คะแนนรวมตามสัดส่วน + 30% คะแนนพัฒนาการสัมพัทธ์ หรือ โบนัสพัฒนาการ) and make sure the formula is clearly shown!
    // Even better: if we use 70% Cumulative + 30% Relative Gain Score (or if Relative Gain > 0, we can either use exact weighted `0.7 * Total + 0.3 * max(0, G)` or allow choosing between "ถ่วงน้ำหนักคะแนนรวม 70% + คะแนนพัฒนาการสัมพัทธ์ (G) 30%" and "คะแนนรวม + โบนัสพัฒนาการ (สูงสุด +10 คะแนน)").
    // Let's check what happens with `0.7 * proportionalTotalScore + 0.3 * Math.max(0, relativeGainScore)`:
    // If a student starts at 50% (Pre) and ends at 85% (Post), G = (85-50)/(100-50)*100 = 70%. If their cumulative is 76%, then 0.7*76 + 0.3*70 = 53.2 + 21 = 74.2%.
    // What if a student starts at 70% and ends at 95%? G = (95-70)/30 * 100 = 83.33%. Cumulative = 85%. 0.7*85 + 0.3*83.33 = 84.5%.
    const growthWeight = (courseInfo.growthWeightPercent ?? 20) / 100;
    const clampedGain = Math.max(0, Math.min(100, relativeGainScore));
    const weightedGrowthScore =
      proportionalTotalScore * (1 - growthWeight) + clampedGain * growthWeight;

    return {
      student,
      rowIndex: idx + 1,
      isActive,
      weightedScores,
      rawScoresNumeric,
      proportionalTotalScore,
      prePercent,
      postPercent,
      relativeGainScore,
      growthAdjustedScore: Math.min(100, Math.max(0, weightedGrowthScore)),
      zScore: 0,
      tScore: 50,
      effectiveScore: proportionalTotalScore,
      finalGrade: '-',
      hasOverflowError,
    };
  });

  // Compute statistics over active students
  const activeResults = preliminaryResults.filter((r) => r.isActive);
  const n = activeResults.length;

  let mean = 0;
  let sd = 0;
  let maxScore = 0;
  let minScore = 0;
  let meanGrowth = 0;

  if (n > 0) {
    const scores = activeResults.map((r) => r.proportionalTotalScore);
    mean = scores.reduce((acc, s) => acc + s, 0) / n;
    const variance =
      scores.reduce((acc, s) => acc + Math.pow(s - mean, 2), 0) / n;
    sd = Math.sqrt(variance);
    maxScore = Math.max(...scores);
    minScore = Math.min(...scores);
    meanGrowth =
      activeResults.reduce((acc, r) => acc + r.relativeGainScore, 0) / n;
  }

  // Second pass: assign Z-score, T-score, effectiveScore, and finalGrade
  const gradeDistribution: Record<string, number> = {};
  for (const label of getGradeLabelList(courseInfo.gradeFormat)) {
    gradeDistribution[label] = 0;
  }

  const finalResults = preliminaryResults.map((res) => {
    if (!res.isActive) {
      return res;
    }

    const zScore = sd > 0.0001 ? (res.proportionalTotalScore - mean) / sd : 0;
    const tScore = 50 + 10 * zScore;

    let effectiveScore = res.proportionalTotalScore;
    let finalGrade = 'F';

    if (courseInfo.gradingSystem === 'criterion') {
      effectiveScore = res.proportionalTotalScore;
      finalGrade = assignGradeByScore(
        effectiveScore,
        courseInfo.gradeFormat,
        cutoffs,
        courseInfo.passingThreshold
      );
    } else if (courseInfo.gradingSystem === 'norm') {
      effectiveScore = res.proportionalTotalScore;
      finalGrade = assignGradeByZScore(
        zScore,
        res.proportionalTotalScore,
        courseInfo.gradeFormat,
        courseInfo.passingThreshold
      );
    } else if (courseInfo.gradingSystem === 'growth') {
      effectiveScore = res.growthAdjustedScore;
      finalGrade = assignGradeByScore(
        effectiveScore,
        courseInfo.gradeFormat,
        cutoffs,
        courseInfo.passingThreshold
      );
    }

    if (gradeDistribution[finalGrade] !== undefined) {
      gradeDistribution[finalGrade] += 1;
    } else {
      gradeDistribution[finalGrade] = 1;
    }

    return {
      ...res,
      zScore,
      tScore,
      effectiveScore,
      finalGrade,
    };
  });

  return {
    results: finalResults,
    statistics: {
      activeStudentCount: n,
      mean,
      sd,
      maxScore,
      minScore,
      meanGrowth,
      gradeDistribution,
    },
  };
}


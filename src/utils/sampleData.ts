import { AssessmentItem, CourseInfo, StudentRecord } from '../types/grading';

export function createInitialAssessmentItems(): AssessmentItem[] {
  return [
    { id: 'item-1', title: '', method: '', maxRawScore: 20, weight: 20 },
    { id: 'item-2', title: '', method: '', maxRawScore: 20, weight: 20 },
    { id: 'item-3', title: '', method: '', maxRawScore: 20, weight: 20 },
    { id: 'item-4', title: '', method: '', maxRawScore: 20, weight: 20 },
    { id: 'item-5', title: '', method: '', maxRawScore: 20, weight: 20 },
  ];
}

export function createEmptyStudents(count = 30, startIndex = 0): StudentRecord[] {
  return Array.from({ length: count }, (_, idx) => ({
    id: `stu-${Date.now()}-${startIndex + idx + 1}-${Math.random().toString(36).slice(2, 6)}`,
    studentId: '',
    fullName: '',
    rawScores: {},
  }));
}

export function getSampleCourseData(): {
  courseInfo: CourseInfo;
  assessmentItems: AssessmentItem[];
  students: StudentRecord[];
} {
  const courseInfo: CourseInfo = {
    courseName: 'วิทยาการคำนวณและเทคโนโลยีสารสนเทศ',
    courseCode: 'ว31181',
    classLevel: 'มัธยมศึกษาปีที่ 4/1',
    instructorName: 'อาจารย์สุทธิพงศ์ เปิ่นปัญญา',
    semester: '1',
    academicYear: '2568',
    schoolName: 'โรงเรียนสาธิตแห่งนวัตกรรมการศึกษา',
    gradingSystem: 'criterion',
    gradeFormat: 'number_8',
    passingThreshold: 50,
    growthWeightPercent: 30,
    growthBaselineItemId: 'demo-item-1',
    growthTargetItemId: 'demo-item-5',
  };

  const assessmentItems: AssessmentItem[] = [
    {
      id: 'demo-item-1',
      title: 'แบบทดสอบก่อนเรียนและใบงานหน่วยที่ 1',
      method: 'แบบทดสอบปรนัย / ตรวจใบงาน',
      maxRawScore: 30,
      weight: 15,
    },
    {
      id: 'demo-item-2',
      title: 'ปฏิบัติการเขียนโปรแกรมแก้ปัญหา',
      method: 'ประเมินทักษะปฏิบัติ (Rubric)',
      maxRawScore: 50,
      weight: 20,
    },
    {
      id: 'demo-item-3',
      title: 'สอบวัดผลกลางภาคเรียน',
      method: 'แบบทดสอบปรนัยและอัตนัย',
      maxRawScore: 40,
      weight: 20,
    },
    {
      id: 'demo-item-4',
      title: 'โครงงานนวัตกรรมดิจิทัลและจิตพิสัย',
      method: 'ประเมินชิ้นงาน / สังเกตพฤติกรรม',
      maxRawScore: 50,
      weight: 15,
    },
    {
      id: 'demo-item-5',
      title: 'สอบวัดผลปลายภาคเรียน',
      method: 'แบบทดสอบวัดผลสัมฤทธิ์',
      maxRawScore: 60,
      weight: 30,
    },
  ];

  const sampleRoster: Array<{
    studentId: string;
    fullName: string;
    scores: [number, number, number, number, number];
  }> = [
    { studentId: '6704101', fullName: 'นายกิตติพงศ์ วงศ์สุวรรณ', scores: [27, 48, 37, 47, 56] },
    { studentId: '6704102', fullName: 'นางสาวกานต์พิชชา รัตนโชติ', scores: [25, 45, 35, 46, 54] },
    { studentId: '6704103', fullName: 'นายชยพล เจริญทรัพย์', scores: [22, 41, 32, 44, 49] },
    { studentId: '6704104', fullName: 'นางสาวณัฐณิชา ศรีสวัสดิ์', scores: [18, 42, 30, 45, 52] },
    { studentId: '6704105', fullName: 'นายธนกฤต พงศ์ไพศาล', scores: [24, 39, 29, 41, 45] },
    { studentId: '6704106', fullName: 'นางสาวธัญชนก อัศวเมธี', scores: [20, 38, 28, 40, 44] },
    { studentId: '6704107', fullName: 'นายนนทพัทธ์ เกียรติกำจร', scores: [19, 36, 26, 39, 41] },
    { studentId: '6704108', fullName: 'นางสาวปุณยวีร์ จันทร์เพ็ญ', scores: [21, 35, 25, 38, 39] },
    { studentId: '6704109', fullName: 'นายพชรพล สุขสวัสดิ์', scores: [16, 34, 24, 37, 38] },
    { studentId: '6704110', fullName: 'นางสาวพิชญาภา วัฒนากูล', scores: [15, 32, 23, 35, 36] },
    { studentId: '6704111', fullName: 'นายภัทรพล ธรรมรักษ์', scores: [17, 30, 21, 34, 34] },
    { studentId: '6704112', fullName: 'นางสาวลภัสรดา มงคลชัย', scores: [14, 28, 20, 33, 32] },
    { studentId: '6704113', fullName: 'นายวรเมธ ชัยภูมิ', scores: [12, 27, 18, 30, 29] },
    { studentId: '6704114', fullName: 'นางสาวศุภิสรา ทองดี', scores: [11, 22, 15, 26, 24] },
    { studentId: '6704115', fullName: 'นายสิรวิชญ์ ภักดีผล', scores: [28, 49, 38, 49, 58] },
    { studentId: '6704116', fullName: 'นางสาวอภิชญา นันทวรรณ', scores: [15, 44, 33, 46, 55] },
    { studentId: '6704117', fullName: 'นายอชิรวิทย์ สายทอง', scores: [23, 40, 31, 42, 47] },
    { studentId: '6704118', fullName: 'นางสาวกมลชนก เลิศวิไล', scores: [19, 37, 27, 40, 42] },
    { studentId: '6704119', fullName: 'นายจิรภัทร ภูมิพัฒน์', scores: [16, 33, 22, 36, 37] },
    { studentId: '6704120', fullName: 'นางสาวชนากานต์ ยิ่งยง', scores: [13, 29, 19, 32, 31] },
    { studentId: '6704121', fullName: 'นายณัฐวุฒิ ศิริพร', scores: [26, 46, 34, 45, 51] },
    { studentId: '6704122', fullName: 'นางสาวดารินทร์ แก้วมณี', scores: [20, 39, 29, 41, 46] },
    { studentId: '6704123', fullName: 'นายธีรภัทร วรโชติ', scores: [18, 35, 25, 38, 40] },
    { studentId: '6704124', fullName: 'นางสาวนภัสสร หงส์ทอง', scores: [14, 31, 22, 35, 35] },
    { studentId: '6704125', fullName: 'นายปวริศร์ อินทรีย์', scores: [10, 24, 16, 28, 25] },
    { studentId: '6704126', fullName: 'นางสาวพลอยชมพู บุญมี', scores: [25, 43, 33, 44, 50] },
    { studentId: '6704127', fullName: 'นายพีรวัส วิเศษกุล', scores: [17, 36, 26, 39, 43] },
    { studentId: '6704128', fullName: 'นางสาวมนัสนันท์ ตั้งใจ', scores: [22, 41, 30, 43, 48] },
    { studentId: '6704129', fullName: 'นายรพีภัทร สมบูรณ์', scores: [15, 30, 21, 33, 33] },
    { studentId: '6704130', fullName: 'นางสาววิชญาพร สุวรรณรัตน์', scores: [29, 47, 39, 48, 57] },
  ];

  const students: StudentRecord[] = sampleRoster.map((row, idx) => ({
    id: `demo-stu-${idx + 1}`,
    studentId: row.studentId,
    fullName: row.fullName,
    rawScores: {
      'demo-item-1': row.scores[0],
      'demo-item-2': row.scores[1],
      'demo-item-3': row.scores[2],
      'demo-item-4': row.scores[3],
      'demo-item-5': row.scores[4],
    },
  }));

  return { courseInfo, assessmentItems, students };
}


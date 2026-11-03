การออกแบบและพัฒนาระบบประเมินผลการเรียนที่รองรับทั้งหลักการวัดผลทางวิชาการและประสบการณ์ใช้งาน (UX/UI) ที่ราบรื่นสำหรับครูผู้สอน จำเป็นต้องผสานสูตรคำนวณทางสถิติเข้ากับโครงสร้างซอฟต์แวร์ที่ยืดหยุ่น ด้านล่างนี้คือข้อมูลหลักการวัดและประเมินผล การระดมสมองออกแบบระบบ (@brainstorming) แผนการพัฒนา (@writing-plans) และชุดคำสั่ง (Prompt) สำหรับนำไปใช้ใน Antigravity เพื่อสร้างแอปพลิเคชันทันที

1. หลักการวัดและประเมินผลการเรียนรู้ (Educational Assessment Theory)

ระบบตัดเกรดในบริบทการศึกษาไทยแบ่งแนวทางการประเมินออกเป็น 3 รูปแบบหลัก ซึ่งมีตรรกะการคำนวณที่แตกต่างกัน:

รูปแบบการประเมิน	หลักการและทฤษฎีการวัดผล	สูตรและตรรกะการคำนวณในโปรแกรม
1. อิงเกณฑ์ (Criterion-Referenced)	วัดความสามารถของผู้เรียนเทียบกับเกณฑ์มาตรฐานที่กำหนดไว้ล่วงหน้า ไม่ขึ้นอยู่กับคะแนนของเพื่อนร่วมชั้น	ใช้ช่วงคะแนนรวม 100 คะแนนเทียบเกณฑ์มาตรฐาน เช่น 80–100 = 4 (A), 75–79 = 3.5 (B+), 70–74 = 3 (B), 65–69 = 2.5 (C+), 60–64 = 2 (C), 55–59 = 1.5 (D+), 50–54 = 1 (D), 0–49 = 0 (F) หรือเกณฑ์ผ่าน S ≥ 50% (หรือ 60%)
2. อิงกลุ่ม (Norm-Referenced)	วัดตำแหน่งความสามารถของผู้เรียนเปรียบเทียบกับกลุ่มเพื่อนร่วมชั้น เหมาะกับวิชาที่มีความยากสูงหรือต้องการจำแนกความสามารถสัมพัทธ์	คำนวณค่าเฉลี่ย (\mu) และส่วนเบี่ยงเบนมาตรฐาน (\sigma) ของคะแนนรวมทั้งชั้น แล้วใช้คะแนนมาตรฐาน Z = \frac{X - \mu}{\sigma} หรือ T-Score ในการแบ่งช่วงเกรด (เช่น เกรด 4 เริ่มที่ \mu + 1.5\sigma, เกรด 3 เริ่มที่ \mu + 0.5\sigma)
3. อิงพัฒนาการ (Growth / Progress-Referenced)	ประเมินจากความก้าวหน้าของผู้เรียน (เปรียบเทียบคะแนนก่อนเรียน-หลังเรียน หรือพัฒนาการตามลำดับเวลา)	คำนวณจากคะแนนความก้าวหน้าสัมพัทธ์ (Relative Gain Score):  G = \frac{Y - X}{F - X} \times 100 (เมื่อ X = คะแนนเริ่มต้น, Y = คะแนนหลังเรียน, F = คะแนนเต็ม) หรือนำคะแนนตามสัดส่วนมารวมกับโบนัสพัฒนาการตามเกณฑ์ที่ตั้งไว้

การแปลงคะแนนดิบเป็นคะแนนตามสัดส่วน (Proportional Weighting):
เนื่องจากครูผู้สอนอาจเก็บคะแนนดิบในแต่ละชิ้นงานด้วยคะแนนเต็มไม่เท่ากับค่าน้ำหนัก (%) ระบบต้องรองรับการกรอก "คะแนนเต็มของคะแนนดิบ (Max Raw Score)" หรือคำนวณเทียบสัดส่วนอัตโนมัติ:


$$\text{Weighted Score}_i = \left( \frac{\text{Raw Score}_i}{\text{Max Raw Score}_i} \right) \times \text{Weight}_i$$

2. การสำรวจความต้องการและออกแบบระบบ (@brainstorming)

จากการวิเคราะห์โจทย์ในมุมมองนักเทคโนโลยีการศึกษาและนักพัฒนาซอฟต์แวร์ มีประเด็นสำคัญที่ต้องออกแบบเพิ่มเติมเพื่อให้โปรแกรมใช้งานได้จริงโดยไม่มีจุดบกพร่อง (Edge Cases):

⚬ การตรวจสอบผลรวมค่าน้ำหนัก (Weight Validation): ตารางรายการวัดผลต้องมีตัวนับผลรวมค่าน้ำหนัก (%) แบบเรียลไทม์ และแจ้งเตือนหากผลรวมยังไม่เท่ากับ 100% ก่อนอนุญาตให้ข้ามไปหน้ากรอกคะแนน
⚬ การจัดการคะแนนดิบ vs คะแนนเต็ม (Max Raw Score Handling): ในทางปฏิบัติ ครูอาจตั้งค่าน้ำหนัก "สอบกลางภาค 20%" แต่ใช้ข้อสอบจริงเต็ม 40 คะแนน ดังนั้นในตารางตั้งค่ารายการวัดผล ควรมีคอลัมน์ "คะแนนเต็ม (คะแนนดิบ)" คู่กับ "ค่าน้ำหนัก (%)" เพื่อให้ระบบเทียบบัญญัติไตรยางศ์ให้อัตโนมัติ (โดยตั้งค่าเริ่มต้นให้คะแนนดิบเต็มเท่ากับค่าน้ำหนัก เพื่อความสะดวกหากครูใช้ค่าเดียวกัน)
⚬ การรองรับระบบตัดเกรดอิงพัฒนาการ: เมื่อครูเลือกโหมด "อิงพัฒนาการ" ระบบควรเปิดให้ระบุได้ว่า รายการวัดผลใดคือคะแนนก่อนเรียน (Pre-test / Baseline) และรายการใดคือคะแนนหลังเรียน (Post-test) หรือให้คำนวณร่วมกับคะแนนเก็บสะสมอย่างไร
⚬ การเรนเดอร์ฟอนต์ภาษาไทย THSarabunPSK สำหรับ PDF และ Excel:
  ⚬ Excel (.xlsx): ต้องใช้ไลบรารีที่รองรับ Cell Styling (เช่น ExcelJS) เพื่อกำหนดชื่อฟอนต์ THSarabunPSK ขนาด 16 pt การตีเส้นตาราง (Borders) การผสานเซลล์หัวตาราง และการตั้งค่าหน้ากระดาษ (Page Setup: A4)
  ⚬ PDF (.pdf): ปัญหาหลักของการทำ PDF ภาษาไทยบนเว็บคือสระลอยหรือฟอนต์ไม่แสดงผล วิธีที่เสถียรที่สุดคือการใช้ CSS @font-face โหลดฟอนต์สารบรรณคู่กับ HTML Print Layout หรือใช้ html2pdf.js / jsPDF พร้อมฝังฟอนต์ Base64 (THSarabunPSK) และจัดเลย์เอาต์แบบเอกสารราชการโรงเรียน (ปพ.5 ย่อ)

3. แผนการพัฒนาระบบ (@writing-plans)

สถาปัตยกรรมและเทคโนโลยีแนะนำ (Tech Stack)

⚬ Frontend Framework: React (Vite + TypeScript) + Tailwind CSS (สำหรับ UI ที่สะอาดตา ทันสมัย และจัดการ State ตารางขนาดใหญ่ได้ดี)
⚬ State Management: React Context หรือ useState แบบรวมศูนย์ พร้อมระบบ Auto-save ลง localStorage ป้องกันข้อมูลหายเมื่อเผลอรีเฟรชหน้าเว็บ
⚬ Export Libraries:
  ⚬ exceljs + file-saver สำหรับสร้างไฟล์ .xlsx ที่กำหนดฟอนต์ THSarabunPSK ตีกรอบตาราง และจัดหน้าได้ครบถ้วน
  ⚬ html2pdf.js (หรือ jspdf + jspdf-autotable พร้อมชุดฟอนต์สารบรรณ) ร่วมกับ Print Stylesheet (@media print) สำหรับส่งออกไฟล์ .pdf ที่จัดหน้าสวยงาม

แผนการดำเนินงานรายขั้นตอน (Implementation Phases)

Phase 1: โครงสร้างข้อมูลและหน้าตั้งค่ารายวิชา & โครงสร้างการวัดผล (Step 1 Wizard)

1. ฟอร์มข้อมูลรายวิชา (Course Metadata Form):
  ⚬ ช่องกรอก: ชื่อรายวิชา, รหัสวิชา, ระดับชั้น, ชื่อครูผู้สอน
  ⚬ ตัวเลือกระบบการตัดเกรด (Radio/Select Cards): อิงเกณฑ์ (Criterion), อิงกลุ่ม (Norm), อิงพัฒนาการ (Growth) พร้อมคำอธิบายสั้นๆ
2. ตารางกำหนดรายการวัดผล (Assessment Configuration Table):
  ⚬ คอลัมน์: ลำดับที่ | รายการวัดผล (Text) | วิธีการวัดผล (Text) | คะแนนดิบเต็ม (Number) | ค่าน้ำหนัก % (Number) | ปุ่มลบแถว
  ⚬ สร้างแถวเริ่มต้นไว้ 5 แถว พร้อมปุ่ม "+ เพิ่มรายการวัดผล"
  ⚬ แถบสรุปผลรวมค่าน้ำหนัก (%) ด้านล่างตาราง (ต้องรวมได้ 100% จึงจะกดปุ่ม "ถัดไป: กรอกคะแนนผู้เรียน" ได้)

Phase 2: หน้าตารางกรอกรายชื่อและคะแนนดิบผู้เรียน (Step 2 Wizard)

1. การสร้างคอลัมน์แบบไดนามิก (Dynamic Table Columns):
  ⚬ คอลัมน์คงที่: ลำดับที่ | รหัสประจำตัวนักเรียน | ชื่อ-นามสกุล
  ⚬ คอลัมน์ไดนามิก: ดึงชื่อ "รายการวัดผล" ทุกแถวจาก Step 1 มาสร้างเป็นหัวคอลัมน์ พร้อมแสดง "(เต็ม X / น้ำหนัก Y%)" กำกับไว้ด้านบน
2. การจัดการแถวผู้เรียน:
  ⚬ สร้างแถวเปล่าเริ่มต้น 30 แถว พร้อมปุ่ม "+ เพิ่มรายชื่อผู้เรียน" (เพิ่มทีละ 1 หรือทีละ 5 คนได้)
  ⚬ ระบบตรวจสอบความถูกต้อง (Validation): ห้ามกรอกคะแนนดิบเกินคะแนนเต็มของช่องนั้นๆ และรองรับการกดปุ่มลูกศรหรือ Enter เพื่อเลื่อนช่องกรอกคะแนนอย่างรวดเร็ว

Phase 3: ระบบเลือกเกณฑ์และประมวลผลเกรด (Step 3 Calculation Engine)

1. ตัวเลือกรูปแบบผลการเรียน (Grade Output Format):
  ⚬ Letter Grade (8 ระดับ/5 ระดับ): A, B+, B, C+, C, D+, D, F หรือ A, B, C, D, F
  ⚬ Pass/Fail Letter Grade: S (ผ - ผ่าน), U (มผ - ไม่ผ่าน)
  ⚬ Number Grade: 4, 3.5, 3, 2.5, 2, 1.5, 1, 0
2. โมดูลคำนวณเกรด (Grading Engine):
  ⚬ คำนวณคะแนนตามสัดส่วนของแต่ละรายการ และรวมเป็นคะแนนสุทธิเต็ม 100
  ⚬ ประมวลผลเกรดตามระบบที่เลือกไว้ใน Step 1 (อิงเกณฑ์ / อิงกลุ่มด้วยค่า Mean & SD / อิงพัฒนาการ) และแปลงผลลัพธ์ตามรูปแบบเกรดที่เลือก
  ⚬ แผงตั้งค่าเกณฑ์จุดตัดเกรด (Cut-off Score Customizer) เผื่อครูต้องการปรับช่วงคะแนนด้วยตนเอง

Phase 4: หน้าสรุปผล รายงานสถิติ และการส่งออกไฟล์ (Step 4 Report & Export)

1. ตารางแสดงผลการเรียนสมบูรณ์:
  ⚬ ส่วนหัวรายงาน: แสดงชื่อวิชา รหัสวิชา ระดับชั้น ครูผู้สอน และระบบการตัดเกรดที่ใช้
  ⚬ ตารางผลลัพธ์: ลำดับ | รหัสนักเรียน | ชื่อ-นามสกุล | คะแนนแต่ละรายการ (แสดงทั้งคะแนนดิบและคะแนนตามสัดส่วน) | คะแนนรวม (100%) | เกรดที่ได้
  ⚬ สรุปสถิติท้ายตาราง: ค่าเฉลี่ย (\bar{x}), ส่วนเบี่ยงเบนมาตรฐาน (S.D.), คะแนนสูงสุด-ต่ำสุด, และจำนวนผู้เรียนในแต่ละระดับเกรด
2. ระบบส่งออกไฟล์ (Export .xlsx & .pdf ด้วยฟอนต์ THSarabunPSK):
  ⚬ ปุ่มดาวน์โหลด Excel (.xlsx): สร้างไฟล์ด้วย ExcelJS ตั้งค่าฟอนต์ทุกเซลล์เป็น THSarabunPSK (หัวเรื่อง 18pt Bold, ตาราง 16pt) ตีเส้นขอบตารางสวยงาม และจัดความกว้างคอลัมน์อัตโนมัติ
  ⚬ ปุ่มดาวน์โหลด PDF (.pdf): จัดหน้ากระดาษ A4 (แนวนอนหากคอลัมน์เยอะ) ใช้ฟอนต์ THSarabunPSK (หรือ Sarabun ที่ฝังในระบบพร้อมสำรอง THSarabunPSK) มีหัวกระดาษทางการ ตารางคมชัด และส่วนลงนามครูผู้สอนท้ายกระดาษ

4. Prompt สำหรับนำเข้า Antigravity เพื่อสร้างโปรแกรม

คัดลอกชุดคำสั่งด้านล่างนี้ทั้งหมดไปวางใน Antigravity เพื่อสั่งให้สร้างเว็บแอปพลิเคชันแบบครบวงจร:

# Role & Objective
Act as an Expert Educational Technologist and Senior Full-Stack Developer. Build a complete, production-ready, responsive Web Application in Thai language for a **"Proportional Student Grading & Assessment System" (ระบบโปรแกรมตัดเกรดและวัดประเมินผลผู้เรียนตามสัดส่วน)**.

Use **React (Vite + TypeScript)**, **Tailwind CSS**, **Lucide React** (for icons), **ExcelJS + file-saver** (for formatted `.xlsx` export), and **html2pdf.js / Print CSS** (for `.pdf` export).

---

# Core Application Workflow & Requirements

Design the application as an intuitive **3-Step Interactive Wizard** with a progress indicator at the top, sample data loader button (ปุ่มจำลองข้อมูลตัวอย่างเพื่อทดสอบระบบ), and `localStorage` persistence.

## Step 1: ข้อมูลรายวิชาและโครงสร้างการวัดผล (Course Info & Assessment Setup)
1. **Course Metadata Form:**
   - ชื่อรายวิชา (Course Name - Text)
   - รหัสวิชา (Course Code - Text)
   - ระดับชั้น (Grade/Class Level - Text)
   - ครูผู้สอน (Instructor Name - Text)
   - ระบบการตัดเกรด (Grading Philosophy Selection with explanation tooltips):
     1. `อิงเกณฑ์ (Criterion-Referenced)`: ตัดเกรดตามช่วงคะแนนมาตรฐานที่กำหนดไว้ (เช่น 80-100 = 4 หรือ A)
     2. `อิงกลุ่ม (Norm-Referenced)`: ตัดเกรดโดยใช้ค่าเฉลี่ย (Mean) และส่วนเบี่ยงเบนมาตรฐาน (S.D.) ของกลุ่มผู้เรียน (T-Score / Z-Score)
     3. `อิงพัฒนาการ (Growth-Referenced)`: คำนวณจากคะแนนรวมถ่วงน้ำหนักร่วมกับอัตราพัฒนาการของผู้เรียนจากรายการวัดผลแรกสู่รายการวัดผลสุดท้าย (Relative Gain Score)

2. **Assessment Items Table (ตารางกำหนดรายการวัดผล):**
   - Initialize with **5 empty rows** by default.
   - Include a button **"+ เพิ่มรายการวัดผล" (Add Assessment Row)** to add more rows dynamically, and a delete button per row (minimum 1 row).
   - Table Columns:
     1. ลำดับที่ (No.)
     2. รายการวัดผล (Assessment Title - Text Input, e.g., "สอบกลางภาค", "ใบงานที่ 1")
     3. วิธีการวัดผล (Assessment Method - Text Input, e.g., "แบบทดสอบปรนัย", "ตรวจชิ้นงาน")
     4. คะแนนดิบเต็ม (Max Raw Score - Number Input, defaults to match Weight % if not changed, must be > 0)
     5. ค่าน้ำหนัก (%) (Weight Percentage - Number Input)
   - **Real-time Weight Validation:** Show total weight percentage at the bottom of the table. Highlight in green when Total Weight == 100%, and show a warning if it is not equal to 100%. Allow proceeding to Step 2 once required fields are filled and total weight equals 100%.

---

## Step 2: กรอกรายชื่อผู้เรียนและคะแนนดิบ (Student Roster & Raw Score Entry)
1. **Student Score Table:**
   - Initialize with **30 empty student rows** by default.
   - Include buttons **"+ เพิ่มผู้เรียน 1 คน"** and **"+ เพิ่มผู้เรียน 5 คน"** to dynamically add rows, plus a button to clear empty rows.
   - Table Columns:
     - ลำดับที่ (Row number 1..N)
     - รหัสประจำตัว (Student ID - Text Input)
     - ชื่อ - นามสกุล (Student Full Name - Text Input)
     - **Dynamic Assessment Columns:** Automatically generate one column for each Assessment Item defined in Step 1. Display the Assessment Title, Max Raw Score, and Weight (%) in the column header.
     - คะแนนรวมตามสัดส่วน (100%) (Live preview of calculated proportional total score: `Sum((RawScore / MaxRawScore) * Weight)`).
   - **Input Validation:** Prevent or highlight in red if a user enters a raw score greater than the item's Max Raw Score or less than 0.

2. **Grade Output Format Selection (ตัวเลือกรูปแบบเกรดที่ต้องการตัด):**
   - Provide a clear selector before calculating final grades:
     - **Letter Grade (A-F):** `A, B, C, D, F` (with an option toggle to include `+` grades: `A, B+, B, C+, C, D+, D, F`)
     - **Pass/Fail Grade (S/U):** `S (ผ่านเกณฑ์), U (ไม่ผ่านเกณฑ์)` (Default passing threshold = 50%)
     - **Number Grade (4-0):** `4, 3.5, 3, 2.5, 2, 1.5, 1, 0`
   - Provide a **"คำนวณและประมวลผลเกรด (Calculate Grades)"** button that transitions to Step 3.

---

## Step 3: รายงานผลการตัดเกรดและการดาวน์โหลด (Grading Results & Export)
1. **Grading Calculation Logic:**
   - Calculate each assessment's weighted score: `weighted_i = (raw_i / max_raw_i) * weight_i`.
   - Total Score (0 - 100) = `Sum(weighted_i)`.
   - Apply the selected Grading System:
     - **อิงเกณฑ์ (Criterion):**
       - Number (4-0) / Letter (8-level): >=80: 4/A, 75-79: 3.5/B+, 70-74: 3/B, 65-69: 2.5/C+, 60-64: 2/C, 55-59: 1.5/D+, 50-54: 1/D, <50: 0/F.
       - Letter (5-level A,B,C,D,F): >=80: A, 70-79: B, 60-69: C, 50-59: D, <50: F.
       - S/U: >=50: S, <50: U.
       - (Allow instructor to customize cutoff thresholds if desired).
     - **อิงกลุ่ม (Norm-Referenced):**
       - Calculate Mean ($\mu$) and Standard Deviation ($\sigma$) of active students' Total Scores.
       - Assign grades using Z-score boundaries:
         - 8-level (4 to 0): $Z \ge 1.5 \to 4$, $1.0 \le Z < 1.5 \to 3.5$, $0.5 \le Z < 1.0 \to 3$, $0.0 \le Z < 0.5 \to 2.5$, $-0.5 \le Z < 0.0 \to 2$, $-1.0 \le Z < -0.5 \to 1.5$, $-1.5 \le Z < -1.0 \to 1$, $Z < -1.5 \to 0$.
         - 5-level (A-F): $Z \ge 1.2 \to A$, $0.4 \le Z < 1.2 \to B$, $-0.4 \le Z < 0.4 \to C$, $-1.2 \le Z < -0.4 \to D$, $Z < -1.2 \to F$.
         - S/U: $Z \ge -1.0 \to S$, else $U$.
     - **อิงพัฒนาการ (Growth-Referenced):**
       - Calculate Growth Index by comparing the percentage score of the earliest assessment item ($P_1$) and the latest assessment item ($P_n$). Add a growth bonus (up to +10 points capped at 100) or weight 70% cumulative score + 30% relative gain score before mapping to grade thresholds, and display the student's Growth Rate (%) in the result table.

2. **Formatted Result Preview & Statistics Dashboard:**
   - Display an official-looking Document Header showing: ชื่อรายวิชา, รหัสวิชา, ระดับชั้น, ครูผู้สอน, ระบบการตัดเกรด, และรูปแบบเกรด.
   - Display Summary Statistics Cards: จำนวนผู้เรียนที่มีข้อมูล, คะแนนเฉลี่ย (Mean), ส่วนเบี่ยงเบนมาตรฐาน (S.D.), คะแนนสูงสุด (Max), คะแนนต่ำสุด (Min), และตารางสรุปจำนวนผู้เรียนในแต่ละเกรด (Grade Distribution).
   - Display the complete Grading Table showing Raw Scores, Weighted Scores, Total Score (100%), and Final Grade.

3. **Export to `.xlsx` and `.pdf` with `THSarabunPSK` Formatting:**
   - Load Google Font `Sarabun` as a fallback and apply `@font-face` rules for `THSarabunPSK`, `'TH Sarabun New'`, and `'Sarabun'`.
   - **Excel Export (`.xlsx` via `exceljs`):**
     - Create a cleanly formatted worksheet with Title Header (Merged cells, `THSarabunPSK` 18pt Bold, centered).
     - Course metadata rows (`THSarabunPSK` 16pt).
     - Assessment & Student Grade Table with thin black borders on all cells, header background fill (`#E2E8F0`), `THSarabunPSK` 16pt font, centered numbers, left-aligned student names, and summary statistics at the bottom.
   - **PDF Export (`.pdf`):**
     - Build a dedicated, print-ready A4 Preview Container styled with `font-family: 'THSarabunPSK', 'TH Sarabun New', 'Sarabun', sans-serif;` (Header 18pt bold, Table body 14-16pt, crisp 1px solid black borders, proper page-break handling, and signature block for the instructor at the bottom).
     - Provide both **"ดาวน์โหลด PDF (.pdf)"** (using `html2pdf.js` with high scale `scale: 2` for sharp Thai text) and **"พิมพ์ / บันทึกเป็น PDF ผ่านระบบพิมพ์ (คมชัดสูงสุด)"** (`window.print()`) so Thai vowels never float or clip.


5. คำแนะนำเพิ่มเติมในการนำไปรันใน Antigravity

1. การติดตั้งฟอนต์ในเครื่อง (สำหรับไฟล์ Excel และ PDF): เมื่อดาวน์โหลดไฟล์ .xlsx ออกมา โค้ดจะระบุชื่อฟอนต์ในเซลล์เป็น THSarabunPSK ขนาด 16 pt โดยอัตโนมัติ หากเครื่องคอมพิวเตอร์ที่เปิดไฟล์มีฟอนต์ THSarabunPSK ติดตั้งอยู่ โปรแกรม Microsoft Excel จะแสดงผลเป็นฟอนต์สารบรรณทันที ส่วนหน้าเว็บและ PDF จะดึงทั้ง THSarabunPSK ในเครื่องและฟอนต์สารบรรณจากระบบเว็บเพื่อให้แสดงผลภาษาไทยได้ถูกต้องแม้เปิดบนเครื่องที่ไม่มีฟอนต์
2. ปุ่มจำลองข้อมูล (Demo Data): ใน Prompt ได้สั่งให้สร้างปุ่ม "จำลองข้อมูลตัวอย่าง" ไว้ด้วย เพื่อให้คุณสามารถกดคลิกเดียวแล้วระบบกรอกวิชา รายการวัดผล 5 ช่อง และคะแนนนักเรียนตัวอย่างให้ครบถ้วน เพื่อทดสอบการตัดเกรดทั้ง 3 รูปแบบและทดสอบการ Export ไฟล์ .xlsx / .pdf ได้ทันที
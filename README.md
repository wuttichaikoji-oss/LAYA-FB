# Laya Operations Hub - Meal Plan Integrated

เว็บแอพแบบ Static สำหรับอัปขึ้น GitHub Pages ได้ทันที

## ในเวอร์ชันนี้
- หน้าเมนูหลักมีการ์ดงาน 7 งานเหมือนเดิม
- กดเข้าแต่ละหัวข้อได้จากหน้า Dashboard และ Sidebar
- หน้า **LAYA MEAL PLAN RECORD** เป็นเวอร์ชันใช้งานจริง
- ช่องใส่จำนวนแขกในแต่ละวันถูกขยายให้ใส่เลขได้ 3 หลักอย่างชัดเจน
- เปลี่ยนเดือนและปีได้อิสระ
- หน้า Meal Plan เชื่อม Firebase / Firestore ได้
- โมดูลอื่น ๆ ยังใช้งานเก็บข้อมูลใน localStorage ได้

## Firebase
ตั้งค่าเริ่มต้นให้กับโปรเจกต์ `laya-fb` แล้ว
- collection: `layaMealPlanMonths`
- document id: `YYYY-MM`

## ไฟล์ในชุดนี้
- index.html
- styles.css
- app.js
- README.md


## อัปเดตล่าสุด
- หน้า Dashboard 7 การ์ดยังคงอยู่เหมือนเดิม
- หน้า `LAYA MEAL PLAN RECORD` ตัด Guest Record ออกแล้ว
- เอาปุ่ม `+Add Guest Record`, `Firebase Settings`, `Sync Now` ออกจากหน้า Meal Plan แล้ว
- เพิ่มปุ่ม `EDIT` และ `SAVE`
- ข้อมูลตัวเลขรายวันและราคา จะถูกแก้ไขได้เฉพาะตอนกด `EDIT`
- เมื่อกด `SAVE` ข้อมูลจะถูกบันทึกและช่องจะถูกล็อกอีกครั้ง
- ช่องจำนวนแขกในแต่ละวันถูกขยายให้พิมพ์เลข 3 หลักได้สวยขึ้น
- เปลี่ยนเดือนและปีได้อิสระ


Updated: added CANCEL button for Meal Plan edit mode, narrowed Year/Month controls, and cleaned long descriptive text from the UI.

Fixed: SAVE now switches Meal Plan back to locked mode immediately after click, then syncs in the background.

Added a special LAYA LOSS DAMAGE page based on the attached Loss / Damage Report template with EDIT / SAVE / CANCEL and per-date saved reports.

Added: LAYA BREAKAGE SPOILLED custom report module based on uploaded form with EDIT / SAVE / CANCEL, date-based reports, totals, and CSV export.

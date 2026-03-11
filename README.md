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


## Added in this version
- Multi-image upload for **LAYA LOSS DAMAGE** and **LAYA BREAKAGE SPOILLED**
- Images are compressed in the browser before upload to Firebase Storage
- View attached images from the report screen
- Remove attached images while in EDIT mode
- New **Export Report** button for both pages
- Export opens a styled printable document that matches the web app look


## Added in this version
- Custom **LAYA LINEN INVENTORY** page based on the uploaded template
- Edit / Save / Cancel flow like Meal Plan
- Period switch by month and year
- 12-month inventory table with live calculated totals
- Beautiful export report and CSV export
- Photo upload section with image compression before upload to Firebase Storage

Updated Linen Inventory: removed No columns from the monthly layout, months accept quantity directly, added ADD ROW, and moved image uploads into each linen row.

Added custom LAYA LINEN RECORD module based on the Linen Control Log structure, with EDIT / SAVE / CANCEL and row-level image upload.

Added custom LAYA DAILY LINEN INSPECTION CHECK LIST module based on the checklist structure, with EDIT / SAVE / CANCEL and row-level image upload.

Updated Daily Linen Inspection Checklist: inspection item field widened, remark changed to a real text area inside the table cell, and values remain viewable after save.


## Added equipment inventory
Because I could not find a separate equipment template file in the current uploads, the **LAYA EQUIPMENT INVENTORY** page in this version is designed in the same practical style as the custom linen inventory pages:
- add items freely
- monthly count Jan–Dec
- on-hand / repair / need order tracking
- row-level photo upload
- EDIT / SAVE / CANCEL
- Export Report / CSV


## Firebase quick setup for all pages that upload images
This build uses one shared Firebase connection for every page that uploads photos:
- LAYA LOSS DAMAGE
- LAYA BREAKAGE SPOILLED
- LAYA LINEN INVENTORY
- LAYA LINEN RECORD
- LAYA DAILY LINEN INSPECTION CHECK LIST
- LAYA EQUIPMENT INVENTORY

A new **Firebase Setup** button is available on the main dashboard.

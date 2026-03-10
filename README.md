# Laya Meal Plan Record

เว็บแอพแบบ Static สำหรับอัปขึ้น GitHub Pages ได้ทันที  
ออกแบบจากโครงสร้างไฟล์ Meal Plan Record และพร้อมใช้งานจริง

## ความสามารถในเวอร์ชันนี้
- Monthly Summary แบบตารางรายวัน 1-31
- รายการจากไฟล์ต้นฉบับ เช่น ABF, RB, Air Arabian, AIP, HB, FB, Crew
- คีย์จำนวน cover ลงในตารางได้โดยตรง
- Guest Records สำหรับบันทึกรายชื่อแขก / ห้อง / pax / remark
- Price Setup ปรับราคาแต่ละรายการได้
- คำนวณ Total Cover และ Revenue อัตโนมัติ
- Export Summary CSV
- Export Guest CSV
- เก็บข้อมูลใน localStorage
- เชื่อม Firebase / Firestore ได้

## โครงสร้างการเก็บข้อมูลใน Firestore
Collection:
- `layaMealPlanMonths`

Document id:
- `YYYY-MM` เช่น `2026-03`

## วิธีเชื่อม Firebase
1. สร้าง Firebase project
2. เปิด Firestore Database
3. สร้าง Web App
4. คัดลอกค่า config
5. เปิดหน้าเว็บ แล้วกด `Firebase Settings`
6. วางค่าให้ครบ แล้วกด `Save & Connect`
7. กด `Sync Now`

## ไฟล์ในชุดนี้
- `index.html`
- `styles.css`
- `app.js`
- `README.md`


## Firebase ที่ตั้งค่าให้แล้ว
เวอร์ชันนี้ฝังค่า Firebase ของโปรเจกต์ `laya-fb` ให้แล้ว  
เมื่ออัปขึ้น GitHub Pages และเปิดใช้งาน Firestore เรียบร้อย ระบบจะพยายามเชื่อมต่ออัตโนมัติ

ค่าที่ตั้งไว้:
- projectId: `laya-fb`
- authDomain: `laya-fb.firebaseapp.com`

หมายเหตุ:
- `measurementId` ไม่จำเป็นต่อการบันทึก Firestore จึงไม่ได้ใช้ในฟังก์ชันหลักของระบบ
- หากต้องการเปลี่ยนไปใช้ Firebase โปรเจกต์อื่น สามารถกด `Firebase Settings` แล้วแก้ค่าได้

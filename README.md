# Laya Operations Hub

เว็บแอพแบบ Static สำหรับอัปขึ้น GitHub Pages ได้ทันที  
รวม 7 โมดูลไว้ในเว็บเดียว และกดเข้าแต่ละฟอร์มได้จริง

## โมดูลในระบบ
1. LAYA MEAL PLAN RECORD
2. LAYA LOSS DAMAGE
3. LAYA BREAKAGE SPOILLED
4. LAYA DAILY LINEN INSPECTION CHECK LIST
5. LAYA LINEN INVENTORY
6. LAYA EQUIPMENT INVENTORY
7. LAYA LINEN RECORD

## ไฟล์ในชุดนี้
- `index.html`
- `styles.css`
- `app.js`

## วิธีอัปขึ้น GitHub Pages
1. แตกไฟล์ zip
2. สร้าง repository ใหม่บน GitHub
3. อัปโหลดทั้ง 4 ไฟล์ขึ้น repository
4. ไปที่ Settings > Pages
5. เลือก Deploy from a branch
6. เลือก branch `main` และโฟลเดอร์ `/root`
7. Save
8. รอสักครู่ GitHub จะสร้างลิงก์เว็บไซต์ให้

## การใช้งาน
- เปิดหน้าเว็บ
- กดเข้าโมดูลที่ต้องการ
- กรอกข้อมูลและกด Save Record
- ระบบจะเก็บข้อมูลไว้ใน `localStorage` ของเบราว์เซอร์
- กด `Export CSV` ในแต่ละโมดูลได้
- กด `Export All Data` ที่หน้าแรกเพื่อดึงข้อมูลทุกโมดูลเป็น JSON


const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyASWE64wumKUhEwRBiYXNzs2TvS_vm6vAU",
  authDomain: "laya-fb.firebaseapp.com",
  projectId: "laya-fb",
  storageBucket: "laya-fb.firebasestorage.app",
  messagingSenderId: "914355730972",
  appId: "1:914355730972:web:4a1ea8e50304b2a604bdd9",
  measurementId: "G-J5K4TMPMR5"
};

const FIREBASE_CONFIG_KEY = "layaMealPlan::firebaseConfig";
const MEAL_STORAGE_PREFIX = "layaMealPlan::";
const HUB_STORAGE_PREFIX = "laya-operations-hub::";
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
const LOSS_REPORT_PREFIX = "layaLossDamage::report::";
const LOSS_TEMPLATE_ROWS = 28;
const BREAKAGE_REPORT_PREFIX = "layaBreakageSpoiled::report::";
const BREAKAGE_TEMPLATE_ROWS = 20;

const modules = [
  {
    id: "meal-plan-record",
    title: "LAYA MEAL PLAN RECORD",
    subtitle: "บันทึกข้อมูล Meal Plan / Breakfast / Lunch / Dinner",
    description: "เก็บข้อมูลลูกค้าที่มาใช้บริการอาหาร, แพ็กเกจ, cover, revenue และหมายเหตุในระบบเดียว พร้อม Monthly Summary แบบรายวัน",
    color: "orange",
    icon: "🍽️"
  },
  {
    id: "loss-damage",
    title: "LAYA LOSS DAMAGE",
    subtitle: "บันทึกของสูญหาย / เสียหาย / เคลม",
    description: "ติดตามเหตุการณ์ของสูญหายหรืออุปกรณ์เสียหาย พร้อมต้นทุน, ผู้รับผิดชอบ และสถานะการติดตาม",
    color: "red",
    icon: "⚠️",
    fields: [
      { name: "date", label: "Date", type: "date", required: true },
      { name: "location", label: "Location / Area", type: "text", placeholder: "เช่น The Taste / Store / Banquet", required: true },
      { name: "itemName", label: "Item Name", type: "text", placeholder: "เช่น Wine Glass" , required: true},
      { name: "quantity", label: "Quantity", type: "number", min: 1, value: 1, required: true },
      { name: "estimatedCost", label: "Estimated Cost", type: "number", min: 0, value: 0, required: true },
      { name: "responsibleBy", label: "Responsible / Reported By", type: "text", placeholder: "ชื่อผู้เกี่ยวข้อง" },
      { name: "status", label: "Status", type: "select", options: ["Open", "Investigating", "Claimed", "Closed"], required: true },
      { name: "details", label: "Details", type: "textarea", placeholder: "รายละเอียดเหตุการณ์" }
    ],
    columns: ["date","location","itemName","quantity","estimatedCost","responsibleBy","status","details"],
    summary(records){
      const qty = records.reduce((s,r)=>s + Number(r.quantity || 0),0);
      const cost = records.reduce((s,r)=>s + Number(r.estimatedCost || 0),0);
      const openCount = records.filter(r => r.status === "Open" || r.status === "Investigating").length;
      return [
        { label:"Records", value: records.length },
        { label:"Qty", value: formatNumber(qty) },
        { label:"Estimated Cost", value: formatCurrency(cost) },
        { label:"Open Cases", value: openCount }
      ];
    }
  },
  {
    id: "breakage-spoiled",
    title: "LAYA BREAKAGE SPOILLED",
    subtitle: "ควบคุมแก้วแตก วัตถุดิบเสีย และของชำรุด",
    description: "สรุปรายการ breakage และ spoiled เพื่อใช้ควบคุมต้นทุนและติดตามสาเหตุอย่างเป็นระบบ",
    color: "pink",
    icon: "🥂",
    fields: [
      { name: "date", label: "Date", type: "date", required: true },
      { name: "category", label: "Category", type: "select", options: ["Glassware", "Chinaware", "Cutlery", "Food", "Beverage", "Other"], required: true },
      { name: "itemName", label: "Item Name", type: "text", required: true },
      { name: "quantity", label: "Quantity", type: "number", min: 1, value: 1, required: true },
      { name: "unitCost", label: "Unit Cost", type: "number", min: 0, value: 0, required: true },
      { name: "reason", label: "Reason", type: "select", options: ["Breakage", "Expired", "Spoiled", "Handling Issue", "Unknown"], required: true },
      { name: "reportedBy", label: "Reported By", type: "text" },
      { name: "remarks", label: "Remarks", type: "textarea" }
    ],
    columns: ["date","category","itemName","quantity","unitCost","total","reason","reportedBy","remarks"],
    computed(record){
      return { total: Number(record.quantity || 0) * Number(record.unitCost || 0) };
    },
    summary(records){
      const qty = records.reduce((s,r)=>s + Number(r.quantity || 0),0);
      const cost = records.reduce((s,r)=>s + Number(r.total || 0),0);
      return [
        { label:"Records", value: records.length },
        { label:"Qty", value: formatNumber(qty) },
        { label:"Total Cost", value: formatCurrency(cost) }
      ];
    }
  },
  {
    id: "daily-linen-inspection-check-list",
    title: "LAYA DAILY LINEN INSPECTION CHECK LIST",
    subtitle: "เช็กลิสต์ตรวจสภาพผ้าประจำวัน",
    description: "ใช้ตรวจสภาพผ้าแต่ละพื้นที่ก่อนเริ่มงาน เช่น สะอาด, เปื้อน, ชำรุด, ขาดจำนวน หรือพร้อมใช้งาน",
    color: "cyan",
    icon: "🧺",
    fields: [
      { name: "date", label: "Date", type: "date", required: true },
      { name: "area", label: "Area", type: "select", options: ["The Taste", "Mangrove", "Banquet", "Room Service", "Laundry"], required: true },
      { name: "inspector", label: "Inspector", type: "text", required: true },
      { name: "tablecloth", label: "Tablecloth", type: "select", options: ["OK", "Dirty", "Torn", "Missing"], required: true },
      { name: "napkin", label: "Napkin", type: "select", options: ["OK", "Dirty", "Torn", "Missing"], required: true },
      { name: "runnerPlacemat", label: "Runner / Placemat", type: "select", options: ["OK", "Dirty", "Torn", "Missing"], required: true },
      { name: "uniform", label: "Uniform / Service Cloth", type: "select", options: ["OK", "Dirty", "Torn", "Missing"], required: true },
      { name: "remarks", label: "Remarks", type: "textarea", placeholder: "บันทึกปัญหาที่พบ" }
    ],
    columns: ["date","area","inspector","tablecloth","napkin","runnerPlacemat","uniform","remarks"],
    summary(records){
      const issues = records.filter(r => ["Dirty","Torn","Missing"].includes(r.tablecloth) || ["Dirty","Torn","Missing"].includes(r.napkin) || ["Dirty","Torn","Missing"].includes(r.runnerPlacemat) || ["Dirty","Torn","Missing"].includes(r.uniform)).length;
      return [
        { label:"Check Lists", value: records.length },
        { label:"Need Attention", value: issues },
        { label:"OK Rate", value: records.length ? Math.round(((records.length - issues)/records.length)*100) + "%" : "0%" }
      ];
    }
  },
  {
    id: "linen-inventory",
    title: "LAYA LINEN INVENTORY",
    subtitle: "สต็อกผ้า รับเข้า เบิกจ่าย ชำรุด คงเหลือ",
    description: "บันทึกการเคลื่อนไหวคลังผ้าแบบ inventory เพื่อเช็กยอดคงเหลือและต้นทุนการใช้งาน",
    color: "blue",
    icon: "📦",
    fields: [
      { name: "date", label: "Date", type: "date", required: true },
      { name: "linenType", label: "Linen Type", type: "select", options: ["Tablecloth", "Napkin", "Placemat", "Towel", "Uniform", "Other"], required: true },
      { name: "openingStock", label: "Opening Stock", type: "number", min: 0, value: 0, required: true },
      { name: "received", label: "Received", type: "number", min: 0, value: 0, required: true },
      { name: "issued", label: "Issued", type: "number", min: 0, value: 0, required: true },
      { name: "damaged", label: "Damaged / Lost", type: "number", min: 0, value: 0, required: true },
      { name: "storeBy", label: "Stored / Updated By", type: "text" },
      { name: "remarks", label: "Remarks", type: "textarea" }
    ],
    columns: ["date","linenType","openingStock","received","issued","damaged","endingStock","storeBy","remarks"],
    computed(record){
      const endingStock = Number(record.openingStock || 0) + Number(record.received || 0) - Number(record.issued || 0) - Number(record.damaged || 0);
      return { endingStock };
    },
    summary(records){
      const ending = records.reduce((s,r)=>s + Number(r.endingStock || 0),0);
      const damage = records.reduce((s,r)=>s + Number(r.damaged || 0),0);
      return [
        { label:"Records", value: records.length },
        { label:"Ending Total", value: formatNumber(ending) },
        { label:"Damaged / Lost", value: formatNumber(damage) }
      ];
    }
  },
  {
    id: "equipment-inventory",
    title: "LAYA EQUIPMENT INVENTORY",
    subtitle: "ครุภัณฑ์ อุปกรณ์ และทรัพย์สินในงานบริการ",
    description: "บันทึกอุปกรณ์แต่ละประเภท, สถานที่เก็บ, จำนวน และสภาพการใช้งาน เพื่อใช้ตรวจนับและควบคุมทรัพย์สิน",
    color: "green",
    icon: "🛠️",
    fields: [
      { name: "date", label: "Date", type: "date", required: true },
      { name: "equipmentName", label: "Equipment Name", type: "text", required: true },
      { name: "category", label: "Category", type: "select", options: ["Service", "Kitchen", "Bar", "Laundry", "Housekeeping", "Other"], required: true },
      { name: "location", label: "Location", type: "text", required: true },
      { name: "quantity", label: "Quantity", type: "number", min: 0, value: 1, required: true },
      { name: "condition", label: "Condition", type: "select", options: ["Good", "Need Repair", "Broken", "Missing"], required: true },
      { name: "assetCode", label: "Asset Code", type: "text", placeholder: "เช่น EQ-001" },
      { name: "remarks", label: "Remarks", type: "textarea" }
    ],
    columns: ["date","equipmentName","category","location","quantity","condition","assetCode","remarks"],
    summary(records){
      const qty = records.reduce((s,r)=>s + Number(r.quantity || 0),0);
      const broken = records.filter(r => r.condition === "Broken" || r.condition === "Missing").length;
      return [
        { label:"Records", value: records.length },
        { label:"Qty", value: formatNumber(qty) },
        { label:"Broken / Missing", value: broken }
      ];
    }
  },
  {
    id: "linen-record",
    title: "LAYA LINEN RECORD",
    subtitle: "ประวัติการรับส่ง เคลื่อนไหว และติดตามผ้า",
    description: "ใช้บันทึกรับเข้า ส่งซัก รับคืน ตัดจ่าย หรือเคลื่อนไหวอื่น ๆ ของผ้าแต่ละประเภท",
    color: "purple",
    icon: "🧾",
    fields: [
      { name: "date", label: "Date", type: "date", required: true },
      { name: "movementType", label: "Movement Type", type: "select", options: ["Receive", "Send Laundry", "Return", "Transfer", "Discard"], required: true },
      { name: "linenType", label: "Linen Type", type: "select", options: ["Tablecloth", "Napkin", "Placemat", "Towel", "Uniform", "Other"], required: true },
      { name: "quantity", label: "Quantity", type: "number", min: 1, value: 1, required: true },
      { name: "referenceNo", label: "Reference No.", type: "text", placeholder: "เลขที่เอกสาร / batch" },
      { name: "fromTo", label: "From / To", type: "text", placeholder: "เช่น Laundry / Banquet Store" },
      { name: "recordedBy", label: "Recorded By", type: "text" },
      { name: "remarks", label: "Remarks", type: "textarea" }
    ],
    columns: ["date","movementType","linenType","quantity","referenceNo","fromTo","recordedBy","remarks"],
    summary(records){
      const qty = records.reduce((s,r)=>s + Number(r.quantity || 0),0);
      const send = records.filter(r => r.movementType === "Send Laundry").length;
      return [
        { label:"Records", value: records.length },
        { label:"Qty", value: formatNumber(qty) },
        { label:"Sent to Laundry", value: send }
      ];
    }
  }
];

const ITEM_MASTER = [
  { section: "ABF", key: "RB (Regular)", defaultPrice: 300 },
  { section: "ABF", key: "RB Extra Charge (Excusive Lounge)", defaultPrice: 250 },
  { section: "ABF", key: "RO Room only Building D Phase 2", defaultPrice: 300 },
  { section: "ABF", key: "Air Arabian", defaultPrice: 390 },
  { section: "Meal Plan", key: "AIP Package @ 1550", defaultPrice: 1550 },
  { section: "Meal Plan", key: "AIP Package @ 2500", defaultPrice: 2500 },
  { section: "Meal Plan", key: "AIP Package upgard @ 1950", defaultPrice: 1950 },
  { section: "Meal Plan", key: "AIP Package upgard @ 1550", defaultPrice: 1550 },
  { section: "Meal Plan", key: "HALF BOARD LUNCH", defaultPrice: 0 },
  { section: "Meal Plan", key: "HALF BOARD DINNER", defaultPrice: 0 },
  { section: "Meal Plan", key: "FULL BOARD LUNCH", defaultPrice: 0 },
  { section: "Meal Plan", key: "FULL BOARD DINNER", defaultPrice: 0 },
  { section: "Meal Plan", key: "Crew SCAT", defaultPrice: 0 },
  { section: "Meal Plan", key: "Crew RED WING", defaultPrice: 0 },
  { section: "Meal Plan", key: "Crew AZUR", defaultPrice: 0 },
  { section: "Meal Plan", key: "Crew .......", defaultPrice: 0 },
  { section: "Meal Plan", key: "Crew ........", defaultPrice: 0 }
];

const dashboardView = document.getElementById("dashboardView");
const moduleView = document.getElementById("moduleView");
const navMenu = document.getElementById("navMenu");
const exportAllBtn = document.getElementById("exportAllBtn");
const firebaseModal = document.getElementById("firebaseModal");
const firebaseForm = document.getElementById("firebaseForm");

let firebaseState = { app: null, db: null, auth: null, storage: null, connected: false };
let mealState = {
  year: new Date().getFullYear(),
  month: new Date().getMonth(),
  monthData: null,
  savedSnapshot: null,
  editMode: false,
  dirty: false
};

function todayValue(){
  return new Date().toISOString().slice(0,10);
}
function formatNumber(value){
  return new Intl.NumberFormat("en-US").format(Number(value || 0));
}
function formatCurrency(value){
  return new Intl.NumberFormat("en-US", { minimumFractionDigits:0, maximumFractionDigits:0 }).format(Number(value || 0));
}
function escapeHtml(value){
  return String(value ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;");
}
function badgeClass(value){
  const text = String(value || "").toLowerCase();
  if(["good","ok","closed","claimed","return","receive"].includes(text)) return "ok";
  if(["need repair","open","investigating","send laundry","dirty"].includes(text)) return "warn";
  if(["broken","missing","torn","spoiled","breakage"].includes(text)) return "bad";
  return "info";
}
function getModule(moduleId){
  return modules.find(m => m.id === moduleId);
}
function getStorageKey(moduleId){
  return HUB_STORAGE_PREFIX + moduleId;
}
function getRecords(moduleId){
  try{
    return JSON.parse(localStorage.getItem(getStorageKey(moduleId))) || [];
  }catch{
    return [];
  }
}
function saveRecords(moduleId, records){
  localStorage.setItem(getStorageKey(moduleId), JSON.stringify(records));
}
function toCSV(rows){
  if(!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v) => `"${String(v ?? "").replaceAll('"','""')}"`;
  const lines = [headers.map(escape).join(",")];
  rows.forEach(row => lines.push(headers.map(h => escape(row[h])).join(",")));
  return lines.join("\n");
}
function downloadFile(filename, content, type = "text/csv;charset=utf-8;"){
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
function moduleCount(){
  let total = 0;
  modules.forEach(m => {
    if (m.id === "meal-plan-record") total += monthCountForCard();
    else if (m.id === "loss-damage") total += lossReportCount();
    else if (m.id === "breakage-spoiled") total += breakageReportCount();
    else total += getRecords(m.id).length;
  });
  return total;
}
function monthCountForCard(){
  return getOverallCover();
}

/* Dashboard + generic modules */
function renderNav(activeId = "dashboard"){
  navMenu.innerHTML = "";
  const dashboardBtn = document.createElement("button");
  dashboardBtn.className = "nav-button " + (activeId === "dashboard" ? "active" : "");
  dashboardBtn.innerHTML = `
    <div class="nav-icon color-orange">🏠</div>
    <div class="nav-text">
      <strong>Main Dashboard</strong>
      <span>หน้าเมนูรวมและสรุปจำนวนรายการทั้งหมด</span>
    </div>
  `;
  dashboardBtn.addEventListener("click", () => showDashboard());
  navMenu.appendChild(dashboardBtn);

  modules.forEach(module => {
    const btn = document.createElement("button");
    btn.className = "nav-button " + (activeId === module.id ? "active" : "");
    btn.innerHTML = `
      <div class="nav-icon color-${module.color}">${module.icon}</div>
      <div class="nav-text">
        <strong>${module.title}</strong>
        <span>${module.subtitle}</span>
      </div>
    `;
    btn.addEventListener("click", () => showModule(module.id));
    navMenu.appendChild(btn);
  });
}

function renderDashboard(){
  const summaries = modules.map(module => ({
    ...module,
    count: module.id === "meal-plan-record"
      ? monthCountForCard()
      : module.id === "loss-damage"
        ? lossReportCount()
        : module.id === "breakage-spoiled"
          ? breakageReportCount()
          : getRecords(module.id).length
  }));

  dashboardView.innerHTML = `
    <div class="summary-grid">
      <div class="summary-card">
        <div class="label">Modules</div>
        <div class="value">${modules.length}</div>
      </div>
      <div class="summary-card">
        <div class="label">Total Records</div>
        <div class="value">${moduleCount()}</div>
      </div>
      <div class="summary-card">
        <div class="label">Meal Plan Month</div>
        <div class="value">${monthLabel()}</div>
      </div>
      <div class="summary-card">
        <div class="label">Meal Plan Covers</div>
        <div class="value">${getOverallCover()}</div>
      </div>
    </div>

    <div class="dashboard-grid">
      ${summaries.map(module => `
        <article class="module-card" data-color="${module.color}">
          <div class="module-top">
            <span class="pill">MODULE</span>
            <h3>${module.title}</h3>
            <p>${module.description}</p>
          </div>
          <div class="module-bottom">
            <div class="meta">${module.id === "meal-plan-record" ? "Month cover" : "Records saved"}: <strong>${module.count}</strong></div>
            <button class="open-btn" data-open-module="${module.id}">Open Module</button>
          </div>
        </article>
      `).join("")}
    </div>

    <div class="panel" style="margin-top:18px">
      <h4>วิธีใช้งาน</h4>
      <div class="panel-sub">
        กดเข้าแต่ละโมดูลเพื่อกรอกข้อมูลจริง โดยหน้า LAYA MEAL PLAN RECORD รองรับการเปลี่ยนเดือนได้อิสระ,
        ใช้ปุ่ม EDIT / SAVE เพื่อควบคุมการแก้ไขตัวเลขรายวันอย่างชัดเจน
      </div>
      <div class="footer-note">
        ข้อมูลโมดูลทั่วไปเก็บใน localStorage และหน้า Meal Plan จะบันทึกเมื่อกด SAVE เท่านั้น
      </div>
    </div>
  `;

  dashboardView.querySelectorAll("[data-open-module]").forEach(button => {
    button.addEventListener("click", () => showModule(button.dataset.openModule));
  });
}

function buildForm(module, existing = {}){
  return `
    <form id="moduleForm" class="generic-form">
      ${module.fields.map(field => renderField(field, existing[field.name])).join("")}
      <div class="field full">
        <button class="action-btn primary color-${module.color}" type="submit">Save Record</button>
      </div>
    </form>
  `;
}
function renderField(field, existingValue){
  const value = existingValue ?? field.value ?? (field.type === "date" ? todayValue() : "");
  if(field.type === "textarea"){
    return `
      <div class="field ${field.full ? "full" : ""}">
        <label>${field.label}</label>
        <textarea name="${field.name}" placeholder="${field.placeholder || ""}" ${field.required ? "required" : ""}>${escapeHtml(value)}</textarea>
      </div>
    `;
  }
  if(field.type === "select"){
    return `
      <div class="field ${field.full ? "full" : ""}">
        <label>${field.label}</label>
        <select name="${field.name}" ${field.required ? "required" : ""}>
          <option value="">Select...</option>
          ${field.options.map(option => `<option value="${escapeHtml(option)}" ${String(value) === String(option) ? "selected" : ""}>${option}</option>`).join("")}
        </select>
      </div>
    `;
  }
  return `
    <div class="field ${field.full ? "full" : ""}">
      <label>${field.label}</label>
      <input
        name="${field.name}"
        type="${field.type || "text"}"
        value="${escapeHtml(value)}"
        ${field.placeholder ? `placeholder="${escapeHtml(field.placeholder)}"` : ""}
        ${field.min !== undefined ? `min="${field.min}"` : ""}
        ${field.required ? "required" : ""}
      />
    </div>
  `;
}
function buildComputedBox(module){
  if(!module.computed) return "";
  return `<div class="calculated" id="computedBox"><div>Calculated Result</div><strong>-</strong></div>`;
}
function buildKpis(module, records){
  const items = module.summary ? module.summary(records) : [{ label:"Records", value: records.length }];
  return `
    <div class="kpi-grid">
      ${items.map(item => `
        <div class="kpi-card">
          <div class="small">${item.label}</div>
          <div class="big">${item.value}</div>
        </div>
      `).join("")}
    </div>
  `;
}
function renderRecordsTable(module, records){
  const columns = module.columns || Object.keys(records[0] || {});
  if(!records.length){
    return `<div class="empty-state">ยังไม่มีข้อมูลในโมดูลนี้</div>`;
  }
  return `
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            ${columns.map(column => `<th>${humanize(column)}</th>`).join("")}
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${records.slice().reverse().map(record => `
            <tr>
              ${columns.map(column => `<td>${formatCell(record[column])}</td>`).join("")}
              <td><button class="action-btn danger" data-delete-id="${record.id}">Delete</button></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}
function humanize(value){
  return String(value)
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/^./, s => s.toUpperCase());
}
function formatCell(value){
  if(value === null || value === undefined || value === "") return "-";
  const text = String(value);
  if(["OK","Good","Open","Investigating","Claimed","Closed","Need Repair","Broken","Missing","Dirty","Torn","Receive","Send Laundry","Return","Transfer","Discard","Breakage","Spoiled"].includes(text)){
    return `<span class="record-badge ${badgeClass(text)}">${escapeHtml(text)}</span>`;
  }
  return escapeHtml(text);
}
function readForm(module, form){
  const payload = { id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  module.fields.forEach(field => {
    payload[field.name] = form.elements[field.name].value;
  });
  if(module.computed){
    Object.assign(payload, module.computed(payload));
  }
  return payload;
}
function updateComputedPreview(module, form){
  if(!module.computed) return;
  const computedBox = document.getElementById("computedBox");
  if(!computedBox) return;
  const payload = {};
  module.fields.forEach(field => {
    payload[field.name] = form.elements[field.name].value;
  });
  const computed = module.computed(payload);
  const entries = Object.entries(computed);
  if(!entries.length) {
    computedBox.querySelector("strong").textContent = "-";
    return;
  }
  const label = humanize(entries[0][0]);
  const raw = entries[0][1];
  const value = entries[0][0].toLowerCase().includes("stock")
    ? formatNumber(raw)
    : formatCurrency(raw);
  computedBox.innerHTML = `<div>${label}</div><strong>${value}</strong>`;
}

function showDashboard(){
  dashboardView.classList.add("active");
  moduleView.classList.remove("active");
  renderNav("dashboard");
  renderDashboard();
  history.replaceState({}, "", "#dashboard");
}

function showGenericModule(moduleId){
  const module = getModule(moduleId);
  const records = getRecords(moduleId);

  dashboardView.classList.remove("active");
  moduleView.classList.add("active");
  renderNav(moduleId);
  history.replaceState({}, "", "#" + moduleId);

  moduleView.innerHTML = `
    <div class="module-shell">
      <div class="module-header">
        <div class="module-header-top">
          <div><button class="back-btn" id="backBtn">← กลับหน้าเมนูหลัก</button></div>
        </div>
        <div class="module-title-row" style="margin-top:18px">
          <div class="module-icon-large color-${module.color}">${module.icon}</div>
          <div>
            <h3>${module.title}</h3>
            <p>${module.description}</p>
          </div>
        </div>
        <div class="module-actions">
          <button class="action-btn primary color-${module.color}" id="exportBtn">Export CSV</button>
          <button class="action-btn danger" id="clearBtn">Clear All Records</button>
        </div>
      </div>

      ${buildKpis(module, records)}

      <div class="module-grid">
        <div class="panel">
          <h4>Add New Record</h4>
          <div class="panel-sub">${module.subtitle}</div>
          ${buildForm(module)}
          ${buildComputedBox(module)}
          <div class="footer-note">ข้อมูลที่บันทึกจะเก็บไว้ในเบราว์เซอร์ของเครื่องนี้ทันที</div>
        </div>

        <div class="panel">
          <h4>Recent Records</h4>
          <div class="panel-sub">สามารถลบรายการที่บันทึกผิดได้จากตารางด้านล่าง</div>
          ${renderRecordsTable(module, records.slice(-5))}
        </div>
      </div>

      <div class="panel">
        <h4>All Records</h4>
        <div class="panel-sub">รายการทั้งหมดของโมดูลนี้</div>
        ${renderRecordsTable(module, records)}
      </div>
    </div>
  `;

  document.getElementById("backBtn").addEventListener("click", showDashboard);
  document.getElementById("exportBtn").addEventListener("click", () => {
    const rows = getRecords(moduleId);
    if(!rows.length){ alert("ยังไม่มีข้อมูลสำหรับ export"); return; }
    downloadFile(`${moduleId}.csv`, toCSV(rows));
  });
  document.getElementById("clearBtn").addEventListener("click", () => {
    if(confirm(`ลบข้อมูลทั้งหมดของ ${module.title} ?`)){
      saveRecords(moduleId, []);
      showGenericModule(moduleId);
    }
  });

  const form = document.getElementById("moduleForm");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const payload = readForm(module, form);
    const next = [...getRecords(moduleId), payload];
    saveRecords(moduleId, next);
    showGenericModule(moduleId);
  });
  if(module.computed){
    form.addEventListener("input", () => updateComputedPreview(module, form));
    updateComputedPreview(module, form);
  }

  moduleView.querySelectorAll("[data-delete-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.deleteId;
      const next = getRecords(moduleId).filter(record => record.id !== id);
      saveRecords(moduleId, next);
      showGenericModule(moduleId);
    });
  });
}

/* Meal plan specialized module */
function createEmptyMonthData() {
  const prices = {};
  const grid = {};
  ITEM_MASTER.forEach(item => {
    prices[item.key] = item.defaultPrice;
    grid[item.key] = {};
  });
  return { prices, grid, guestRecords: [], updatedAt: new Date().toISOString() };
}
function getPeriodKey(year = mealState.year, month = mealState.month) {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}
function mealStorageKey(periodKey = getPeriodKey()) {
  return MEAL_STORAGE_PREFIX + periodKey;
}
function monthLabel(year = mealState.year, month = mealState.month) {
  return `${MONTHS[month]} ${year}`;
}
function daysInMonth(year = mealState.year, month = mealState.month) {
  return new Date(year, month + 1, 0).getDate();
}
function dayShort(year, month, day) {
  return new Date(year, month, day).toLocaleDateString("en-US", { weekday: "short" });
}
function isWeekend(year, month, day) {
  const dow = new Date(year, month, day).getDay();
  return dow === 0 || dow === 6;
}
function mergeMonthData(base, incoming) {
  const merged = createEmptyMonthData();
  merged.prices = { ...merged.prices, ...(base?.prices || {}), ...(incoming?.prices || {}) };
  merged.grid = { ...merged.grid, ...(base?.grid || {}) };
  Object.keys(incoming?.grid || {}).forEach(key => {
    merged.grid[key] = { ...(merged.grid[key] || {}), ...(incoming.grid[key] || {}) };
  });
  merged.guestRecords = [];
  merged.updatedAt = incoming?.updatedAt || base?.updatedAt || new Date().toISOString();
  return merged;
}
function loadLocalMonthData() {
  try {
    const raw = localStorage.getItem(mealStorageKey());
    if (!raw) {
      mealState.monthData = createEmptyMonthData();
    mealState.savedSnapshot = JSON.parse(JSON.stringify(mealState.monthData));
      mealState.savedSnapshot = JSON.parse(JSON.stringify(mealState.monthData));
      return;
    }
    mealState.monthData = mergeMonthData(createEmptyMonthData(), JSON.parse(raw));
    mealState.savedSnapshot = JSON.parse(JSON.stringify(mealState.monthData));
  } catch (e) {
    console.error(e);
    mealState.monthData = createEmptyMonthData();
  }
}
function saveLocalMonthData() {
  mealState.monthData.updatedAt = new Date().toISOString();
  localStorage.setItem(mealStorageKey(), JSON.stringify(mealState.monthData));
}
function groupBySection() {
  return ITEM_MASTER.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});
}
function aggregatedGuestMap() {
  return {};
}
function manualCount(itemKey, day) {
  return Number(mealState.monthData?.grid?.[itemKey]?.[day] || 0);
}
function guestCount(itemKey, day) {
  return 0;
}
function combinedCount(itemKey, day) {
  return manualCount(itemKey, day);
}
function totalGuestRevenueForItem(itemKey) {
  return 0;
}
function totalCoverForItem(itemKey) {
  let total = 0;
  for (let day = 1; day <= daysInMonth(); day += 1) total += combinedCount(itemKey, day);
  return total;
}
function totalRevenueForItem(itemKey) {
  let manualRevenue = 0;
  for (let day = 1; day <= daysInMonth(); day += 1) {
    manualRevenue += manualCount(itemKey, day) * Number(mealState.monthData.prices[itemKey] || 0);
  }
  return manualRevenue;
}
function getOverallCover() {
  if (!mealState.monthData) return 0;
  return ITEM_MASTER.reduce((sum, item) => sum + totalCoverForItem(item.key), 0);
}
function getOverallRevenue() {
  if (!mealState.monthData) return 0;
  return ITEM_MASTER.reduce((sum, item) => sum + totalRevenueForItem(item.key), 0);
}
function getDailyTotal(day) {
  return ITEM_MASTER.reduce((sum, item) => sum + combinedCount(item.key, day), 0);
}
function buildSummaryRowsForExport() {
  const rows = [];
  ITEM_MASTER.forEach(item => {
    const row = {
      section: item.section,
      item: item.key,
      price: Number(mealState.monthData.prices[item.key] || 0),
      totalCover: totalCoverForItem(item.key),
      revenue: totalRevenueForItem(item.key)
    };
    for (let day = 1; day <= daysInMonth(); day += 1) row[`day_${day}`] = combinedCount(item.key, day);
    rows.push(row);
  });
  return rows;
}

function loadFirebaseConfigFromStorage() {
  try {
    const saved = JSON.parse(localStorage.getItem(FIREBASE_CONFIG_KEY) || "null");
    if (saved && saved.apiKey && saved.projectId && saved.appId) return { ...DEFAULT_FIREBASE_CONFIG, ...saved };
    return DEFAULT_FIREBASE_CONFIG;
  } catch {
    return DEFAULT_FIREBASE_CONFIG;
  }
}
function fillFirebaseForm(config = {}) {
  const merged = { ...DEFAULT_FIREBASE_CONFIG, ...config };
  ["apiKey","authDomain","projectId","storageBucket","messagingSenderId","appId"].forEach(key => {
    if (firebaseForm?.elements?.[key]) firebaseForm.elements[key].value = merged[key] || "";
  });
}
function updateFirebaseStatus(connected, message) {
  const badge = document.getElementById("firebaseBadge");
  const note = document.getElementById("firebaseNote");
  if (!badge || !note) return;
  badge.textContent = `Firebase: ${message}`;
  badge.classList.toggle("ok", connected);
  note.textContent = connected
    ? "เชื่อมสำเร็จแล้ว ข้อมูลสามารถ Sync ขึ้น Firestore ของโปรเจกต์ laya-fb ได้ทันที"
    : "หากเชื่อมไม่สำเร็จ ระบบจะเก็บข้อมูลไว้ในเครื่องนี้ก่อน";
}
function initFirebaseIfPossible() {
  const config = loadFirebaseConfigFromStorage();
  if (!config || !config.apiKey || !config.projectId || !config.appId || typeof firebase === "undefined") {
    firebaseState = { app: null, db: null, auth: null, storage: null, connected: false };
    updateFirebaseStatus(false, "Not connected");
    return false;
  }
  try {
    const appName = "LayaMealPlanApp";
    let app;
    try { app = firebase.app(appName); } catch { app = firebase.initializeApp(config, appName); }
    const db = app.firestore();
    const auth = typeof app.auth === "function" ? app.auth() : null;
    const storage = typeof app.storage === "function" ? app.storage() : null;
    firebaseState = { app, db, auth, storage, connected: true };
    updateFirebaseStatus(true, "Connected");
    return true;
  } catch (error) {
    console.error(error);
    firebaseState = { app: null, db: null, auth: null, storage: null, connected: false };
    updateFirebaseStatus(false, "Connection failed");
    return false;
  }
}
async function syncMonthToFirebase(showAlert = true) {
  if (!firebaseState.connected || !firebaseState.db) {
    if (showAlert) alert("Firebase ยังไม่เชื่อมต่อ");
    return;
  }
  try {
    const payload = {
      periodKey: getPeriodKey(),
      year: mealState.year,
      month: mealState.month + 1,
      prices: mealState.monthData.prices,
      grid: mealState.monthData.grid,
      updatedAtClient: new Date().toISOString(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    await firebaseState.db.collection("layaMealPlanMonths").doc(getPeriodKey()).set(payload, { merge: true });
    if (showAlert) alert("Sync ข้อมูลขึ้น Firebase สำเร็จ");
  } catch (error) {
    console.error(error);
    if (showAlert) alert("Sync Firebase ไม่สำเร็จ กรุณาตรวจสอบค่า config และ Firestore");
  }
}
async function loadMonthFromFirebaseIfConnected() {
  if (!firebaseState.connected || !firebaseState.db) return false;
  try {
    const doc = await firebaseState.db.collection("layaMealPlanMonths").doc(getPeriodKey()).get();
    if (!doc.exists) return false;
    const data = doc.data();
    mealState.monthData = mergeMonthData(createEmptyMonthData(), {
      prices: data.prices || {},
      grid: data.grid || {},
      updatedAt: data.updatedAtClient || new Date().toISOString()
    });
    mealState.savedSnapshot = JSON.parse(JSON.stringify(mealState.monthData));
    saveLocalMonthData();
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

function mealPlanHeaderHtml() {
  return `
    <div class="module-header meal-header">
      <div class="meal-title">
        <div><button class="back-btn" id="backBtn">← กลับหน้าเมนูหลัก</button></div>
        <div class="eyebrow" style="margin-top:16px">FOOD & BEVERAGE • PHASE 2</div>
        <h3>LAYA MEAL PLAN RECORD</h3>
      </div>
      <div class="meal-stat-grid">
        <div class="stat-card sand"><div class="label">Total Cover</div><div class="value" id="statCover">0</div></div>
        <div class="stat-card mint"><div class="label">Revenue</div><div class="value" id="statRevenue">0</div></div>
        <div class="stat-card sky"><div class="label">Month</div><div class="value" id="statMonth">-</div></div>
      </div>
    </div>
  `;
}function mealPlanToolbarHtml() {
  return `
    <div class="toolbar-card">
      <div class="meal-toolbar-grid">
        <div class="field compact-field"><label>Year</label><input type="number" id="mealYearInput" min="2024" max="2100" /></div>
        <div class="field compact-field"><label>Month</label><select id="mealMonthInput"></select></div>
        <div class="field period-field"><label>Period Key</label><input type="text" id="mealPeriodKey" readonly /></div>
      </div>
      <div class="meal-toolbar-actions">
        <button class="btn ${mealState.editMode ? "btn-soft" : "primary"}" id="mealEditBtn">EDIT</button>
        <button class="btn ${mealState.editMode ? "primary" : "btn-soft"}" id="mealSaveBtn">SAVE</button>
        <button class="btn ${mealState.editMode ? "" : "btn-soft"}" id="mealCancelBtn">CANCEL</button>
        <button class="btn" id="mealExportSummaryBtn">Export Summary CSV</button>
        <button class="btn danger" id="mealClearMonthBtn">Clear This Month</button>
      </div>
      <div class="meal-mode-note">
        Current mode: <strong>${mealState.editMode ? "Editing" : "Locked"}</strong>
        ${mealState.dirty ? "• มีการแก้ไขที่ยังไม่ถูกบันทึก" : ""}
      </div>
    </div>
  `;
}function mealPlanTabsHtml() {
  return `
    <div class="tabs-card">
      <div class="meal-tabs">
        <button class="tab-btn active" data-meal-tab="summary">Monthly Summary</button>
        <button class="tab-btn" data-meal-tab="price">Price Setup</button>
      </div>
      <div class="meal-tab-panel active" id="mealTabSummary">
        <div class="muted">กด EDIT ก่อนจึงจะสามารถแก้ไขตัวเลขในช่องรายวันได้ และกด SAVE เพื่อบันทึกและล็อกข้อมูลอีกครั้ง</div>
        <div class="table-wrap"><table class="summary-table" id="summaryTable"></table></div>
      </div>
      <div class="meal-tab-panel" id="mealTabPrice">
        <div class="form-panel">
          <h4>Price Setup</h4>
          <div class="muted">ราคาจะแก้ไขได้เมื่ออยู่ในโหมด EDIT และจะถูกบันทึกจริงเมื่อกด SAVE</div>
          <div class="table-wrap">
            <table class="table">
              <thead><tr><th>Section</th><th>Item</th><th>Price</th></tr></thead>
              <tbody id="priceTbody"></tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}function updateMealHeaderStats() {
  const statCover = document.getElementById("statCover");
  const statRevenue = document.getElementById("statRevenue");
  const statMonth = document.getElementById("statMonth");
  const periodKey = document.getElementById("mealPeriodKey");
  if (statCover) statCover.textContent = formatNumber(getOverallCover());
  if (statRevenue) statRevenue.textContent = formatNumber(getOverallRevenue());
  if (statMonth) statMonth.textContent = monthLabel();
  if (periodKey) periodKey.value = getPeriodKey();
}
function canDiscardMealEdits() {
  if (!mealState.editMode || !mealState.dirty) return true;
  return confirm("มีข้อมูลที่ยังไม่ได้กด SAVE ต้องการออกจากโหมดแก้ไขหรือเปลี่ยนเดือนโดยไม่บันทึกหรือไม่?");
}

function renderMealPlanSummaryTable() {
  const table = document.getElementById("summaryTable");
  if (!table) return;
  const totalDays = daysInMonth();
  const sections = groupBySection();
  const headRow = `
    <thead>
      <tr class="summary-head-main">
        <th class="section-cell">Phase 2</th>
        <th class="item-col">Promotion Detail</th>
        <th class="money-col">Revenue</th>
        <th class="price-col">Price</th>
        <th class="total-col">Total Cover</th>
        ${Array.from({ length: totalDays }, (_, i) => {
          const day = i + 1;
          return `<th class="day-head ${isWeekend(mealState.year, mealState.month, day) ? "weekend" : "weekday"}"><span class="dow">${dayShort(mealState.year, mealState.month, day)}</span><span class="dom">${day}</span></th>`;
        }).join("")}
      </tr>
    </thead>`;
  const bodyRows = [];
  Object.entries(sections).forEach(([sectionName, items]) => {
    items.forEach((item, index) => {
      const rowspanCell = index === 0 ? `<td rowspan="${items.length}" class="section-cell ${sectionName === "ABF" ? "section-abf" : "section-meal"}">${sectionName}</td>` : "";
      bodyRows.push(`
        <tr>
          ${rowspanCell}
          <td class="item-col item-label">${escapeHtml(item.key)}</td>
          <td class="money-col revenue-cell">${formatNumber(totalRevenueForItem(item.key))}</td>
          <td class="price-col">${formatNumber(mealState.monthData.prices[item.key] || 0)}</td>
          <td class="total-col"><strong>${formatNumber(totalCoverForItem(item.key))}</strong></td>
          ${Array.from({ length: totalDays }, (_, i) => {
            const day = i + 1;
            const manual = manualCount(item.key, day);
            return `<td><input class="cell-input" type="number" min="0" max="999" inputmode="numeric" value="${manual || ""}" data-item-key="${escapeHtml(item.key)}" data-day="${day}" ${mealState.editMode ? "" : "disabled"} /></td>`;
          }).join("")}
        </tr>`);
    });
  });
  const totalRow = `
    <tr class="total-row">
      <td colspan="2">Monthly Total</td>
      <td>${formatNumber(getOverallRevenue())}</td>
      <td>-</td>
      <td>${formatNumber(getOverallCover())}</td>
      ${Array.from({ length: totalDays }, (_, i) => `<td>${formatNumber(getDailyTotal(i + 1))}</td>`).join("")}
    </tr>`;
  table.innerHTML = headRow + `<tbody>${bodyRows.join("")}${totalRow}</tbody>`;

  table.querySelectorAll(".cell-input").forEach(input => {
    input.addEventListener("change", (event) => {
      if (!mealState.editMode) return;
      const itemKey = event.target.dataset.itemKey;
      const day = Number(event.target.dataset.day);
      let value = Number(event.target.value || 0);
      if (value > 999) value = 999;
      if (!mealState.monthData.grid[itemKey]) mealState.monthData.grid[itemKey] = {};
      if (value <= 0) {
        delete mealState.monthData.grid[itemKey][day];
        event.target.value = "";
      } else {
        mealState.monthData.grid[itemKey][day] = value;
        event.target.value = value;
      }
      mealState.dirty = true;
      updateMealHeaderStats();
      renderMealPlanSummaryTable();
    });
  });
}

function renderMealGuestTable() {
  return;
}

function renderMealPriceTable() {
  const tbody = document.getElementById("priceTbody");
  if (!tbody) return;
  tbody.innerHTML = ITEM_MASTER.map(item => `
    <tr>
      <td>${escapeHtml(item.section)}</td>
      <td class="table-left">${escapeHtml(item.key)}</td>
      <td><input class="price-cell-input" type="number" min="0" value="${Number(mealState.monthData.prices[item.key] || 0)}" data-price-item="${escapeHtml(item.key)}" ${mealState.editMode ? "" : "disabled"} /></td>
    </tr>
  `).join("");
  tbody.querySelectorAll("[data-price-item]").forEach(input => {
    input.addEventListener("change", (event) => {
      if (!mealState.editMode) return;
      mealState.monthData.prices[event.target.dataset.priceItem] = Number(event.target.value || 0);
      mealState.dirty = true;
      updateMealHeaderStats();
      renderMealPriceTable();
      renderMealPlanSummaryTable();
    });
  });
}

function bindMealPlanEvents() {
  document.getElementById("backBtn").addEventListener("click", () => {
    if (!canDiscardMealEdits()) return;
    mealState.editMode = false;
    mealState.dirty = false;
    if (mealState.savedSnapshot) mealState.monthData = JSON.parse(JSON.stringify(mealState.savedSnapshot));
    showDashboard();
  });

  const yearInput = document.getElementById("mealYearInput");
  const monthInput = document.getElementById("mealMonthInput");

  yearInput.value = mealState.year;
  monthInput.innerHTML = MONTHS.map((m, idx) => `<option value="${idx}">${m}</option>`).join("");
  monthInput.value = String(mealState.month);
  updateMealHeaderStats();

  yearInput.addEventListener("change", async () => {
    if (!canDiscardMealEdits()) {
      yearInput.value = mealState.year;
      return;
    }
    mealState.year = Number(yearInput.value || new Date().getFullYear());
    mealState.editMode = false;
    mealState.dirty = false;
    loadLocalMonthData();
    await loadMonthFromFirebaseIfConnected();
    mealState.savedSnapshot = JSON.parse(JSON.stringify(mealState.monthData));
    renderMealPlanModule(mealState.keepTab || "summary");
  });

  monthInput.addEventListener("change", async () => {
    if (!canDiscardMealEdits()) {
      monthInput.value = String(mealState.month);
      return;
    }
    mealState.month = Number(monthInput.value);
    mealState.editMode = false;
    mealState.dirty = false;
    loadLocalMonthData();
    await loadMonthFromFirebaseIfConnected();
    mealState.savedSnapshot = JSON.parse(JSON.stringify(mealState.monthData));
    renderMealPlanModule(mealState.keepTab || "summary");
  });

  document.querySelectorAll("[data-meal-tab]").forEach(btn => {
    btn.addEventListener("click", () => {
      mealState.keepTab = btn.dataset.mealTab;
      document.querySelectorAll("[data-meal-tab]").forEach(el => el.classList.toggle("active", el.dataset.mealTab === mealState.keepTab));
      document.getElementById("mealTabSummary").classList.toggle("active", mealState.keepTab === "summary");
      document.getElementById("mealTabPrice").classList.toggle("active", mealState.keepTab === "price");
    });
  });

  document.getElementById("mealEditBtn").addEventListener("click", () => {
    if (mealState.editMode) return;
    mealState.savedSnapshot = JSON.parse(JSON.stringify(mealState.monthData));
    mealState.editMode = true;
    mealState.dirty = false;
    renderMealPlanModule(mealState.keepTab || "summary");
  });

  document.getElementById("mealSaveBtn").addEventListener("click", () => {
    if (!mealState.editMode) {
      alert("กรุณากด EDIT ก่อน แล้วค่อยกด SAVE");
      return;
    }

    saveLocalMonthData();
    mealState.savedSnapshot = JSON.parse(JSON.stringify(mealState.monthData));
    mealState.editMode = false;
    mealState.dirty = false;

    renderMealPlanModule(mealState.keepTab || "summary");

    if (firebaseState.connected) {
      syncMonthToFirebase(false).catch(error => {
        console.error(error);
      });
    }
  });

  document.getElementById("mealCancelBtn").addEventListener("click", () => {
    if (!mealState.editMode) {
      alert("ยังไม่มีการแก้ไขให้ยกเลิก");
      return;
    }
    mealState.monthData = mealState.savedSnapshot
      ? JSON.parse(JSON.stringify(mealState.savedSnapshot))
      : createEmptyMonthData();
    mealState.editMode = false;
    mealState.dirty = false;
    renderMealPlanModule(mealState.keepTab || "summary");
  });

  document.getElementById("mealExportSummaryBtn").addEventListener("click", () => {
    downloadFile(`laya-meal-plan-summary-${getPeriodKey()}.csv`, toCSV(buildSummaryRowsForExport()));
  });

  document.getElementById("mealClearMonthBtn").addEventListener("click", () => {
    if (!confirm(`ลบข้อมูลทั้งหมดของ ${getPeriodKey()} ?`)) return;
    mealState.monthData = createEmptyMonthData();
    mealState.savedSnapshot = JSON.parse(JSON.stringify(mealState.monthData));
    mealState.editMode = false;
    mealState.dirty = false;
    saveLocalMonthData();
    renderMealPlanModule(mealState.keepTab || "summary");

    if (firebaseState.connected) {
      syncMonthToFirebase(false).catch(error => {
        console.error(error);
      });
    }
  });

  renderMealPlanSummaryTable();
  renderMealPriceTable();
}


/* Loss Damage special module */
let lossState = {
  currentDate: todayValue(),
  reportData: null,
  savedSnapshot: null,
  editMode: false,
  dirty: false
};

function lossStorageKey(date = lossState.currentDate){
  return `${LOSS_REPORT_PREFIX}${date}`;
}
function cloneDeep(obj){
  return JSON.parse(JSON.stringify(obj));
}

function bytesToLabel(size){
  const value = Number(size || 0);
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
}
function safeStorageName(name){
  return String(name || "image")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "image";
}
async function ensureFirebaseAuthReady(){
  if (!firebaseState.connected) return true;
  if (!firebaseState.auth) return true;
  if (firebaseState.auth.currentUser) return firebaseState.auth.currentUser;
  return firebaseState.auth.signInAnonymously().then(() => firebaseState.auth.currentUser);
}
function fileToDataUrl(file){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
async function compressImageFile(file, options = {}){
  const maxWidth = Number(options.maxWidth || 1600);
  const maxHeight = Number(options.maxHeight || 1600);
  const quality = Number(options.quality || 0.8);

  const dataUrl = await fileToDataUrl(file);
  const image = new Image();

  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
    image.src = dataUrl;
  });

  let width = image.naturalWidth || image.width;
  let height = image.naturalHeight || image.height;
  const ratio = Math.min(maxWidth / width, maxHeight / height, 1);

  width = Math.max(1, Math.round(width * ratio));
  height = Math.max(1, Math.round(height * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0, width, height);

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) resolve(result);
      else reject(new Error("Unable to compress image"));
    }, "image/jpeg", quality);
  });

  return { blob, width, height, size: blob.size };
}
async function uploadCompressedImagesToStorage(moduleKey, reportDate, files){
  if (!firebaseState.connected || !firebaseState.storage) {
    throw new Error("Firebase Storage not connected");
  }

  await ensureFirebaseAuthReady();

  const uploaded = [];
  for (const file of Array.from(files || [])) {
    const compressed = await compressImageFile(file, { maxWidth: 1600, maxHeight: 1600, quality: 0.78 });
    const storagePath = `report-images/${moduleKey}/${reportDate}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeStorageName(file.name)}.jpg`;
    const storageRef = firebaseState.storage.ref().child(storagePath);

    await storageRef.put(compressed.blob, {
      contentType: "image/jpeg",
      customMetadata: {
        originalName: file.name || "image"
      }
    });

    const url = await storageRef.getDownloadURL();
    uploaded.push({
      id: crypto.randomUUID(),
      name: file.name || "image.jpg",
      url,
      storagePath,
      size: compressed.size,
      width: compressed.width,
      height: compressed.height,
      uploadedAt: new Date().toISOString()
    });
  }
  return uploaded;
}
async function deleteStorageFileIfPossible(storagePath){
  if (!storagePath || !firebaseState.connected || !firebaseState.storage) return;
  try {
    await ensureFirebaseAuthReady();
    await firebaseState.storage.ref().child(storagePath).delete();
  } catch (error) {
    console.warn("Unable to delete storage file", storagePath, error);
  }
}
async function cleanupAddedImages(currentImages = [], snapshotImages = []){
  const snapshotIds = new Set((snapshotImages || []).map(img => img.id));
  for (const image of currentImages || []) {
    if (!snapshotIds.has(image.id)) {
      await deleteStorageFileIfPossible(image.storagePath);
    }
  }
}
function renderReportImageGallery(images, prefix, editMode){
  const list = Array.isArray(images) ? images : [];
  if (!list.length) {
    return '<div class="empty-media">ยังไม่มีรูปภาพ</div>';
  }
  return `
    <div class="report-image-grid">
      ${list.map(image => `
        <div class="report-image-card">
          <button type="button" class="report-image-thumb" data-view-image="${escapeHtml(image.url)}">
            <img src="${escapeHtml(image.url)}" alt="${escapeHtml(image.name || "image")}" />
          </button>
          <div class="report-image-meta">
            <div class="report-image-name">${escapeHtml(image.name || "image")}</div>
            <div class="report-image-sub">${bytesToLabel(image.size)} • ${Number(image.width || 0)}×${Number(image.height || 0)}</div>
          </div>
          <div class="report-image-actions">
            <button type="button" class="mini-btn" data-view-image="${escapeHtml(image.url)}">View</button>
            ${editMode ? `<button type="button" class="mini-btn danger" data-${prefix}-remove-image="${escapeHtml(image.id)}">Remove</button>` : ""}
          </div>
        </div>
      `).join("")}
    </div>
  `;
}
function openImageUrl(url){
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
}
function reportWindowBase(title, bodyHtml){
  const popup = window.open("", "_blank");
  if (!popup) {
    alert("เบราว์เซอร์บล็อกหน้าต่างใหม่ กรุณาอนุญาต pop-up ก่อน");
    return;
  }
  popup.document.open();
  popup.document.write(`<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    :root{--line:#e8dccb;--text:#1f2430;--muted:#6d7485;--panel:#ffffff;--sand:#f4e8d3;--mint:#e3f3ec;--sky:#e7f0ff;}
    *{box-sizing:border-box}
    body{margin:0;font-family:"Inter",system-ui,sans-serif;background:#f6f2ea;color:var(--text)}
    .toolbar{position:sticky;top:0;z-index:4;background:#ffffff;border-bottom:1px solid var(--line);padding:14px 18px;display:flex;gap:10px;justify-content:flex-end}
    .toolbar button{border:none;border-radius:12px;padding:10px 14px;font-weight:800;background:#1f4de0;color:#fff;cursor:pointer}
    .toolbar button.secondary{background:#f2eadf;color:#5e5346}
    .sheet{max-width:1240px;margin:24px auto;padding:0 18px 28px}
    .hero{background:#fff;border:1px solid var(--line);border-radius:28px;padding:22px 24px;box-shadow:0 12px 30px rgba(0,0,0,.06)}
    .eyebrow{display:inline-block;padding:7px 11px;border-radius:999px;background:#fff2d8;color:#9c6900;font-size:.74rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase}
    h1{margin:12px 0 8px;font-size:2.3rem;line-height:1.05}
    .grid{display:grid;grid-template-columns:repeat(3,minmax(180px,1fr));gap:14px;margin-top:18px}
    .stat{padding:16px 18px;border-radius:22px;border:1px solid var(--line)}
    .sand{background:var(--sand)} .mint{background:var(--mint)} .sky{background:var(--sky)}
    .stat .label{font-size:.8rem;letter-spacing:.06em;text-transform:uppercase;color:#6f5f4e}
    .stat .value{margin-top:6px;font-size:1.7rem;font-weight:900}
    .block{background:#fff;border:1px solid var(--line);border-radius:24px;padding:18px;margin-top:18px}
    .meta-grid{display:grid;grid-template-columns:2fr 1fr;gap:14px}
    .meta-field{padding:12px 14px;border-radius:16px;background:#faf6ef;border:1px solid var(--line)}
    .meta-field .label{font-size:.78rem;color:var(--muted);text-transform:uppercase;letter-spacing:.06em}
    .meta-field .value{margin-top:6px;font-weight:700}
    table{width:100%;border-collapse:collapse}
    th,td{border:1px solid var(--line);padding:10px 10px;vertical-align:top}
    th{background:#f4ece0;font-size:.82rem;text-transform:uppercase;letter-spacing:.04em}
    td.num{text-align:right}
    .totals{font-weight:800;background:#fbf6ee}
    .images{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}
    .image-card{border:1px solid var(--line);border-radius:18px;overflow:hidden;background:#fff}
    .image-card img{display:block;width:100%;height:180px;object-fit:cover;background:#f3f3f3}
    .image-meta{padding:10px 12px}
    .image-name{font-weight:700}
    .image-sub{margin-top:4px;color:var(--muted);font-size:.85rem}
    .sign-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
    .sign-item{padding:12px 14px;border:1px solid var(--line);border-radius:16px;background:#fffdf9}
    .sign-item .label{font-size:.8rem;color:var(--muted);text-transform:uppercase}
    .sign-item .value{margin-top:18px;min-height:28px;font-weight:700;border-top:1px dashed #d7cab7;padding-top:10px}
    .note-box{padding:14px 16px;border-radius:16px;background:#faf6ef;border:1px solid var(--line);line-height:1.7}
    @media print{
      body{background:#ffffff}
      .toolbar{display:none}
      .sheet{max-width:none;margin:0;padding:0}
      .hero,.block{box-shadow:none}
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <button onclick="window.print()">Print / Save PDF</button>
    <button class="secondary" onclick="window.close()">Close</button>
  </div>
  <div class="sheet">${bodyHtml}</div>
</body>
</html>`);
  popup.document.close();
}

function flattenLineImages(report){
  if (!report || !Array.isArray(report.lines)) return [];
  return report.lines.flatMap(line => Array.isArray(line.images) ? line.images : []);
}
function renderLineEvidenceCell(images, prefix, lineIndex, editMode){
  const list = Array.isArray(images) ? images : [];
  return `
    <div class="line-evidence-wrap">
      ${editMode ? `
        <label class="line-upload-btn">
          <span>+ Photo</span>
          <input type="file" data-${prefix}-line-upload="${lineIndex}" accept="image/*" multiple />
        </label>
      ` : ""}
      ${list.length ? `
        <div class="line-thumb-grid">
          ${list.map(image => `
            <div class="line-thumb-card">
              <button type="button" class="line-thumb-btn" data-view-image="${escapeHtml(image.url)}" title="${escapeHtml(image.name || "image")}">
                <img src="${escapeHtml(image.url)}" alt="${escapeHtml(image.name || "image")}" />
              </button>
              <div class="line-thumb-meta">${bytesToLabel(image.size)}</div>
              ${editMode ? `<button type="button" class="mini-btn danger line-remove-btn" data-${prefix}-remove-image="${escapeHtml(image.id)}" data-line="${lineIndex}">×</button>` : ""}
            </div>
          `).join("")}
        </div>
      ` : `<div class="line-evidence-empty">No photo</div>`}
    </div>
  `;
}
function renderEvidenceByItemSection(lines, titleField){
  const rows = (lines || []).filter(line => Array.isArray(line.images) && line.images.length);
  if (!rows.length) {
    return `<div class="note-box">No attached photos</div>`;
  }
  return `
    <div class="evidence-item-stack">
      ${rows.map((line, idx) => `
        <div class="evidence-item-block">
          <div class="evidence-item-title">Item ${line.item || idx + 1} • ${escapeHtml(line[titleField] || "-")}</div>
          <div class="images">
            ${(line.images || []).map(image => `
              <div class="image-card">
                <img src="${escapeHtml(image.url)}" alt="${escapeHtml(image.name || "image")}" />
                <div class="image-meta">
                  <div class="image-name">${escapeHtml(image.name || "image")}</div>
                  <div class="image-sub">${bytesToLabel(image.size)} • ${Number(image.width || 0)}×${Number(image.height || 0)}</div>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function commonImageUploadError(error){
  console.error(error);
  alert("อัปโหลดรูปไม่สำเร็จ กรุณาตรวจสอบ Firebase Storage, Storage Rules และการเปิด Anonymous Auth หากโปรเจกต์ตั้งให้ต้องล็อกอิน");
}

function createEmptyLossLine(index){
  return {
    item: index + 1,
    articleNumber: "",
    description: "",
    unit: "",
    qty: "",
    recoveryCost: "",
    reasons: "",
    recoverySelling: "",
    images: []
  };
}
function createEmptyLossReport(date = lossState.currentDate){
  return {
    outletDept: "",
    reportDate: date,
    lines: Array.from({ length: LOSS_TEMPLATE_ROWS }, (_, i) => createEmptyLossLine(i)),
    pictureNote: "",
    images: [],
    preparedBy: "",
    reportedBy: "",
    checkedBy: "",
    verifiedBy: "",
    acknowledgeBy: "",
    approvedBy: "",
    updatedAt: new Date().toISOString()
  };
}
function mergeLossReport(base, incoming){
  const merged = cloneDeep(base);
  if (incoming && typeof incoming === "object"){
    Object.assign(merged, incoming);
    if (Array.isArray(incoming.lines)){
      merged.lines = Array.from({ length: LOSS_TEMPLATE_ROWS }, (_, i) => ({
        ...createEmptyLossLine(i),
        ...(incoming.lines[i] || {}),
        item: i + 1
      }));
    }
  }
  return merged;
}
function loadLossReport(date = lossState.currentDate){
  lossState.currentDate = date;
  try {
    const raw = localStorage.getItem(lossStorageKey(date));
    if (!raw) {
      lossState.reportData = createEmptyLossReport(date);
      lossState.savedSnapshot = cloneDeep(lossState.reportData);
      return;
    }
    const parsed = JSON.parse(raw);
    lossState.reportData = mergeLossReport(createEmptyLossReport(date), parsed);
    lossState.savedSnapshot = cloneDeep(lossState.reportData);
  } catch (error) {
    console.error(error);
    lossState.reportData = createEmptyLossReport(date);
    lossState.savedSnapshot = cloneDeep(lossState.reportData);
  }
}
function saveLossReport(){
  lossState.reportData.updatedAt = new Date().toISOString();
  localStorage.setItem(lossStorageKey(lossState.currentDate), JSON.stringify(lossState.reportData));
}
function lossReportCount(){
  let count = 0;
  for (let i = 0; i < localStorage.length; i += 1){
    const key = localStorage.key(i);
    if (key && key.startsWith(LOSS_REPORT_PREFIX)) count += 1;
  }
  return count;
}
function exportAllLossReports(){
  const bundle = {};
  for (let i = 0; i < localStorage.length; i += 1){
    const key = localStorage.key(i);
    if (!key || !key.startsWith(LOSS_REPORT_PREFIX)) continue;
    try {
      bundle[key.replace(LOSS_REPORT_PREFIX, "")] = JSON.parse(localStorage.getItem(key));
    } catch (error) {
      console.error(error);
    }
  }
  return bundle;
}
function canDiscardLossEdits(){
  if (!lossState.editMode || !lossState.dirty) return true;
  return confirm("มีการแก้ไขที่ยังไม่ได้บันทึก ต้องการออกหรือเปลี่ยนวันที่ต่อหรือไม่?");
}
function lossLineTotals(line){
  const qty = Number(line.qty || 0);
  const recoveryCost = Number(line.recoveryCost || 0);
  const recoverySelling = Number(line.recoverySelling || 0);
  return {
    costTotal: qty * recoveryCost,
    sellingExVat: (qty * recoverySelling) / 1.07,
    sellingIncVat: qty * recoverySelling
  };
}
function lossTotals(){
  return lossState.reportData.lines.reduce((acc, line) => {
    const row = lossLineTotals(line);
    acc.cost += row.costTotal;
    acc.sellingExVat += row.sellingExVat;
    acc.sellingIncVat += row.sellingIncVat;
    acc.qty += Number(line.qty || 0);
    return acc;
  }, { cost: 0, sellingExVat: 0, sellingIncVat: 0, qty: 0 });
}
function lossExportRows(){
  return lossState.reportData.lines.map((line, index) => {
    const totals = lossLineTotals(line);
    return {
      reportDate: lossState.currentDate,
      outletDept: lossState.reportData.outletDept,
      item: index + 1,
      articleNumber: line.articleNumber,
      description: line.description,
      unit: line.unit,
      qty: line.qty,
      recoveryCostAt: line.recoveryCost,
      recoveryCostTotal: totals.costTotal,
      reasons: line.reasons,
      recoverySellingAt: line.recoverySelling,
      recoverySellingExVatTotal: totals.sellingExVat,
      recoverySellingIncVatTotal: totals.sellingIncVat,
      imageCount: ((line.images || []).length)
    };
  });
}

function exportLossReportDocument(){
  const totals = lossTotals();
  const bodyHtml = `
    <section class="hero">
      <div class="eyebrow">Laya Resort Phuket</div>
      <h1>Loss / Damage Report</h1>
      <div class="meta-grid">
        <div class="meta-field">
          <div class="label">Outlet / Dept.</div>
          <div class="value">${escapeHtml(lossState.reportData.outletDept || "-")}</div>
        </div>
        <div class="meta-field">
          <div class="label">Report Date</div>
          <div class="value">${escapeHtml(lossState.currentDate)}</div>
        </div>
      </div>
      <div class="grid">
        <div class="stat sand"><div class="label">Recovery Cost</div><div class="value">${formatNumber(totals.cost)}</div></div>
        <div class="stat mint"><div class="label">Selling Excl. VAT</div><div class="value">${formatNumber(totals.sellingExVat)}</div></div>
        <div class="stat sky"><div class="label">Selling Incl. VAT</div><div class="value">${formatNumber(totals.sellingIncVat)}</div></div>
      </div>
    </section>

    <section class="block">
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Article Number</th>
            <th>Description</th>
            <th>Unit</th>
            <th>Qty.</th>
            <th>Recovery Cost @</th>
            <th>Total</th>
            <th>Reasons</th>
            <th>Recovery Selling @</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${lossState.reportData.lines.map((line, index) => {
            const row = lossLineTotals(line);
            return `
              <tr>
                <td>${index + 1}</td>
                <td>${escapeHtml(line.articleNumber || "")}</td>
                <td>${escapeHtml(line.description || "")}</td>
                <td>${escapeHtml(line.unit || "")}</td>
                <td class="num">${formatNumber(line.qty || 0)}</td>
                <td class="num">${formatNumber(line.recoveryCost || 0)}</td>
                <td class="num">${formatNumber(row.costTotal)}</td>
                <td>${escapeHtml(line.reasons || "")}</td>
                <td class="num">${formatNumber(line.recoverySelling || 0)}</td>
                <td class="num">${formatNumber(row.sellingExVat)}</td>
              </tr>
            `;
          }).join("")}
          <tr class="totals">
            <td colspan="6">Total Recovery Cost</td>
            <td class="num">${formatNumber(totals.cost)}</td>
            <td colspan="2">Total Recovery Selling (Excl. VAT)</td>
            <td class="num">${formatNumber(totals.sellingExVat)}</td>
          </tr>
          <tr class="totals">
            <td colspan="9">Total Inclusive VAT</td>
            <td class="num">${formatNumber(totals.sellingIncVat)}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="block">
      <h3>Picture / Evidence Note</h3>
      <div class="note-box">${escapeHtml(lossState.reportData.pictureNote || "-").replace(/\n/g, "<br>")}</div>
    </section>

    <section class="block">
      <h3>Evidence by Item</h3>
      ${renderEvidenceByItemSection(lossState.reportData.lines, "description")}
    </section>

    <section class="block">
      <h3>Approval / Signature</h3>
      <div class="sign-grid">
        <div class="sign-item"><div class="label">Prepared by</div><div class="value">${escapeHtml(lossState.reportData.preparedBy || "")}</div></div>
        <div class="sign-item"><div class="label">Reported by</div><div class="value">${escapeHtml(lossState.reportData.reportedBy || "")}</div></div>
        <div class="sign-item"><div class="label">Checked by</div><div class="value">${escapeHtml(lossState.reportData.checkedBy || "")}</div></div>
        <div class="sign-item"><div class="label">Verified by</div><div class="value">${escapeHtml(lossState.reportData.verifiedBy || "")}</div></div>
        <div class="sign-item"><div class="label">Acknowledge by</div><div class="value">${escapeHtml(lossState.reportData.acknowledgeBy || "")}</div></div>
        <div class="sign-item"><div class="label">Approved by</div><div class="value">${escapeHtml(lossState.reportData.approvedBy || "")}</div></div>
      </div>
    </section>
  `;
  reportWindowBase(`Loss-Damage-${lossState.currentDate}`, bodyHtml);
}

function lossHeaderHtml(){
  const totals = lossTotals();
  return `
    <div class="meal-header loss-header">
      <div class="meal-title">
        <div class="eyebrow">Laya Resort Phuket</div>
        <h3>LAYA LOSS DAMAGE</h3>
        <p>ออกแบบตามเอกสาร Loss / Damage Report พร้อมโหมด EDIT / SAVE / CANCEL สำหรับใช้งานจริง</p>
      </div>
      <div class="meal-stat-grid">
        <div class="stat-card sand">
          <div class="label">Reports Saved</div>
          <div class="value">${formatNumber(lossReportCount())}</div>
        </div>
        <div class="stat-card mint">
          <div class="label">Recovery Cost</div>
          <div class="value" id="lossStatCost">${formatNumber(totals.cost)}</div>
        </div>
        <div class="stat-card sky">
          <div class="label">Selling Incl. VAT</div>
          <div class="value" id="lossStatSale">${formatNumber(totals.sellingIncVat)}</div>
        </div>
      </div>
    </div>
  `;
}
function lossToolbarHtml(){
  return `
    <div class="panel">
      <div class="loss-toolbar-grid">
        <div class="field compact-field">
          <label>Report Date</label>
          <input type="date" id="lossDateInput" value="${lossState.currentDate}" ${lossState.editMode ? "disabled" : ""}/>
        </div>
        <div class="field compact-field">
          <label>Status</label>
          <input type="text" value="${lossState.editMode ? "Editing" : "Locked"}" readonly />
        </div>
        <div class="field period-field">
          <label>Report Key</label>
          <input type="text" value="${lossState.currentDate}" readonly />
        </div>
      </div>
      <div class="meal-toolbar-actions">
        <button class="btn ${lossState.editMode ? "btn-soft" : "primary"}" id="lossEditBtn">EDIT</button>
        <button class="btn ${lossState.editMode ? "primary" : "btn-soft"}" id="lossSaveBtn">SAVE</button>
        <button class="btn ${lossState.editMode ? "" : "btn-soft"}" id="lossCancelBtn">CANCEL</button>
        <button class="btn" id="lossExportReportBtn">Export Report</button>
        <button class="btn" id="lossExportBtn">Export CSV</button>
        <button class="btn danger" id="lossClearBtn">Clear Report</button>
      </div>
    </div>
  `;
}
function renderLossDamageModule(){
  if (!lossState.reportData) loadLossReport(lossState.currentDate);
  dashboardView.classList.remove("active");
  moduleView.classList.add("active");
  renderNav("loss-damage");
  history.replaceState({}, "", "#loss-damage");

  moduleView.innerHTML = `
    <div class="meal-shell">
      ${lossHeaderHtml()}
      ${lossToolbarHtml()}
      <div class="panel loss-report-card">
        <div class="loss-report-head">
          <div class="loss-title-stack">
            <div class="loss-resort">Laya Resort Phuket</div>
            <div class="loss-main-title">Loss / Damage</div>
          </div>
          <div class="loss-meta-row">
            <div class="loss-meta-field">
              <span>OUTLET / DEPT.</span>
              <input class="loss-head-input" id="lossOutletDept" value="${escapeHtml(lossState.reportData.outletDept || "")}" ${lossState.editMode ? "" : "disabled"} />
            </div>
            <div class="loss-meta-field short">
              <span>DATE :</span>
              <input class="loss-head-input" value="${escapeHtml(lossState.currentDate)}" disabled />
            </div>
          </div>
        </div>

        <div class="table-wrap">
          <table class="loss-table">
            <thead>
              <tr class="summary-head-main">
                <th class="loss-col-item">Item</th>
                <th class="loss-col-article">Article Number</th>
                <th class="loss-col-description">Description</th>
                <th class="loss-col-unit">Unit</th>
                <th class="loss-col-qty">Qty.</th>
                <th class="loss-col-price">Recovery Cost @</th>
                <th class="loss-col-total">Total</th>
                <th class="loss-col-reason">Reasons</th>
                <th class="loss-col-price">Recovery Selling @</th>
                <th class="loss-col-total">Total</th>
                <th class="loss-col-evidence">Evidence</th>
              </tr>
            </thead>
            <tbody>
              ${lossState.reportData.lines.map((line, index) => {
                const totals = lossLineTotals(line);
                return `
                  <tr>
                    <td>${index + 1}</td>
                    <td><input class="loss-input" data-line="${index}" data-field="articleNumber" value="${escapeHtml(line.articleNumber || "")}" ${lossState.editMode ? "" : "disabled"} /></td>
                    <td><input class="loss-input left" data-line="${index}" data-field="description" value="${escapeHtml(line.description || "")}" ${lossState.editMode ? "" : "disabled"} /></td>
                    <td><input class="loss-input" data-line="${index}" data-field="unit" value="${escapeHtml(line.unit || "")}" ${lossState.editMode ? "" : "disabled"} /></td>
                    <td><input class="loss-input num" type="number" min="0" max="999" inputmode="numeric" data-line="${index}" data-field="qty" value="${escapeHtml(line.qty || "")}" ${lossState.editMode ? "" : "disabled"} /></td>
                    <td><input class="loss-input num" type="number" min="0" step="0.01" data-line="${index}" data-field="recoveryCost" value="${escapeHtml(line.recoveryCost || "")}" ${lossState.editMode ? "" : "disabled"} /></td>
                    <td class="loss-total-cell" id="lossCostTotal_${index}">${formatNumber(totals.costTotal)}</td>
                    <td><input class="loss-input left" data-line="${index}" data-field="reasons" value="${escapeHtml(line.reasons || "")}" ${lossState.editMode ? "" : "disabled"} /></td>
                    <td><input class="loss-input num" type="number" min="0" step="0.01" data-line="${index}" data-field="recoverySelling" value="${escapeHtml(line.recoverySelling || "")}" ${lossState.editMode ? "" : "disabled"} /></td>
                    <td class="loss-total-cell" id="lossSaleTotal_${index}">${formatNumber(totals.sellingExVat)}</td>
                    <td class="loss-evidence-cell">${renderLineEvidenceCell(line.images, "loss", index, lossState.editMode)}</td>
                  </tr>
                `;
              }).join("")}
              <tr class="total-row">
                <td colspan="6" class="item-label">Total Recovery Cost</td>
                <td id="lossGrandCost">${formatNumber(lossTotals().cost)}</td>
                <td colspan="2" class="item-label">Total Recovery Selling (Excl. VAT)</td>
                <td id="lossGrandSale">${formatNumber(lossTotals().sellingExVat)}</td>
                <td></td>
              </tr>
              <tr class="total-row">
                <td colspan="10" class="item-label">Total Inclusive VAT</td>
                <td id="lossGrandVat">${formatNumber(lossTotals().sellingIncVat)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="loss-bottom-grid">
          <div class="panel loss-evidence-panel">
            <h4>Picture / Evidence Note</h4>
            <div class="upload-hint">อัปโหลดรูปได้จากคอลัมน์ Evidence ของแต่ละแถว เพื่อผูกหลักฐานให้ตรงกับรายการนั้นโดยตรง</div>
            <textarea id="lossPictureNote" class="loss-note-area" ${lossState.editMode ? "" : "disabled"} placeholder="บันทึกข้อมูลหลักฐานหรือหมายเหตุเพิ่มเติมของรายงาน">${escapeHtml(lossState.reportData.pictureNote || "")}</textarea>
          </div>
          <div class="panel loss-sign-panel">
            <h4>Approval / Signature</h4>
            <div class="loss-sign-grid">
              <div class="field"><label>Prepared by</label><input id="lossPreparedBy" value="${escapeHtml(lossState.reportData.preparedBy || "")}" ${lossState.editMode ? "" : "disabled"} /></div>
              <div class="field"><label>Reported by</label><input id="lossReportedBy" value="${escapeHtml(lossState.reportData.reportedBy || "")}" ${lossState.editMode ? "" : "disabled"} /></div>
              <div class="field"><label>Checked by</label><input id="lossCheckedBy" value="${escapeHtml(lossState.reportData.checkedBy || "")}" ${lossState.editMode ? "" : "disabled"} /></div>
              <div class="field"><label>Verified by</label><input id="lossVerifiedBy" value="${escapeHtml(lossState.reportData.verifiedBy || "")}" ${lossState.editMode ? "" : "disabled"} /></div>
              <div class="field"><label>Acknowledge by</label><input id="lossAcknowledgeBy" value="${escapeHtml(lossState.reportData.acknowledgeBy || "")}" ${lossState.editMode ? "" : "disabled"} /></div>
              <div class="field"><label>Approved by</label><input id="lossApprovedBy" value="${escapeHtml(lossState.reportData.approvedBy || "")}" ${lossState.editMode ? "" : "disabled"} /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  bindLossDamageEvents();
}
function refreshLossLiveTotals(){
  lossState.reportData.lines.forEach((line, index) => {
    const totals = lossLineTotals(line);
    const costEl = document.getElementById(`lossCostTotal_${index}`);
    const saleEl = document.getElementById(`lossSaleTotal_${index}`);
    if (costEl) costEl.textContent = formatNumber(totals.costTotal);
    if (saleEl) saleEl.textContent = formatNumber(totals.sellingExVat);
  });
  const totals = lossTotals();
  const grandCost = document.getElementById("lossGrandCost");
  const grandSale = document.getElementById("lossGrandSale");
  const grandVat = document.getElementById("lossGrandVat");
  const statCost = document.getElementById("lossStatCost");
  const statSale = document.getElementById("lossStatSale");
  if (grandCost) grandCost.textContent = formatNumber(totals.cost);
  if (grandSale) grandSale.textContent = formatNumber(totals.sellingExVat);
  if (grandVat) grandVat.textContent = formatNumber(totals.sellingIncVat);
  if (statCost) statCost.textContent = formatNumber(totals.cost);
  if (statSale) statSale.textContent = formatNumber(totals.sellingIncVat);
}
function bindLossDamageEvents(){
  document.getElementById("backBtn")?.remove();
  const dateInput = document.getElementById("lossDateInput");
  const outletDept = document.getElementById("lossOutletDept");
  const pictureNote = document.getElementById("lossPictureNote");
  const signMap = {
    preparedBy: document.getElementById("lossPreparedBy"),
    reportedBy: document.getElementById("lossReportedBy"),
    checkedBy: document.getElementById("lossCheckedBy"),
    verifiedBy: document.getElementById("lossVerifiedBy"),
    acknowledgeBy: document.getElementById("lossAcknowledgeBy"),
    approvedBy: document.getElementById("lossApprovedBy")
  };

  dateInput.addEventListener("change", () => {
    if (!canDiscardLossEdits()) {
      dateInput.value = lossState.currentDate;
      return;
    }
    loadLossReport(dateInput.value || todayValue());
    lossState.editMode = false;
    lossState.dirty = false;
    renderLossDamageModule();
  });

  document.getElementById("lossEditBtn").addEventListener("click", () => {
    if (lossState.editMode) return;
    lossState.savedSnapshot = cloneDeep(lossState.reportData);
    lossState.editMode = true;
    lossState.dirty = false;
    renderLossDamageModule();
  });

  document.getElementById("lossSaveBtn").addEventListener("click", () => {
    if (!lossState.editMode) {
      alert("กรุณากด EDIT ก่อน แล้วค่อยกด SAVE");
      return;
    }
    saveLossReport();
    lossState.savedSnapshot = cloneDeep(lossState.reportData);
    lossState.editMode = false;
    lossState.dirty = false;
    renderLossDamageModule();
  });

  document.getElementById("lossCancelBtn").addEventListener("click", () => {
    if (!lossState.editMode) {
      alert("ยังไม่มีการแก้ไขให้ยกเลิก");
      return;
    }
    const currentImages = flattenLineImages(lossState.reportData);
    const snapshotImages = flattenLineImages(lossState.savedSnapshot || {});
    lossState.reportData = lossState.savedSnapshot ? cloneDeep(lossState.savedSnapshot) : createEmptyLossReport(lossState.currentDate);
    lossState.editMode = false;
    lossState.dirty = false;
    renderLossDamageModule();
    cleanupAddedImages(currentImages, snapshotImages).catch(console.error);
  });

  document.getElementById("lossExportReportBtn").addEventListener("click", () => {
    exportLossReportDocument();
  });

  document.getElementById("lossExportBtn").addEventListener("click", () => {
    downloadFile(`laya-loss-damage-${lossState.currentDate}.csv`, toCSV(lossExportRows()));
  });

  document.getElementById("lossClearBtn").addEventListener("click", () => {
    if (!confirm(`ลบข้อมูลของรายงานวันที่ ${lossState.currentDate} ?`)) return;
    const oldImages = flattenLineImages(lossState.reportData);
    lossState.reportData = createEmptyLossReport(lossState.currentDate);
    lossState.savedSnapshot = cloneDeep(lossState.reportData);
    lossState.editMode = false;
    lossState.dirty = false;
    saveLossReport();
    renderLossDamageModule();
    oldImages.forEach(image => deleteStorageFileIfPossible(image.storagePath));
  });

  if (outletDept) {
    outletDept.addEventListener("input", (event) => {
      lossState.reportData.outletDept = event.target.value;
      lossState.dirty = true;
    });
  }
  if (pictureNote) {
    pictureNote.addEventListener("input", (event) => {
      lossState.reportData.pictureNote = event.target.value;
      lossState.dirty = true;
    });
  }
  Object.entries(signMap).forEach(([field, el]) => {
    if (!el) return;
    el.addEventListener("input", (event) => {
      lossState.reportData[field] = event.target.value;
      lossState.dirty = true;
    });
  });

  document.querySelectorAll(".loss-input").forEach(input => {
    input.addEventListener("input", (event) => {
      const lineIndex = Number(event.target.dataset.line);
      const field = event.target.dataset.field;
      let value = event.target.value;
      if (["qty", "recoveryCost", "recoverySelling"].includes(field)) {
        value = value === "" ? "" : Number(value);
      }
      lossState.reportData.lines[lineIndex][field] = value;
      lossState.dirty = true;
      refreshLossLiveTotals();
    });
  });

  document.querySelectorAll("[data-loss-line-upload]").forEach(input => {
    input.addEventListener("change", async (event) => {
      const lineIndex = Number(event.target.dataset.lossLineUpload);
      const files = Array.from(event.target.files || []);
      event.target.value = "";
      if (!files.length) return;
      if (!lossState.editMode) {
        alert("กรุณากด EDIT ก่อนอัปโหลดรูป");
        return;
      }
      try {
        const uploaded = await uploadCompressedImagesToStorage(`loss-damage/item-${lineIndex + 1}`, lossState.currentDate, files);
        lossState.reportData.lines[lineIndex].images = [...(lossState.reportData.lines[lineIndex].images || []), ...uploaded];
        lossState.dirty = true;
        renderLossDamageModule();
      } catch (error) {
        commonImageUploadError(error);
      }
    });
  });

  document.querySelectorAll("[data-view-image]").forEach(btn => {
    btn.addEventListener("click", () => openImageUrl(btn.dataset.viewImage));
  });

  document.querySelectorAll("[data-loss-remove-image]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (!lossState.editMode) {
        alert("กรุณากด EDIT ก่อนลบรูป");
        return;
      }
      const imageId = btn.dataset.lossRemoveImage;
      const lineIndex = Number(btn.dataset.line);
      const target = (lossState.reportData.lines[lineIndex].images || []).find(image => image.id === imageId);
      lossState.reportData.lines[lineIndex].images = (lossState.reportData.lines[lineIndex].images || []).filter(image => image.id !== imageId);
      lossState.dirty = true;
      renderLossDamageModule();
      if (target && target.storagePath) {
        deleteStorageFileIfPossible(target.storagePath);
      }
    });
  });

  refreshLossLiveTotals();
}


/* Breakage / Spoiled custom report */
let breakageState = {
  currentDate: todayValue(),
  reportData: null,
  savedSnapshot: null,
  editMode: false,
  dirty: false
};

function breakageStorageKey(date = breakageState.currentDate){
  return `${BREAKAGE_REPORT_PREFIX}${date}`;
}
function createEmptyBreakageLine(index){
  return {
    item: index + 1,
    productCode: "",
    description: "",
    unit: "",
    qty: "",
    recoveryCost: "",
    reasons: "",
    images: []
  };
}
function createEmptyBreakageReport(date = breakageState.currentDate){
  return {
    outletDept: "",
    reportDate: date,
    lines: Array.from({ length: BREAKAGE_TEMPLATE_ROWS }, (_, i) => createEmptyBreakageLine(i)),
    pictureNote: "",
    images: [],
    preparedBy: "",
    reportedBy: "",
    checkedBy: "",
    verifiedBy: "",
    acknowledgeBy: "",
    approvedBy: "",
    updatedAt: new Date().toISOString()
  };
}
function mergeBreakageReport(base, incoming){
  const merged = cloneDeep(base);
  if (incoming && typeof incoming === "object"){
    Object.assign(merged, incoming);
    if (Array.isArray(incoming.lines)){
      merged.lines = Array.from({ length: BREAKAGE_TEMPLATE_ROWS }, (_, i) => ({
        ...createEmptyBreakageLine(i),
        ...(incoming.lines[i] || {}),
        item: i + 1
      }));
    }
  }
  return merged;
}
function loadBreakageReport(date = breakageState.currentDate){
  breakageState.currentDate = date;
  try {
    const raw = localStorage.getItem(breakageStorageKey(date));
    if (!raw) {
      breakageState.reportData = createEmptyBreakageReport(date);
      breakageState.savedSnapshot = cloneDeep(breakageState.reportData);
      return;
    }
    const parsed = JSON.parse(raw);
    breakageState.reportData = mergeBreakageReport(createEmptyBreakageReport(date), parsed);
    breakageState.savedSnapshot = cloneDeep(breakageState.reportData);
  } catch (error) {
    console.error(error);
    breakageState.reportData = createEmptyBreakageReport(date);
    breakageState.savedSnapshot = cloneDeep(breakageState.reportData);
  }
}
function saveBreakageReport(){
  breakageState.reportData.updatedAt = new Date().toISOString();
  localStorage.setItem(breakageStorageKey(breakageState.currentDate), JSON.stringify(breakageState.reportData));
}
function breakageReportCount(){
  let count = 0;
  for (let i = 0; i < localStorage.length; i += 1){
    const key = localStorage.key(i);
    if (key && key.startsWith(BREAKAGE_REPORT_PREFIX)) count += 1;
  }
  return count;
}
function exportAllBreakageReports(){
  const bundle = {};
  for (let i = 0; i < localStorage.length; i += 1){
    const key = localStorage.key(i);
    if (!key || !key.startsWith(BREAKAGE_REPORT_PREFIX)) continue;
    try {
      bundle[key.replace(BREAKAGE_REPORT_PREFIX, "")] = JSON.parse(localStorage.getItem(key));
    } catch (error) {
      console.error(error);
    }
  }
  return bundle;
}
function canDiscardBreakageEdits(){
  if (!breakageState.editMode || !breakageState.dirty) return true;
  return confirm("มีการแก้ไขที่ยังไม่ได้บันทึก ต้องการออกหรือเปลี่ยนวันที่ต่อหรือไม่?");
}
function breakageLineTotal(line){
  return Number(line.qty || 0) * Number(line.recoveryCost || 0);
}
function breakageTotals(){
  return breakageState.reportData.lines.reduce((acc, line) => {
    acc.cost += breakageLineTotal(line);
    acc.qty += Number(line.qty || 0);
    return acc;
  }, { cost: 0, qty: 0 });
}
function breakageExportRows(){
  return breakageState.reportData.lines.map((line, index) => ({
    reportDate: breakageState.currentDate,
    outletDept: breakageState.reportData.outletDept,
    item: index + 1,
    productCode: line.productCode,
    description: line.description,
    unit: line.unit,
    qty: line.qty,
    recoveryCostAt: line.recoveryCost,
    total: breakageLineTotal(line),
    reasons: line.reasons,
    imageCount: ((line.images || []).length)
  }));
}

function exportBreakageReportDocument(){
  const totals = breakageTotals();
  const bodyHtml = `
    <section class="hero">
      <div class="eyebrow">Laya Resort Phuket</div>
      <h1>Breakage / Spoiled Report</h1>
      <div class="meta-grid">
        <div class="meta-field">
          <div class="label">Outlet / Dept.</div>
          <div class="value">${escapeHtml(breakageState.reportData.outletDept || "-")}</div>
        </div>
        <div class="meta-field">
          <div class="label">Report Date</div>
          <div class="value">${escapeHtml(breakageState.currentDate)}</div>
        </div>
      </div>
      <div class="grid">
        <div class="stat sand"><div class="label">Reports Saved</div><div class="value">${formatNumber(breakageReportCount())}</div></div>
        <div class="stat mint"><div class="label">Total Qty</div><div class="value">${formatNumber(totals.qty)}</div></div>
        <div class="stat sky"><div class="label">Recovery Cost</div><div class="value">${formatNumber(totals.cost)}</div></div>
      </div>
    </section>

    <section class="block">
      <table>
        <thead>
          <tr>
            <th>No.</th>
            <th>Product Code</th>
            <th>Description</th>
            <th>Unit</th>
            <th>Qty.</th>
            <th>Recovery Cost @</th>
            <th>Total</th>
            <th>Reason</th>
          </tr>
        </thead>
        <tbody>
          ${breakageState.reportData.lines.map((line, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${escapeHtml(line.productCode || "")}</td>
              <td>${escapeHtml(line.description || "")}</td>
              <td>${escapeHtml(line.unit || "")}</td>
              <td class="num">${formatNumber(line.qty || 0)}</td>
              <td class="num">${formatNumber(line.recoveryCost || 0)}</td>
              <td class="num">${formatNumber(breakageLineTotal(line))}</td>
              <td>${escapeHtml(line.reasons || "")}</td>
            </tr>
          `).join("")}
          <tr class="totals">
            <td colspan="6">Total Recovery Cost</td>
            <td class="num">${formatNumber(totals.cost)}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="block">
      <h3>Picture / Evidence Note</h3>
      <div class="note-box">${escapeHtml(breakageState.reportData.pictureNote || "-").replace(/\n/g, "<br>")}</div>
    </section>

    <section class="block">
      <h3>Evidence by Item</h3>
      ${renderEvidenceByItemSection(breakageState.reportData.lines, "description")}
    </section>

    <section class="block">
      <h3>Approval / Signature</h3>
      <div class="sign-grid">
        <div class="sign-item"><div class="label">Prepared by</div><div class="value">${escapeHtml(breakageState.reportData.preparedBy || "")}</div></div>
        <div class="sign-item"><div class="label">Checked by</div><div class="value">${escapeHtml(breakageState.reportData.checkedBy || "")}</div></div>
        <div class="sign-item"><div class="label">Reported by</div><div class="value">${escapeHtml(breakageState.reportData.reportedBy || "")}</div></div>
        <div class="sign-item"><div class="label">Verified by</div><div class="value">${escapeHtml(breakageState.reportData.verifiedBy || "")}</div></div>
        <div class="sign-item"><div class="label">Acknowledge by</div><div class="value">${escapeHtml(breakageState.reportData.acknowledgeBy || "")}</div></div>
        <div class="sign-item"><div class="label">Approved by</div><div class="value">${escapeHtml(breakageState.reportData.approvedBy || "")}</div></div>
      </div>
    </section>
  `;
  reportWindowBase(`Breakage-Spoiled-${breakageState.currentDate}`, bodyHtml);
}

function breakageHeaderHtml(){
  const totals = breakageTotals();
  return `
    <div class="meal-header breakage-header">
      <div class="meal-title">
        <div class="eyebrow">Laya Resort Phuket</div>
        <h3>LAYA BREAKAGE SPOILLED</h3>
        <p>ออกแบบตามเอกสาร Breakage / Spoiled พร้อมโหมด EDIT / SAVE / CANCEL สำหรับใช้งานจริง</p>
      </div>
      <div class="meal-stat-grid">
        <div class="stat-card sand">
          <div class="label">Reports Saved</div>
          <div class="value">${formatNumber(breakageReportCount())}</div>
        </div>
        <div class="stat-card mint">
          <div class="label">Total Qty</div>
          <div class="value" id="breakageStatQty">${formatNumber(totals.qty)}</div>
        </div>
        <div class="stat-card sky">
          <div class="label">Recovery Cost</div>
          <div class="value" id="breakageStatCost">${formatNumber(totals.cost)}</div>
        </div>
      </div>
    </div>
  `;
}
function breakageToolbarHtml(){
  return `
    <div class="panel">
      <div class="breakage-toolbar-grid">
        <div class="field compact-field">
          <label>Report Date</label>
          <input type="date" id="breakageDateInput" value="${breakageState.currentDate}" ${breakageState.editMode ? "disabled" : ""}/>
        </div>
        <div class="field compact-field">
          <label>Status</label>
          <input type="text" value="${breakageState.editMode ? "Editing" : "Locked"}" readonly />
        </div>
        <div class="field period-field">
          <label>Report Key</label>
          <input type="text" value="${breakageState.currentDate}" readonly />
        </div>
      </div>
      <div class="meal-toolbar-actions">
        <button class="btn ${breakageState.editMode ? "btn-soft" : "primary"}" id="breakageEditBtn">EDIT</button>
        <button class="btn ${breakageState.editMode ? "primary" : "btn-soft"}" id="breakageSaveBtn">SAVE</button>
        <button class="btn ${breakageState.editMode ? "" : "btn-soft"}" id="breakageCancelBtn">CANCEL</button>
        <button class="btn" id="breakageExportReportBtn">Export Report</button>
        <button class="btn" id="breakageExportBtn">Export CSV</button>
        <button class="btn danger" id="breakageClearBtn">Clear Report</button>
      </div>
    </div>
  `;
}
function refreshBreakageLiveTotals(){
  const totals = breakageTotals();
  const qtyEl = document.getElementById("breakageStatQty");
  const costEl = document.getElementById("breakageStatCost");
  if (qtyEl) qtyEl.textContent = formatNumber(totals.qty);
  if (costEl) costEl.textContent = formatNumber(totals.cost);

  document.querySelectorAll("[data-breakage-line-total]").forEach(el => {
    const index = Number(el.dataset.breakageLineTotal);
    el.textContent = formatNumber(breakageLineTotal(breakageState.reportData.lines[index]));
  });
  const totalEl = document.getElementById("breakageTotalCost");
  if (totalEl) totalEl.textContent = formatNumber(totals.cost);
}
function renderBreakageSpoiledModule(){
  if (!breakageState.reportData) loadBreakageReport(breakageState.currentDate);
  dashboardView.classList.remove("active");
  moduleView.classList.add("active");
  renderNav("breakage-spoiled");
  history.replaceState({}, "", "#breakage-spoiled");

  moduleView.innerHTML = `
    <div class="meal-shell">
      ${breakageHeaderHtml()}
      ${breakageToolbarHtml()}
      <div class="panel breakage-report-card">
        <div class="breakage-report-head">
          <div class="breakage-title-stack">
            <div class="breakage-resort">Laya Resort Phuket</div>
            <div class="breakage-main-title">Breakage / Spoiled</div>
          </div>
          <div class="breakage-meta-row">
            <div class="breakage-meta-field">
              <span>OUTLET / DEPT.</span>
              <input class="breakage-head-input" id="breakageOutletDept" value="${escapeHtml(breakageState.reportData.outletDept || "")}" ${breakageState.editMode ? "" : "disabled"} />
            </div>
            <div class="breakage-meta-field short">
              <span>DATE :</span>
              <input class="breakage-head-input" value="${escapeHtml(breakageState.currentDate)}" disabled />
            </div>
          </div>
        </div>

        <div class="table-wrap">
          <table class="breakage-table">
            <thead>
              <tr class="summary-head-main">
                <th class="breakage-col-no" rowspan="2">No.</th>
                <th class="breakage-col-code" rowspan="2">Product Code</th>
                <th class="breakage-col-description" rowspan="2">Description</th>
                <th class="breakage-col-unit" rowspan="2">Unit</th>
                <th class="breakage-col-qty" rowspan="2">Qty.</th>
                <th class="breakage-col-cost" colspan="2">Recovery Cost (Baht)</th>
                <th class="breakage-col-reason" rowspan="2">Reason</th>
                <th class="breakage-col-evidence" rowspan="2">Evidence</th>
              </tr>
              <tr class="summary-head-main">
                <th class="breakage-col-cost-at">@</th>
                <th class="breakage-col-total">Total</th>
              </tr>
            </thead>
            <tbody>
              ${breakageState.reportData.lines.map((line, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td><input class="breakage-input" data-line="${index}" data-field="productCode" value="${escapeHtml(line.productCode)}" ${breakageState.editMode ? "" : "disabled"} /></td>
                  <td><input class="breakage-input left" data-line="${index}" data-field="description" value="${escapeHtml(line.description)}" ${breakageState.editMode ? "" : "disabled"} /></td>
                  <td><input class="breakage-input" data-line="${index}" data-field="unit" value="${escapeHtml(line.unit)}" ${breakageState.editMode ? "" : "disabled"} /></td>
                  <td><input class="breakage-input num" type="number" min="0" data-line="${index}" data-field="qty" value="${escapeHtml(line.qty)}" ${breakageState.editMode ? "" : "disabled"} /></td>
                  <td><input class="breakage-input num" type="number" min="0" data-line="${index}" data-field="recoveryCost" value="${escapeHtml(line.recoveryCost)}" ${breakageState.editMode ? "" : "disabled"} /></td>
                  <td class="breakage-total-cell" data-breakage-line-total="${index}">${formatNumber(breakageLineTotal(line))}</td>
                  <td><input class="breakage-input left" data-line="${index}" data-field="reasons" value="${escapeHtml(line.reasons)}" ${breakageState.editMode ? "" : "disabled"} /></td>
                  <td class="breakage-evidence-cell">${renderLineEvidenceCell(line.images, "breakage", index, breakageState.editMode)}</td>
                </tr>
              `).join("")}
              <tr class="total-row">
                <td colspan="6" style="text-align:right;padding-right:18px">Total</td>
                <td class="breakage-total-cell" id="breakageTotalCost">${formatNumber(breakageTotals().cost)}</td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="breakage-bottom-grid">
          <div class="panel loss-evidence-panel">
            <h4>Picture / Evidence Note</h4>
            <div class="upload-hint">อัปโหลดรูปได้จากคอลัมน์ Evidence ของแต่ละแถว เพื่อผูกหลักฐานให้ตรงกับรายการนั้นโดยตรง</div>
            <textarea id="breakagePictureNote" class="loss-note-area" ${breakageState.editMode ? "" : "disabled"} placeholder="บันทึกข้อมูลหลักฐานหรือหมายเหตุเพิ่มเติมของรายงาน">${escapeHtml(breakageState.reportData.pictureNote || "")}</textarea>
          </div>

          <div class="breakage-sign-grid">
            <div class="breakage-sign-item">
              <label>Prepared by :</label>
              <input class="breakage-sign-input" id="breakagePreparedBy" value="${escapeHtml(breakageState.reportData.preparedBy || "")}" ${breakageState.editMode ? "" : "disabled"} />
              <div class="breakage-role-label">Prepared by</div>
            </div>
            <div class="breakage-sign-item">
              <label>Checked by :</label>
              <input class="breakage-sign-input" id="breakageCheckedBy" value="${escapeHtml(breakageState.reportData.checkedBy || "")}" ${breakageState.editMode ? "" : "disabled"} />
              <div class="breakage-role-label">Cost Controller</div>
            </div>

            <div class="breakage-sign-item">
              <label>Reported by :</label>
              <input class="breakage-sign-input" id="breakageReportedBy" value="${escapeHtml(breakageState.reportData.reportedBy || "")}" ${breakageState.editMode ? "" : "disabled"} />
              <div class="breakage-role-label">Department Head</div>
            </div>
            <div class="breakage-sign-item">
              <label>Verified by :</label>
              <input class="breakage-sign-input" id="breakageVerifiedBy" value="${escapeHtml(breakageState.reportData.verifiedBy || "")}" ${breakageState.editMode ? "" : "disabled"} />
              <div class="breakage-role-label">Cluster Financial Controller</div>
            </div>

            <div class="breakage-sign-item">
              <label>Acknowlege by :</label>
              <input class="breakage-sign-input" id="breakageAcknowledgeBy" value="${escapeHtml(breakageState.reportData.acknowledgeBy || "")}" ${breakageState.editMode ? "" : "disabled"} />
              <div class="breakage-role-label">Hotel Manager</div>
            </div>
            <div class="breakage-sign-item">
              <label>Approved by :</label>
              <input class="breakage-sign-input" id="breakageApprovedBy" value="${escapeHtml(breakageState.reportData.approvedBy || "")}" ${breakageState.editMode ? "" : "disabled"} />
              <div class="breakage-role-label">Cluster General Manager</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const dateInput = document.getElementById("breakageDateInput");
  const outletDept = document.getElementById("breakageOutletDept");
  const pictureNote = document.getElementById("breakagePictureNote");
  const signMap = {
    preparedBy: document.getElementById("breakagePreparedBy"),
    reportedBy: document.getElementById("breakageReportedBy"),
    checkedBy: document.getElementById("breakageCheckedBy"),
    verifiedBy: document.getElementById("breakageVerifiedBy"),
    acknowledgeBy: document.getElementById("breakageAcknowledgeBy"),
    approvedBy: document.getElementById("breakageApprovedBy")
  };

  document.getElementById("backBtn")?.addEventListener("click", () => {
    if (!canDiscardBreakageEdits()) return;
    breakageState.editMode = false;
    breakageState.dirty = false;
    if (breakageState.savedSnapshot) breakageState.reportData = cloneDeep(breakageState.savedSnapshot);
    showDashboard();
  });

  if (dateInput){
    dateInput.addEventListener("change", (event) => {
      if (!canDiscardBreakageEdits()) {
        dateInput.value = breakageState.currentDate;
        return;
      }
      breakageState.currentDate = event.target.value || todayValue();
      breakageState.editMode = false;
      breakageState.dirty = false;
      loadBreakageReport(breakageState.currentDate);
      renderBreakageSpoiledModule();
    });
  }

  document.getElementById("breakageEditBtn").addEventListener("click", () => {
    if (breakageState.editMode) return;
    breakageState.savedSnapshot = cloneDeep(breakageState.reportData);
    breakageState.editMode = true;
    breakageState.dirty = false;
    renderBreakageSpoiledModule();
  });

  document.getElementById("breakageSaveBtn").addEventListener("click", () => {
    if (!breakageState.editMode) {
      alert("กรุณากด EDIT ก่อน แล้วค่อยกด SAVE");
      return;
    }
    saveBreakageReport();
    breakageState.savedSnapshot = cloneDeep(breakageState.reportData);
    breakageState.editMode = false;
    breakageState.dirty = false;
    renderBreakageSpoiledModule();
  });

  document.getElementById("breakageCancelBtn").addEventListener("click", () => {
    if (!breakageState.editMode) {
      alert("ยังไม่มีการแก้ไขให้ยกเลิก");
      return;
    }
    const currentImages = flattenLineImages(breakageState.reportData);
    const snapshotImages = flattenLineImages(breakageState.savedSnapshot || {});
    breakageState.reportData = breakageState.savedSnapshot ? cloneDeep(breakageState.savedSnapshot) : createEmptyBreakageReport(breakageState.currentDate);
    breakageState.editMode = false;
    breakageState.dirty = false;
    renderBreakageSpoiledModule();
    cleanupAddedImages(currentImages, snapshotImages).catch(console.error);
  });

  document.getElementById("breakageExportReportBtn").addEventListener("click", () => {
    exportBreakageReportDocument();
  });

  document.getElementById("breakageExportBtn").addEventListener("click", () => {
    downloadFile(`laya-breakage-spoiled-${breakageState.currentDate}.csv`, toCSV(breakageExportRows()));
  });

  document.getElementById("breakageClearBtn").addEventListener("click", () => {
    if (!confirm(`ลบข้อมูลของรายงานวันที่ ${breakageState.currentDate} ?`)) return;
    const oldImages = flattenLineImages(breakageState.reportData);
    breakageState.reportData = createEmptyBreakageReport(breakageState.currentDate);
    breakageState.savedSnapshot = cloneDeep(breakageState.reportData);
    breakageState.editMode = false;
    breakageState.dirty = false;
    saveBreakageReport();
    renderBreakageSpoiledModule();
    oldImages.forEach(image => deleteStorageFileIfPossible(image.storagePath));
  });

  if (outletDept){
    outletDept.addEventListener("input", (event) => {
      breakageState.reportData.outletDept = event.target.value;
      breakageState.dirty = true;
    });
  }
  if (pictureNote){
    pictureNote.addEventListener("input", (event) => {
      breakageState.reportData.pictureNote = event.target.value;
      breakageState.dirty = true;
    });
  }
  Object.entries(signMap).forEach(([field, el]) => {
    if (!el) return;
    el.addEventListener("input", (event) => {
      breakageState.reportData[field] = event.target.value;
      breakageState.dirty = true;
    });
  });

  document.querySelectorAll(".breakage-input").forEach(input => {
    input.addEventListener("input", (event) => {
      const lineIndex = Number(event.target.dataset.line);
      const field = event.target.dataset.field;
      let value = event.target.value;
      if (["qty", "recoveryCost"].includes(field)) {
        value = value === "" ? "" : Number(value);
      }
      breakageState.reportData.lines[lineIndex][field] = value;
      breakageState.dirty = true;
      refreshBreakageLiveTotals();
    });
  });

  document.querySelectorAll("[data-breakage-line-upload]").forEach(input => {
    input.addEventListener("change", async (event) => {
      const lineIndex = Number(event.target.dataset.breakageLineUpload);
      const files = Array.from(event.target.files || []);
      event.target.value = "";
      if (!files.length) return;
      if (!breakageState.editMode) {
        alert("กรุณากด EDIT ก่อนอัปโหลดรูป");
        return;
      }
      try {
        const uploaded = await uploadCompressedImagesToStorage(`breakage-spoiled/item-${lineIndex + 1}`, breakageState.currentDate, files);
        breakageState.reportData.lines[lineIndex].images = [...(breakageState.reportData.lines[lineIndex].images || []), ...uploaded];
        breakageState.dirty = true;
        renderBreakageSpoiledModule();
      } catch (error) {
        commonImageUploadError(error);
      }
    });
  });

  document.querySelectorAll("[data-view-image]").forEach(btn => {
    btn.addEventListener("click", () => openImageUrl(btn.dataset.viewImage));
  });

  document.querySelectorAll("[data-breakage-remove-image]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (!breakageState.editMode) {
        alert("กรุณากด EDIT ก่อนลบรูป");
        return;
      }
      const imageId = btn.dataset.breakageRemoveImage;
      const lineIndex = Number(btn.dataset.line);
      const target = (breakageState.reportData.lines[lineIndex].images || []).find(image => image.id === imageId);
      breakageState.reportData.lines[lineIndex].images = (breakageState.reportData.lines[lineIndex].images || []).filter(image => image.id !== imageId);
      breakageState.dirty = true;
      renderBreakageSpoiledModule();
      if (target && target.storagePath) {
        deleteStorageFileIfPossible(target.storagePath);
      }
    });
  });

  refreshBreakageLiveTotals();
}


function renderMealPlanModule(activeTab = "summary") {
  mealState.keepTab = activeTab;
  dashboardView.classList.remove("active");
  moduleView.classList.add("active");
  renderNav("meal-plan-record");
  history.replaceState({}, "", "#meal-plan-record");

  moduleView.innerHTML = `
    <div class="meal-shell">
      ${mealPlanHeaderHtml()}
      ${mealPlanToolbarHtml()}
      ${mealPlanTabsHtml()}
    </div>
  `;
  document.querySelectorAll("[data-meal-tab]").forEach(btn => btn.classList.toggle("active", btn.dataset.mealTab === activeTab));
  document.getElementById("mealTabSummary").classList.toggle("active", activeTab === "summary");
  document.getElementById("mealTabPrice").classList.toggle("active", activeTab === "price");
  bindMealPlanEvents();
}
function showModule(moduleId){
  if (moduleId === "meal-plan-record") return renderMealPlanModule(mealState.keepTab || "summary");
  if (moduleId === "loss-damage") return renderLossDamageModule();
  if (moduleId === "breakage-spoiled") return renderBreakageSpoiledModule();
  return showGenericModule(moduleId);
}

function exportAllData(){
  const bundle = {};
  modules.forEach(module => {
    if (module.id === "meal-plan-record") {
      bundle[module.id] = {
        periodKey: getPeriodKey(),
        year: mealState.year,
        month: mealState.month + 1,
        data: mealState.monthData
      };
    } else if (module.id === "loss-damage") {
      bundle[module.id] = exportAllLossReports();
    } else if (module.id === "breakage-spoiled") {
      bundle[module.id] = exportAllBreakageReports();
    } else {
      bundle[module.id] = getRecords(module.id);
    }
  });
  downloadFile("laya-operations-data.json", JSON.stringify(bundle, null, 2), "application/json;charset=utf-8;");
}

function bootModal() {
  document.querySelectorAll("[data-close-modal]").forEach(el => {
    el.addEventListener("click", () => firebaseModal.classList.add("hidden"));
  });
  firebaseForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const config = {};
    ["apiKey","authDomain","projectId","storageBucket","messagingSenderId","appId"].forEach(key => {
      config[key] = firebaseForm.elements[key].value.trim();
    });
    localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config));
    const ok = initFirebaseIfPossible();
    firebaseModal.classList.add("hidden");
    if (ok) {
      await loadMonthFromFirebaseIfConnected();
      if (location.hash === "#meal-plan-record") renderMealPlanModule(mealState.keepTab || "summary");
      else renderDashboard();
      alert("เชื่อม Firebase สำเร็จ และพร้อมใช้งานกับโปรเจกต์ laya-fb");
    } else {
      alert("เชื่อม Firebase ไม่สำเร็จ");
    }
  });
}

function boot(){
  fillFirebaseForm(loadFirebaseConfigFromStorage());
  initFirebaseIfPossible();
  loadLocalMonthData();
  loadLossReport(lossState.currentDate);
  loadBreakageReport(breakageState.currentDate);
  loadMonthFromFirebaseIfConnected().finally(() => {
    mealState.editMode = false;
    mealState.dirty = false;
    mealState.savedSnapshot = JSON.parse(JSON.stringify(mealState.monthData));
    renderNav("dashboard");
    renderDashboard();
    const hash = (location.hash || "").replace("#", "");
    if(hash && hash !== "dashboard" && getModule(hash)) showModule(hash);
    else showDashboard();
  });
}

document.querySelector('[data-target="dashboard"]').addEventListener("click", showDashboard);
exportAllBtn.addEventListener("click", exportAllData);
bootModal();
boot();

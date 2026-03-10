
const STORAGE_PREFIX = "layaMealPlan::";
const FIREBASE_CONFIG_KEY = STORAGE_PREFIX + "firebaseConfig";
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyASWE64wumKUhEwRBiYXNzs2TvS_vm6vAU",
  authDomain: "laya-fb.firebaseapp.com",
  projectId: "laya-fb",
  storageBucket: "laya-fb.firebasestorage.app",
  messagingSenderId: "914355730972",
  appId: "1:914355730972:web:4a1ea8e50304b2a604bdd9",
  measurementId: "G-J5K4TMPMR5"
};


const ITEM_MASTER = [
  {
    section: "ABF",
    key: "RB (Regular)",
    defaultPrice: 300
  },
  {
    section: "ABF",
    key: "RB Extra Charge (Excusive Lounge)",
    defaultPrice: 250
  },
  {
    section: "ABF",
    key: "RO Room only Building D Phase 2",
    defaultPrice: 300
  },
  {
    section: "ABF",
    key: "Air Arabian",
    defaultPrice: 390
  },
  {
    section: "Meal Plan",
    key: "AIP Package @ 1550",
    defaultPrice: 1550
  },
  {
    section: "Meal Plan",
    key: "AIP Package @ 2500",
    defaultPrice: 2500
  },
  {
    section: "Meal Plan",
    key: "AIP Package upgard @ 1950",
    defaultPrice: 1950
  },
  {
    section: "Meal Plan",
    key: "AIP Package upgard @ 1550",
    defaultPrice: 1550
  },
  {
    section: "Meal Plan",
    key: "HALF BOARD LUNCH",
    defaultPrice: 0
  },
  {
    section: "Meal Plan",
    key: "HALF BOARD DINNER",
    defaultPrice: 0
  },
  {
    section: "Meal Plan",
    key: "FULL BOARD LUNCH",
    defaultPrice: 0
  },
  {
    section: "Meal Plan",
    key: "FULL BOARD DINNER",
    defaultPrice: 0
  },
  {
    section: "Meal Plan",
    key: "Crew SCAT",
    defaultPrice: 0
  },
  {
    section: "Meal Plan",
    key: "Crew RED WING",
    defaultPrice: 0
  },
  {
    section: "Meal Plan",
    key: "Crew AZUR",
    defaultPrice: 0
  },
  {
    section: "Meal Plan",
    key: "Crew .......",
    defaultPrice: 0
  },
  {
    section: "Meal Plan",
    key: "Crew ........",
    defaultPrice: 0
  }
];

const els = {
  yearInput: document.getElementById("yearInput"),
  monthInput: document.getElementById("monthInput"),
  periodKey: document.getElementById("periodKey"),
  statCover: document.getElementById("statCover"),
  statRevenue: document.getElementById("statRevenue"),
  statMonth: document.getElementById("statMonth"),
  summaryTable: document.getElementById("summaryTable"),
  guestForm: document.getElementById("guestForm"),
  guestTbody: document.getElementById("guestTbody"),
  priceTbody: document.getElementById("priceTbody"),
  firebaseBadge: document.getElementById("firebaseBadge"),
  firebaseNote: document.getElementById("firebaseNote"),
  firebaseModal: document.getElementById("firebaseModal"),
  firebaseForm: document.getElementById("firebaseForm"),
  addRecordBtn: document.getElementById("addRecordBtn"),
  syncBtn: document.getElementById("syncBtn"),
  clearMonthBtn: document.getElementById("clearMonthBtn"),
  exportSummaryBtn: document.getElementById("exportSummaryBtn"),
  exportGuestBtn: document.getElementById("exportGuestBtn"),
  firebaseSettingsBtn: document.getElementById("firebaseSettingsBtn")
};

let firebaseState = {
  app: null,
  db: null,
  connected: false,
  message: "Not connected"
};

let state = {
  year: new Date().getFullYear(),
  month: new Date().getMonth(),
  monthData: createEmptyMonthData()
};

function createEmptyMonthData() {
  const prices = {};
  const grid = {};
  ITEM_MASTER.forEach(item => {
    prices[item.key] = item.defaultPrice;
    grid[item.key] = {};
  });

  return {
    prices,
    grid,
    guestRecords: [],
    updatedAt: new Date().toISOString()
  };
}

function getPeriodKey(year = state.year, month = state.month) {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}
function storageKey(periodKey = getPeriodKey()) {
  return STORAGE_PREFIX + periodKey;
}
function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(Number(value || 0));
}
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function monthLabel(year = state.year, month = state.month) {
  return `${MONTHS[month]} ${year}`;
}
function daysInMonth(year = state.year, month = state.month) {
  return new Date(year, month + 1, 0).getDate();
}
function dayShort(year, month, day) {
  return new Date(year, month, day).toLocaleDateString("en-US", { weekday: "short" });
}
function isWeekend(year, month, day) {
  const dow = new Date(year, month, day).getDay();
  return dow === 0 || dow === 6;
}
function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function mergeMonthData(base, incoming) {
  const merged = createEmptyMonthData();

  merged.prices = { ...merged.prices, ...(base?.prices || {}), ...(incoming?.prices || {}) };
  merged.grid = { ...merged.grid, ...(base?.grid || {}) };
  Object.keys(incoming?.grid || {}).forEach(key => {
    merged.grid[key] = { ...(merged.grid[key] || {}), ...(incoming.grid[key] || {}) };
  });

  merged.guestRecords = Array.isArray(base?.guestRecords) ? [...base.guestRecords] : [];
  if (Array.isArray(incoming?.guestRecords)) {
    const seen = new Set(merged.guestRecords.map(r => r.id));
    incoming.guestRecords.forEach(record => {
      if (!seen.has(record.id)) {
        seen.add(record.id);
        merged.guestRecords.push(record);
      }
    });
  }
  merged.updatedAt = incoming?.updatedAt || base?.updatedAt || new Date().toISOString();
  return merged;
}

function saveLocalMonthData() {
  state.monthData.updatedAt = new Date().toISOString();
  localStorage.setItem(storageKey(), JSON.stringify(state.monthData));
}
function loadLocalMonthData() {
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) {
      state.monthData = createEmptyMonthData();
      return;
    }
    const parsed = JSON.parse(raw);
    state.monthData = mergeMonthData(createEmptyMonthData(), parsed);
  } catch (error) {
    console.error(error);
    state.monthData = createEmptyMonthData();
  }
}

function aggregatedGuestMap() {
  const map = {};
  state.monthData.guestRecords.forEach(record => {
    if (!record.date || !record.itemCode) return;
    const d = new Date(record.date);
    if (d.getFullYear() !== state.year || d.getMonth() !== state.month) return;
    const day = d.getDate();
    const key = `${record.itemCode}::${day}`;
    map[key] = (map[key] || 0) + Number(record.pax || 0);
  });
  return map;
}
function totalGuestRevenueForItem(itemKey) {
  return state.monthData.guestRecords
    .filter(record => record.itemCode === itemKey)
    .reduce((sum, record) => sum + Number(record.pax || 0) * Number(record.unitPrice || 0), 0);
}
function manualCount(itemKey, day) {
  return Number(state.monthData.grid?.[itemKey]?.[day] || 0);
}
function guestCount(itemKey, day) {
  return aggregatedGuestMap()[`${itemKey}::${day}`] || 0;
}
function combinedCount(itemKey, day) {
  return manualCount(itemKey, day) + guestCount(itemKey, day);
}
function totalCoverForItem(itemKey) {
  let total = 0;
  for (let day = 1; day <= daysInMonth(); day += 1) {
    total += combinedCount(itemKey, day);
  }
  return total;
}
function totalRevenueForItem(itemKey) {
  const manualRevenue = (() => {
    let total = 0;
    for (let day = 1; day <= daysInMonth(); day += 1) {
      total += manualCount(itemKey, day) * Number(state.monthData.prices[itemKey] || 0);
    }
    return total;
  })();
  return manualRevenue + totalGuestRevenueForItem(itemKey);
}

function updateHeaderStats() {
  let totalCover = 0;
  let totalRevenue = 0;
  ITEM_MASTER.forEach(item => {
    totalCover += totalCoverForItem(item.key);
    totalRevenue += totalRevenueForItem(item.key);
  });
  els.statCover.textContent = formatNumber(totalCover);
  els.statRevenue.textContent = formatNumber(totalRevenue);
  els.statMonth.textContent = monthLabel();
  els.periodKey.value = getPeriodKey();
}

function renderMonthControls() {
  els.yearInput.value = state.year;
  els.monthInput.innerHTML = MONTHS.map((m, idx) => `<option value="${idx}">${m}</option>`).join("");
  els.monthInput.value = String(state.month);
  els.periodKey.value = getPeriodKey();
}

function renderSummaryTable() {
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
          const weekend = isWeekend(state.year, state.month, day);
          return `
            <th class="day-head ${weekend ? "weekend" : "weekday"}">
              <span class="dow">${dayShort(state.year, state.month, day)}</span>
              <span class="dom">${day}</span>
            </th>
          `;
        }).join("")}
      </tr>
    </thead>
  `;

  const bodyRows = [];
  Object.entries(sections).forEach(([sectionName, items]) => {
    items.forEach((item, index) => {
      const rowspanCell = index === 0
        ? `<td rowspan="${items.length}" class="section-cell ${sectionName === "ABF" ? "section-abf" : "section-meal"}">${sectionName}</td>`
        : "";
      const revenue = totalRevenueForItem(item.key);
      const cover = totalCoverForItem(item.key);

      bodyRows.push(`
        <tr>
          ${rowspanCell}
          <td class="item-col item-label">${escapeHtml(item.key)}</td>
          <td class="money-col revenue-cell">${formatNumber(revenue)}</td>
          <td class="price-col">${formatNumber(state.monthData.prices[item.key] || 0)}</td>
          <td class="total-col"><strong>${formatNumber(cover)}</strong></td>
          ${Array.from({ length: totalDays }, (_, i) => {
            const day = i + 1;
            const manual = manualCount(item.key, day);
            const guest = guestCount(item.key, day);
            const title = guest > 0 ? `title="Guest records included: ${guest}"` : "";
            return `
              <td>
                <input
                  class="cell-input"
                  type="number"
                  min="0"
                  value="${manual || ""}"
                  data-item-key="${escapeHtml(item.key)}"
                  data-day="${day}"
                  ${title}
                />
              </td>
            `;
          }).join("")}
        </tr>
      `);
    });
  });

  const totalRow = `
    <tr class="total-row">
      <td colspan="2">Monthly Total</td>
      <td>${formatNumber(getOverallRevenue())}</td>
      <td>-</td>
      <td>${formatNumber(getOverallCover())}</td>
      ${Array.from({ length: totalDays }, (_, i) => `<td>${formatNumber(getDailyTotal(i + 1))}</td>`).join("")}
    </tr>
  `;

  els.summaryTable.innerHTML = headRow + `<tbody>${bodyRows.join("")}${totalRow}</tbody>`;

  els.summaryTable.querySelectorAll(".cell-input").forEach(input => {
    input.addEventListener("change", async (event) => {
      const itemKey = event.target.dataset.itemKey;
      const day = Number(event.target.dataset.day);
      const value = Number(event.target.value || 0);
      if (!state.monthData.grid[itemKey]) state.monthData.grid[itemKey] = {};
      if (value <= 0) {
        delete state.monthData.grid[itemKey][day];
        event.target.value = "";
      } else {
        state.monthData.grid[itemKey][day] = value;
      }
      saveLocalMonthData();
      updateHeaderStats();
      renderSummaryTable();
      renderGuestTable();
      if (firebaseState.connected) {
        await syncMonthToFirebase(false);
      }
    });
  });
}

function renderGuestSelectOptions() {
  const select = els.guestForm.elements.itemCode;
  select.innerHTML = ITEM_MASTER.map(item => `<option value="${escapeHtml(item.key)}">${escapeHtml(item.section)} • ${escapeHtml(item.key)}</option>`).join("");
}
function renderGuestTable() {
  const rows = [...state.monthData.guestRecords].sort((a, b) => new Date(b.date) - new Date(a.date));
  if (!rows.length) {
    els.guestTbody.innerHTML = `<tr><td colspan="7" style="padding:18px">ยังไม่มีรายการบันทึกแขก</td></tr>`;
    return;
  }
  els.guestTbody.innerHTML = rows.map(record => `
    <tr>
      <td>${escapeHtml(record.date)}</td>
      <td style="text-align:left">${escapeHtml(record.itemCode)}</td>
      <td style="text-align:left">${escapeHtml(record.guestName)}</td>
      <td>${escapeHtml(record.roomNo || "-")}</td>
      <td>${formatNumber(record.pax)}</td>
      <td>${formatNumber(Number(record.pax || 0) * Number(record.unitPrice || 0))}</td>
      <td><button class="action-link" data-delete-id="${record.id}">Delete</button></td>
    </tr>
  `).join("");

  els.guestTbody.querySelectorAll("[data-delete-id]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.deleteId;
      state.monthData.guestRecords = state.monthData.guestRecords.filter(record => record.id !== id);
      saveLocalMonthData();
      updateHeaderStats();
      renderSummaryTable();
      renderGuestTable();
      if (firebaseState.connected) {
        await syncMonthToFirebase(false);
      }
    });
  });
}
function renderPriceTable() {
  els.priceTbody.innerHTML = ITEM_MASTER.map(item => `
    <tr>
      <td>${escapeHtml(item.section)}</td>
      <td style="text-align:left">${escapeHtml(item.key)}</td>
      <td>
        <input
          class="price-cell-input"
          type="number"
          min="0"
          value="${Number(state.monthData.prices[item.key] || 0)}"
          data-price-item="${escapeHtml(item.key)}"
        />
      </td>
    </tr>
  `).join("");

  els.priceTbody.querySelectorAll("[data-price-item]").forEach(input => {
    input.addEventListener("change", async (event) => {
      const itemKey = event.target.dataset.priceItem;
      state.monthData.prices[itemKey] = Number(event.target.value || 0);
      saveLocalMonthData();
      updateHeaderStats();
      renderSummaryTable();
      renderPriceTable();
      if (firebaseState.connected) {
        await syncMonthToFirebase(false);
      }
    });
  });
}

function renderAll() {
  updateHeaderStats();
  renderSummaryTable();
  renderGuestTable();
  renderPriceTable();
}

function groupBySection() {
  return ITEM_MASTER.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});
}
function getOverallCover() {
  return ITEM_MASTER.reduce((sum, item) => sum + totalCoverForItem(item.key), 0);
}
function getOverallRevenue() {
  return ITEM_MASTER.reduce((sum, item) => sum + totalRevenueForItem(item.key), 0);
}
function getDailyTotal(day) {
  return ITEM_MASTER.reduce((sum, item) => sum + combinedCount(item.key, day), 0);
}

function downloadFile(name, content, type = "text/csv;charset=utf-8;") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
function toCSV(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = value => `\"${String(value ?? "").replaceAll('\"', '\\"')}\"`;
  const lines = [headers.map(esc).join(",")];
  rows.forEach(row => lines.push(headers.map(h => esc(row[h])).join(",")));
  return lines.join("\n");
}
function buildSummaryRowsForExport() {
  const rows = [];
  ITEM_MASTER.forEach(item => {
    const row = {
      section: item.section,
      item: item.key,
      price: Number(state.monthData.prices[item.key] || 0),
      totalCover: totalCoverForItem(item.key),
      revenue: totalRevenueForItem(item.key)
    };
    for (let day = 1; day <= daysInMonth(); day += 1) {
      row[`day_${day}`] = combinedCount(item.key, day);
    }
    rows.push(row);
  });
  return rows;
}

function setupTabs() {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(el => el.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach(el => el.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.add("active");
    });
  });
}

function openFirebaseModal() {
  els.firebaseModal.classList.remove("hidden");
}
function closeFirebaseModal() {
  els.firebaseModal.classList.add("hidden");
}
function loadFirebaseConfigFromStorage() {
  try {
    const saved = JSON.parse(localStorage.getItem(FIREBASE_CONFIG_KEY) || "null");
    if (saved && saved.apiKey && saved.projectId && saved.appId) {
      return { ...DEFAULT_FIREBASE_CONFIG, ...saved };
    }
    return DEFAULT_FIREBASE_CONFIG;
  } catch {
    return DEFAULT_FIREBASE_CONFIG;
  }
}
function fillFirebaseForm(config = {}) {
  const merged = { ...DEFAULT_FIREBASE_CONFIG, ...config };
  ["apiKey","authDomain","projectId","storageBucket","messagingSenderId","appId"].forEach(key => {
    els.firebaseForm.elements[key].value = merged[key] || "";
  });
}
function updateFirebaseStatus(connected, message) {
  els.firebaseBadge.textContent = `Firebase: ${message}`;
  els.firebaseBadge.classList.toggle("ok", connected);
  els.firebaseNote.textContent = connected
    ? "เชื่อมสำเร็จแล้ว ข้อมูลสามารถ Sync ขึ้น Firestore ของโปรเจกต์ laya-fb ได้ทันที"
    : "หากเชื่อมไม่สำเร็จ ระบบจะเก็บข้อมูลไว้ในเครื่องนี้ก่อน";
}
function initFirebaseIfPossible() {
  const config = loadFirebaseConfigFromStorage();
  if (!config || !config.apiKey || !config.projectId || !config.appId) {
    firebaseState = { app: null, db: null, connected: false, message: "Not connected" };
    updateFirebaseStatus(false, "Not connected");
    return false;
  }

  try {
    const appName = "LayaMealPlanApp";
    let app;
    try {
      app = firebase.app(appName);
    } catch {
      app = firebase.initializeApp(config, appName);
    }
    const db = app.firestore();
    firebaseState = { app, db, connected: true, message: "Connected" };
    updateFirebaseStatus(true, "Connected");
    return true;
  } catch (error) {
    console.error(error);
    firebaseState = { app: null, db: null, connected: false, message: "Connection failed" };
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
      year: state.year,
      month: state.month + 1,
      prices: state.monthData.prices,
      grid: state.monthData.grid,
      guestRecords: state.monthData.guestRecords,
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
    state.monthData = mergeMonthData(createEmptyMonthData(), {
      prices: data.prices || {},
      grid: data.grid || {},
      guestRecords: data.guestRecords || [],
      updatedAt: data.updatedAtClient || new Date().toISOString()
    });
    saveLocalMonthData();
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function changePeriod(year, month) {
  state.year = year;
  state.month = month;
  loadLocalMonthData();
  const loadedRemote = await loadMonthFromFirebaseIfConnected();
  renderMonthControls();
  renderAll();
  fillGuestFormDefaults();
  return loadedRemote;
}

function fillGuestFormDefaults() {
  els.guestForm.elements.date.value = todayISO();
  els.guestForm.elements.itemCode.value = ITEM_MASTER[0].key;
  els.guestForm.elements.unitPrice.value = state.monthData.prices[ITEM_MASTER[0].key] || ITEM_MASTER[0].defaultPrice;
}

function setupGuestForm() {
  renderGuestSelectOptions();
  fillGuestFormDefaults();

  els.guestForm.elements.itemCode.addEventListener("change", (event) => {
    const itemKey = event.target.value;
    els.guestForm.elements.unitPrice.value = Number(state.monthData.prices[itemKey] || 0);
  });

  els.guestForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = els.guestForm;
    const payload = {
      id: crypto.randomUUID(),
      date: form.elements.date.value,
      itemCode: form.elements.itemCode.value,
      guestName: form.elements.guestName.value.trim(),
      roomNo: form.elements.roomNo.value.trim(),
      pax: Number(form.elements.pax.value || 0),
      unitPrice: Number(form.elements.unitPrice.value || 0),
      remark: form.elements.remark.value.trim()
    };

    if (!payload.date || !payload.itemCode || !payload.guestName || payload.pax <= 0) {
      alert("กรุณากรอกข้อมูลแขกให้ครบ");
      return;
    }

    const d = new Date(payload.date);
    if (d.getFullYear() !== state.year || d.getMonth() !== state.month) {
      alert("วันที่ของ Guest Record ต้องอยู่ในเดือนที่กำลังเปิดใช้งานอยู่");
      return;
    }

    state.monthData.guestRecords.push(payload);
    saveLocalMonthData();
    renderAll();
    fillGuestFormDefaults();
    form.elements.guestName.value = "";
    form.elements.roomNo.value = "";
    form.elements.pax.value = 1;
    form.elements.remark.value = "";
    if (firebaseState.connected) {
      await syncMonthToFirebase(false);
    }
  });
}

function setupToolbar() {
  els.yearInput.addEventListener("change", () => changePeriod(Number(els.yearInput.value || new Date().getFullYear()), state.month));
  els.monthInput.addEventListener("change", () => changePeriod(state.year, Number(els.monthInput.value)));

  els.addRecordBtn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(el => el.classList.remove("active"));
    document.querySelector('[data-tab="guestTab"]').classList.add("active");
    document.getElementById("guestTab").classList.add("active");
    els.guestForm.elements.guestName.focus();
  });

  els.clearMonthBtn.addEventListener("click", async () => {
    if (!confirm(`ลบข้อมูลทั้งหมดของ ${getPeriodKey()} ?`)) return;
    state.monthData = createEmptyMonthData();
    saveLocalMonthData();
    renderAll();
    fillGuestFormDefaults();
    if (firebaseState.connected) {
      await syncMonthToFirebase(false);
    }
  });

  els.exportSummaryBtn.addEventListener("click", () => {
    downloadFile(`laya-meal-plan-summary-${getPeriodKey()}.csv`, toCSV(buildSummaryRowsForExport()));
  });
  els.exportGuestBtn.addEventListener("click", () => {
    downloadFile(`laya-meal-plan-guests-${getPeriodKey()}.csv`, toCSV(state.monthData.guestRecords));
  });

  els.firebaseSettingsBtn.addEventListener("click", () => {
    fillFirebaseForm(loadFirebaseConfigFromStorage() || {});
    openFirebaseModal();
  });
  els.syncBtn.addEventListener("click", () => syncMonthToFirebase(true));
}

function setupModal() {
  document.querySelectorAll("[data-close-modal]").forEach(el => {
    el.addEventListener("click", closeFirebaseModal);
  });

  els.firebaseForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const config = {};
    ["apiKey","authDomain","projectId","storageBucket","messagingSenderId","appId"].forEach(key => {
      config[key] = els.firebaseForm.elements[key].value.trim();
    });
    localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config));
    const ok = initFirebaseIfPossible();
    closeFirebaseModal();
    if (ok) {
      await loadMonthFromFirebaseIfConnected();
      renderAll();
      alert("เชื่อม Firebase สำเร็จ และพร้อมใช้งานกับโปรเจกต์ laya-fb");
    } else {
      alert("เชื่อม Firebase ไม่สำเร็จ");
    }
  });
}

async function boot() {
  renderMonthControls();
  setupTabs();
  setupGuestForm();
  setupToolbar();
  setupModal();
  initFirebaseIfPossible();
  loadLocalMonthData();
  await loadMonthFromFirebaseIfConnected();
  renderAll();
  fillGuestFormDefaults();
}
boot();

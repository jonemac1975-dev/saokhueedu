import { readData, writeData } 
from "../../../scripts/services/firebaseService.js";

/* ========= BIẾN ========= */
let gvSel, lopSel, namInp, thangSel, tuanSel;
let tuNgay, denNgay;
let btnThem, btnLuu, btnXoa;
let table;

let fNam, fThang, fTuan;

let editId = null;

let gvMap = {};
let lopMap = {};

/* ========= DOM ========= */
function getDOM() {
  gvSel    = document.getElementById("ldGiaoVien");
  lopSel   = document.getElementById("ldLop");
  namInp   = document.getElementById("ldNam");
  thangSel = document.getElementById("ldThang");
  tuanSel  = document.getElementById("ldTuan");
  tuNgay   = document.getElementById("ldTuNgay");
  denNgay  = document.getElementById("ldDenNgay");

  btnThem  = document.getElementById("btnThem");
  btnLuu   = document.getElementById("btnLuu");
  btnXoa   = document.getElementById("btnXoa");

  table    = document.getElementById("lichdayTable");

  fNam     = document.getElementById("fNam");
  fThang   = document.getElementById("fThang");
  fTuan    = document.getElementById("fTuan");
}

/* ========= TOAST ========= */
function showToast(msg, type="success") {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.className = `toast show ${type}`;
  setTimeout(() => t.classList.remove("show"), 2500);
}

/* ========= INIT NĂM / THÁNG ========= */
function initTime() {
  const y = new Date().getFullYear();
  namInp.value = y;

  thangSel.innerHTML = "";
  fThang.innerHTML   = "";

  for (let m = 1; m <= 12; m++) {
    thangSel.innerHTML += `<option value="${m}">${m}</option>`;
    fThang.innerHTML   += `<option value="${m}">${m}</option>`;
  }

  fNam.innerHTML = `<option value="${y}">${y}</option>`;
  fTuan.innerHTML = `
    <option value="1">1</option>
    <option value="2">2</option>
    <option value="3">3</option>
    <option value="4">4</option>
  `;
}

/* ========= LOAD GIÁO VIÊN + LỚP ========= */
async function loadGV_Lop() {
  // ===== GIÁO VIÊN =====
  const gv = await readData("users/teachers");
  gvSel.innerHTML = `<option value="">-- Chọn giáo viên --</option>`;
  gvMap = {};

  if (gv) {
    Object.entries(gv).forEach(([id, v]) => {
      const name = v.profile?.ho_ten || id;
      gvMap[id] = name;
      gvSel.innerHTML += `<option value="${id}">${name}</option>`;
    });
  }

  // ===== LỚP =====
  const lop = await readData("config/danh_muc/lop");
  lopSel.innerHTML = `<option value="">-- Chọn lớp --</option>`;
  lopMap = {};

  if (lop) {
    Object.entries(lop).forEach(([id, v]) => {
      const name = v.name || id;
      lopMap[id] = name;
      lopSel.innerHTML += `<option value="${id}">${name}</option>`;
    });
  }
}


/* ========= CHECKBOX → INPUT ========= */
function bindDayEvents() {
  document.querySelectorAll(".day-check").forEach(chk => {
    chk.onchange = () => {
      const day = chk.dataset.day;
      const input = document.querySelector(`.day-time[data-day="${day}"]`);
      if (!input) return;

      input.disabled = !chk.checked;
      if (!chk.checked) input.value = "";
    };
  });
}

/* ========= LẤY LỊCH ========= */
function getSchedule() {
  const map = {};
  document.querySelectorAll(".day-check").forEach(chk => {
    if (!chk.checked) return;
    const day = chk.dataset.day;
    const input = document.querySelector(`.day-time[data-day="${day}"]`);
    if (input && input.value.trim()) {
      map[day] = input.value.trim();
    }
  });
  return map;
}

/* ========= Fill lịch ========= */
function fillSchedule(lich = {}) {
  document.querySelectorAll(".day-check").forEach(chk => {
    const day = chk.dataset.day;
    const input = document.querySelector(`.day-time[data-day="${day}"]`);

    if (lich[day]) {
      chk.checked = true;
      input.disabled = false;
      input.value = lich[day];
    } else {
      chk.checked = false;
      input.disabled = true;
      input.value = "";
    }
  });
}



/* ========= CLEAR FORM ========= */
function clearForm() {
  editId = null;

  document.querySelectorAll(".day-check").forEach(c => c.checked = false);
  document.querySelectorAll(".day-time").forEach(i => {
    i.value = "";
    i.disabled = true;
  });

  btnThem.style.display = "inline-block";
  btnLuu.style.display  = "none";
  btnXoa.style.display  = "none";
}

/* ========= SAVE ========= */
async function save(isEdit=false) {
  if (!gvSel.value || !lopSel.value) {
    showToast("Thiếu giáo viên hoặc lớp", "error");
    return;
  }

  const id = `${namInp.value}_${thangSel.value}_${tuanSel.value}_${gvSel.value}_${lopSel.value}`;
  
  await writeData(`lichday/${id}`, {
    giaovien: gvSel.value,
    lop: lopSel.value,
    nam: namInp.value,
    thang: thangSel.value,
    tuan: tuanSel.value,
    tungay: tuNgay.value,
    denngay: denNgay.value,
    lich: getSchedule(),
    updated_at: Date.now()
  });

  clearForm();
  await loadTable();
  showToast(isEdit ? "Đã cập nhật lịch" : "Đã thêm lịch");
}

/* ========= XOÁ ========= */
async function xoa() {
  if (!editId) return;
  if (!confirm("Xóa lịch này?")) return;

  await writeData(`lichday/${editId}`, null);
  clearForm();
  await loadTable();
  showToast("Đã xóa lịch");
}

/* ========= LOAD TABLE ========= */
async function loadTable() {
  table.innerHTML = "";
  const data = await readData("lichday");
  if (!data) return;

  let stt = 1;

  Object.entries(data).forEach(([id, v]) => {
    if (
      v.nam != fNam.value ||
      v.thang != fThang.value ||
      v.tuan != fTuan.value
    ) return;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${stt++}</td>
      <td>${gvMap[v.giaovien] || v.giaovien}</td>
      <td>${lopMap[v.lop] || v.lop}</td>
      ${["t2","t3","t4","t5","t6","t7","cn"]
        .map(d => `<td>${v.lich?.[d] || ""}</td>`).join("")}
    `;

    tr.onclick = () => {
  editId = id;

  gvSel.value    = v.giaovien;
  lopSel.value   = v.lop;
  namInp.value   = v.nam;
  thangSel.value = v.thang;
  tuanSel.value  = v.tuan;
  tuNgay.value   = v.tungay || "";
  denNgay.value  = v.denngay || "";

  fillSchedule(v.lich);   // ⭐ QUAN TRỌNG ⭐

  btnThem.style.display = "none";
  btnLuu.style.display  = "inline-block";
  btnXoa.style.display  = "inline-block";
};


    table.appendChild(tr);
  });
}


/* ========= INIT ========= */
export async function init() {
  getDOM();
  if (!btnThem) return;

  initTime();
  bindDayEvents();

  await loadGV_Lop();
  await loadTable();

  btnThem.onclick = () => save(false);
  btnLuu.onclick  = () => save(true);
  btnXoa.onclick  = xoa;

  fNam.onchange = fThang.onchange = fTuan.onchange = loadTable;
}

import { readData } from "../../../scripts/services/firebaseService.js";

let namSel, thangSel, tuanSel;
let container;
let lopMapName = {};
let tuNgayText, denNgayText;
const days = ["t2","t3","t4","t5","t6","t7","cn"];

export async function init() {

  namSel   = document.getElementById("ldNam");
  thangSel = document.getElementById("ldThang");
  tuanSel  = document.getElementById("ldTuan");
tuNgayText  = document.getElementById("ldTuNgayText");
denNgayText = document.getElementById("ldDenNgayText");
  container = document.getElementById("lichContainer");

  if (!namSel) return;
 await loadDanhMucLop();
  initTime();
  await loadSchedule();
  updateDateRange();

  namSel.onchange = thangSel.onchange = tuanSel.onchange = async () => {
  updateDateRange();
  await loadSchedule();
};
}



/* ===== INIT TIME ===== */
function initTime() {
  const now = new Date();

  namSel.value = now.getFullYear();
  thangSel.value = now.getMonth() + 1;

  const week = Math.ceil(now.getDate() / 7);
  tuanSel.value = week;
}

/* ===== Tính ngày theo Tháng/Tuần ===== */
function updateDateRange() {

  const year  = parseInt(namSel.value);
  const month = parseInt(thangSel.value);
  const week  = parseInt(tuanSel.value);

  if (!year || !month || !week) return;

  const startDay = (week - 1) * 7 + 1;
  const endDay   = week * 7;

  const fromDate = new Date(year, month - 1, startDay);
  const toDate   = new Date(year, month - 1, endDay);

  const format = d =>
    d.getDate().toString().padStart(2, "0") + "/" +
    (d.getMonth()+1).toString().padStart(2, "0") + "/" +
    d.getFullYear();

  tuNgayText.textContent  = format(fromDate);
  denNgayText.textContent = format(toDate);
}
/* ===== LOAD LỊCH ===== */
async function loadSchedule() {

 const gvId = localStorage.getItem("teacher_id");
  if (!gvId) return;

  const data = await readData("lichday");
  if (!data) {
    container.innerHTML = "Chưa có lịch dạy";
    return;
  }

  const list = Object.values(data).filter(v =>
    v.giaovien == gvId &&
    v.nam == namSel.value &&
    v.thang == thangSel.value &&
    v.tuan == tuanSel.value
  );

  if (!list.length) {
    container.innerHTML = "Tuần này chưa có lịch";
    return;
  }

  renderByClass(list);
}


/* ===== LOAD DANH MỤC LỚP ===== */
async function loadDanhMucLop() {

  const data = await readData("config/danh_muc/lop");

  if (!data) return;

  Object.entries(data).forEach(([id, value]) => {
    lopMapName[id] = value.name;
  });
}
/* ===== RENDER ===== */
function renderByClass(list) {

  container.innerHTML = "";

  const lopMap = {};

  list.forEach(v => {
    if (!lopMap[v.lop]) lopMap[v.lop] = [];
    lopMap[v.lop].push(v);
  });

  Object.entries(lopMap).forEach(([lopId, items]) => {

    const lich = items[0].lich || {};

    let html = `
      <div class="lich-box">
        <h3>Lớp: ${lopMapName[lopId] || lopId}</h3>
        <table class="lich-table">
          <tr>
            <th>Ngày</th>
            ${days.map(d => `<th>${d.toUpperCase()}</th>`).join("")}
          </tr>
          <tr>
            <td>Giờ</td>
            ${days.map(d => {
              const time = lich[d] || "";
              const cls  = getTimeStatus(time);
              return `<td class="${cls}">${time}</td>`;
            }).join("")}
          </tr>
        </table>
      </div>
    `;

    container.innerHTML += html;
  });
}

/* ===== TÔ MÀU GIỜ ===== */
function getTimeStatus(timeStr) {
  if (!timeStr) return "";

  const now = new Date();
  const todayIndex = now.getDay(); // CN=0

  const dayMap = {
    1:"t2",2:"t3",3:"t4",4:"t5",5:"t6",6:"t7",0:"cn"
  };

  const todayKey = dayMap[todayIndex];
  const currentHour = now.getHours();

  const match = timeStr.match(/(\d{1,2})h/);
  if (!match) return "";

  const startHour = parseInt(match[1]);

  if (timeStr && todayKey) {

    if (currentHour >= startHour && currentHour < startHour + 2) {
      return "now-class";       // đang dạy
    }

    if (currentHour < startHour) {
      return "next-class";      // sắp dạy
    }
  }

  return "";
}
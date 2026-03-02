import { readData } from "../../../scripts/services/firebaseService.js";

export async function init() {

  const student = JSON.parse(localStorage.getItem("studentLogin"));
  if (!student) return;

  const data = await readData(
    `users/students/${student.id}/kiemtra`
  );

  if (!data) {
    document.getElementById("diemTableBody").innerHTML =
      "<tr><td colspan='5'>Chưa có dữ liệu</td></tr>";
    return;
  }

  // 🔥 load danh mục giáo viên + lớp
  const teachers = await readData("users/teachers");
  const lopDanhMuc = await readData("config/danh_muc/lop");

  renderTable(data, teachers, lopDanhMuc);
  renderCharts(data, teachers);
}

/* ================= TABLE ================= */

function renderTable(data, teachers, lopDanhMuc) {

  const tbody = document.getElementById("diemTableBody");
  tbody.innerHTML = "";

  const list = Object.values(data).sort(
    (a, b) => new Date(a.ngay) - new Date(b.ngay)
  );

  list.forEach((item, index) => {

    const tr = document.createElement("tr");

    const diemClass =
      item.diem >= 5 ? "score-green" : "score-red";

    // 🔥 map tên giáo viên
    const tenGV =
      teachers?.[item.giao_vien]?.profile?.ho_ten
      || item.giao_vien;

    // 🔥 map tên lớp
    const tenLop =
      lopDanhMuc?.[item.lop]?.name
      || item.lop
      || "";

    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${tenGV}</td>
      <td>${tenLop}</td>
      <td class="${diemClass}">${item.diem}</td>
      <td>${formatDate(item.ngay)}</td>
    `;

    tbody.appendChild(tr);
  });
}

/* ================= CHART ================= */

function renderCharts(data, teachers) {

  const container = document.getElementById("chartContainer");
  container.innerHTML = "";

  const grouped = {};

  Object.values(data).forEach(item => {
    if (!grouped[item.giao_vien]) {
      grouped[item.giao_vien] = [];
    }
    grouped[item.giao_vien].push(item);
  });

  Object.entries(grouped).forEach(([gvId, list]) => {

    list.sort((a,b)=> new Date(a.ngay) - new Date(b.ngay));

    const tenGV =
      teachers?.[gvId]?.profile?.ho_ten
      || gvId;

    const box = document.createElement("div");
    box.className = "chart-box";

    const title = document.createElement("h4");
    title.innerText = `Giáo viên: ${tenGV}`;
    box.appendChild(title);

    const canvas = document.createElement("canvas");
    box.appendChild(canvas);

    container.appendChild(box);

    new Chart(canvas, {
      type: "line",
      data: {
        labels: list.map(i => formatDate(i.ngay)),
        datasets: [{
          label: "Điểm",
          data: list.map(i => i.diem),
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            min: 0,
            max: 10
          }
        }
      }
    });
  });
}

/* ================= UTIL ================= */

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN");
}
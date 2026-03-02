import { readData } from "../../../scripts/services/firebaseService.js";

const student = JSON.parse(localStorage.getItem("studentLogin"));

init();

async function init() {

  if (!student) return;

  const body = document.getElementById("diemTestBody");
  const chartWrap = document.getElementById("testChartWrap");

  const data = await readData(
    `users/students/${student.id}/test`
  );

  if (!data) {
    body.innerHTML =
      `<tr><td colspan="5">Chưa có dữ liệu test</td></tr>`;
    return;
  }

  const teachers =
    await readData("users/teachers") || {};

   let stt = 1;
  const teacherScoreMap = {};

  Object.values(data).forEach(item => {

    const tenGV =
      teachers?.[item.giao_vien]?.profile?.ho_ten
      || item.giao_vien;

        const ngay = new Date(item.ngay)
      .toLocaleDateString("vi-VN");

    body.innerHTML += `
      <tr>
        <td>${stt++}</td>
        <td>${tenGV}</td>
        <td><b>${item.diem}</b></td>
        <td>${ngay}</td>
      </tr>
    `;

    if (!teacherScoreMap[tenGV])
      teacherScoreMap[tenGV] = [];

    teacherScoreMap[tenGV].push(item.diem);
  });

  renderCharts(chartWrap, teacherScoreMap);
}

/* ================= CHART ================= */

function renderCharts(container, dataMap) {

  container.innerHTML = "";

  Object.entries(dataMap).forEach(([teacher, scores]) => {

    const canvas = document.createElement("canvas");
    container.appendChild(canvas);

    new Chart(canvas, {
      type: "line",
      data: {
        labels: scores.map((_, i) => `Lần ${i+1}`),
        datasets: [{
          label: teacher,
          data: scores,
          tension: 0.3
        }]
      },
      options: {
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
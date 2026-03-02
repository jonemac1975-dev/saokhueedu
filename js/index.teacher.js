import { readData } from "../scripts/services/firebaseService.js";

function convertDriveToPreview(url) {
  if (!url) return "";

  const match = url.match(/\/file\/d\/([^/]+)/);
  if (match) {
    return `https://drive.google.com/file/d/${match[1]}/preview`;
  }

  return url;
}


async function initTeacherSidebar() {

  const teacherId = localStorage.getItem("teacher_id");
  if (!teacherId) return;

  // ===== LOAD DATA ĐÚNG NODE =====
  const teacherData = await readData("teacher/" + teacherId);
  if (!teacherData) return;

  loadMenu("gv-baigiang", teacherData.baigiang, "baigiang");
  loadMenu("gv-baitap", teacherData.baitap, "baitap");
  loadMenu("gv-kiemtra", teacherData.kiemtra, "kiemtra");
}

function loadMenu(elementId, data, type) {

  const ul = document.getElementById(elementId);
  if (!ul || !data) return;

  ul.innerHTML = "";

  Object.entries(data).forEach(([id, item]) => {

    const li = document.createElement("li");
    li.textContent = item.title || item.tieude || "Không tên";

    li.onclick = () => {

      if (type === "baigiang") {
        loadLesson(item);
      }

      if (type === "baitap") {
        loadLesson(item);
      }

      if (type === "kiemtra") {
        loadExam(item);
      }
    };

    ul.appendChild(li);
  });
}

/* ================= LOAD BÀI GIẢNG / BÀI TẬP ================= */

function loadLesson(item) {

  const main = document.getElementById("main");
  const mediaBox = document.getElementById("teacherMedia");
  main.classList.add("working-mode");


  // Ẩn grid
  const grid = document.getElementById("mainGrid");
  if (grid) grid.style.display = "none";

  // Load HTML nội dung
  main.innerHTML = `
  <div class="lesson-content">
    ${item.content_html || ""}
  </div>
`;


  // Hiện media
 // const mediaBox = document.getElementById("teacherMedia");

if (item.media) {

  mediaBox.style.display = "grid";

  const mp3 = document.getElementById("gvMp3");
  const mp4 = document.getElementById("gvMp4");
  const yt  = document.getElementById("gvYoutube");

  mp3.textContent = "MP3 - " + item.title;
  mp4.textContent = "MP4 - " + item.title;
  yt.textContent  = "YouTube - " + item.title;

  mp3.dataset.url = item.media.mp3 || "";
  mp4.dataset.url = item.media.mp4 || "";
  yt.dataset.url  = item.media.youtube || "";

} else {

  // 🔥 Nếu không phải bài giảng → ẩn media
  mediaBox.style.display = "none";

  document.getElementById("teacherPlayer").innerHTML = "";
}


}

/* ================= LOAD KIỂM TRA ================= */

function loadExam(item) {

  const main = document.getElementById("main");

  const grid = document.getElementById("mainGrid");
  if (grid) grid.style.display = "none";

  main.innerHTML = item.noidung || "";
}

initTeacherSidebar();


document.addEventListener("click", function(e){

  const id = e.target.id;
  if (!["gvMp3","gvMp4","gvYoutube"].includes(id)) return;

  const rawUrl = e.target.dataset.url;
  if (!rawUrl) return;

  const box = document.getElementById("teacherPlayer");

  /* ================= YOUTUBE ================= */
  if (id === "gvYoutube") {

    const videoId = rawUrl.split("v=")[1]?.split("&")[0];

    box.innerHTML = `
      <iframe width="100%" height="250"
        src="https://www.youtube.com/embed/${videoId}"
        frameborder="0"
        allowfullscreen>
      </iframe>
    `;

  }

  /* ================= MP4 ================= */
  else if (id === "gvMp4") {

    const previewUrl = convertDriveToPreview(rawUrl);

    box.innerHTML = `
      <iframe 
        src="${previewUrl}"
        width="100%"
        height="250"
        allow="autoplay">
      </iframe>
    `;

  }

  /* ================= MP3 ================= */
  else if (id === "gvMp3") {

    const previewUrl = convertDriveToPreview(rawUrl);

    box.innerHTML = `
      <iframe 
        src="${previewUrl}"
        width="100%"
        height="80"
        allow="autoplay">
      </iframe>
    `;

  }

});

import { readData, writeData } 
from "../../../scripts/services/firebaseService.js";

/* ================= CONST ================= */
const teacherId = localStorage.getItem("teacher_id");
if (!teacherId) location.href = "../../index.html";

let currentEditId = null;

/* ================= INIT ================= */
export async function init() {
  await loadTeacherName();
  await loadDanhMuc();
  await loadDanhSach();
  initEditor();

  kt_add.onclick  = addBaiKiemTra;
  kt_save.onclick = saveBaiKiemTra;
}

/* ================= LOAD TEACHER ================= */
async function loadTeacherName() {
  const d = await readData(`teacher/${teacherId}`);
  kt_giaovien.value =
    d?.hoten || d?.profile?.hoten || teacherId;
}

/* ================= DANH MỤC ================= */
async function loadDanhMuc() {
  await loadSelect("monhoc", "kt_monhoc");
  await loadSelect("lop", "kt_lop");
  await loadSelect("kythi", "kt_kythi");
}

async function loadSelect(dm, selectId) {
  const sel = document.getElementById(selectId);
  sel.innerHTML = `<option value="">-- Chọn --</option>`;

  const data = await readData(`config/danh_muc/${dm}`);
  if (!data) return;

  Object.entries(data).forEach(([id, item]) => {
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = item.name;
    sel.appendChild(opt);
  });
}

/* ================= ADD ================= */
async function addBaiKiemTra() {
  const data = getFormData();
  if (!data.tieude) {
    showToast("Chưa nhập tiêu đề", "error");
    return;
  }

  const id = "kt_" + Date.now();
  await writeData(`teacher/${teacherId}/kiemtra/${id}`, data);

  showToast("Đã thêm bài kiểm tra");
  clearForm();
  loadDanhSach();
}

/* ================= SAVE ================= */
async function saveBaiKiemTra() {
  if (!currentEditId) {
    showToast("Chưa chọn bài để sửa", "error");
    return;
  }

  const data = getFormData();
  await writeData(
    `teacher/${teacherId}/kiemtra/${currentEditId}`,
    data
  );

  showToast("Đã lưu thay đổi");
  clearForm();
  loadDanhSach();
}

/* ================= LIST ================= */
async function loadDanhSach() {
  const tbody = kt_list;
  tbody.innerHTML = "";

  const data = await readData(`teacher/${teacherId}/kiemtra`);
  if (!data) return;

  let i = 1;
  Object.entries(data).forEach(([id, item]) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i++}</td>
      <td>${item.tieude || ""}</td>
      <td>${item.ngay || ""}</td>
      <td>
        <button onclick="window.editKT('${id}')">Sửa</button>
        <button onclick="window.deleteKT('${id}')">Xóa</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/* ================= EDIT / DELETE ================= */
window.editKT = async id => {
  const d = await readData(`teacher/${teacherId}/kiemtra/${id}`);
  if (!d) return;

  currentEditId = id;
  kt_monhoc.value   = d.monhoc || "";
  kt_lop.value      = d.lop || "";
  kt_kythi.value    = d.kythi || "";
  kt_tieude.value   = d.tieude || "";
  kt_ngay.value     = d.ngay || "";
  kt_noidung.innerHTML = d.noidung || "";
};

window.deleteKT = async id => {
  if (!confirm("Xóa bài này?")) return;
  await writeData(`teacher/${teacherId}/kiemtra/${id}`, null);
  showToast("Đã xóa bài", "error");
  clearForm();
  loadDanhSach();
};

/* ================= FORM ================= */
function getFormData() {
  return {
    monhoc: kt_monhoc.value,
    lop: kt_lop.value,
    kythi: kt_kythi.value,
    tieude: kt_tieude.value,
    ngay: kt_ngay.value,
    noidung: kt_noidung.innerHTML,
    updatedAt: Date.now()
  };
}

function clearForm() {
  currentEditId = null;
  kt_tieude.value = "";
  kt_ngay.value = "";
  kt_noidung.innerHTML = "";
}

/* ================= EDITOR (Y HỆT BAITAP) ================= */
function initEditor() {
  const content = kt_noidung;
  const fileInput = document.getElementById("fileInput");

  btnChooseFile.onclick = () => fileInput.click();

  function insertAtCursor(html) {
    content.focus();
    document.execCommand("insertHTML", false, html);
  }

  fileInput.onchange = () => {
    const f = fileInput.files[0];
    if (!f) return;

    const r = new FileReader();
    r.onload = e => {
      let html = "";
      if (f.type.startsWith("image/"))
        html = `<img src="${e.target.result}" style="max-width:70%;display:block;margin:16px auto">`;
      else if (f.type.startsWith("audio/"))
        html = `<audio controls src="${e.target.result}" style="width:70%;display:block;margin:16px auto"></audio>`;
      else if (f.type.startsWith("video/"))
        html = `<video controls src="${e.target.result}" style="width:70%;display:block;margin:16px auto"></video>`;
      else return alert("Chỉ hỗ trợ ảnh / audio / video");

      insertAtCursor(html);
      fileInput.value = "";
    };
    r.readAsDataURL(f);
  };

  btnAudio.onclick = () => insertDrive("audio", 60);
  btnMp4.onclick   = () => insertDrive("video", 340);

  function insertDrive(type, h) {
    const url = prompt(`Dán link ${type.toUpperCase()} Google Drive`);
    if (!url) return;
    const m = url.match(/\/d\/([^/]+)/) || url.match(/id=([^&]+)/);
    if (!m) return alert("Link sai");

    insertAtCursor(`
      <iframe src="https://drive.google.com/file/d/${m[1]}/preview"
      style="width:70%;height:${h}px;display:block;margin:16px auto;border:none"></iframe>
    `);
  }

  btnYoutube.onclick = () => {
    const url = prompt("Link YouTube");
    if (!url) return;
    const id = url.includes("v=")
      ? url.split("v=")[1].split("&")[0]
      : url.split("/").pop();

    insertAtCursor(`
      <iframe src="https://www.youtube.com/embed/${id}"
      style="width:70%;height:360px;display:block;margin:16px auto"
      allowfullscreen></iframe>
    `);
  };

  btnPdf.onclick = () => {
    const url = prompt("Link PDF Drive");
    const m = url?.match(/\/d\/([^/]+)/);
    if (!m) return;

    insertAtCursor(`
      <iframe src="https://drive.google.com/file/d/${m[1]}/preview"
      style="width:100%;height:600px;border:none;margin:16px 0"></iframe>
    `);
  };

  btnPptx.onclick = () => {
    const url = prompt("Link PPT / HTML / Flip");
    if (url) insertAtCursor(url);
  };

  btnPreview.onclick = () => {
    if (!content.innerHTML.trim())
      return showToast("Chưa có nội dung", "error");

    localStorage.setItem("lesson_preview", JSON.stringify({
      name: kt_tieude.value || "Bài kiểm tra",
      meta: `Môn: ${kt_monhoc.value} | Lớp: ${kt_lop.value}`,
      content: content.innerHTML
    }));
    window.open("/preview.html", "_blank");
  };
}


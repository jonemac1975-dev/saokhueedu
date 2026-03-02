import { readData, updateData }
from "../../scripts/services/firebaseService.js";

import { compressImage }
from "../../scripts/utils/imageCompress.js";

/* ===== SESSION ===== */
const studentLogin =
  JSON.parse(localStorage.getItem("studentLogin"));

if (!studentLogin || !studentLogin.id) {
  location.href = "../../index.html";
}

const studentId = studentLogin.id;
/* ===== DOM ===== */
const username = document.getElementById("username");
const avatarFile = document.getElementById("avatarFile");
const avatarPreview = document.getElementById("avatarPreview");
const msg = document.getElementById("msg");

const ho_ten = document.getElementById("ho_ten");
const gioi_tinh = document.getElementById("gioi_tinh");
const ngay_sinh = document.getElementById("ngay_sinh");
const dien_thoai = document.getElementById("dien_thoai");
const gmail = document.getElementById("gmail");
const facebook = document.getElementById("facebook");
const zalo = document.getElementById("zalo");
const truong_hoc = document.getElementById("truong_hoc");
const lop = document.getElementById("lop");
const hinh_thuc_dong_phi = document.getElementById("hinh_thuc_dong_phi");

username.value = studentId;

let avatarBase64 = null;


/* ===== LOAD DANH MỤC ===== */
async function loadDanhMuc() {
  const lopData = await readData("config/danh_muc/lop");
  fillSelect(lop, lopData);
}

function fillSelect(select, data) {
  if (!data) return;

  select.innerHTML = `<option value="">-- Chọn lớp --</option>`;

  Object.entries(data).forEach(([key, value]) => {
    const o = document.createElement("option");

    o.value = key;                // ✅ lưu ID
    o.textContent = value.name;   // ✅ hiển thị tên

    select.appendChild(o);
  });
}

/* ===== LOAD PROFILE ===== */
(async function init() {

  await loadDanhMuc();

  const profile =
    await readData(`users/students/${studentId}/profile`);

  if (!profile) return;

  ho_ten.value = profile.ho_ten || "";
  gioi_tinh.value = profile.gioi_tinh || "";
  ngay_sinh.value = profile.ngay_sinh || "";
  dien_thoai.value = profile.dien_thoai || "";
  gmail.value = profile.gmail || "";
  facebook.value = profile.facebook || "";
  zalo.value = profile.zalo || "";
  truong_hoc.value = profile.truong_hoc || "";
  lop.value = profile.lop || "";
  hinh_thuc_dong_phi.value =
    profile.hinh_thuc_dong_phi || "";

  if (profile.mon_hoc) {
    profile.mon_hoc.forEach(m => {
      const cb =
        document.querySelector(`input[value="${m}"]`);
      if (cb) cb.checked = true;
    });
  }

  if (profile.avatar) {
    avatarPreview.src = profile.avatar;
  }

})();


/* ===== AVATAR ===== */
avatarFile.onchange = async e => {
  const file = e.target.files[0];
  if (!file) return;

  const compressed = await compressImage(file);

  const reader = new FileReader();
  reader.onload = () => {
    avatarBase64 = reader.result;     // Lưu base64
    avatarPreview.src = avatarBase64; // Preview đúng dữ liệu sẽ lưu
  };

  reader.readAsDataURL(compressed);
};


window.removeAvatar = () => {
  avatarBase64 = null;
  avatarPreview.src = "";
};


/* ===== COLLECT ===== */
function collectData() {
  const mon = [...document.querySelectorAll("input[type=checkbox]:checked")]
    .map(i => i.value);

  return {
    ho_ten: ho_ten.value.trim(),
    gioi_tinh: gioi_tinh.value,
    ngay_sinh: ngay_sinh.value,
    dien_thoai: dien_thoai.value.trim(),
    gmail: gmail.value.trim(),
    facebook: facebook.value.trim(),
    zalo: zalo.value.trim(),
    truong_hoc: truong_hoc.value.trim(),
    mon_hoc: mon,
    lop: lop.value,
    hinh_thuc_dong_phi: hinh_thuc_dong_phi.value,
    updated_at: Date.now()
  };
}

/* ===== MESSAGE ===== */
function showMsg(text, ok = true) {
  msg.innerText = text;
  msg.style.display = "block";
  msg.style.position = "fixed";
  msg.style.top = "20px";
  msg.style.right = "20px";
  msg.style.zIndex = 9999;

  msg.style.background = ok ? "#e8f5e9" : "#ffebee";
  msg.style.color = ok ? "#2e7d32" : "#c62828";
  msg.style.padding = "10px 16px";
  msg.style.borderRadius = "6px";
  msg.style.boxShadow = "0 4px 12px rgba(0,0,0,.15)";

  setTimeout(() => msg.style.display = "none", 3000);
}


/* ===== ĐĂNG KÝ (GHI THÊM FIELD) ===== */
window.register = async function () {
  try {
    const data = collectData();

    if (avatarBase64) {
  data.avatar = avatarBase64;
}


    data.created_at ??= Date.now();
    data.updated_at = Date.now();

    await updateData(`users/students/${studentId}/profile`, data);
    showMsg("Đăng ký hồ sơ thành công");

  } catch (e) {
   
    showMsg("Lỗi khi đăng ký hồ sơ", false);
  }
};

/* ===== CẬP NHẬT ===== */
window.updateProfile = async function () {
  try {
    const data = collectData();

    if (avatarBase64) {
  data.avatar = avatarBase64;
}


    data.updated_at = Date.now();

    await updateData(`users/students/${studentId}/profile`, data);
    showMsg("Cập nhật hồ sơ thành công");

  } catch (e) {
    
    showMsg("Lỗi khi cập nhật hồ sơ", false);
  }
};

window.goHome = () => location.href = "../../index.html";
window.gopage = () => location.href = "./hocvien.html";

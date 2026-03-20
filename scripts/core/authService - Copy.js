import { readData, writeData, updateData } from "../services/firebaseService.js";
import { hashPass } from "../utils/crypto.js";

/* ===== TẠO ID KỸ THUẬT ===== */
function genId(prefix) {
  return `${prefix}_${Date.now()}`;
}

/* ===== ĐĂNG KÝ ===== */
export async function registerUser(role, username, password) {
  const basePath = `users/${role}`;
  const users = await readData(basePath) || {};

  // dò trùng username
  for (const id in users) {
    if (users[id].auth?.username === username) {
      throw "Tên đăng nhập đã tồn tại";
    }
  }

  const id = genId(role === "teachers" ? "gv" : "hv");
  const pass_hash = await hashPass(password);

  await writeData(`${basePath}/${id}`, {
    auth: {
      username,
      pass_hash,
      created_at: Date.now(),
      status: "active"
    },
    profile: {},
    meta: { last_update: Date.now() }
  });

  return id;
}

/* ===== ĐĂNG NHẬP ===== */
export async function loginUser(role, username, password) {
  const basePath = `users/${role}`;
  const users = await readData(basePath);

  if (!users) throw "Không có dữ liệu";

  const pass_hash = await hashPass(password);

  for (const id in users) {
    const u = users[id];
    if (u.auth?.username === username && u.auth.pass_hash === pass_hash) {
      return { id, role };
    }
  }

  throw "Sai tên đăng nhập hoặc mật khẩu";
}

/* ===== ĐỔI PASS ===== */
export async function changePassword(role, id, newPass) {
  const pass_hash = await hashPass(newPass);
  await updateData(`users/${role}/${id}/auth`, {
    pass_hash,
    updated_at: Date.now()
  });
}

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCYbp4nOHhDbgFN68SW-RdE9M-HGWITFKU",
  authDomain: "saokhueedu.firebaseapp.com",
  databaseURL: "https://saokhueedu-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "saokhueedu",
  storageBucket: "saokhueedu.firebasestorage.app",
  messagingSenderId: "490120669688",
  appId: "1:490120669688:web:7a13cd26c094681f09ce0d"
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

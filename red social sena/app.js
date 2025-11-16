import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAF02qA-D0ofDCGt6c9qM7MJa6iFCRs8hw",
  authDomain: "redsocial-sena.firebaseapp.com",
  projectId: "redsocial-sena",
  storageBucket: "redsocial-sena.appspot.com",
  messagingSenderId: "9507332533",
  appId: "1:9507332533:web:05ed65d4ca5d533b50b9fc",
  measurementId: "G-6BS73S4KNG"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- REGISTRO ---
const registerBtn = document.getElementById("register");
if (registerBtn) {
  registerBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Registro exitoso ✅");
      window.location.href = "index.html";
    } catch (error) {
      alert("Error: " + error.message);
    }
  });
}

// --- LOGIN ---
const loginBtn = document.getElementById("login");
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "index.html";
    } catch (error) {
      alert("Error: " + error.message);
    }
  });
}

// --- CERRAR SESIÓN ---
const logoutBtn = document.getElementById("logout");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "login.html";
  });
}

// --- PUBLICACIONES ---
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const emailSpan = document.getElementById("user-email");
    if (emailSpan) emailSpan.textContent = "Usuario: " + user.email;

    const postsDiv = document.getElementById("posts");
    if (postsDiv) {
      // Mostrar publicaciones ordenadas por fecha (timestamp descendente)
      const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      postsDiv.innerHTML = "";
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const postEl = document.createElement("div");
        postEl.className = "post";
        postEl.innerHTML = `<strong>${data.author || "Anónimo"}:</strong><br>${data.text}`;

        // Botón de borrar solo si es tu publicación
        if (data.author === user.email) {
          const delBtn = document.createElement("button");
          delBtn.className = "delete-btn";
          delBtn.textContent = "X";
          delBtn.onclick = async () => {
            await deleteDoc(doc(db, "posts", docSnap.id));
            location.reload();
          };
          postEl.appendChild(delBtn);
        }

        postsDiv.appendChild(postEl);
      });
    }

    // Crear publicación
    const postBtn = document.getElementById("postBtn");
    if (postBtn) {
      postBtn.addEventListener("click", async () => {
        const text = document.getElementById("postText").value.trim();
        if (text === "") return alert("Escribe algo antes de publicar");
        await addDoc(collection(db, "posts"), {
          text,
          author: user.email,
          timestamp: new Date()
        });
        alert("Publicado ✅");
        location.reload();
      });
    }

  } else {
    if (
      !window.location.href.includes("login.html") &&
      !window.location.href.includes("registro.html")
    ) {
      window.location.href = "login.html";
    }
  }
});

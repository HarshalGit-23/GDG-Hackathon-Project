import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup }
from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs }
from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

/* 🔥 PASTE YOUR FIREBASE CONFIG HERE */
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "XXXX",
  appId: "XXXX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

/* 🔐 GOOGLE LOGIN */
window.googleLogin = function () {
  signInWithPopup(auth, provider)
    .then(result => {
      alert("Welcome " + result.user.displayName);
    })
    .catch(error => console.log(error));
};

/* ➕ ADD HELP REQUEST */
window.addRequest = async function () {
  const name = document.getElementById("name").value;
  const helpType = document.getElementById("helpType").value;
  const description = document.getElementById("description").value;

  navigator.geolocation.getCurrentPosition(async position => {
    await addDoc(collection(db, "helpRequests"), {
      name,
      helpType,
      description,
      lat: position.coords.latitude,
      lng: position.coords.longitude
    });

    alert("Help request submitted!");
    loadRequests();
  });
};

/* 🗺️ MAP USING LEAFLET */
let map;

function initMap() {
  map = L.map('map').setView([20.5937, 78.9629], 5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);
}

/* 📍 LOAD REQUESTS FROM FIRESTORE */
async function loadRequests() {
  const snapshot = await getDocs(collection(db, "helpRequests"));
  snapshot.forEach(doc => {
    const data = doc.data();
    L.marker([data.lat, data.lng])
      .addTo(map)
      .bindPopup(`<b>${data.helpType}</b><br>${data.description}`);
  });
}

window.onload = () => {
  initMap();
  loadRequests();
};

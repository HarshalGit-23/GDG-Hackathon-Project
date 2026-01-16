import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

/* 🔥 FIREBASE CONFIG */
const firebaseConfig = {
  apiKey: "AIzaSyAsP9n4alDFMWyThC0yuFt7rYu6Mn56Jeo",
  authDomain: "community-help-finder.firebaseapp.com",
  projectId: "community-help-finder-c7dca"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* UI TOGGLE */
window.showNeedyForm = () => {
  needyForm.classList.remove("hidden");
  volunteerForm.classList.add("hidden");
};

window.showVolunteerForm = () => {
  volunteerForm.classList.remove("hidden");
  needyForm.classList.add("hidden");
};

/* GOOGLE MAP */
let map;
let markers = [];

window.initMap = function () {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 20.5937, lng: 78.9629 },
    zoom: 5
  });

  listenForRequests();
};

/* SUBMIT NEEDY REQUEST (CURRENT LOCATION) */
window.submitNeedy = function () {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(async position => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    const name = n_name.value;
    const phone = n_phone.value;
    const type = n_type.value;
    const desc = n_desc.value;

    if (!name || !phone || !desc) {
      alert("Fill all fields");
      return;
    }

    await addDoc(collection(db, "requests"), {
      name,
      phone,
      type,
      desc,
      lat,
      lng,
      time: Date.now()
    });

    alert("Request submitted! Volunteers can see you on map.");
    needyForm.classList.add("hidden");
  }, () => {
    alert("Location permission denied");
  });
};

/* REGISTER VOLUNTEER */
window.registerVolunteer = function () {
  volunteerForm.classList.add("hidden");
  alert("You are registered as volunteer. Live requests shown on map.");

  google.maps.event.trigger(map, "resize");
  map.setZoom(6);
};

/* REAL-TIME MAP UPDATE */
function listenForRequests() {
  onSnapshot(collection(db, "requests"), snapshot => {
    markers.forEach(m => m.setMap(null));
    markers = [];

    snapshot.forEach(doc => {
      const d = doc.data();

      const marker = new google.maps.Marker({
        position: { lat: d.lat, lng: d.lng },
        map
      });

      const info = new google.maps.InfoWindow({
        content: `
          <b>${d.type}</b><br>
          ${d.name}<br>
          ${d.phone}<br>
          ${d.desc}
        `
      });

      marker.addListener("click", () => {
        info.open(map, marker);
      });

      markers.push(marker);
    });
  });
}


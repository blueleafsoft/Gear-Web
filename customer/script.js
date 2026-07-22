import { db } from "../firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const token = new URLSearchParams(window.location.search).get("token");

const ref = doc(db, "Customers", token);
const snap = await getDoc(ref);

if (snap.exists()) {
    const data = snap.data();
    document.getElementById("customer_name").textContent = data.Name;
    document.getElementById("customer_address").textContent = data.Address;
} else {
    document.getElementById("customer_name").textContent = "Customer not found";
}

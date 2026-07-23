import { db } from "../firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

async function getCustomerDetails() {
    const token = new URLSearchParams(window.location.search).get("token");
    console.log("Token:", token);

    if (!token) {
        console.error("Token Not ");
        return;
    }

    const ref = doc(db, "Customers", token);
    const snap = await getDoc(ref);

    console.log("Exists:", snap.exists());

    if (snap.exists()) {
        const data = snap.data();
        console.log("Data:", data); // டேட்டா வருகிறதா என்று பார்க்க

        // HTML-இல் டேட்டாவை செட் செய்ய
        document.getElementById("customerName").textContent = data.Name || "Name Not Found";
        document.getElementById("customerAddress").textContent = data.Address || "Address Not Found";
        
        const uid = data.User_Id;
    } else {
        document.getElementById("customerAddress").textContent = "Customer not found";
    }
}

// Function-ஐ அழைக்கவும்
getCustomerDetails();
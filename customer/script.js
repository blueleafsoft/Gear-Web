import { db } from "../firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

async function getuser(customer) {
    const uid = customer.User_Id;

    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
        const user = snap.data();

        document.getElementById("garageName").textContent = user.name || "";
        document.getElementById("garageDesc").textContent = user.user_description || "";

        document.getElementById("customerName").textContent = customer.Name || "Name Not Found";
        document.getElementById("customerAddress").textContent = customer.Address || "Address Not Found";
    }
}


async function getCustomerDetails() {
    const token = new URLSearchParams(window.location.search).get("token");
    
    if (!token) {
        console.error("Token Not Found");
        return;
    }

    try {
        const ref = doc(db, "Customers", token);
        const snap = await getDoc(ref);
        
        if (snap.exists()) {
    					 await getuser(snap);
								} else {
          document.getElementById("customerName").textContent = "Customer Not Found";
          document.getElementById("customerAddress").textContent = "";
        }
    } catch (error) {
        console.error("Error fetching document:", error);
    }
}

getCustomerDetails();
						
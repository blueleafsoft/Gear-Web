import { db } from "../firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

async function getCustomerDetails() {
    // URL-ல் இருந்து token எடுக்கிறோம்
    const token = new URLSearchParams(window.location.search).get("token");
    console.log("Token:", token);

    if (!token) {
        console.error("Token Not Found");
        alert("Invalid Token! URL-ஐ சரிபார்க்கவும்."); // alter-ஐ alert ஆக மாற்றியாச்சு
        return;
    }

    try {
        const ref = doc(db, "Customers", token);
        const snap = await getDoc(ref);

        console.log("Exists:", snap.exists());

        if (snap.exists()) {
            const data = snap.data();
            console.log("Data:", data); 
            
            // மொபைலில் செக் செய்வதற்கான Alert
            alert("டேட்டா வந்துள்ளது! பெயர்: " + data.Name); 
        
            // HTML-ல் டேட்டாவை செட் செய்வது
            document.getElementById("customerName").textContent = data.Name || "Name Not Found";
            document.getElementById("customerAddress").textContent = data.Address || "Address Not Found";
            
            const uid = data.User_Id;
        } else {
            alert("Customer data கிடைக்கவில்லை!");
            document.getElementById("customerName").textContent = "Customer Not Found";
            document.getElementById("customerAddress").textContent = "";
        }
    } catch (error) {
        console.error("Error fetching document:", error);
        alert("எரர் வந்துள்ளது: " + error.message);
    }
}

getCustomerDetails();

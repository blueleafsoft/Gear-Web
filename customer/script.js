import { db } from "../firebase.js";
import { doc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

async function getuser(customer) {
    const uid = customer.User_Id;
    //alert(JSON.stringify(customer));
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
        const user = snap.data();
					//alert(JSON.stringify(user));
						
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
    					 await Promise.all([getuser(snap.data()),getVehicle(token)]);
								} else {
          document.getElementById("customerName").textContent = "Customer Not Found";
          document.getElementById("customerAddress").textContent = "";
        }
    } catch (error) {
        console.error("Error fetching document:", error);
    }
}

getCustomerDetails();

const vehicleList = document.getElementById("vehicleList");

async function getVehicle(customerId) {
    try {
        
        const vehicleRef = collection(db, "Customers", customerId, "Workshop");
        const vehicleSnap = await getDocs(vehicleRef);
        
        vehicleSnap.forEach((doc) => {
            const item = doc.data();
            console.log(item);
            //alert(JSON.stringify(item, null, 2));

            let bill = item.Bill_Amount || 0;
            let pay = item.Payment_Amount || 0;
            let isPaid = bill == pay;

            let credit = bill - pay;
            let balance = pay - bill;
            let isCredit = bill > pay;

            let htmlContent;

												if (isPaid) {
               htmlContent = `<p class="balance-text">Paid : ₹${pay}</p>`;
            } else if (isCredit) {
               htmlContent = `<p class="credit-text">Credit : ₹${credit}</p>`;
            } else {
               htmlContent = `<p class="balance-text">Balance : ₹${balance}</p>`;
            }
            
            const card = document.createElement("div");
            card.className = "adapter";

            card.innerHTML = `
                <div class="horizontal" style="width:100%;">
                    <div class="left-bar"></div>
                    <div class="icon">
                        <span class="material-icons" style="font-size:42px;">directions_car</span>
                    </div>
                    <div class="vertical">
                        <h4>${item.Brand}</h4>
                        <p>${item.Model}</p>
                        ${htmlContent}
                    </div>
                    <div class="amount">
                        <p>₹${bill}</p>
                    </div>
                </div>
            `;

            card.addEventListener("click", () => {
                console.log("Selected Item:", item.Brand);
            });

            vehicleList.appendChild(card);
        });

    } catch (error) {
        console.error("Error fetching vehicles:", error);
    }
}




async function getVehiclexx(customerId) {
    alert("1: Function Called");

    try {
        alert("2: Customer ID = " + customerId);

        const vehicleRef = collection(db, "Customers", customerId, "Workshop");
        alert("3: Collection Created");

        const vehicleSnap = await getDocs(vehicleRef);
        alert("4: Documents = " + vehicleSnap.size);

    } catch (e) {
        alert("ERROR: " + e.message);
        console.error(e);
    }
}			


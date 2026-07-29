import { db } from "../firebase.js";
import { doc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const token = params.get("token");
const id = params.get("id");

const vehicleList = document.getElementById("vehicleList");
const sparesList = document.getElementById("serviceList");


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

		let credit = Math.abs(customer.credit);
        if (customer.credit > 0) {
		   document.getElementById("creditText").textContent = `₹${credit || 0}`;
        } else {
           document.getElementById("balanceText").textContent = `₹${credit || 0}`;
	    }
    }
}


async function getCustomerDetails() {
    if (!token) {
        console.error("Token Not Found");
        return;
    }

    try {
        const ref = doc(db, "Customers", token);
        const snap = await getDoc(ref);
		const loading = document.getElementById("loadingScreen");

        
        if (snap.exists()) {
    	 const promises = [getuser(snap.data())];
        if (sparesList) {
		  promises.push(getVehicleData(id));
          promises.push(getSparesList(id));
        }
        if (vehicleList) {
          promises.push(getVehicleList(token));
        }
        await Promise.all(promises);
        loading.remove();
        document.getElementById("content").style.display = "block";
		} else {
		  loading.remove();
          document.getElementById("content").style.display = "block";
          document.getElementById("customerName").textContent = "Customer Not Found";
          document.getElementById("customerAddress").textContent = "";
        }
    } catch (error) {
        console.error("Error fetching document:", error);
		alert(`Customer Data\n${error.name}\n${error.message}`);
    }
}

getCustomerDetails();


async function getVehicleList(customerId) {
    try {
        const vehicleRef = collection(db, "Customers", customerId, "Workshop");
        const vehicleSnap = await getDocs(vehicleRef);
        
        vehicleSnap.forEach((doc) => {
            const item = doc.data();
            console.log(item);
            //alert(JSON.stringify(item, null, 2));
            let title = item.model +" - " + item.vehicleNo;
			let date = item.date;
			let billNo = item.billNo;
			let bill = item.bill || 0;
            let pay = item.pay || 0;
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
                        <h4>${title}</h4>
                        <p> ${date}</p>
                        ${htmlContent}
                    </div>
                    <div class="amount">
                        <p>₹${bill}</p>
                    </div>
                </div>
            `;
            card.addEventListener("click", () => {
				window.location.href = `service-info.html?token=${token}&id=${doc.id}`;
            });
            vehicleList.appendChild(card);
        });
    } catch (error) {
        console.error("Error fetching vehicles:", error);
		alert(`Vehicle List\n${error.name}\n${error.message}`);
    }
}
async function getVehicleData(id) {
    try {
        const ref = doc(db, "Customers", token, "Workshop", id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
            const data = snap.data();
            document.getElementById("model").textContent = data.brand + " - "+ data.model || "";
			document.getElementById("vehicleNo").textContent = data.vehicleNo || "";
			const table = document.getElementById("vehicleTable");
            table.innerHTML = "";
            addBillRow(table, "Date", data.date || "");
            addBillRow(table, "Bill No", data.billNo || "");
            addBillRow(table, "On KM", data.onKm || "");
            addBillRow(table, "Bill", `₹${data.bill || 0}`);
            addBillRow(table, "Pay", `₹${data.pay || 0}`);
            
        } else {
            alert("Service document not found");
        }
    } catch (error) {
        console.error("Error fetching vehicle data:", error);
        alert(`Vehicle Data\n${error.name}\n${error.message}`);
    }
}
function addBillRow(table, label, value) {
const row = table.insertRow();
    row.innerHTML = `
         <td class="label">
            <div>${label}</div>
        </td>
         <td class="value">
            <div>${value}</div>
        </td>
    `;
}

async function getSparesList(id) {
    try {
        const ref = doc(db, "Customers", token, "Spares", id);
        const snap = await getDoc(ref);
        //alert(snap.exists());
        if (!snap.exists()) {
            alert("Spares document not found");
            return;
        }

        const items = snap.data();
        //alert(JSON.stringify(items, null, 2));
        //console.log(items);

        Object.entries(items).forEach(([itemId, item]) => {
            //console.log(itemId, item);
			let total = item.total || 0;
            const card = document.createElement("div");
           card.className = "adapter";
    
           card.innerHTML = `
              <div class="horizontal">
               <div class="icon" style="width: 42px; height: 42px;">
                <span class="material-icons" style="font-size: 24px;">handyman</span>
            </div>
        <div class="vertical">
          <h4>${item.desc}</h4>
          <p>Rate : ₹${item.rate} | Qty : ${item.qty}</p>
        </div>
           <div style="padding-right: 10px;">
               <p>₹${total}</p>
            </div>
      </div>`;
    
    sparesList.appendChild(card);
        });
    } catch (error) {
        console.error("Error fetching spares:", error);
        alert(`Spares List\n${error.name}\n${error.message}`);
    }
}



document.addEventListener("DOMContentLoaded", () => {
    fetch("../strings.json")
        .then(response => {
            if (!response.ok) {
                throw new Error("Unable to load strings.json");
            }
            return response.json();
        })
        .then(data => {

            // App Name
            const appName = document.getElementById("appName");
            if (appName) appName.textContent = data.app.name;

            // Contact Email
            const email = document.getElementById("contactEmail");
            if (email) {
                email.textContent =   data.contact.email;
                email.href = "mailto:" + data.contact.email;
            }

            // Privacy Policy Link
            const privacy = document.getElementById("privacyLink");
            if (privacy) {
                privacy.textContent = data.links.privacyText;
                privacy.href = data.links.privacy;
            }

            // Terms Link
            const terms = document.getElementById("termsLink");
            if (terms) {
                terms.textContent = data.links.termsText;
                terms.href = data.links.terms;
            }

            // Footer
            const footer = document.getElementById("footerText");
            if (footer) footer.textContent = data.footer.copyright;

        })
        .catch(error => console.error(error));
});


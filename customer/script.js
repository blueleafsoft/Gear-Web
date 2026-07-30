import { db } from "../firebase.js";
import { doc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const token = params.get("token");
const id = params.get("id");

const vehicleList = document.getElementById("vehicleList");
const sparesList = document.getElementById("serviceList");
const noData = document.getElementById("noData");

function showNoData(message = "No data available") {
    noData.textContent = message;
    noData.style.display = "block";
}

function hideNoData() {
    noData.style.display = "none";
}

async function getuser(customer) {
    const uid = customer.User_Id;
    //alert(JSON.stringify(customer));
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
        const user = snap.data();
						
        document.getElementById("garageName").textContent = user.name || "";
        document.getElementById("garageDesc").textContent = user.user_description || "";

        document.getElementById("customerName").textContent = customer.Name || "Name Not Found";
        document.getElementById("customerAddress").textContent = customer.Address || "Address Not Found";

		let credit = Math.abs(customer.Credit);
        if (customer.Credit < 0) {
			document.getElementById("amountTitle").textContent = "Credit";
			document.getElementById("creditText").textContent = `${formatAmount(credit)}`;
        } else {
			document.getElementById("amountTitle").textContent ="Total Due";
			document.getElementById("dueText").textContent = `${formatAmount(credit)}`;
	    }
    }else{
		showNoData();
	}
}


async function getCustomerDetails() {
    if (!token) {
        console.error("Token Not Found");
		loading.remove();
		showNoData("Invalid Url");
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
          showNoData();
        }
    } catch (error) {
        console.error("Error fetching document:", error);
		//alert(`Customer Data\n${error.name}\n${error.message}`);
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

            let credit = Math.abs(bill - pay);
            let isCredit = bill < pay;

            let htmlContent;
			if (isPaid) {
               htmlContent = `<p>Paid : ${formatAmount(pay)}</p>`;
            } else if (isCredit) {
               htmlContent = `<p class="credit-text">Credit : ${formatAmount(credit)}</p>`;
            } else {
               htmlContent = `<p class="due-text">Due : ${formatAmount(credit)}</p>`;
            }
            
            const card = document.createElement("div");
            card.className = "adapter";

            card.innerHTML = `
                <div class="horizontal" style="width:100%;">
                    <div class="left-bar"></div>
                    <div class="icon">
                        <span translate="no" style="font-size:42px;">${getCarIcon().outerHTML}</span>
                    </div>
                    <div class="vertical">
                        <h4>${title}</h4>
                        <p> ${date}</p>
                        ${htmlContent}
                    </div>
                    <div class="amount">
                        <p>${formatAmount(bill)}</p>
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
		//alert(`Vehicle List\n${error.name}\n${error.message}`);
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
			const pay = data.pay ?? 0;
			const table = document.getElementById("vehicleTable");
            table.innerHTML = "";
            addBillRow(table, "Service Date", data.date || " ");
            addBillRow(table, "Bill Number", data.billNo || " ");
            addBillRow(table, "Odometer", data.onKm.toLocaleString("en-IN") || " ");
            addBillRow(table, "Bill Amount", `${formatAmount(data.bill)}`);
            addBillRow(table, "Paid",  pay > 0  ? `${formatAmount(pay)} ${getPaymentMode(data.paymentMode)}` : "--");
        } else {
            showNoData("Service document not found");
        }
    } catch (error) {
        console.error("Error fetching vehicle data:", error);
        //alert(`Vehicle Data\n${error.name}\n${error.message}`);
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
            showNoData("Spares document not found");
            return;
        }

        const items = snap.data();
        //alert(JSON.stringify(items, null, 2));
        //console.log(items);

        Object.entries(items).forEach(([itemId, item]) => {
            //console.log(itemId, item);
			let total = item.total || 0;
            const card = document.createElement("div");
           card.className = "service-item";
    
           card.innerHTML = `
		   <div class="adapter">
		   <div class="horizontal">
               <div class="icon" style="width: 42px; height: 42px;">
                <span class="material-icons" translate="no" style="font-size: 24px;">handyman</span>
            </div>
        <div class="vertical">
          <h4>${item.desc}</h4>
          <p>Rate : ${formatAmount(item.rate)} | Qty : ${item.qty}</p>
        </div>
           <div class="amount" style="padding-right: 10px; margin: 0px;">
               <p style="font-weight: normal;">${formatAmount(total)}</p>
            </div>
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

function formatAmount(amount) {
    return "₹" + Number(amount ?? 0).toLocaleString("en-IN");
}
function getPaymentMode(mode) {
    switch (mode ?? -1) {
        case 1:
            return "(Cash)";
        case 2:
            return "(Bank)";
        case 3:
            return "(UPI)";
		case 4:
			return "(Card)";
		default:
            return "";
    }
}
const themeColorMeta = document.querySelector('meta[name="theme-color"]');

function updateThemeColor() {
  const color = getComputedStyle(document.documentElement)
    .getPropertyValue('--md-sys-color-background').trim();
  themeColorMeta.setAttribute('content', color);
}

updateThemeColor();

// Update when system theme changes
window.matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', updateThemeColor);




function getCarIcon() {
    const NS = "http://www.w3.org/2000/svg";

    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "42");
    svg.setAttribute("height", "42");

    svg.innerHTML = `
    <path
		fill="var(--md-sys-color-outline)"
		d="M16.24,16.11C16.87,16.13,17.50,16.15,17.84,16.06C18.17,15.96,18.21,15.75,18.25,15.90C18.28,16.05,18.30,16.56,18.25,16.82C18.19,17.09,18.07,17.11,17.73,17.12C17.39,17.14,16.84,17.14,16.56,17.12C16.27,17.10,16.25,17.05,16.24,16.88C16.23,16.71,16.24,16.41,16.24,16.11z"/>
	<path
		fill="var(--md-sys-color-outline)"
		d="M7.82,16.11C7.19,16.13,6.56,16.15,6.23,16.06C5.89,15.96,5.85,15.75,5.82,15.90C5.79,16.05,5.77,16.56,5.82,16.82C5.87,17.09,5.99,17.11,6.33,17.12C6.67,17.14,7.22,17.14,7.51,17.12C7.79,17.10,7.81,17.05,7.82,16.88C7.83,16.71,7.82,16.41,7.82,16.11z"/>
	<path
		fill="var(--md-sys-color-on-background)"
		d="M18.25,10.88Q18.56,11.00,18.52,11.64Q18.45,15.42,18.19,15.55C17.93,15.83,16.53,15.88,6.94,15.80Q5.71,15.80,5.63,14.73C5.45,11.64,5.38,11.00,5.87,10.80Q6.27,10.66,6.51,10.24Q5.44,10.09,5.29,9.93Q5.08,9.70,5.29,9.45C5.52,9.25,6.02,9.24,6.46,9.31C6.62,9.37,6.65,9.56,6.65,10.01C7.81,8.01,7.81,6.85,8.93,6.89C14.51,6.95,15.34,6.61,16.00,7.40Q16.61,8.29,17.35,9.96C17.35,9.51,17.40,9.34,17.54,9.27C17.98,9.20,18.48,9.20,18.71,9.41Q18.92,9.65,18.71,9.89Q18.56,10.04,17.49,10.19Q17.87,10.78,18.25,10.88zM8.71,9.75C9.00,10.00,10.33,10.00,10.50,9.75L13.47,9.75C14.00,10.00,15.00,10.00,15.32,9.74L16.55,9.74Q15.85,7.61,15.49,7.58Q12.04,7.58,8.44,7.59Q8.12,7.58,7.42,9.74L8.71,9.75zM6.20,11.64C6.16,11.75,6.11,11.86,6.13,12.06C6.15,12.26,6.23,12.57,6.70,12.69C7.17,12.81,8.03,12.76,8.41,12.60C8.78,12.44,8.68,12.17,8.55,12.00C8.42,11.83,8.26,11.77,7.91,11.64C7.56,11.52,7.02,11.34,6.70,11.33C6.38,11.32,6.29,11.48,6.20,11.64zM17.75,11.66C17.66,11.50,17.57,11.34,17.26,11.35C16.94,11.35,16.39,11.54,16.04,11.66C15.69,11.78,15.53,11.85,15.40,12.02C15.27,12.19,15.17,12.46,15.55,12.62C15.93,12.78,16.79,12.83,17.26,12.71C17.73,12.58,17.81,12.28,17.82,12.08C17.84,11.87,17.79,11.77,17.75,11.66zM14.51,15.23C14.83,15.27,16.15,13.32,15.40,13.34L8.55,13.34C7.81,13.32,8.98,15.24,9.38,15.23L14.51,15.23zM16.08,9.74L13.89,9.74"/>
	<path
		fill="var(--md-sys-color-outline)"
		d="M14.49,14.42L9.51,14.42C9.40,14.42,9.29,14.43,9.24,14.38C9.18,14.32,9.18,14.22,9.24,14.17C9.29,14.11,9.40,14.12,9.51,14.12L14.49,14.12C14.60,14.12,14.71,14.11,14.76,14.17C14.82,14.22,14.82,14.32,14.76,14.38C14.71,14.43,14.60,14.42,14.49,14.42z"/>
	<path
		fill="var(--md-sys-color-outline)"
		d="M14.26,14.95L9.74,14.95C9.64,14.95,9.54,14.95,9.49,14.90C9.44,14.85,9.44,14.75,9.49,14.69C9.54,14.64,9.64,14.65,9.74,14.65L14.26,14.65C14.36,14.65,14.46,14.64,14.51,14.69C14.56,14.75,14.56,14.85,14.51,14.90C14.46,14.95,14.36,14.95,14.26,14.95z"/>
	<path
		fill="var(--md-sys-color-outline)"
		d="M14.65,13.89L9.24,13.89C9.12,13.89,9.00,13.89,8.94,13.84C8.88,13.79,8.88,13.68,8.94,13.63C9.00,13.58,9.12,13.58,9.24,13.58L14.65,13.58C14.77,13.58,14.89,13.58,14.95,13.63C15.01,13.68,15.01,13.79,14.95,13.84C14.89,13.89,14.77,13.89,14.65,13.89z"/>
	<path
		fill="var(--md-sys-color-outline)"
		d="M14.46,8.48C14.22,8.50,13.97,8.52,13.76,8.71C13.54,8.90,13.36,9.25,13.48,9.47C13.60,9.68,14.04,9.76,14.46,9.76C14.88,9.76,15.29,9.68,15.43,9.47C15.56,9.25,15.42,8.90,15.22,8.71C15.01,8.52,14.73,8.50,14.46,8.48zM9.60,8.48C9.87,8.50,10.15,8.52,10.35,8.71C10.56,8.89,10.70,9.24,10.57,9.46C10.43,9.68,10.02,9.78,9.59,9.78C9.17,9.78,8.74,9.69,8.62,9.46C8.50,9.24,8.68,8.89,8.90,8.70C9.11,8.52,9.35,8.50,9.60,8.48z"/>
 `;

    return svg;
}

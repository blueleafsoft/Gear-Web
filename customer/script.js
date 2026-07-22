console.log("Token:", token);

const ref = doc(db, "Customers", token);
const snap = await getDoc(ref);

console.log("Exists:", snap.exists());

if (snap.exists()) {
    console.log(snap.data());

    const data = snap.data();
    document.getElementById("customer_name").textContent = data.Name;
    document.getElementById("customer_address").textContent = data.Address;
} else {
    document.getElementById("customer_name").textContent = "Customer not found";
}

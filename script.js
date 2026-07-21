// Simple script to demonstrate interactivity
const button = document.getElementById("countBtn");
const countEl = document.getElementById("count");
let count = 0;

if (button && countEl) {
  button.addEventListener("click", () => {
    count += 1;
    countEl.textContent = `Clicked ${count} time${count === 1 ? "" : "s"}`;
  });
}

document.addEventListener("DOMContentLoaded", () => {
    fetch("strings.json")
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
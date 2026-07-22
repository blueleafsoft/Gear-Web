import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDj0WYmoDfG7E5d68Ie6rRw9IwjUXCG5vs",
  authDomain: "blueleaf-soft.firebaseapp.com",
  projectId: "blueleaf-soft",
  storageBucket: "blueleaf-soft.appspot.com",
  messagingSenderId: "174166087316",
  appId: "1:174166087316:web:0b0315d150114909f6c681"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

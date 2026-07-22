
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyDj0WYmoDfG7E5d68Ie6rRw9IwjUXCG5vs",
    authDomain: "blueleaf-soft.firebaseapp.com",
    databaseURL: "https://blueleaf-soft-default-rtdb.firebaseio.com",
    projectId: "blueleaf-soft",
    storageBucket: "blueleaf-soft.appspot.com",
    messagingSenderId: "174166087316",
    appId: "1:174166087316:web:0b0315d150114909f6c681",
    measurementId: "G-1YDETYGJWJ"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);

import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your real web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBAgo9oKc0disNp26qvFd8_TUd6X6bSwGU",
  authDomain: "seelai-4b026.firebaseapp.com",
  databaseURL: "https://seelai-4b026-default-rtdb.firebaseio.com",
  projectId: "seelai-4b026",
  storageBucket: "seelai-4b026.firebasestorage.app",
  messagingSenderId: "697931553557",
  appId: "1:697931553557:web:2340b0b14dafb77b15a71c",
  measurementId: "G-GKVGRTEGVF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services so our React components can use them
export const analytics = getAnalytics(app);
export const database = getDatabase(app);
export const auth = getAuth(app);
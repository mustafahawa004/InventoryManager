// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCnGTU18JutUB3pci1iCoyw6_lQVr4kg-8",
  authDomain: "inventory-management-cd226.firebaseapp.com",
  projectId: "inventory-management-cd226",
  storageBucket: "inventory-management-cd226.appspot.com",
  messagingSenderId: "636973982969",
  appId: "1:636973982969:web:49a8545f9be22fb3a82e28",
  measurementId: "G-EZWQFVG1CV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export {firestore};
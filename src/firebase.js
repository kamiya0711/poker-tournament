import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyByJ1hEUkISup2Vi23MVp1Zn0w3ttadnYA",
  authDomain: "poker-tournament-dev.firebaseapp.com",
  databaseURL: "https://poker-tournament-dev-default-rtdb.firebaseio.com",
  projectId: "poker-tournament-dev",
  storageBucket: "poker-tournament-dev.firebasestorage.app",
  messagingSenderId: "678998245671",
  appId: "1:678998245671:web:0e6eada42759ec1888e902"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

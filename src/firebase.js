import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey:        process.env.REACT_APP_FIREBASE_API_KEY        || "AIzaSyC0i_PUEFPoybnsVaCGlk_J-FronkQJMIA",
  authDomain:    process.env.REACT_APP_FIREBASE_PROJECT_ID     ? `${process.env.REACT_APP_FIREBASE_PROJECT_ID}.firebaseapp.com` : "poker-tournament-b845f.firebaseapp.com",
  databaseURL:   process.env.REACT_APP_FIREBASE_DB_URL         || "https://poker-tournament-b845f-default-rtdb.firebaseio.com",
  projectId:     process.env.REACT_APP_FIREBASE_PROJECT_ID     || "poker-tournament-b845f",
  storageBucket: process.env.REACT_APP_FIREBASE_PROJECT_ID     ? `${process.env.REACT_APP_FIREBASE_PROJECT_ID}.firebasestorage.app` : "poker-tournament-b845f.firebasestorage.app",
  messagingSenderId: "758629753463",
  appId:         process.env.REACT_APP_FIREBASE_APP_ID         || "1:758629753463:web:8485cd78a87b048a465c72"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

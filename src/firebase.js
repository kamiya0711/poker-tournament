import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyC0i_PUEFPoybnsVaCGlk_J-FronkQJMIA",
  authDomain: "poker-tournament-b845f.firebaseapp.com",
  databaseURL: "https://poker-tournament-b845f-default-rtdb.firebaseio.com",
  projectId: "poker-tournament-b845f",
  storageBucket: "poker-tournament-b845f.firebasestorage.app",
  messagingSenderId: "758629753463",
  appId: "1:758629753463:web:8485cd78a87b048a465c72"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDvZgEYvf_Z-JzHJaDwynUn9IvGJZ2CiKw",
  authDomain: "clipitchat-da3c3.firebaseapp.com",
  projectId: "clipitchat-da3c3",
  storageBucket: "clipitchat-da3c3.appspot.com",
  messagingSenderId: "1081155707073",
  appId: "1:1081155707073:web:bd116d50ae3b121976f440",
  measurementId: "G-CSBG1N2PKC",
};
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

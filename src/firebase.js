import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

function Firebase() {
  var firebaseConfig = {
    apiKey: "AIzaSyCZ-dB1gu7JV7g8eT5iXWWaQFUgkSC9CFc",
    authDomain: "exam-tuan.firebaseapp.com",
    databaseURL: "https://exam-tuan-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "exam-tuan",
    storageBucket: "exam-tuan.appspot.com",
    messagingSenderId: "1078767863554",
    appId: "1:1078767863554:web:5b5cc3826379ffadb6241b",
    measurementId: "G-7MVMBMXVDQ"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  // Initialize Realtime Database and get a reference to the service
  return getDatabase(app);
}

export default Firebase;
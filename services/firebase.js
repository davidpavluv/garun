import "expo-firestore-offline-persistence";

import * as firebase from "firebase";
import "firebase/firestore";

firebase.initializeApp({
  apiKey: "AIzaSyD16eIHW6f3nFASS27Mqgt-MCvHLvHBhbU",
  authDomain: "tracker-webapp-54030.firebaseapp.com",
  databaseURL: "",
  projectId: "tracker-webapp-54030",
  storageBucket: "tracker-webapp-54030.appspot.com",
  messagingSenderId: "997534553023",
  appId: "1:997534553023:web:f55c2c99ce28e0f41cc70a",
  measurementId: "",
});

const firestore = firebase.firestore;

firestore().enablePersistence();

export const db = firestore();
export const FieldValue = firestore.FieldValue;

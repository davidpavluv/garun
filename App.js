import React, { useState, useEffect } from "react";
import "expo-firestore-offline-persistence";
import * as Google from "expo-google-app-auth";
import * as SecureStore from "expo-secure-store";

import { View } from "react-native";
import styles from "./styles/global";

import AppLoading from "expo-app-loading";
import { useFonts } from "expo-font";

import Login from "./screens/Login";
import Home from "./screens/Home";

import * as TaskManager from "expo-task-manager";
import AsyncStorage from "@react-native-async-storage/async-storage";

console.disableYellowBox = true;
const LOCATION_TRACKING = "locationtracking";

TaskManager.defineTask(
  LOCATION_TRACKING,
  async ({ data: { locations }, error }) => {
    if (error) {
      console.log("LOCATION_TRACKING task ERROR:", error);
      return;
    }
    if (locations) {
      let lat = locations[0].coords.latitude;
      let long = locations[0].coords.longitude;
      let speed = locations[0].coords.speed;
      try {
        let storedCoordinates = await getSavedLocations();
        storedCoordinates.push([lat, long, speed]);

        await AsyncStorage.setItem(
          "storedCoordinates",
          JSON.stringify(storedCoordinates)
        );
      } catch (err) {
        console.log(err);
      }
    }
  }
);

async function getSavedLocations() {
  try {
    const item = await AsyncStorage.getItem("storedCoordinates");
    return item ? JSON.parse(item) : [];
  } catch (e) {
    return [];
  }
}
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getUser();
  }, []);

  let [fontsLoaded] = useFonts({
    "rubik-light": require("./assets/fonts/Rubik-Light.ttf"),
    "rubik-regular": require("./assets/fonts/Rubik-Regular.ttf"),
    "rubik-medium": require("./assets/fonts/Rubik-Medium.ttf"),
  });

  //login loading functions
  async function loadingStart() {
    setLoading(true);
  }
  async function loadingEnd() {
    setLoading(false);
  }

  //user saving functions
  async function saveUser(data) {
    if (data === null) {
      setUser(null);
      await SecureStore.deleteItemAsync("user");
    } else {
      await SecureStore.setItemAsync("user", JSON.stringify(data));
      setUser(data);
    }
  }
  async function getUser() {
    let storedUser = JSON.parse(await SecureStore.getItemAsync("user"));

    if (storedUser && storedUser.email) {
      setUser(storedUser);
    } else {
      setUser(null);
    }
  }
  function logOut() {
    saveUser(null);
    loadingEnd();
  }

  async function googleLogin() {
    loadingStart();
    const data = await Google.logInAsync({
      iosClientId:
        "81549393528-qg05hcoaf0lcu6lts1dbjudcqrkralul.apps.googleusercontent.com",
      iosStandaloneAppClientId:
        "81549393528-r5o3tdt24cms9gcpkujmqjbdj4h8lusp.apps.googleusercontent.com",
      androidClientId:
        "81549393528-f5a7f2n0j0ci6ohhoa89tf8chjp6n3el.apps.googleusercontent.com",
      androidStandaloneAppClientId:
        "81549393528-h124ofbq8ffbmlid3k2i71oj5vck4v2f.apps.googleusercontent.com",
      scopes: ["profile", "email"],
    });

    if (data.type === "success") {
      // Then you can use the Google REST API
      // let userInfoResponse = await fetch(
      //   "https://www.googleapis.com/userinfo/v2/me",
      //   {
      //     headers: { Authorization: `Bearer ${data.accessToken}` },
      //   }
      // );
      saveUser(data.user);
    } else {
      saveUser(null);
    }
    loadingEnd();
  }

  if (!fontsLoaded) return <AppLoading />;
  return (
    <View style={styles.container}>
      {user ? (
        <Home logOut={logOut} user={user} />
      ) : (
        <Login googleLogin={googleLogin} loading={loading} />
      )}
    </View>
  );
}

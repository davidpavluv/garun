import React, { useEffect, useState, useRef } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Modal,
  Alert,
  AppState,
  Platform,
} from "react-native";
import * as Application from "expo-application";

import * as Linking from "expo-linking";
import { Ionicons } from "@expo/vector-icons";
import { db, FieldValue } from "../services/firebase";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";

import * as Location from "expo-location";
import * as Permissions from "expo-permissions";
import globalStyles from "../styles/global";
import styles from "../styles/tracker";
import * as IntentLauncher from "expo-intent-launcher";

const LOCATION_TRACKING = "locationtracking";

export default function Tracker({ navigation, user, setNavigationVisible }) {
  const [intervalId, setIntervalId] = useState(null);
  const [running, setRunning] = useState(0); //0=first render, -1=not running, 1, running
  const [distance, setDistance] = useState(0);

  const startTime = useRef(0);
  const [time, setTime] = useState(0);

  const [overLimit, setOverLimit] = useState(false);
  const [coordinates, setCoordinates] = useState([]);

  const [saving, setSaving] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [modal, setModal] = useState(["", false]); //[[message],[visibility]]

  //check if already started
  useEffect(() => {
    startIfAlreadyStarted();
  }, []);

  useEffect(() => {
    if (running === -1) {
      handleStopTracking();
    } else if (running === 1) {
      handleStartTracking();
    }
  }, [running]);

  //pause interval on background
  useEffect(() => {
    AppState.addEventListener("change", pauser);
    return () => {
      AppState.removeEventListener("change", pauser);
    };
  }, []);

  async function pauser() {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      let hasStarted = await Location.hasStartedLocationUpdatesAsync(
        LOCATION_TRACKING
      );
      if (!running && hasStarted) {
        startUpdates();
      }
    } else {
      clearInterval(intervalId);
    }
  }

  //handles stopping
  function handleStopTracking() {
    clearInterval(intervalId);
    stopLocationTracking();
    setSaving(true);
  }
  //handles starting
  async function handleStartTracking() {
    let hasStarted = await Location.hasStartedLocationUpdatesAsync(
      LOCATION_TRACKING
    );

    if (hasStarted) {
      try {
        let storedStartTime = await AsyncStorage.getItem("startTime");
        startTime.current = storedStartTime ? JSON.parse(storedStartTime) : 0;
      } catch (e) {
        console.log(e);
      }
    } else {
      try {
        let theStartTime = Date.now();
        startTime.current = theStartTime;
        await AsyncStorage.setItem("startTime", JSON.stringify(theStartTime));
        startLocationTracking();
      } catch (e) {
        console.log(e);
      }
    }

    startUpdates();
  }

  function startUpdates() {
    let id = setInterval(() => {
      setTime(Date.now() - startTime.current);
      setSavedCoordinates();
    }, 1000);
    setIntervalId(id);
  }

  //clears interval on unmount
  useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  //start if already started
  async function startIfAlreadyStarted() {
    let hasStarted = await Location.hasStartedLocationUpdatesAsync(
      LOCATION_TRACKING
    );
    if (hasStarted) {
      setRunning(1);
    }
  }

  //sets saved locations
  async function setSavedCoordinates() {
    setCoordinates(await getSavedLocations());
  }

  //returns saved locations
  async function getSavedLocations() {
    try {
      const item = await AsyncStorage.getItem("storedCoordinates");
      return item ? JSON.parse(item) : [];
    } catch (e) {
      return [];
    }
  }

  //hides navigation
  useEffect(() => {
    if ((running === 1) | saving) {
      setNavigationVisible(false);
    } else {
      setNavigationVisible(true);
    }
  }, [running, saving]);

  //checks if cheat
  useEffect(() => {
    let isOver = coordinates.some((coords) => coords[2] > 7);
    setOverLimit(isOver);
  }, [coordinates]);

  //calculates distance
  useEffect(() => {
    let sum = 0;
    let shifted = coordinates.slice(3);

    if (shifted.length > 1) {
      for (let i = 1; i < shifted.length; i++) {
        sum += distanceFrom([shifted[i - 1], shifted[i]]);
      }
    }
    sum = sum * 100;
    sum = Math.round(sum);
    sum = sum / 100;
    setDistance(sum);
  }, [coordinates]);

  //ask for permission 1 - or reset
  async function toggleToStart() {
    let stored = await Permissions.getAsync(Permissions.LOCATION);

    if (stored.status !== "granted") {
      Alert.alert(
        "Proč vyžaduje GA RUN přístup k poloze?",
        "Tato aplikace shromažďuje údaje o poloze, aby umožnila zaznamenávání běhu, i když je aplikace zavřená nebo se nepoužívá.",
        [
          {
            text: "Nepovolit",
            onPress: reset,
            style: "cancel",
          },
          { text: "OK", onPress: toggleToStartAfterPrompt },
        ]
      );
    } else {
      toggleToStartAfterPrompt();
    }
  }

  //ask for permission 2 - or reset
  async function toggleToStartAfterPrompt() {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status == "granted") {
      Location.enableNetworkProviderAsync()
        .then(() => {
          toggleToStartWithAlways();
        })
        .catch(() => {
          reset();
        });
    } else {
      reset();
    }
  }
  //ask for persisson 3 (always) - or reset
  async function toggleToStartWithAlways() {
    if (!(await isEnabledAlways())) {
      Alert.alert(
        "Aplikace nemůže vaši polohu používat na pozadí",
        "Přepněte v nastavení: opravnění polohy na 'povolit vždy'",
        [
          {
            text: "Přejít do nastavení",
            onPress: () => {
              if (Platform.OS == "android") {
                IntentLauncher.startActivityAsync(
                  IntentLauncher.ACTION_APPLICATION_DETAILS_SETTINGS,
                  { data: "package:" + Application.applicationId }
                );
              } else {
                Linking.openURL("app-settings:");
              }
            },
          },
        ]
      );
      return;
    }
    startRunning();
  }
  async function isEnabledAlways() {
    let info = await Permissions.getAsync(Permissions.LOCATION);
    return info.permissions.location.scope == "always";
  }
  //set to running = 1
  function startRunning() {
    setRunning(1);
  }

  //start background
  async function startLocationTracking() {
    await Location.startLocationUpdatesAsync(LOCATION_TRACKING, {
      accuracy: Location.Accuracy.BestForNavigation,
      // android behavior
      foregroundService: {
        notificationTitle: "GA RUN je aktivní",
        notificationBody: "Zaznamenává se tvoje poloha pro výpočet vzdálenosti",
        notificationColor: "#4D6BFF",
      },
      // ios behavior
      activityType: Location.ActivityType.Fitness,
      showsBackgroundLocationIndicator: true,
    });
  }

  //stop background
  async function stopLocationTracking() {
    await Location.stopLocationUpdatesAsync(LOCATION_TRACKING);
  }

  //resets all to default
  async function reset() {
    try {
      stopLocationTracking();
      clearInterval(intervalId);

      setRunning(-1);
      setDistance(0);

      setIntervalId(null);
      startTime.current = 0;
      setTime(0);

      setSaving(false);
      setCoordinates([]);
      setOverLimit(false);

      await AsyncStorage.clear();
    } catch (e) {
      console.log(e);
    }
  }

  //calculate distance
  function distanceFrom(points) {
    var radianLat1 = points[0][0] * (Math.PI / 180);
    var radianLng1 = points[0][1] * (Math.PI / 180);
    var radianLat2 = points[1][0] * (Math.PI / 180);
    var radianLng2 = points[1][1] * (Math.PI / 180);

    var earth_radius = 6371;
    var diffLat = radianLat1 - radianLat2;
    var diffLng = radianLng1 - radianLng2;
    var sinLat = Math.sin(diffLat / 2);
    var sinLng = Math.sin(diffLng / 2);
    var a =
      Math.pow(sinLat, 2.0) +
      Math.cos(radianLat1) * Math.cos(radianLat2) * Math.pow(sinLng, 2.0);
    var distance = earth_radius * 2 * Math.asin(Math.min(1, Math.sqrt(a)));
    return distance;
  }

  //toggle running state
  function toggle() {
    if (running < 1) {
      toggleToStart();
    } else {
      setRunning(-1);
    }
  }

  //get display time
  function getTimeToDisplay(millisec) {
    var seconds = (millisec / 1000).toFixed(0);
    var minutes = Math.floor(seconds / 60);
    var hours = "";
    if (minutes > 59) {
      hours = Math.floor(minutes / 60);
      hours = hours >= 10 ? hours : "0" + hours;
      minutes = minutes - hours * 60;
      minutes = minutes >= 10 ? minutes : "0" + minutes;
    }

    seconds = Math.floor(seconds % 60);
    seconds = seconds >= 10 ? seconds : "0" + seconds;
    if (hours != "") {
      return hours + ":" + minutes + ":" + seconds;
    }
    return minutes + ":" + seconds;
  }

  //handle save
  function save() {
    NetInfo.fetch().then(async (state) => {
      if (state.isConnected) {
        try {
          setUploading(true);
          //write recored
          let ref = db.collection("records").doc(user.email);
          let doc = await ref.get();

          let timeNow = Date.now();

          if (doc && doc.exists) {
            await ref.update({ [timeNow]: [time, distance, timeNow] });
          } else {
            await ref.set({ [timeNow]: [time, distance, timeNow] });
          }

          //increment school
          let totalRef = db.collection("totals").doc("gyarab");
          let increment = FieldValue.increment(distance);
          await totalRef.update({ total: increment });

          //increment profile
          let userTotalRef = db.collection("users-totals").doc(user.email);
          let totalDoc = await userTotalRef.get();

          if (totalDoc && totalDoc.exists) {
            await userTotalRef.update({ total: increment });
          } else {
            await userTotalRef.set({ total: increment });
          }
          setUploading(false);
          setModal(["uloženo", true]);
          reset();
        } catch (er) {
          console.log(er);
        }
      } else {
        setModal(["nejdříve se připojte k internetu", true]);
      }
    });
  }

  return (
    <View
      style={{
        ...globalStyles.page,
        display: navigation == 0 ? "flex" : "none",
      }}
    >
      <View style={globalStyles.panel}>
        <Ionicons name="timer-outline" size={32} color="#4D6BFF" />
        <Text style={globalStyles.panel_title}>Proběhni se</Text>
      </View>

      <View style={{ ...globalStyles.card, ...styles.card }}>
        <Text style={globalStyles.title}>dráha</Text>
        <Text style={globalStyles.value}>{distance.toLocaleString()} km</Text>
        <Text style={{ ...globalStyles.title, marginTop: 20 }}>čas</Text>
        <Text style={globalStyles.value}>{getTimeToDisplay(time)}</Text>
      </View>

      <View style={styles.button_container}>
        {overLimit ? (
          <TouchableOpacity onPress={reset} style={styles.error_button}>
            <Text style={styles.action_text}>zavřít</Text>
            <Text style={styles.description_text}>
              překonal jsi limit 30km/h
            </Text>
          </TouchableOpacity>
        ) : saving ? (
          uploading ? (
            <ActivityIndicator size="small" color="#0000ff" />
          ) : (
            <View style={styles.done_button_wrapper}>
              <TouchableOpacity style={styles.reset_button} onPress={reset}>
                <Ionicons name="md-refresh-outline" size={32} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.save_button} onPress={save}>
                <Text style={styles.action_text}>uložit</Text>
                <Text style={styles.description_text}>běh se zaznamená</Text>
              </TouchableOpacity>
            </View>
          )
        ) : (
          <TouchableOpacity style={styles.toggle_button} onPress={toggle}>
            {running === 1 ? (
              <Ionicons name="ios-pause" size={32} color="white" />
            ) : (
              <Ionicons
                name="ios-play"
                size={32}
                color="white"
                style={{ marginLeft: 2 }}
              />
            )}
          </TouchableOpacity>
        )}
      </View>

      <Modal animationType="fade" transparent={true} visible={modal[1]}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modal_text}>{modal[0]}</Text>
            <TouchableOpacity onPress={() => setModal(["", false])}>
              <Text style={styles.modal_button_text}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

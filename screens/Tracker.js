import React, { useEffect, useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db, FieldValue } from "../services/firebase";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";

import * as Location from "expo-location";
import * as Permissions from "expo-permissions";
import globalStyles from "../styles/global";
import styles from "../styles/tracker";

const LOCATION_TRACKING = "locationtracking";

export default function Tracker({ navigation, user, setNavigationVisible }) {
  const [timerId, setTimerId] = useState(null);
  const [running, setRunning] = useState(0); //0=first render, -1=not running, 1, running
  const [distance, setDistance] = useState(0);

  const [startTime, setStartTime] = useState(0);
  const [time, setTime] = useState(0);

  const [overLimit, setOverLimit] = useState(false);
  const [coordinates, setCoordinates] = useState([]);

  const [saving, setSaving] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [modal, setModal] = useState(["", false]); //[[message],[visibility]]

  async function getCoordinates() {
    setCoordinates(await getSavedLocations());
  }
  async function getSavedLocations() {
    try {
      const item = await AsyncStorage.getItem("storedCoordinates");
      return item ? JSON.parse(item) : [];
    } catch (e) {
      return [];
    }
  }

  useEffect(() => {
    let id;
    if ((running === 1) | saving) {
      //hide
      setNavigationVisible(false);
      //udate
      id = setInterval(() => {
        getCoordinates();
      }, 1000);
    } else {
      //show
      setNavigationVisible(true);
      //stop update
      clearInterval(id);
    }
    return () => {
      clearInterval(id);
    };
  }, [running, saving]);

  useEffect(() => {
    let isOver = coordinates.some((coords) => coords[2] > 7);
    setOverLimit(isOver);
  }, [coordinates]);

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

  useEffect(() => {
    if (running === -1) {
      clearInterval(timerId); //stop timer
      stopLocationTracking(); //stop tracker
    } else if (running === 1) {
      toggleToStart();
    }
  }, [running]);

  async function toggleToStart() {
    let { status } = await Permissions.getAsync(Permissions.LOCATION);
    let resultGPS = await Location.enableNetworkProviderAsync();
    if (status !== "granted" && resultGPS) {
      let res = await Permissions.askAsync(Permissions.LOCATION);
      if (res.status !== "granted") {
        setRunning(-1);
      } else {
        startRunning();
      }
    } else {
      startRunning();
    }
  }

  function startRunning() {
    //start timer
    let id = setInterval(() => {
      setTime(Date.now() - startTime);
    }, 1000);
    setTimerId(id);

    //start tracker
    startLocationTracking();
  }

  useEffect(() => {
    if (overLimit) {
      toggle();
      stopLocationTracking();
      clearInterval(timerId);
    }
  }, [overLimit]);

  async function startLocationTracking() {
    await Location.startLocationUpdatesAsync(LOCATION_TRACKING, {
      accuracy: Location.Accuracy.BestForNavigation,
      timeInterval: 60 * 1000,
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
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(
      LOCATION_TRACKING
    );
    console.log("tracking started?", hasStarted);
  }
  async function stopLocationTracking() {
    await Location.stopLocationUpdatesAsync(LOCATION_TRACKING);
  }

  async function reset() {
    stopLocationTracking();
    clearInterval(timerId);

    setRunning(-1);
    setDistance(0);

    setTimerId(null);
    setStartTime(0);
    setTime(0);

    setSaving(false);
    setCoordinates([]);
    setOverLimit(false);

    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.log(e);
    }
  }
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
  function toggle() {
    if (running < 1) {
      setSaving(false);
      setStartTime(Date.now());
      setRunning(1);
    } else {
      setSaving(true);
      setRunning(-1);
    }
  }
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
        <Text style={globalStyles.panel_title}>Proběhni si</Text>
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

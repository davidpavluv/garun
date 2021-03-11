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
import * as TaskManager from "expo-task-manager";
import * as Permissions from "expo-permissions";
import globalStyles from "../styles/global";
import styles from "../styles/tracker";
const LOCATION_TRACKING = "location-tracking";

TaskManager.defineTask(LOCATION_TRACKING, async ({ data, error }) => {
  if (error) {
    console.log("LOCATION_TRACKING task ERROR:", error);
    return;
  }
  if (data) {
    const { locations } = data;
    let lat = locations[0].coords.latitude;
    let long = locations[0].coords.longitude;
    try {
      let storedCoordinates = getSavedLocations();
      storedCoordinates = JSON.parse(storedCoordinates);
      storedCoordinates.push([lat, long, speed]);
    } catch (err) {
      console.log(err);
    }
  }
});

async function getSavedLocations() {
  try {
    const item = await AsyncStorage.getItem("storedCoordinates");
    return item ? JSON.parse(item) : [];
  } catch (e) {
    return [];
  }
}

export default function Tracker({ navigation, user, setNavigationVisible }) {
  const [timerId, setTimerId] = useState(null);
  const [running, setRunning] = useState(0); //0=first render, -1=not running, 1, running
  const [distance, setDistance] = useState(0);

  const [startTime, setStartTime] = useState(0);
  const [time, setTime] = useState(0);

  const [overLimit, setOverLimit] = useState(false);
  const [coordinates, setCoordinates] = useState([]);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [modal, setModal] = useState(["", false]); //[[message],[visibility]]

  useEffect(() => {
    let id = setInterval(() => {
      getCoordinates();
    }, 4000);

    return () => {
      clearInterval(id);
    };
  }, []);

  async function getCoordinates() {
    console.log(await getSavedLocations());
    setCoordinates(await getSavedLocations());
  }

  useEffect(() => {
    if ((running === 1) | saving) {
      //hide
      setNavigationVisible(false);
    } else {
      //show
      setNavigationVisible(true);
    }
  }, [running, saving]);

  useEffect(() => {
    const config = async () => {
      let res = await Permissions.askAsync(Permissions.LOCATION);
      if (res.status !== "granted") {
        console.log("Permission to access location was denied");
      } else {
        console.log("Permission to access location granted");
      }
    };

    config();
  }, []);

  useEffect(() => {
    let sum = 0;
    if (coordinates.length > 1) {
      for (let i = 1; i < coordinates.length; i++) {
        sum += distanceFrom([coordinates[i - 1], coordinates[i]]);
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
      stopLocationTracking; //stop tracker
    } else if (running === 1) {
      //start timer
      let id = setInterval(() => {
        setTime(Date.now() - startTime);
      }, 1000);
      setTimerId(id);

      //start tracker
      startLocationTracking();
    }
  }, [running]);

  useEffect(() => {
    if (overLimit) {
      toggle();
    }
  }, [overLimit]);

  async function startLocationTracking() {
    await Location.startLocationUpdatesAsync(LOCATION_TRACKING, {
      accuracy: Location.Accuracy.Highest,
      timeInterval: 5000,
      distanceInterval: 0,
    });
  }
  async function stopLocationTracking() {
    await Location.stopLocationUpdatesAsync(LOCATION_TRACKING);
  }

  async function reset() {
    setRunning(-1);
    setDistance(0);

    setTimerId(null);
    setStartTime(0);
    setTime(0);

    setSaving(false);
    setCoordinates([]);
    setOverLimit(false);

    await AsyncStorage.removeItem("storedCoordinates");
  }

  function getInternet() {
    NetInfo.fetch().then((state) => {
      return state.isConnected;
    });
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

  async function save() {
    //online
    if (await getInternet()) {
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
    }
    //offline
    else {
      setModal(["nejdříve se připojte k internetu", true]);
    }
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
          <View onPress={reset} style={styles.error_button}>
            <Text style={styles.action_text}>zavřít</Text>
            <Text style={styles.description_text}>
              překonal jsi limit 30km/h
            </Text>
          </View>
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

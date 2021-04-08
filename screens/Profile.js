import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import NetInfo from "@react-native-community/netinfo";

import { Ionicons } from "@expo/vector-icons";
import { db, FieldValue } from "../services/firebase";
import globalStyles from "../styles/global";
import styles from "../styles/profile";

export default function Profile({ navigation, logOut, user }) {
  const [history, setHistory] = useState([]);
  const [userTotal, setUserTotal] = useState(0);
  const [position, setPosition] = useState("");
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState([]);

  const [internet, setInternet] = useState(false);

  useEffect(() => {
    setLoading(true);
    getUserTotal();
    getPosition();
    getHistory();
    getInternet();
  }, [navigation]);

  function getInternet() {
    NetInfo.fetch().then((state) => {
      setInternet(state.isConnected);
    });
  }
  async function getHistory(removingId) {
    let ref = db.collection("records").doc(user.email);

    let doc = await ref.get();
    if (doc.exists) {
      let array = [...Object.values(doc.data())].sort((a, b) => b[2] - a[2]);
      setHistory(array);
    }
    if (removingId) setRemoving(removing.filter((item) => item != removingId));
    setLoading(false);
  }

  async function getUserTotal() {
    let ref = db.collection("users-totals").doc(user.email);

    let doc = await ref.get();
    if (doc.exists && doc.data()) {
      setUserTotal(Math.round(doc.data().total * 10) / 10);
    } else {
      setUserTotal(0);
    }
  }

  async function getPosition() {
    let totalsRef = db.collection("users-totals");
    let snapshot = await totalsRef.get();

    if (snapshot.empty) {
      setPosition(0);
    }
    let array = [];
    snapshot.forEach((doc) => {
      array.push({ name: doc.id, total: doc.data().total | 0 });
    });
    array.sort((a, b) => b.total - a.total);
    let calculatedPosition =
      array.findIndex((item) => item.name == user.email) + 1;

    setPosition(calculatedPosition);
  }

  function getTimeToDisplay(millisec) {
    let seconds = (millisec / 1000).toFixed(0);
    let minutes = Math.floor(seconds / 60);
    let hours = "";
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
  async function remove(id) {
    setRemoving([...removing, id]);
    let recordRef = db.collection("records").doc(user.email);

    await recordRef.update({
      [id]: FieldValue.delete(),
    });

    getHistory(id);
  }

  return (
    <View
      style={{
        ...globalStyles.page,
        display: navigation == 2 ? "flex" : "none",
      }}
    >
      <View style={globalStyles.panel}>
        <Ionicons name="person-outline" size={32} color="#4D6BFF" />
        <Text style={globalStyles.panel_title}>Profil</Text>
      </View>

      <View style={globalStyles.card}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#4D6BFF"
            style={{ marginTop: 150 }}
          />
        ) : (
          <View style={{ flex: 1 }}>
            <View style={styles.topPanel}>
              <View>
                <Text style={styles.name}>{user ? user.name : ""}</Text>
                <Text style={styles.position}>Celková pozice: {position}</Text>
              </View>
              <TouchableOpacity onPress={logOut}>
                <Ionicons name="log-out-outline" size={30} color="#F4514C" />
              </TouchableOpacity>
            </View>

            <View style={styles.totalDistancePanel}>
              <Text style={globalStyles.title}>tvoje celková dráha</Text>
              <Text style={globalStyles.value}>
                {userTotal.toLocaleString()} km
              </Text>
            </View>

            <ScrollView style={styles.list}>
              {history.map((item, index) => {
                return (
                  <View style={styles.record} key={index}>
                    <Text style={styles.date}>
                      {new Date(item[2]).toLocaleDateString("cs")}
                    </Text>
                    <View style={styles.record_right}>
                      <Text style={styles.duration}>
                        {getTimeToDisplay(item[0])} -{" "}
                      </Text>

                      <Text style={styles.distance}>
                        {item[1].toLocaleString()} km
                      </Text>
                      {removing.includes(item[2]) ? (
                        <ActivityIndicator size="small" color="#4D6BFF" />
                      ) : internet ? (
                        <TouchableOpacity onPress={() => remove(item[2])}>
                          <Ionicons
                            name="trash-outline"
                            size={24}
                            color="#F4514C"
                          />
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
}

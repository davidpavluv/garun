import React, { useState, useEffect } from "react";
import { ScrollView, Text, View, ActivityIndicator, Image } from "react-native";
import { db } from "../services/firebase";

import globalStyles from "../styles/global";
import styles from "../styles/school";

import progressLineBlue from "../assets/progressLineBlue.png";
import progressLineGrey from "../assets/progressLineGrey.png";

import { Ionicons } from "@expo/vector-icons";

export default function School({ navigation }) {
  const [milestones, setMilestones] = useState([]);
  const [schoolTotal, setSchoolTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSchoolTotal();
    getMilestones();
  }, [navigation]);

  async function getMilestones() {
    let ref = db.collection("milestones");
    let snapshot = await ref.orderBy("distance").get();
    let milestonesArr = [];
    snapshot.forEach((doc) => {
      milestonesArr.push(doc.data());
    });
    setMilestones(milestonesArr);
    setLoading(false);
  }

  async function getSchoolTotal() {
    let ref = db.collection("totals").doc("gyarab");
    let doc = await ref.get();
    if (doc.exists && doc.data()) {
      setSchoolTotal(Math.round(doc.data().total * 10) / 10);
    } else {
      setSchoolTotal(0);
    }
  }

  return (
    <View
      style={{
        ...globalStyles.page,
        display: navigation == 1 ? "flex" : "none",
      }}
    >
      <View style={globalStyles.panel}>
        <Ionicons name="trophy-outline" size={32} color="#4D6BFF" />
        <Text style={globalStyles.panel_title}>Školní úspěchy</Text>
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
            <View style={styles.totalDistancePanel}>
              <Text style={globalStyles.title}>školní celková dráha</Text>
              <Text style={globalStyles.value}>
                {schoolTotal.toLocaleString()} km
              </Text>
            </View>

            <ScrollView style={styles.list}>
              {milestones.map((item, index) => {
                return (
                  <View style={styles.record} key={index}>
                    {schoolTotal >= item.distance ? (
                      <Image
                        source={progressLineBlue}
                        style={styles.image_line}
                      />
                    ) : (
                      <Image
                        source={progressLineGrey}
                        style={styles.image_line}
                      />
                    )}
                    <Text
                      style={{
                        ...styles.label,
                        color:
                          schoolTotal >= item.distance ? "#4D6BFF" : "#6C757D",
                      }}
                    >
                      {item.distance.toLocaleString()} km - {item.name}
                    </Text>
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

import React, { useEffect } from "react";
import { View, TouchableOpacity } from "react-native";

import styles from "../styles/navigation";

import { Ionicons } from "@expo/vector-icons";

export default function Navigation({ setNavigation, navigation, visible }) {
  return (
    <View>
      {visible ? (
        <View style={styles.nav_container}>
          <TouchableOpacity
            style={styles.nav_item}
            onPress={() => setNavigation(0)}
          >
            <Ionicons
              name="timer-outline"
              size={32}
              color={navigation == 0 ? "#4D6BFF" : "#899197"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.nav_item}
            onPress={() => setNavigation(1)}
          >
            <Ionicons
              name="trophy-outline"
              size={32}
              color={navigation == 1 ? "#4D6BFF" : "#899197"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.nav_item}
            onPress={() => setNavigation(2)}
          >
            <Ionicons
              name="person-outline"
              size={32}
              color={navigation == 2 ? "#4D6BFF" : "#899197"}
            />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ height: 60, backgroundColor: "#E5E5E5" }}></View>
      )}
    </View>
  );
}

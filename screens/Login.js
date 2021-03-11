import React, { useEffect, useContext, useState } from "react";
import { Ionicons } from "@expo/vector-icons";

import {
  Text,
  View,
  Button,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import styles from "../styles/login";
import logoName from "../assets/logoName.png";

export default function Login({ googleLogin, loading }) {
  return (
    <View style={styles.page}>
      <Image source={logoName} style={styles.image} />
      {loading ? (
        <ActivityIndicator
          size="small"
          color="#4D6BFF"
          style={styles.loading}
        />
      ) : (
        <TouchableOpacity onPress={googleLogin} style={styles.button}>
          <Ionicons name="logo-google" size={24} color="white" />
          <Text style={styles.button_text}>Přihlásit se Google účtem</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

import React from "react";
import { Ionicons } from "@expo/vector-icons";

import {
  Text,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
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
        <View>
          <TouchableOpacity onPress={googleLogin} style={styles.button}>
            <Ionicons name="logo-google" size={24} color="white" />
            <Text style={styles.button_text}>Přihlásit se Google účtem</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              ...styles.policy_button,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => {
              Linking.openURL("https://sites.google.com/view/garunpolicy/page");
            }}
          >
            <Text
              style={{
                ...styles.button_text,
                color: "#4D6BFF",
                fontSize: 12,
                marginTop: 15,
              }}
            >
              Zásady ochrany osobních údajů
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

import React, { useState } from "react";
import { Text, View, Image } from "react-native";
import logo from "../assets/logo.png";
import styles from "../styles/header";

export default function Header() {
  return (
    <View style={styles.header_container}>
      <Image style={styles.logo} source={logo} />
      <Text style={styles.title}>GA RUN</Text>
    </View>
  );
}

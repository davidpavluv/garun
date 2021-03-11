import React, { useState, useRef } from "react";
import { View } from "react-native";

import Profile from "./Profile";
import School from "./School";
import Tracker from "./Tracker";

import Navigation from "../components/Navigation";
import Header from "../components/Header";

export default function Home({ logOut, user }) {
  const [navigation, setNavigation] = useState(0);
  const [navigationVisible, setNavigationVisible] = useState(true);

  return (
    <View>
      <Header />

      <Tracker
        navigation={navigation}
        user={user}
        setNavigationVisible={setNavigationVisible}
      />
      <School navigation={navigation} user={user} />
      <Profile navigation={navigation} user={user} logOut={logOut} />

      <Navigation
        visible={navigationVisible}
        navigation={navigation}
        setNavigation={setNavigation}
      />
    </View>
  );
}

import { StyleSheet } from "react-native";
import { Dimensions } from "react-native";
import Constants from "expo-constants";

export default StyleSheet.create({
  header_container: {
    height: 60 + Constants.statusBarHeight,
    paddingTop: 15 + Constants.statusBarHeight,
    width: Dimensions.get("window").width,
    flexDirection: "row",
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "flex-start",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
    padding: 15,
  },
  logo: {
    width: 38,
    resizeMode: "contain",
  },
  title: {
    fontFamily: "rubik-regular",
    fontSize: 18,
    color: "#4D6BFF",
    marginLeft: 10,
    paddingTop: 5,
  },
});

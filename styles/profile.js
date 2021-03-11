import { StyleSheet } from "react-native";
import { Dimensions } from "react-native";

export default StyleSheet.create({
  topPanel: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  name: {
    fontSize: 15,
    fontFamily: "rubik-regular",
    color: "#6C757D",
  },
  position: {
    fontSize: 13,
    fontFamily: "rubik-regular",
    color: "#6C757D",
  },
  totalDistancePanel: {
    marginTop: 30,
  },

  list: {
    flex: 1,
    marginTop: 30,
    paddingRight: 5,

    borderTopColor: "#6C757D33",
    borderTopWidth: 1,
  },
  record: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 55,

    borderBottomColor: "#4D6BFF33",
    borderBottomWidth: 1,
  },
  record_right: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: {
    fontFamily: "rubik-regular",
    fontSize: 13,
    color: "#6C757D",
  },
  duration: {
    fontFamily: "rubik-regular",
    fontSize: 13,
    color: "#6C757D",
  },
  distance: {
    fontFamily: "rubik-regular",
    fontSize: 13,
    color: "#000000",

    marginRight: 8,
  },
});

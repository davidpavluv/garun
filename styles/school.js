import { StyleSheet } from "react-native";

export default StyleSheet.create({
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
    justifyContent: "flex-start",
    alignItems: "flex-end",
    height: 50,
  },
  image_line: {
    height: 50,
    resizeMode: "contain",
    marginBottom: 1,
  },
  label: {
    fontFamily: "rubik-regular",
    fontSize: 13,
    color: "#6C757D",
    textAlign: "left",
    marginLeft: 5,
  },
});

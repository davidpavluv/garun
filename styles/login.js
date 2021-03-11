import { StyleSheet } from "react-native";
import { Dimensions } from "react-native";

export default StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    height: 130,
    resizeMode: "contain",
    marginBottom: 100,
  },
  button: {
    width: 230,
    height: 50,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4D6BFF",
    borderRadius: 4,
  },
  button_text: {
    fontFamily: "rubik-regular",
    fontSize: 14,
    color: "white",
    marginLeft: 12,
  },
  loading: {
    marginTop: 30,
  },
});

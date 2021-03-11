import { StyleSheet } from "react-native";
import { Dimensions } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  page: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#E5E5E5",
    alignItems: "center",
  },
  card: {
    flex: 1,
    width: Dimensions.get("window").width - 38,
    backgroundColor: "white",
    marginTop: 20,
    marginBottom: 40,
    borderRadius: 3,
    padding: 20,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  panel: {
    width: Dimensions.get("window").width,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  panel_title: {
    fontFamily: "rubik-medium",
    color: "#6C757D",
    fontSize: 20,
    marginLeft: 8,
  },

  title: {
    fontSize: 20,
    fontFamily: "rubik-medium",
    color: "#6C757D",
    textAlign: "center",
  },
  value: {
    fontSize: 45,
    fontFamily: "rubik-medium",
    color: "#000000",
    textAlign: "center",
  },
});

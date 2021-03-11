import { Dimensions, StyleSheet } from "react-native";

export default StyleSheet.create({
  card: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  button_container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  toggle_button: {
    justifyContent: "center",
    alignItems: "center",
    height: 100,
    width: 100,
    borderRadius: 50,
    backgroundColor: "#4D6BFF",

    shadowColor: "#4D6BFF",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  done_button_wrapper: {
    flexDirection: "row",
    height: 54,
  },
  reset_button: {
    width: 54,
    height: 54,
    backgroundColor: "#F4514C",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#F4514C",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,

    paddingLeft: 2,
    paddingBottom: 2,
  },
  error_button: {
    height: 54,
    backgroundColor: "#FBAC45",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FBAC45",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,

    paddingLeft: 30,
    paddingRight: 30,
  },
  save_button: {
    height: 54,
    backgroundColor: "#01B452",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#01B452",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,

    paddingLeft: 30,
    paddingRight: 30,

    marginLeft: 10,
  },
  action_text: {
    fontFamily: "rubik-regular",
    fontSize: 22,
    color: "white",
  },
  description_text: {
    fontFamily: "rubik-regular",
    fontSize: 10,
    color: "white",
  },

  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4D6BFF26",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 4,
    paddingHorizontal: 40,
    paddingVertical: 20,
    alignItems: "center",

    shadowColor: "#01B452",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modal_text: {
    fontFamily: "rubik-light",
    fontSize: 18,
    textAlign: "center",
  },
  modal_button_text: {
    fontFamily: "rubik-regular",
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    color: "#4D6BFF",
    paddingHorizontal: 7,
    paddingVertical: 5,
    paddingTop: 6,
    borderColor: "#4D6BFF",
    borderWidth: 1,
    borderRadius: 3,
  },
});

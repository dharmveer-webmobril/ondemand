import React from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Image,
} from "react-native";
import { Colors, useNetworkStatus } from "../utils";
import AppText from "./AppText";

const NoInternetModal: React.FC = () => {
  const isConnected = useNetworkStatus();
  return (
    <Modal transparent visible={!isConnected} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Image
            tintColor={Colors.themeColor}
            source={require("../assets/images/nointernet.png")}
            style={styles.image}
          />
          <AppText style={styles.message}>
            Looks like you don’t have an internet connection. Please reconnect
            and try again.
          </AppText>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
  },
  modalContainer: {
    width: "100%",
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  image: {
    height: 80,
    width: 80,
    marginVertical: 15,
  },
  message: {
    textAlign: "center",
    fontSize: 14,
    color: Colors.textAppColor,
  },
});

export default NoInternetModal;

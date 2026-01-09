import MainNavigator from "./MainNavigator";
import { View } from "react-native";
import { SweetAlert } from "@components";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { logout } from "@store/slices/authSlice";
import { setInactiveMessage, setIsUserActiveOrNotModal } from "@store/slices/appSlice";
import { resetAndNavigate } from "@utils/NavigationUtils";
import SCREEN_NAMES from "./ScreenNames";

export default function RootNavigator() {
  const { isUserActiveOrNotModal, inactiveMessage } = useAppSelector((state) => state.app);
  const dispatch = useAppDispatch();
  const logoutBtn = () => {
    dispatch(setIsUserActiveOrNotModal(false));
    dispatch(setInactiveMessage(''));
    dispatch(logout());
    resetAndNavigate(SCREEN_NAMES.LOGIN);
  }
  return (
    <View style={{ flex: 1 }}>
      <MainNavigator />
      <SweetAlert
        visible={isUserActiveOrNotModal}
        message={inactiveMessage}
        isConfirmType="info"
        onOk={logoutBtn}
      />
    </View>
  );
}

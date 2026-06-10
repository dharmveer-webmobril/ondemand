import MainNavigator from "./MainNavigator";
import { View } from "react-native";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { logout } from "@store/slices/authSlice";
import { clearAuthToken } from "@services/auth/authTokenService";
import { resetUserScopedAppState, setInactiveMessage, setIsUserActiveOrNotModal } from "@store/slices/appSlice";
import { resetAndNavigate } from "@utils/NavigationUtils";
import SCREEN_NAMES from "./ScreenNames";
import { SweetAlert } from "@components";
import { useQueryClient } from "@tanstack/react-query";

export default function RootNavigator() {
  const { isUserActiveOrNotModal, inactiveMessage } = useAppSelector((state) => state.app);
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const logoutBtn = async () => {
    dispatch(setIsUserActiveOrNotModal(false));
    dispatch(setInactiveMessage(''));
    queryClient.cancelQueries();
    queryClient.removeQueries();
    queryClient.clear();
    await clearAuthToken(dispatch);
    dispatch(logout());
    dispatch(resetUserScopedAppState());
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

import MainNavigator from "./MainNavigator";
import { View } from "react-native";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { logout } from "@store/slices/authSlice";
import { resetUserScopedAppState, setInactiveMessage, setIsUserActiveOrNotModal } from "@store/slices/appSlice";
import { resetAndNavigate } from "@utils/NavigationUtils";
import SCREEN_NAMES from "./ScreenNames";
import { SweetAlert } from "@components";
import { useQueryClient } from "@tanstack/react-query";

export default function RootNavigator() {
  const { isUserActiveOrNotModal, inactiveMessage } = useAppSelector((state) => state.app);
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const logoutBtn = () => {
    dispatch(setIsUserActiveOrNotModal(false));
    dispatch(setInactiveMessage(''));
    // Wipe React Query caches so the next user doesn't briefly see the
    // previous user's bookings / chat / profile data.
    queryClient.cancelQueries();
    queryClient.removeQueries();
    queryClient.clear();
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
